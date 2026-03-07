import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import {
  mapProductRowToProduct,
  normalizeImageValue,
  serializeImageList,
  type ProductRowWithVariants,
} from "@/lib/supabase/transformers"
import { PRODUCT_SELECT_FIELDS } from "../../../utils"
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
    sources.push(typeof payload.image === "string" ? payload.image : payload.image === null ? null : undefined)
  }

  return Array.from(
    new Set(sources.map((entry) => normalizeImageValue(entry)).filter((entry): entry is string => Boolean(entry))),
  )
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

    const trimmedName = (payload.name ?? "").trim()
    if (!trimmedName) {
      return NextResponse.json({ error: "Variant name is required" }, { status: 400 })
    }

    const supabase = getSupabaseServiceRoleClient()

    const { data: existingVariant, error: variantLoadError } = await supabase
      .from("product_variants")
      .select("product_id, is_preorder")
      .eq("id", variantId)
      .single()

    if (variantLoadError) {
      if (variantLoadError.code === "PGRST116") {
        return NextResponse.json({ error: "Variant not found" }, { status: 404 })
      }
      console.error("[products][variants][PATCH] Failed to load variant", variantLoadError)
      return NextResponse.json({ error: "Failed to load variant" }, { status: 500 })
    }

    if (!existingVariant || Number(existingVariant.product_id) !== productId) {
      return NextResponse.json({ error: "Variant does not belong to the specified product" }, { status: 404 })
    }

    const requestedIsPreorder = payload.isPreorder
    const requestedIsActive = payload.isActive
    const currentIsPreorder = Boolean((existingVariant as { is_preorder?: boolean } | null)?.is_preorder)
    const effectiveIsPreorder =
      requestedIsPreorder !== undefined ? Boolean(requestedIsPreorder) : currentIsPreorder
    const hasDownPaymentUpdate = Object.prototype.hasOwnProperty.call(payload, "preorderDownPayment")
    let preorderDownPaymentUpdate: { type: "none" | "percent" | "amount"; value: number | null } | null = null

    const hasPreorderMessageUpdate = Object.prototype.hasOwnProperty.call(payload, "preorderMessage")
    let preorderMessageUpdate: string | null | undefined = undefined

    if (!effectiveIsPreorder) {
      preorderDownPaymentUpdate = { type: "none", value: null }
      preorderMessageUpdate = null
    } else {
      if (hasDownPaymentUpdate) {
        const downPaymentResult = parseDownPaymentRequest(payload.preorderDownPayment ?? null, true)
        if (!downPaymentResult.ok) {
          return NextResponse.json({ error: downPaymentResult.message }, { status: 400 })
        }
        preorderDownPaymentUpdate = downPaymentResult.value
      }

      if (hasPreorderMessageUpdate) {
        const rawMessage =
          typeof payload.preorderMessage === "string" ? payload.preorderMessage.trim() : ""
        preorderMessageUpdate = rawMessage.length > 0 ? rawMessage : null
      }
    }

    const rawSizeEntries = Array.isArray(payload.sizes) ? payload.sizes : []
    const normalizedSizeEntries = rawSizeEntries.map((entry) => ({
      size: typeof entry?.size === "string" ? entry.size.trim() : "",
      price: Number(entry?.price),
      stock:
        entry?.stock === undefined || entry?.stock === null || (entry as any)?.stock === ""
          ? effectiveIsPreorder
            ? 0
            : Number.NaN
          : Number(entry?.stock),
    }))
    let sizeEntries = normalizedSizeEntries.filter(
      (entry) => Number.isFinite(entry.price) && Number.isFinite(entry.stock),
    )

    if (payload.sizes !== undefined && sizeEntries.length === 0) {
      const fallbackPrice = Number(payload?.sizes?.[0]?.price)
      const fallbackStock =
        payload?.sizes?.[0]?.stock === undefined ||
          payload?.sizes?.[0]?.stock === null ||
          (payload?.sizes?.[0] as any)?.stock === ""
          ? effectiveIsPreorder
            ? 0
            : Number.NaN
          : Number(payload?.sizes?.[0]?.stock)
      sizeEntries = [
        {
          size: typeof payload?.sizes?.[0]?.size === "string" ? payload?.sizes?.[0]?.size.trim() : "",
          price: fallbackPrice,
          stock: fallbackStock,
        },
      ].filter((entry) => Number.isFinite(entry.price) && Number.isFinite(entry.stock))
    }

    if (payload.sizes !== undefined) {
      if (sizeEntries.length === 0) {
        return NextResponse.json(
          { error: "At least one size entry with non-negative price and stock is required." },
          { status: 400 },
        )
      }

      const multipleSizes = sizeEntries.length > 1
      const invalidEntry = sizeEntries.find(
        (entry) =>
          entry.price < 0 ||
          entry.stock < 0 ||
          (!effectiveIsPreorder && !Number.isInteger(entry.stock)) ||
          (multipleSizes && entry.size.length === 0),
      )

      if (invalidEntry) {
        const errorMessage =
          invalidEntry.price < 0 || !Number.isFinite(invalidEntry.price)
            ? "Each size entry requires a non-negative price."
            : !Number.isInteger(invalidEntry.stock) || invalidEntry.stock < 0
              ? "Each size entry requires a non-negative stock quantity unless the variant is for pre-order."
              : "Size is required when adding multiple entries."
        return NextResponse.json({ error: errorMessage }, { status: 400 })
      }
    }

    const sanitizedSizeEntries =
      payload.sizes !== undefined
        ? sizeEntries.map((entry) => ({
          size: entry.size.length > 0 ? entry.size : null,
          price: entry.price,
          stock: effectiveIsPreorder ? 0 : entry.stock,
        }))
        : null

    const updatePayload: Record<string, any> = {
      color: trimmedName,
      updated_at: new Date().toISOString(),
    }

    const hasSkuUpdate = Object.prototype.hasOwnProperty.call(payload, "sku")
    if (hasSkuUpdate) {
      const rawSku =
        payload.sku === null
          ? ""
          : typeof payload.sku === "string"
            ? payload.sku.trim()
            : ""
      updatePayload.sku = rawSku.length > 0 ? rawSku : null
    }

    if (payload.description !== undefined) {
      const rawDescription =
        payload.description === null
          ? ""
          : typeof payload.description === "string"
            ? payload.description.trim()
            : ""
      updatePayload.description = rawDescription.length > 0 ? rawDescription : null
    }

    const hasImageUpdate =
      (payload && Object.prototype.hasOwnProperty.call(payload, "image")) ||
      (payload && Object.prototype.hasOwnProperty.call(payload, "images"))

    if (hasImageUpdate) {
      const imageList = collectVariantImages(payload ?? {})
      updatePayload.image_url = serializeImageList(imageList)
    }
    if (requestedIsPreorder !== undefined) {
      updatePayload.is_preorder = effectiveIsPreorder
    }
    if (requestedIsActive !== undefined) {
      updatePayload.is_active = Boolean(requestedIsActive)
    }

    if (preorderDownPaymentUpdate) {
      updatePayload.preorder_down_payment_type = preorderDownPaymentUpdate.type
      updatePayload.preorder_down_payment_value = preorderDownPaymentUpdate.value
    }
    if (preorderMessageUpdate !== undefined) {
      updatePayload.preorder_message = preorderMessageUpdate
    }

    const { error: updateError } = await supabase.from("product_variants").update(updatePayload).eq("id", variantId)

    if (updateError) {
      console.error("[products][variants][PATCH] Failed to update variant", updateError)
      return NextResponse.json({ error: "Failed to update variant" }, { status: 500 })
    }

    if (sanitizedSizeEntries !== null) {
      const { error: deleteSizesError } = await supabase.from("variant_sizes").delete().eq("variant_id", variantId)

      if (deleteSizesError) {
        console.error("[products][variants][PATCH] Failed to delete existing variant sizes", deleteSizesError)
        return NextResponse.json({ error: "Failed to update variant sizes" }, { status: 500 })
      }

      const sizeInsertPayload = sanitizedSizeEntries.map((entry) => ({
        variant_id: variantId,
        size: entry.size,
        price: entry.price,
        stock_quantity: entry.stock,
      }))

      const { error: sizeInsertError } = await supabase.from("variant_sizes").insert(sizeInsertPayload)

      if (sizeInsertError) {
        console.error("[products][variants][PATCH] Failed to insert variant sizes", sizeInsertError)
        return NextResponse.json({ error: "Failed to update variant sizes" }, { status: 500 })
      }
    }

    const { data: productRow, error: productError } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_FIELDS)
      .eq("id", productId)
      .single()

    if (productError || !productRow) {
      console.error("[products][variants][PATCH] Failed to load updated product", productError)
      return NextResponse.json({ error: "Variant updated but failed to refresh product" }, { status: 500 })
    }

    const product = mapProductRowToProduct(productRow as ProductRowWithVariants)
    return NextResponse.json({ data: product })
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

    const supabase = getSupabaseServiceRoleClient()
    const { data: existingVariant, error: loadError } = await supabase
      .from("product_variants")
      .select("product_id")
      .eq("id", variantId)
      .single()

    if (loadError) {
      if (loadError.code === "PGRST116") {
        return NextResponse.json({ error: "Variant not found" }, { status: 404 })
      }
      console.error("[products][variants][DELETE] Failed to load variant", loadError)
      return NextResponse.json({ error: "Failed to load variant" }, { status: 500 })
    }

    if (!existingVariant || Number(existingVariant.product_id) !== productId) {
      return NextResponse.json({ error: "Variant does not belong to the specified product" }, { status: 404 })
    }

    const { error: deleteSizesError } = await supabase.from("variant_sizes").delete().eq("variant_id", variantId)
    if (deleteSizesError) {
      console.error("[products][variants][DELETE] Failed to delete variant sizes", deleteSizesError)
      return NextResponse.json({ error: "Failed to delete variant sizes" }, { status: 500 })
    }

    const { error: deleteVariantError } = await supabase.from("product_variants").delete().eq("id", variantId)
    if (deleteVariantError) {
      console.error("[products][variants][DELETE] Failed to delete variant", deleteVariantError)
      return NextResponse.json({ error: "Failed to delete variant" }, { status: 500 })
    }

    const { data: productRow, error: productError } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_FIELDS)
      .eq("id", productId)
      .single()

    if (productError || !productRow) {
      console.error("[products][variants][DELETE] Failed to refresh product", productError)
      return NextResponse.json({ error: "Variant deleted but failed to refresh product" }, { status: 500 })
    }

    const product = mapProductRowToProduct(productRow as ProductRowWithVariants)
    return NextResponse.json({ data: product })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid")) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("[products][variants][DELETE] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error deleting variant" }, { status: 500 })
  }
}
