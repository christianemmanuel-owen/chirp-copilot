import { NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import type { NewProductInput } from "@/lib/types"
import { resolveBrandId, resolveCategoryIds } from "./utils"

import { getDb } from "@/lib/db"
import { brands, categories, products, productCategories, productVariants, variantSizes } from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, and, sql } from "drizzle-orm"

export const runtime = "edge"

export async function GET(request: Request) {
  try {
    const { env } = getRequestContext()
    const d1 = env.DB
    if (!d1) {
      return NextResponse.json({ error: "Database binding not found" }, { status: 500 })
    }

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const [productsData, categoriesData, brandsData] = await Promise.all([
      db.query.products.findMany({
        where: eq(products.projectId, tenantId),
        with: {
          brand: true,
        }
      }),
      db.select().from(categories).where(eq(categories.projectId, tenantId)).orderBy(categories.name),
      db.select().from(brands).where(eq(brands.projectId, tenantId)).orderBy(brands.name),
    ])

    return NextResponse.json({
      data: productsData,
      categories: categoriesData,
      brands: brandsData
    })
  } catch (error) {
    console.error("[products][GET] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error retrieving products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as NewProductInput | null

    if (!payload) {
      return NextResponse.json({ error: "Missing product payload" }, { status: 400 })
    }

    if (!payload.name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 })
    }

    const { env } = getRequestContext()
    const d1 = env.DB
    if (!d1) {
      return NextResponse.json({ error: "Database binding not found" }, { status: 500 })
    }

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    // Resolve Brand and Categories using Drizzle
    const [brandId, categoryIds] = await Promise.all([
      resolveBrandId(db, tenantId, payload.brand ?? null),
      resolveCategoryIds(db, tenantId, payload.categories ?? []),
    ])

    // Drizzle Transaction to handle complex insert
    const product = await db.transaction(async (tx) => {
      // 1. Insert Product
      const [newProduct] = await tx.insert(products).values({
        name: payload.name,
        imageUrl: payload.image,
        brandId,
        projectId: tenantId,
      }).returning()

      // 2. Insert Categories
      if (categoryIds.length > 0) {
        await tx.insert(productCategories).values(
          categoryIds.map(categoryId => ({
            productId: newProduct.id,
            categoryId,
          }))
        )
      }

      // 3. Insert Variants and Sizes
      const variantInputs = Array.isArray(payload.variants) ? payload.variants : []
      for (const variantInput of variantInputs) {
        const [newVariant] = await tx.insert(productVariants).values({
          productId: newProduct.id,
          sku: variantInput.sku,
          color: variantInput.color,
          imageUrl: variantInput.image,
          description: variantInput.description,
          isPreorder: variantInput.isPreorder ?? false,
          isActive: true,
        }).returning()

        if (variantInput.sizes && variantInput.sizes.length > 0) {
          await tx.insert(variantSizes).values(
            variantInput.sizes.map(sizeEntry => ({
              variantId: newVariant.id,
              size: sizeEntry.size,
              price: sizeEntry.price,
              stockQuantity: sizeEntry.stock,
            }))
          )
        }
      }

      // Return the full product with relations
      return await tx.query.products.findFirst({
        where: eq(products.id, newProduct.id),
        with: {
          brand: true,
        }
      })
    })

    return NextResponse.json({ data: product }, { status: 201 })
  } catch (error) {
    console.error("[products][POST] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error creating product" }, { status: 500 })
  }
}
