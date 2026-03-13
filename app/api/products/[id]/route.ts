import { NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb } from "@/lib/db"
import { products as productsSchema, productCategories, productVariants, variantSizes, brands, categories } from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, and, inArray } from "drizzle-orm"
import { resolveBrandId, resolveCategoryIds } from "../utils"
import type { UpdateProductInput } from "@/lib/types"

export const runtime = "edge"

function parseId(id: string) {
  const numericId = Number(id)
  if (!Number.isFinite(numericId)) {
    throw new Error("Invalid product id")
  }
  return numericId
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await context.params
    const id = parseId(idParam)
    const { env } = getRequestContext()
    const d1 = env.DB
    if (!d1) {
      return NextResponse.json({ error: "Database binding not found" }, { status: 500 })
    }

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const product = (await db.query.products.findFirst({
      where: and(eq(productsSchema.id, id), eq(productsSchema.projectId, tenantId)),
      with: {
        brand: true,
        productCategories: {
          with: {
            category: true,
          }
        },
        variants: {
          with: {
            sizes: true,
          }
        }
      }
    })) as any

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Transform to frontend type
    const transformed = {
      id: product.id,
      name: product.name,
      image: product.imageUrl,
      brand: product.brand,
      categories: product.productCategories.map((pc: any) => pc.category),
      variants: product.variants.map((v: any) => ({
        ...v,
        sizes: v.sizes,
      })),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }

    return NextResponse.json({ data: transformed })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid product id") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("[products][GET:id] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error retrieving product" }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await context.params
    const id = parseId(idParam)
    const payload = (await request.json()) as UpdateProductInput | null

    if (!payload || Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "No product fields provided for update" }, { status: 400 })
    }

    const { env } = getRequestContext()
    const d1 = env.DB
    if (!d1) {
      return NextResponse.json({ error: "Database binding not found" }, { status: 500 })
    }

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    // Ensure product exists and belongs to project
    const existing = (await db.query.products.findFirst({
      where: and(eq(productsSchema.id, id), eq(productsSchema.projectId, tenantId))
    })) as any

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const hasBrandUpdate = Object.prototype.hasOwnProperty.call(payload, "brand")
    const brandId = hasBrandUpdate ? await resolveBrandId(db, tenantId, payload.brand ?? null) : undefined

    const hasCategoryUpdate = Object.prototype.hasOwnProperty.call(payload, "categories")
    const categoryIds = hasCategoryUpdate
      ? await resolveCategoryIds(db, tenantId, payload.categories ?? [])
      : undefined

    await db.transaction(async (tx) => {
      // Update product fields
      const updateData: Record<string, any> = { updatedAt: new Date() }
      if (payload.name !== undefined) updateData.name = payload.name
      if (payload.image !== undefined) updateData.imageUrl = payload.image
      if (hasBrandUpdate) updateData.brandId = brandId

      if (Object.keys(updateData).length > 1) {
        await tx.update(productsSchema)
          .set(updateData)
          .where(eq(productsSchema.id, id))
      }

      // Update categories
      if (hasCategoryUpdate && categoryIds !== undefined) {
        await tx.delete(productCategories).where(eq(productCategories.productId, id))
        if (categoryIds.length > 0) {
          await tx.insert(productCategories).values(
            categoryIds.map(cid => ({ productId: id, categoryId: cid }))
          )
        }
      }
    })

    // Fetch updated product
    const updated = await db.query.products.findFirst({
      where: eq(productsSchema.id, id),
      with: {
        brand: true,
        productCategories: {
          with: {
            category: true,
          }
        },
        variants: {
          with: {
            sizes: true,
          }
        }
      }
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid product id") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("[products][PATCH:id] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error updating product" }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await context.params
    const id = parseId(idParam)
    const { env } = getRequestContext()
    const d1 = env.DB
    if (!d1) {
      return NextResponse.json({ error: "Database binding not found" }, { status: 500 })
    }

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const result = await db.delete(productsSchema)
      .where(and(eq(productsSchema.id, id), eq(productsSchema.projectId, tenantId)))
      .returning()

    if (result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid product id") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("[products][DELETE:id] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error deleting product" }, { status: 500 })
  }
}
