import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import {
  mapProductRowToProduct,
  normalizeImageValue,
  serializeImageList,
  type ProductRowWithVariants,
} from "@/lib/supabase/transformers"
import { PRODUCT_SELECT_FIELDS } from "../../utils"
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
    sources.push(typeof payload.image === "string" ? payload.image : payload.image === null ? null : undefined)
  }

  return Array.from(
    new Set(sources.map((entry) => normalizeImageValue(entry)).filter((entry): entry is string => Boolean(entry))),
  )
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

    const variantName = (payload.name ?? "").trim()
    if (!variantName) {
      return NextResponse.json({ error: "Variant name is required" }, { status: 400 })
    }
    const descriptionText = typeof payload.description === "string" ? payload.description.trim() : ""
    const variantDescription = descriptionText.length > 0 ? descriptionText : null

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
      stock:
        entry?.stock === undefined || entry?.stock === null || (entry as any)?.stock === ""
          ? isPreorder
            ? 0
            : Number.NaN
          : Number(entry?.stock),
    }))
    const sizeEntries = normalizedSizeEntries.filter(
      (entry) => Number.isFinite(entry.price) && Number.isFinite(entry.stock),
    )

    if (sizeEntries.length === 0) {
      return NextResponse.json({ error: "At least one size entry with price and stock is required." }, { status: 400 })
    }

    const multipleSizes = sizeEntries.length > 1
    const invalidEntry = sizeEntries.find(
      (entry) =>
        entry.price < 0 ||
        entry.stock < 0 ||
        (!isPreorder && !Number.isInteger(entry.stock)) ||
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

    const preorderMessageRaw =
      typeof payload.preorderMessage === "string" ? payload.preorderMessage.trim() : ""
    const preorderMessage = isPreorder && preorderMessageRaw.length > 0 ? preorderMessageRaw : null

    const sanitizedSizeEntries = sizeEntries.map((entry) => ({
      size: entry.size.length > 0 ? entry.size : null,
      price: entry.price,
      stock: isPreorder ? 0 : entry.stock,
    }))

    const supabase = getSupabaseServiceRoleClient()

    // Ensure product exists
    const { error: productCheckError } = await supabase.from("products").select("id").eq("id", productId).single()
    if (productCheckError) {
      if (productCheckError.code === "PGRST116") {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }
      console.error("[products][variants][POST] Failed to verify product", productCheckError)
      return NextResponse.json({ error: "Failed to verify product" }, { status: 500 })
    }

    const imageList = collectVariantImages(payload)
    const insertPayload = {
      product_id: productId,
      sku: payload.sku ? payload.sku.trim() : null,
      color: variantName,
      description: variantDescription,
      image_url: serializeImageList(imageList),
      is_preorder: isPreorder,
      preorder_down_payment_type: preorderDownPayment.type,
      preorder_down_payment_value: preorderDownPayment.value,
      preorder_message: preorderMessage,
      is_active: isActive,
    }

    const { data: insertedRows, error: insertError } = await supabase
      .from("product_variants")
      .insert(insertPayload)
      .select("id")

    if (insertError || !insertedRows || insertedRows.length === 0) {
      console.error("[products][variants][POST] Failed to insert variant", insertError)
      return NextResponse.json({ error: "Failed to create variant" }, { status: 500 })
    }

    const variantId = insertedRows[0].id as number

    const sizeInsertPayload = sanitizedSizeEntries.map((entry) => ({
      variant_id: variantId,
      size: entry.size,
      price: entry.price,
      stock_quantity: entry.stock,
    }))

    const { error: sizeInsertError } = await supabase.from("variant_sizes").insert(sizeInsertPayload)

    if (sizeInsertError) {
      console.error("[products][variants][POST] Failed to insert variant sizes", sizeInsertError)
      await supabase.from("product_variants").delete().eq("id", variantId)
      return NextResponse.json({ error: "Failed to create variant sizes" }, { status: 500 })
    }

    const { data: productRow, error: productError } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_FIELDS)
      .eq("id", productId)
      .single()

    if (productError || !productRow) {
      console.error("[products][variants][POST] Failed to load product after insert", productError)
      return NextResponse.json({ error: "Variant created but failed to refresh product" }, { status: 500 })
    }

    const product = mapProductRowToProduct(productRow as ProductRowWithVariants)

    return NextResponse.json({ data: product }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid product id") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("[products][variants][POST] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error creating variant" }, { status: 500 })
  }
}
