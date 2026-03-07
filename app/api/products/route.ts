import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import {
  mapProductInputToInsert,
  mapProductRowToProduct,
  type ProductRowWithVariants,
} from "@/lib/supabase/transformers"
import type { NewProductInput } from "@/lib/types"
import { PRODUCT_SELECT_FIELDS, resolveBrandId, resolveCategoryIds } from "./utils"

export async function GET() {
  try {
    const supabase = getSupabaseServiceRoleClient()
    const [productsData, categoriesData, brandsData] = await Promise.all([
      supabase.from("products").select(PRODUCT_SELECT_FIELDS).order("name", { ascending: true }),
      supabase.from("categories").select("id, name").order("name", { ascending: true }),
      supabase.from("brands").select("id, name").order("name", { ascending: true }),
    ])

    if (productsData.error) {
      console.error("[products][GET] Supabase error (products)", productsData.error)
      return NextResponse.json({ error: "Failed to load products" }, { status: 500 })
    }

    const products = (productsData.data ?? []).map((row) => mapProductRowToProduct(row as ProductRowWithVariants))
    const categories = categoriesData.data ?? []
    const brands = brandsData.data ?? []

    return NextResponse.json({ data: products, categories, brands })
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

    const variantInputs = Array.isArray(payload.variants) ? payload.variants : []
    const supabase = getSupabaseServiceRoleClient()

    const [brandId, categoryIds] = await Promise.all([
      resolveBrandId(supabase, payload.brand ?? null),
      resolveCategoryIds(supabase, payload.categories ?? []),
    ])

    const { product: productInsert, variants: variantInserts, variantSizes } = mapProductInputToInsert(
      {
        ...payload,
        variants: variantInputs,
      },
      { brandId },
    )

    const invalidVariantIndex = variantSizes.findIndex((sizes, index) => {
      if (sizes.length === 0) {
        return true
      }

      const isPreorder = Boolean(variantInserts[index]?.is_preorder)

      return sizes.some((entry) => {
        if (!Number.isFinite(entry.price) || entry.price < 0) {
          return true
        }

        if (entry.stock < 0) {
          return true
        }

        if (!isPreorder && !Number.isInteger(entry.stock)) {
          return true
        }

        return false
      })
    })

    if (invalidVariantIndex !== -1) {
      return NextResponse.json(
        {
          error:
            "Each variant requires at least one size with a non-negative price. Stock must be a whole number unless the variant is marked for pre-order.",
        },
        { status: 400 },
      )
    }

    const { data: productRow, error: productError } = await supabase
      .from("products")
      .insert(productInsert)
      .select("id")
      .single()

    if (productError || !productRow) {
      console.error("[products][POST] Failed to create product", productError)
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
    }

    if (categoryIds.length > 0) {
      const categoryPayload = categoryIds.map((categoryId) => ({
        product_id: productRow.id as number,
        category_id: categoryId,
      }))

      const { error: categoryLinkError } = await supabase.from("product_categories").insert(categoryPayload)

      if (categoryLinkError) {
        console.error("[products][POST] Failed to link categories", categoryLinkError)
        await supabase.from("products").delete().eq("id", productRow.id)
        return NextResponse.json({ error: "Failed to link product categories" }, { status: 500 })
      }
    }

    if (variantInserts.length > 0) {
      const variantPayloads = variantInserts.map((variant) => ({
        ...variant,
        product_id: productRow.id,
      }))

      const { data: insertedVariants, error: variantError } = await supabase
        .from("product_variants")
        .insert(variantPayloads)
        .select("id")

      if (variantError || !insertedVariants) {
        console.error("[products][POST] Failed to create variants", variantError)
        await supabase.from("products").delete().eq("id", productRow.id)
        return NextResponse.json({ error: "Failed to create product variants" }, { status: 500 })
      }

      const sizeInsertPayload = insertedVariants.flatMap((variant, index) => {
        const sizesForVariant = variantSizes[index] ?? []
        return sizesForVariant.map((sizeEntry) => ({
          variant_id: variant.id as number,
          size: sizeEntry.size,
          price: sizeEntry.price,
          stock_quantity: sizeEntry.stock,
        }))
      })

      if (sizeInsertPayload.length > 0) {
        const { error: sizeInsertError } = await supabase.from("variant_sizes").insert(sizeInsertPayload)

        if (sizeInsertError) {
          console.error("[products][POST] Failed to create variant sizes", sizeInsertError)
          await supabase.from("variant_sizes").delete().in(
            "variant_id",
            insertedVariants.map((variant) => variant.id as number),
          )
          await supabase.from("product_variants").delete().in(
            "id",
            insertedVariants.map((variant) => variant.id as number),
          )
          await supabase.from("products").delete().eq("id", productRow.id)
          return NextResponse.json({ error: "Failed to create variant sizes" }, { status: 500 })
        }
      }
    }

    const { data: refreshedProduct, error: refreshError } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_FIELDS)
      .eq("id", productRow.id)
      .single()

    if (refreshError || !refreshedProduct) {
      console.error("[products][POST] Failed to load product after creation", refreshError)
      return NextResponse.json({ error: "Product created but failed to refresh data" }, { status: 500 })
    }

    const product = mapProductRowToProduct(refreshedProduct as ProductRowWithVariants)
    return NextResponse.json({ data: product }, { status: 201 })
  } catch (error) {
    console.error("[products][POST] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error creating product" }, { status: 500 })
  }
}
