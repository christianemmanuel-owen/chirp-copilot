import { NextResponse } from "next/server"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb } from "@/lib/db"
import { products as productsSchema, productVariants, variantSizes } from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, and } from "drizzle-orm"
import { parseDownPaymentRequest, type DownPaymentRequest } from "./down-payment"


function parseProductId(value: string) {
  const numericId = Number(value)
  if (!Number.isFinite(numericId)) {
    throw new Error("Invalid product id")
  }
  return numericId
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

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await context.params
    const productId = parseProductId(idParam)
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

    const { env } = await getCloudflareContext()
    const d1 = env.DB
    if (!d1) {
      return NextResponse.json({ error: "Database binding not found" }, { status: 500 })
    }

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    // Ensure product exists and belongs to project
    const existingProduct = await db.query.products.findFirst({
      where: and(eq(productsSchema.id, productId), eq(productsSchema.projectId, tenantId))
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const variantName = (payload.name ?? "").trim()
    if (!variantName) {
      return NextResponse.json({ error: "Variant name is required" }, { status: 400 })
    }
    const variantDescription = typeof payload.description === "string" ? payload.description.trim() : null

    const isPreorder = Boolean(payload.isPreorder)
    const downPaymentResult = parseDownPaymentRequest(payload.preorderDownPayment ?? null, isPreorder)
    if (!downPaymentResult.ok) {
      return NextResponse.json({ error: downPaymentResult.message }, { status: 400 })
    }
    const preorderDownPayment = downPaymentResult.value
    const isActive = payload?.isActive === undefined ? true : Boolean(payload.isActive)

    const rawSizeEntries = Array.isArray(payload.sizes) ? payload.sizes : []
    const normalizedSizeEntries = rawSizeEntries.map((entry) => ({
      size: typeof entry?.size === "string" ? entry.size.trim() : "",
      price: Number(entry?.price),
      stock: entry?.stock === undefined || entry?.stock === null || (entry as any)?.stock === ""
        ? (isPreorder ? 0 : Number.NaN)
        : Number(entry?.stock),
    }))

    const sizeEntries = normalizedSizeEntries.filter(
      (entry) => Number.isFinite(entry.price) && Number.isFinite(entry.stock),
    )

    if (sizeEntries.length === 0) {
      return NextResponse.json({ error: "At least one size entry with price and stock is required." }, { status: 400 })
    }

    const imageList = collectVariantImages(payload)
    const imageUrl = imageList.length > 0 ? imageList[0] : null // Using first image as primary

    const result = await db.transaction(async (tx) => {
      const [insertedVariant] = await tx.insert(productVariants).values({
        productId,
        sku: payload.sku?.trim() || null,
        color: variantName,
        description: variantDescription,
        imageUrl: imageUrl,
        isPreorder,
        isActive,
        preorderDownPaymentType: preorderDownPayment.type,
        preorderDownPaymentValue: preorderDownPayment.value,
        preorderMessage: isPreorder ? (payload.preorderMessage?.trim() || null) : null,
      }).returning()

      const sizeInsertPayload = sizeEntries.map(entry => ({
        variantId: insertedVariant.id,
        size: entry.size || null,
        price: entry.price,
        stockQuantity: isPreorder ? 0 : entry.stock,
      }))

      if (sizeInsertPayload.length > 0) {
        await tx.insert(variantSizes).values(sizeInsertPayload)
      }

      return insertedVariant.id
    })

    // Fetch refreshed product to return
    const refreshed = await db.query.products.findFirst({
      where: eq(productsSchema.id, productId),
      with: {
        brand: true,
        productCategories: { with: { category: true } },
        variants: { with: { sizes: true } }
      }
    })

    return NextResponse.json({ data: refreshed }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid product id") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("[products][variants][POST] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error creating variant" }, { status: 500 })
  }
}
