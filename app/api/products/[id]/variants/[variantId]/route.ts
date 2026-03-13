import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { products as productsSchema, productVariants, variantSizes } from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, and } from "drizzle-orm"
import { parseDownPaymentRequest, type DownPaymentRequest } from "../down-payment"

function parseNumericId(value: string, label: string) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    throw new Error(`Invalid ${label}`)
  }
  return numeric
}

function collectVariantImages(payload: { images?: unknown; image?: unknown }): string[] {
  const sources: Array<string | null | undefined> = []
  if (Array.isArray(payload.images)) {
    sources.push(...payload.images)
  }
  if (Object.prototype.hasOwnProperty.call(payload, "image")) {
    sources.push(typeof payload.image === "string" ? payload.image : (payload.image === null ? null : undefined))
  }
  return Array.from(new Set(sources.filter((s): s is string => typeof s === "string" && s.length > 0)))
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; variantId: string }> },
) {
  try {
    const { id: productIdParam, variantId: variantIdParam } = await context.params
    const productId = parseNumericId(productIdParam, "product id")
    const variantId = parseNumericId(variantIdParam, "variant id")

    const payload = (await request.json()) as {
      sku?: string | null
      name?: string | null
      description?: string | null
      image?: string | null
      images?: string[]
      sizes?: Array<{ size?: string | null; price?: number; stock?: number }> | null
      isPreorder?: boolean
      isActive?: boolean
      preorderDownPayment?: DownPaymentRequest
      preorderMessage?: string | null
    } | null

    if (!payload) {
      return NextResponse.json({ error: "Missing variant payload" }, { status: 400 })
    }

    const d1 = (process.env as any).DB as D1Database
    if (!d1) {
      return NextResponse.json({ error: "Database binding not found" }, { status: 500 })
    }

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    // Verify variant belongs to product and product belongs to project
    const existing = (await db.query.productVariants.findFirst({
      where: eq(productVariants.id, variantId),
      with: {
        product: true
      }
    })) as any

    if (!existing || existing.productId !== productId || existing.product.projectId !== tenantId) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 })
    }

    const trimmedName = (payload.name ?? "").trim()
    if (payload.name !== undefined && !trimmedName) {
      return NextResponse.json({ error: "Variant name is required" }, { status: 400 })
    }

    const requestedIsPreorder = payload.isPreorder
    const effectiveIsPreorder = requestedIsPreorder !== undefined ? Boolean(requestedIsPreorder) : existing.isPreorder

    const updatePayload: Record<string, any> = { updatedAt: new Date() }
    if (payload.name !== undefined) updatePayload.color = trimmedName
    if (payload.sku !== undefined) updatePayload.sku = payload.sku?.trim() || null
    if (payload.description !== undefined) updatePayload.description = payload.description?.trim() || null

    const hasImageUpdate = payload.image !== undefined || payload.images !== undefined
    if (hasImageUpdate) {
      const imageList = collectVariantImages(payload)
      updatePayload.imageUrl = imageList.length > 0 ? imageList[0] : null
    }

    if (requestedIsPreorder !== undefined) updatePayload.isPreorder = effectiveIsPreorder
    if (payload.isActive !== undefined) updatePayload.isActive = Boolean(payload.isActive)

    if (!effectiveIsPreorder) {
      updatePayload.preorderDownPaymentType = "none"
      updatePayload.preorderDownPaymentValue = null
      updatePayload.preorderMessage = null
    } else {
      if (payload.preorderDownPayment !== undefined) {
        const dpResult = parseDownPaymentRequest(payload.preorderDownPayment, true)
        if (!dpResult.ok) return NextResponse.json({ error: dpResult.message }, { status: 400 })
        updatePayload.preorderDownPaymentType = dpResult.value.type
        updatePayload.preorderDownPaymentValue = dpResult.value.value
      }
      if (payload.preorderMessage !== undefined) {
        updatePayload.preorderMessage = payload.preorderMessage?.trim() || null
      }
    }

    await db.transaction(async (tx) => {
      if (Object.keys(updatePayload).length > 1) {
        await tx.update(productVariants).set(updatePayload).where(eq(productVariants.id, variantId))
      }

      if (payload.sizes !== undefined) {
        const sizeEntries = (payload.sizes || []).map(entry => ({
          size: entry.size?.trim() || null,
          price: Number(entry.price),
          stock: Number(entry.stock),
        })).filter(e => Number.isFinite(e.price) && Number.isFinite(e.stock))

        if (sizeEntries.length === 0) {
          // Keep existing sizes or error? Existing code required at least one if payload.sizes is provided.
          throw new Error("At least one valid size entry is required")
        }

        await tx.delete(variantSizes).where(eq(variantSizes.variantId, variantId))
        await tx.insert(variantSizes).values(
          sizeEntries.map(e => ({
            variantId,
            size: e.size,
            price: e.price,
            stockQuantity: effectiveIsPreorder ? 0 : e.stock,
          }))
        )
      }
    })

    const refreshed = await db.query.products.findFirst({
      where: eq(productsSchema.id, productId),
      with: {
        brand: true,
        productCategories: { with: { category: true } },
        variants: { with: { sizes: true } }
      }
    })

    return NextResponse.json({ data: refreshed })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid")) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("[products][variants][PATCH] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error updating variant" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; variantId: string }> },
) {
  try {
    const { id: productIdParam, variantId: variantIdParam } = await context.params
    const productId = parseNumericId(productIdParam, "product id")
    const variantId = parseNumericId(variantIdParam, "variant id")

    const d1 = (process.env as any).DB as D1Database
    if (!d1) {
      return NextResponse.json({ error: "Database binding not found" }, { status: 500 })
    }

    const tenantId = await ensureTenantId(_request, d1)
    const db = getDb(d1)

    // Verify ownership
    const existing = (await db.query.productVariants.findFirst({
      where: eq(productVariants.id, variantId),
      with: { product: true }
    })) as any

    if (!existing || existing.productId !== productId || existing.product.projectId !== tenantId) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 })
    }

    await db.delete(productVariants).where(eq(productVariants.id, variantId))

    const refreshed = await db.query.products.findFirst({
      where: eq(productsSchema.id, productId),
      with: {
        brand: true,
        productCategories: { with: { category: true } },
        variants: { with: { sizes: true } }
      }
    })

    return NextResponse.json({ data: refreshed })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid")) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("[products][variants][DELETE] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error deleting variant" }, { status: 500 })
  }
}
