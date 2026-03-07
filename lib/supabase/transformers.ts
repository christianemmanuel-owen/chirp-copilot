import type { Database } from "./types"
import type {
  DiscountCampaign,
  DiscountCampaignVariant,
  NewPaymentMethodInput,
  NewOrderInput,
  NewProductInput,
  Order,
  OrderStatus,
  PaymentMethodConfig,
  PreorderDownPaymentConfig,
  PreorderDownPaymentSummary,
  Product,
  ProductVariant,
  ProductVariantInput,
  ProductVariantSizeInput,
  UpdatePaymentMethodInput,
  UpdateProductInput,
} from "@/lib/types"

type ProductRow = Database["public"]["Tables"]["products"]["Row"]
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"]
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"]
type BrandRow = Database["public"]["Tables"]["brands"]["Row"]
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"]
type ProductCategoryRow = Database["public"]["Tables"]["product_categories"]["Row"]
type ProductVariantRow = Database["public"]["Tables"]["product_variants"]["Row"]
type ProductVariantInsert = Database["public"]["Tables"]["product_variants"]["Insert"]
type ProductVariantInsertBase = Omit<ProductVariantInsert, "product_id">
type VariantSizeRow = Database["public"]["Tables"]["variant_sizes"]["Row"]
type OrderRow = Database["public"]["Tables"]["orders"]["Row"]
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"]
type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"]
type PaymentMethodRow = Database["public"]["Tables"]["payment_methods"]["Row"]
type PaymentMethodInsert = Database["public"]["Tables"]["payment_methods"]["Insert"]
type PaymentMethodUpdate = Database["public"]["Tables"]["payment_methods"]["Update"]
type DiscountCampaignRow = Database["public"]["Tables"]["discount_campaigns"]["Row"]
type DiscountCampaignVariantRow = Database["public"]["Tables"]["discount_campaign_variants"]["Row"]

const PLACEHOLDER_IMAGE = "/placeholder.svg?height=400&width=400"

type DownPaymentDbValue = {
  type: "none" | "percent" | "amount"
  value: number | null
}

export function normalizeImageValue(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function parseImageList(raw: string | null): string[] {
  if (typeof raw !== "string") {
    return []
  }

  const trimmed = raw.trim()
  if (trimmed.length === 0) {
    return []
  }

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        const normalized = parsed
          .map((entry) => normalizeImageValue(entry))
          .filter((entry): entry is string => Boolean(entry))
        if (normalized.length > 0) {
          return normalized
        }
      }
    } catch (error) {
      console.warn("[transformers] Failed to parse variant image array", error)
    }
  }

  const single = normalizeImageValue(trimmed)
  return single ? [single] : []
}

export function serializeImageList(images: Array<string | null | undefined>): string | null {
  const normalized = Array.from(
    new Set(images.map((entry) => normalizeImageValue(entry)).filter((entry): entry is string => Boolean(entry))),
  )

  if (normalized.length === 0) {
    return null
  }

  return JSON.stringify(normalized)
}

function collectImageEntries(
  list?: Array<string | null | undefined> | null,
  singleValue?: string | null | undefined,
): string[] {
  const images: Array<string | null | undefined> = []

  if (Array.isArray(list)) {
    images.push(...list)
  }

  if (singleValue !== undefined) {
    images.push(singleValue)
  }

  return Array.from(
    new Set(images.map((entry) => normalizeImageValue(entry)).filter((entry): entry is string => Boolean(entry))),
  )
}

function collectVariantImagesFromInput(input: ProductVariantInput): string[] {
  const hasLegacyImageField = Object.prototype.hasOwnProperty.call(input, "image")
  const singleValue = hasLegacyImageField ? input.image ?? null : undefined
  return collectImageEntries(input.images ?? null, singleValue)
}

function mapDownPaymentFromRow(row: { preorder_down_payment_type?: string | null; preorder_down_payment_value?: number | null }):
  | PreorderDownPaymentConfig
  | null {
  const type = row.preorder_down_payment_type
  if (type !== "percent" && type !== "amount") {
    return null
  }

  const rawValue = row.preorder_down_payment_value
  const value = typeof rawValue === "number" ? Number(rawValue) : Number(rawValue ?? 0)
  if (!Number.isFinite(value) || value <= 0) {
    return null
  }

  if (type === "percent") {
    return {
      type,
      value: Math.min(Math.max(value, 0), 100),
    }
  }

  return {
    type,
    value: Math.max(value, 0),
  }
}

function normalizeVariantDownPayment(
  config: PreorderDownPaymentConfig | null | undefined,
  isPreorder: boolean,
): DownPaymentDbValue {
  if (!isPreorder) {
    return { type: "none", value: null }
  }

  if (!config || (config.type !== "percent" && config.type !== "amount")) {
    return { type: "none", value: null }
  }

  const numericValue = Number(config.value)
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return { type: "none", value: null }
  }

  if (config.type === "percent") {
    return {
      type: "percent",
      value: Math.min(Math.max(numericValue, 0), 100),
    }
  }

  return {
    type: "amount",
    value: Math.max(numericValue, 0),
  }
}

function collectProductImagesFromInput(
  input: Pick<NewProductInput, "images" | "image"> | Pick<UpdateProductInput, "images" | "image">,
): string[] {
  const hasLegacyImageField = Object.prototype.hasOwnProperty.call(input, "image")
  const singleValue = hasLegacyImageField ? (input as { image: string | null | undefined }).image ?? null : undefined
  return collectImageEntries(
    Array.isArray(input.images) ? (input.images as Array<string | null | undefined>) : null,
    singleValue,
  )
}

export function mapPaymentMethodRow(row: PaymentMethodRow): PaymentMethodConfig {
  return {
    id: row.id,
    provider: row.provider,
    accountName: row.account_name,
    instructions: row.instructions,
    qrCodeUrl: row.qr_code_url,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapPaymentMethodInputToInsert(input: NewPaymentMethodInput): PaymentMethodInsert {
  const now = new Date().toISOString()
  return {
    provider: normalizeProvider(input.provider),
    account_name: sanitizeOptionalText(input.accountName),
    instructions: sanitizeOptionalText(input.instructions),
    qr_code_url: input.qrCodeUrl ?? null,
    is_active: input.isActive ?? true,
    created_at: now,
    updated_at: now,
  }
}

export function mapPaymentMethodUpdateToUpdate(input: UpdatePaymentMethodInput): PaymentMethodUpdate {
  const update: PaymentMethodUpdate = {
    updated_at: new Date().toISOString(),
  }

  if (input.provider !== undefined) {
    update.provider = normalizeProvider(input.provider)
  }
  if (input.accountName !== undefined) {
    update.account_name = sanitizeOptionalText(input.accountName)
  }
  if (input.instructions !== undefined) {
    update.instructions = sanitizeOptionalText(input.instructions)
  }
  if (input.qrCodeUrl !== undefined) {
    update.qr_code_url = input.qrCodeUrl ?? null
  }
  if (input.isActive !== undefined) {
    update.is_active = input.isActive
  }

  return update
}

export type ProductRowWithVariants = ProductRow & {
  brand?: BrandRow | null
  product_variants?: (ProductVariantRow & { variant_sizes?: VariantSizeRow[] | null })[] | null
  product_categories?: (ProductCategoryRow & { category?: CategoryRow | null })[] | null
}

type ProductVariantRowWithSizes = ProductVariantRow & { variant_sizes?: VariantSizeRow[] | null }

export type DiscountCampaignVariantRowWithJoins = DiscountCampaignVariantRow & {
  variant?: (ProductVariantRowWithSizes & { product?: ProductRow | null }) | null
}

export type DiscountCampaignRowWithVariants = DiscountCampaignRow & {
  discount_campaign_variants?: DiscountCampaignVariantRowWithJoins[] | null
}

export function mapProductRowToProduct(row: ProductRowWithVariants): Product {
  const variants = (row.product_variants ?? []).map(mapVariantRowToVariant)
  const prices = variants.flatMap((variant) => variant.sizes.map((size) => size.price))
  const totalStock = variants.reduce((sum, variant) => {
    return sum + variant.sizes.reduce((acc, size) => acc + size.stock, 0)
  }, 0)
  const colors = Array.from(new Set(variants.map((variant) => variant.color).filter(Boolean))) as string[]
  const sizes = Array.from(
    new Set(
      variants.flatMap((variant) =>
        variant.sizes
          .map((size) => (size.size && size.size.trim().length > 0 ? size.size.trim() : "Default"))
          .filter((entry): entry is string => Boolean(entry)),
      ),
    ),
  )

  const categoryMap = new Map<number, { id: number; name: string }>()
  for (const entry of row.product_categories ?? []) {
    const category = entry?.category
    if (!category) continue
    const trimmedName = typeof category.name === "string" ? category.name.trim() : ""
    if (trimmedName.length === 0) continue
    categoryMap.set(category.id, { id: category.id, name: trimmedName })
  }

  const categories = Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name))

  const brand =
    row.brand && typeof row.brand.name === "string" && row.brand.name.trim().length > 0
      ? {
        id: row.brand.id,
        name: row.brand.name.trim(),
      }
      : null

  const rawProductImages = parseImageList(row.image_url ?? null)
  const productImages = rawProductImages.filter((url) => url !== PLACEHOLDER_IMAGE)
  const primaryProductImage = productImages[0] ?? rawProductImages[0] ?? PLACEHOLDER_IMAGE

  return {
    id: row.id,
    name: row.name,
    image: primaryProductImage,
    images: productImages,
    price: prices.length > 0 ? Math.min(...prices) : 0,
    stock: totalStock,
    categories,
    brand,
    variants,
    customizationOptions: {
      colors: colors.length > 0 ? colors : undefined,
      sizes: sizes.length > 0 ? sizes : undefined,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapVariantRowToVariant(row: ProductVariantRowWithSizes): ProductVariant {
  const normalizedSizes: ProductVariant["sizes"] =
    row.variant_sizes
      ?.map((sizeRow) => ({
        size: typeof sizeRow.size === "string" && sizeRow.size.trim().length > 0 ? sizeRow.size.trim() : null,
        price: Number(sizeRow.price),
        stock: sizeRow.stock_quantity,
      }))
      .filter((entry) => Number.isFinite(entry.price) && Number.isFinite(entry.stock)) ?? []

  const sizes = normalizedSizes.length > 0 ? normalizedSizes : [{ size: null, price: 0, stock: 0 }]
  const defaultEntry = sizes[0]
  const totalStock = sizes.reduce((sum, entry) => sum + entry.stock, 0)
  const imageList = parseImageList(row.image_url ?? null)
  const primaryImage = imageList[0] ?? undefined
  const preorderDownPayment = mapDownPaymentFromRow(row)

  return {
    id: row.id,
    productId: row.product_id,
    sku: row.sku ?? undefined,
    color: row.color ?? undefined,
    description: row.description ?? undefined,
    size: defaultEntry.size,
    image: primaryImage,
    images: imageList,
    price: defaultEntry.price,
    stock: totalStock,
    isPreorder: Boolean(row.is_preorder),
    isActive: row.is_active !== false,
    sizes,
    preorderDownPayment,
    preorderMessage: row.preorder_message ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapProductInputToInsert(input: NewProductInput, options?: { brandId?: number | null }) {
  const productImages = collectProductImagesFromInput(input)
  const serializedProductImages = serializeImageList(productImages)
  const product: ProductInsert = {
    name: input.name,
    image_url: serializedProductImages ?? null,
  }

  if (options && Object.prototype.hasOwnProperty.call(options, "brandId")) {
    product.brand_id = options.brandId ?? null
  }

  const variantEntries = (input.variants ?? []).map((variant) => {
    const mappedVariant = mapVariantInputToInsert(variant)
    const sizes = mapVariantSizeInputs(variant.sizes)
    const normalizedSizes = mappedVariant.is_preorder
      ? sizes.map((entry) => ({ ...entry, stock: 0 }))
      : sizes

    return {
      variant: mappedVariant,
      sizes: normalizedSizes,
    }
  })

  const variants = variantEntries.map((entry) => entry.variant)
  const variantSizes = variantEntries.map((entry) => entry.sizes)

  return { product, variants, variantSizes }
}

export function mapProductUpdateToUpdate(
  input: UpdateProductInput,
  options?: { brandId?: number | null },
): ProductUpdate {
  const update: ProductUpdate = {}

  if (input.name !== undefined) update.name = input.name

  if (Object.prototype.hasOwnProperty.call(input, "images")) {
    const serialized = serializeImageList(
      collectImageEntries(
        Array.isArray(input.images) ? (input.images as Array<string | null | undefined>) : null,
        undefined,
      ),
    )
    update.image_url = serialized ?? null
  } else if (input.image !== undefined) {
    const serialized = serializeImageList([input.image])
    update.image_url = serialized ?? null
  }
  if (options && Object.prototype.hasOwnProperty.call(options, "brandId")) {
    update.brand_id = options.brandId ?? null
  }

  return update
}

export function mapVariantInputToInsert(input: ProductVariantInput): ProductVariantInsertBase {
  const images = collectVariantImagesFromInput(input)
  const serializedImages = serializeImageList(images)
  const downPayment = normalizeVariantDownPayment(input.preorderDownPayment, Boolean(input.isPreorder))

  return {
    sku: sanitizeOptionalText(input.sku),
    color: sanitizeOptionalText(input.color),
    description: sanitizeOptionalText(input.description),
    image_url: serializedImages,
    is_preorder: Boolean(input.isPreorder),
    preorder_down_payment_type: downPayment.type,
    preorder_down_payment_value: downPayment.value,
    preorder_message: input.preorderMessage ?? null,
    is_active: input.isActive ?? true,
  }
}

function mapVariantSizeInputs(
  inputs?: ProductVariantSizeInput[],
): Array<{ size: string | null; price: number; stock: number }> {
  if (!inputs) return []
  return inputs.map((entry) => ({
    size: sanitizeOptionalText(entry.size ?? null),
    price: Number(entry.price),
    stock: Number(entry.stock ?? 0),
  }))
}

export function mapOrderRowToOrder(row: OrderRow): Order {
  const status = isValidOrderStatus(row.status) ? row.status : "For Evaluation"
  const rawItems = Array.isArray(row.order_items) ? (row.order_items as any[]) : []
  const items = rawItems.map((item) => {
    const productId = Number(item?.productId ?? item?.id ?? 0)
    const variantId = Number(item?.variantId ?? item?.id ?? 0)
    const downPayment = normalizeOrderItemDownPayment(item?.preorderDownPayment)

    return {
      productId,
      variantId,
      name: typeof item?.name === "string" ? item.name : "Unknown Item",
      image: typeof item?.image === "string" && item.image.length > 0 ? item.image : PLACEHOLDER_IMAGE,
      customizations:
        item?.customizations && typeof item.customizations === "object" ? (item.customizations as Record<string, string>) : {},
      price: Number(item?.price ?? 0),
      quantity: Number(item?.quantity ?? 0),
      preorderDownPayment: downPayment,
    }
  })

  return {
    id: row.id,
    date: row.created_at,
    customer: {
      firstName: row.customer_first_name,
      lastName: row.customer_last_name,
      phone: row.customer_phone,
      email: row.customer_email,
      instagramHandle: row.instagram_handle,
    },
    delivery: {
      unit: row.delivery_unit ?? "",
      lot: row.delivery_lot ?? "",
      street: row.delivery_street,
      city: row.delivery_city,
      region: row.delivery_region,
      zipCode: row.delivery_zip_code,
      country: row.delivery_country,
    },
    fulfillmentMethod: row.fulfillment_method === "pickup" ? "pickup" : "delivery",
    pickup:
      row.fulfillment_method === "pickup"
        ? {
          locationName: row.pickup_location_name ?? row.delivery_street,
          unit: row.pickup_location_unit ?? row.delivery_unit ?? "",
          lot: row.pickup_location_lot ?? row.delivery_lot ?? "",
          street: row.pickup_location_street ?? row.delivery_street,
          city: row.pickup_location_city ?? row.delivery_city,
          region: row.pickup_location_region ?? row.delivery_region,
          zipCode: row.pickup_location_zip_code ?? row.delivery_zip_code,
          country: row.pickup_location_country ?? row.delivery_country,
          notes: row.pickup_location_notes ?? "",
          scheduledDate: row.pickup_scheduled_date,
          scheduledTime: row.pickup_scheduled_time,
        }
        : null,
    items,
    paymentMethod: row.payment_method,
    proofOfPayment: row.proof_of_payment_url,
    subtotal: Number(row.subtotal),
    vat: Number(row.vat),
    shippingFee: Number(row.shipping_fee ?? 0),
    trackingId: row.tracking_id ?? null,
    total: Number(row.total),
    status,
    isRead: row.is_read,
    inventoryAdjusted: row.inventory_adjusted,
    updatedAt: row.updated_at,
  }
}

export function mapOrderInputToInsert(id: string, input: NewOrderInput): OrderInsert {
  return {
    id,
    payment_method: input.paymentMethod,
    proof_of_payment_url: input.proofOfPayment ?? null,
    customer_first_name: input.customer.firstName,
    customer_last_name: input.customer.lastName,
    customer_phone: input.customer.phone,
    customer_email: input.customer.email,
    instagram_handle: input.customer.instagramHandle ?? null,
    delivery_unit: input.delivery.unit || null,
    delivery_lot: input.delivery.lot || null,
    delivery_street: input.delivery.street,
    delivery_city: input.delivery.city,
    delivery_region: input.delivery.region,
    delivery_zip_code: input.delivery.zipCode,
    delivery_country: input.delivery.country,
    fulfillment_method: input.fulfillmentMethod,
    pickup_location_name: input.pickup?.locationName ?? null,
    pickup_location_unit: input.pickup?.unit ?? null,
    pickup_location_lot: input.pickup?.lot ?? null,
    pickup_location_street: input.pickup?.street ?? null,
    pickup_location_city: input.pickup?.city ?? null,
    pickup_location_region: input.pickup?.region ?? null,
    pickup_location_zip_code: input.pickup?.zipCode ?? null,
    pickup_location_country: input.pickup?.country ?? null,
    pickup_location_notes: input.pickup?.notes ?? null,
    pickup_scheduled_date: input.pickup?.scheduledDate ?? null,
    pickup_scheduled_time: input.pickup?.scheduledTime ?? null,
    order_items: input.items,
    subtotal: input.subtotal,
    vat: input.vat,
    shipping_fee: input.shippingFee,
    tracking_id: input.trackingId ?? null,
    total: input.total,
    status: "For Evaluation",
    is_read: false,
    inventory_adjusted: false,
  }
}

export function mapOrderUpdate(input: Partial<Order>): OrderUpdate {
  const update: OrderUpdate = {}

  if (input.paymentMethod !== undefined) update.payment_method = input.paymentMethod
  if (input.proofOfPayment !== undefined) update.proof_of_payment_url = input.proofOfPayment
  if (input.customer) {
    update.customer_first_name = input.customer.firstName
    update.customer_last_name = input.customer.lastName
    update.customer_phone = input.customer.phone
    update.customer_email = input.customer.email
    if (Object.prototype.hasOwnProperty.call(input.customer, "instagramHandle")) {
      update.instagram_handle = input.customer.instagramHandle ?? null
    }
  }
  if (input.delivery) {
    update.delivery_unit = input.delivery.unit
    update.delivery_lot = input.delivery.lot
    update.delivery_street = input.delivery.street
    update.delivery_city = input.delivery.city
    update.delivery_region = input.delivery.region
    update.delivery_zip_code = input.delivery.zipCode
    update.delivery_country = input.delivery.country
  }
  if (input.fulfillmentMethod !== undefined) {
    update.fulfillment_method = input.fulfillmentMethod
  }
  if (Object.prototype.hasOwnProperty.call(input, "pickup")) {
    const pickup = input.pickup ?? null
    update.pickup_location_name = pickup?.locationName ?? null
    update.pickup_location_unit = pickup?.unit ?? null
    update.pickup_location_lot = pickup?.lot ?? null
    update.pickup_location_street = pickup?.street ?? null
    update.pickup_location_city = pickup?.city ?? null
    update.pickup_location_region = pickup?.region ?? null
    update.pickup_location_zip_code = pickup?.zipCode ?? null
    update.pickup_location_country = pickup?.country ?? null
    update.pickup_location_notes = pickup?.notes ?? null
    update.pickup_scheduled_date = pickup?.scheduledDate ?? null
    update.pickup_scheduled_time = pickup?.scheduledTime ?? null
  }
  if (input.items !== undefined) update.order_items = input.items
  if (input.subtotal !== undefined) update.subtotal = input.subtotal
  if (input.vat !== undefined) update.vat = input.vat
  if (input.shippingFee !== undefined) update.shipping_fee = input.shippingFee
  if (input.trackingId !== undefined) update.tracking_id = input.trackingId
  if (input.total !== undefined) update.total = input.total
  if (input.status !== undefined) update.status = input.status
  if (input.isRead !== undefined) update.is_read = input.isRead
  if (input.inventoryAdjusted !== undefined) update.inventory_adjusted = input.inventoryAdjusted

  return update
}

export function mapDiscountCampaignRow(row: DiscountCampaignRowWithVariants): DiscountCampaign {
  const variants =
    row.discount_campaign_variants?.map((entry) => mapDiscountCampaignVariantRow(row.id, entry)) ?? []

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    bannerImage: row.banner_image_url,
    startDate: row.start_date,
    endDate: row.end_date,
    isActive: row.is_active,
    variants,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapDiscountCampaignVariantRow(
  campaignId: string,
  row: DiscountCampaignVariantRowWithJoins,
): DiscountCampaignVariant {
  const variantRow = row.variant ?? null
  const productRow = variantRow?.product ?? null

  let basePrice = 0
  if (variantRow) {
    const mappedVariant = mapVariantRowToVariant(variantRow)
    const sizePrices = mappedVariant.sizes.map((size) => size.price)
    basePrice = sizePrices.length > 0 ? Math.min(...sizePrices) : 0
  }

  const productId = variantRow?.product_id ?? productRow?.id ?? 0
  const productName = productRow?.name ?? "Unknown product"
  const variantLabel = variantRow?.color ?? variantRow?.sku ?? null

  return {
    id: row.id,
    campaignId,
    variantId: row.variant_id,
    productId,
    productName,
    variantLabel,
    sku: variantRow?.sku ?? null,
    color: variantRow?.color ?? null,
    image: variantRow?.image_url ?? productRow?.image_url ?? PLACEHOLDER_IMAGE,
    basePrice,
    discountPercent: Number(row.discount_percent),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function isValidOrderStatus(value: string): value is OrderStatus {
  return [
    "For Evaluation",
    "Confirmed",
    "For Delivery",
    "Out for Delivery",
    "For Refund",
    "Refunded",
    "Completed",
    "Cancelled",
  ].includes(value as OrderStatus)
}

function sanitizeOptionalText(value?: string | null) {
  if (value === undefined || value === null) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeProvider(value: string) {
  return value.trim().toLowerCase()
}

function normalizeOrderItemDownPayment(raw: unknown): PreorderDownPaymentSummary | null {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const candidate = raw as {
    type?: unknown
    value?: unknown
    perUnitAmount?: unknown
    totalAmount?: unknown
  }

  if (candidate.type !== "percent" && candidate.type !== "amount") {
    return null
  }

  const value = Number(candidate.value)
  const perUnitAmount = Number(candidate.perUnitAmount)
  const totalAmount = Number(candidate.totalAmount)

  if (!Number.isFinite(value) || !Number.isFinite(perUnitAmount) || !Number.isFinite(totalAmount)) {
    return null
  }

  return {
    type: candidate.type,
    value,
    perUnitAmount,
    totalAmount,
  }
}
