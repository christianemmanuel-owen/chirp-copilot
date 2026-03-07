import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import { mapProductRowToProduct, mapProductUpdateToUpdate, type ProductRowWithVariants } from "@/lib/supabase/transformers"
import { PRODUCT_SELECT_FIELDS, resolveBrandId, resolveCategoryIds } from "../utils"
import type { UpdateProductInput } from "@/lib/types"

function parseId(id: string) {
  const numericId = Number(id)
  if (!Number.isFinite(numericId)) {
    throw new Error("Invalid product id")
  }
  return numericId
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await context.params
    const id = parseId(idParam)
    const supabase = getSupabaseServiceRoleClient()
    const { data, error } = await supabase.from("products").select(PRODUCT_SELECT_FIELDS).eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }
      console.error("[products][GET:id] Supabase error", error)
      return NextResponse.json({ error: "Failed to load product" }, { status: 500 })
    }

    const product = mapProductRowToProduct(data as ProductRowWithVariants)
    return NextResponse.json({ data: product })
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

    const supabase = getSupabaseServiceRoleClient()
    const { data: existingRow, error: existingError } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_FIELDS)
      .eq("id", id)
      .single()

    if (existingError) {
      if (existingError.code === "PGRST116") {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }
      console.error("[products][PATCH:id] Failed to load product", existingError)
      return NextResponse.json({ error: "Failed to load product" }, { status: 500 })
    }

    const existingProductRow = existingRow as ProductRowWithVariants

    const hasBrandUpdate = Object.prototype.hasOwnProperty.call(payload, "brand")
    const brandId = hasBrandUpdate ? await resolveBrandId(supabase, payload.brand ?? null) : undefined

    const hasCategoryUpdate = Object.prototype.hasOwnProperty.call(payload, "categories")
    const categoryIds = hasCategoryUpdate
      ? await resolveCategoryIds(supabase, payload.categories ?? [])
      : undefined

    const updatePayload = mapProductUpdateToUpdate(payload, hasBrandUpdate ? { brandId } : undefined)

    if (Object.keys(updatePayload).length > 0) {
      updatePayload.updated_at = new Date().toISOString()
      const { error: updateError } = await supabase.from("products").update(updatePayload).eq("id", id)

      if (updateError) {
        console.error("[products][PATCH:id] Supabase update error", updateError)
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
      }
    }

    if (hasCategoryUpdate) {
      const previousCategoryIds = Array.from(
        new Set((existingProductRow.product_categories ?? []).map((entry) => entry.category_id)),
      )
      const nextCategoryIds = Array.from(new Set(categoryIds ?? []))

      const { error: deleteError } = await supabase.from("product_categories").delete().eq("product_id", id)

      if (deleteError) {
        console.error("[products][PATCH:id] Failed to clear product categories", deleteError)
        return NextResponse.json({ error: "Failed to update product categories" }, { status: 500 })
      }

      if (nextCategoryIds.length > 0) {
        const linkPayload = nextCategoryIds.map((categoryId) => ({
          product_id: id,
          category_id: categoryId,
        }))
        const { error: linkError } = await supabase.from("product_categories").insert(linkPayload)

        if (linkError) {
          console.error("[products][PATCH:id] Failed to link product categories", linkError)
          if (previousCategoryIds.length > 0) {
            const { error: restoreError } = await supabase
              .from("product_categories")
              .insert(previousCategoryIds.map((categoryId) => ({ product_id: id, category_id: categoryId })))
            if (restoreError) {
              console.error("[products][PATCH:id] Failed to restore previous categories", restoreError)
            }
          }
          return NextResponse.json({ error: "Failed to update product categories" }, { status: 500 })
        }
      }
    }

    const { data: refreshedRow, error: refreshError } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_FIELDS)
      .eq("id", id)
      .single()

    if (refreshError || !refreshedRow) {
      console.error("[products][PATCH:id] Failed to load updated product", refreshError)
      return NextResponse.json({ error: "Failed to load updated product" }, { status: 500 })
    }

    const product = mapProductRowToProduct(refreshedRow as ProductRowWithVariants)
    return NextResponse.json({ data: product })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid product id") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("[products][PATCH:id] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error updating product" }, { status: 500 })
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await context.params
    const id = parseId(idParam)
    const supabase = getSupabaseServiceRoleClient()
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      console.error("[products][DELETE:id] Supabase error", error)
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
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
