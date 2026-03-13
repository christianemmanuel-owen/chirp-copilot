import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import {
  mapDiscountCampaignRow,
  mapProductRowToProduct,
  type DiscountCampaignRowWithVariants,
  type ProductRowWithVariants,
} from "@/lib/supabase/transformers"
import type { Database } from "@/lib/supabase/types"
import type { DiscountCampaign, PreorderDownPaymentConfig, Product } from "@/lib/types"
import { createVariantSlug } from "@/lib/utils"

const PRODUCT_SELECT_FIELDS =
  "*, brand:brands(*), product_categories(category:categories(*)), product_variants(*, variant_sizes(*))"

const DISCOUNT_CAMPAIGN_SELECT = `
  *,
  discount_campaign_variants (
    id,
    campaign_id,
    variant_id,
    discount_percent,
    created_at,
    updated_at,
    variant:product_variants (
      *,
      product:products(*),
      variant_sizes(*)
    )
  )
`

export type CollectionTileKind = "brand" | "category"

type BrandRow = Database["public"]["Tables"]["brands"]["Row"]
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"]
type OrderRow = Database["public"]["Tables"]["orders"]["Row"]
type StorefrontSettingsRow = Database["public"]["Tables"]["storefront_settings"]["Row"]

export interface NavCollectionItem {
  id: number
  name: string
  image: string
  href: string
  kind: CollectionTileKind
}

export interface CollectionTile {
  id: number
  name: string
  image: string
  href: string
  totalSold: number
  productCount: number
  variantCount: number
  kind: CollectionTileKind
}

export interface HeroProductHighlight {
  id: number
  title: string
  subtitle: string
  image: string
  href: string
  accent?: string
  productId?: number
  ctaLabel?: string
  discountCampaignId?: string
  variantLabel?: string | null
}

export interface CatalogVariant {
  id: number
  productId: number
  productName: string
  variantLabel: string | null
  displayName: string
  image: string
  description: string | null
  brandName: string | null
  categories: string[]
  sizes: { label: string; price: number; stock: number }[]
  minPrice: number
  maxPrice: number
  totalStock: number
  detailPath: string
  isPreorder: boolean
  discountPercent?: number | null
}

export type CollectionTileMode = "brands" | "categories"

export interface DiscountFilterPayload {
  campaignId: string
  name: string
  description?: string | null
  variantIds: number[]
}

export interface CatalogData {
  navItems: NavCollectionItem[]
  navBrands: NavCollectionItem[]
  navCategories: NavCollectionItem[]
  tileMode: CollectionTileMode
  tiles: CollectionTile[]
  brandTiles: CollectionTile[]
  categoryTiles: CollectionTile[]
  hero: {
    popular: HeroProductHighlight | null
    latest: HeroProductHighlight | null
    featured: HeroProductHighlight[]
    slides: HeroProductHighlight[]
  }
  discountFilter?: DiscountFilterPayload
  variants: CatalogVariant[]
  discountCampaigns: DiscountCampaign[]
  categoryFilters: string[]
  brandFilters: string[]
  priceRange: [number, number]
}

export interface VariantDetailSizeOption {
  size: string | null
  label: string
  price: number
  stock: number
}

export interface VariantDetailSibling {
  id: number
  label: string
  detailPath: string
  image: string
  isActive: boolean
}

const getActiveVariants = (product: Product) =>
  (product.variants ?? []).filter((variant) => variant.isActive)

const getActiveVariantImages = (product: Product) =>
  getActiveVariants(product).map((variant) => variant.image ?? undefined)

export interface VariantDetailData {
  product: {
    id: number
    name: string
    brandName: string | null
    categories: string[]
  }
  variant: {
    id: number
    label: string | null
    displayName: string
    sku: string | null
    description: string | null
    image: string
    isPreorder: boolean
    preorderMessage: string | null
    preorderDownPayment: PreorderDownPaymentConfig | null
    sizeOptions: VariantDetailSizeOption[]
    minPrice: number
    maxPrice: number
    totalStock: number
  }
  breadcrumbs: Array<{ label: string; href?: string }>
  gallery: string[]
  galleryCaptions: string[]
  siblingVariants: VariantDetailSibling[]
}

const PLACEHOLDER_IMAGE = "/placeholder.svg?height=400&width=400"

const VARIANT_FALLBACK_LABEL = "Classic"
const DISCOUNT_SLIDE_ID_BASE = 1_000_000_000

interface DiscountPromotion {
  slide: HeroProductHighlight
  campaignId: string
  campaignName: string
  description?: string | null
  variantIds: number[]
}

function buildVariantDisplayName(productName: string, variantLabel: string | null, sku?: string | null) {
  const normalizedLabel = variantLabel && variantLabel.trim().length > 0 ? variantLabel.trim() : null
  if (normalizedLabel) {
    return `${productName} · ${normalizedLabel}`
  }

  const normalizedSku = sku && sku.trim().length > 0 ? sku.trim() : null
  if (normalizedSku) {
    return `${productName} · ${normalizedSku}`
  }

  return `${productName} · ${VARIANT_FALLBACK_LABEL}`
}

function pickProductLeadImage(
  productImage: string,
  variantImages: Array<string | undefined>,
  options?: { exclude?: Set<string> },
) {
  const normalizeImageValue = (value: string | undefined | null): string | null => {
    if (typeof value !== "string") return null
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  const excluded = new Set<string>()
  if (options?.exclude) {
    for (const entry of options.exclude) {
      const normalized = normalizeImageValue(entry)
      if (normalized) {
        excluded.add(normalized)
      }
    }
  }

  const normalizedVariantImages: string[] = []
  for (const image of variantImages) {
    const normalized = normalizeImageValue(image)
    if (normalized) {
      normalizedVariantImages.push(normalized)
    }
  }

  for (const image of normalizedVariantImages) {
    if (excluded.has(image)) continue
    return image
  }

  const normalizedProductImage = normalizeImageValue(productImage)
  if (normalizedProductImage && !excluded.has(normalizedProductImage)) {
    return normalizedProductImage
  }

  const fallbackCandidate = normalizedVariantImages[0] ?? normalizedProductImage
  if (fallbackCandidate) {
    return fallbackCandidate
  }

  return PLACEHOLDER_IMAGE
}

function formatSoldSubtitle(quantity: number, categoryName?: string) {
  if (quantity <= 0) {
    return categoryName ? `Explore our favorites in ${categoryName}` : "Explore our community favorites"
  }

  if (categoryName) {
    return `Top seller in ${categoryName} · ${quantity} sold`
  }

  return `${quantity} sold by our community`
}

function buildDiscountPromotion(campaigns: DiscountCampaign[]): DiscountPromotion | null {
  if (!Array.isArray(campaigns) || campaigns.length === 0) {
    return null
  }

  const now = new Date()
  const featuredCampaign = selectFeaturedCampaign(campaigns, now)
  if (!featuredCampaign) {
    return null
  }

  const featuredVariant = selectTopCampaignVariant(featuredCampaign)
  if (!featuredVariant) {
    return null
  }

  const accent =
    featuredVariant.discountPercent > 0
      ? `${formatDiscountPercent(featuredVariant.discountPercent)} OFF`
      : "Limited offer"

  const variantLabel = featuredVariant.variantLabel ?? featuredVariant.color ?? null
  const defaultSubtitle = `Save ${formatDiscountPercent(
    featuredVariant.discountPercent,
  )} on ${featuredVariant.productName}${variantLabel ? ` - ${variantLabel}` : ""}${formatCampaignDeadline(
    featuredCampaign.endDate,
  )}`
  const subtitle =
    typeof featuredCampaign.description === "string" && featuredCampaign.description.trim().length > 0
      ? featuredCampaign.description.trim()
      : defaultSubtitle

  const variantIds = Array.from(
    new Set(
      (featuredCampaign.variants ?? [])
        .map((variant) => Number(variant.variantId))
        .filter((variantId) => Number.isInteger(variantId) && variantId > 0),
    ),
  )

  const bannerImage =
    typeof featuredCampaign.bannerImage === "string" && featuredCampaign.bannerImage.trim().length > 0
      ? featuredCampaign.bannerImage.trim()
      : featuredVariant.image ?? PLACEHOLDER_IMAGE

  const slide: HeroProductHighlight = {
    id: buildCampaignSlideId(featuredCampaign.id),
    productId: featuredVariant.productId,
    title: featuredCampaign.name,
    subtitle,
    image: bannerImage,
    href: `/catalog?q=${encodeURIComponent(featuredVariant.productName)}`,
    accent,
    ctaLabel: "Shop Discounted",
    discountCampaignId: featuredCampaign.id,
  }

  return {
    slide,
    campaignId: featuredCampaign.id,
    campaignName: featuredCampaign.name,
    description: featuredCampaign.description?.trim() ?? null,
    variantIds,
  }
}

function selectFeaturedCampaign(campaigns: DiscountCampaign[], now: Date): DiscountCampaign | null {
  const eligible = campaigns.filter((campaign) => campaign.isActive && campaign.variants.length > 0)
  if (eligible.length === 0) {
    return null
  }

  const nowMs = now.getTime()

  const activeCampaigns = eligible
    .filter((campaign) => isCampaignActive(campaign, nowMs))
    .sort((a, b) => compareNumericAsc(parseCampaignDate(a.endDate), parseCampaignDate(b.endDate)))
  if (activeCampaigns.length > 0) {
    return activeCampaigns[0] ?? null
  }

  const upcomingCampaigns = eligible
    .filter((campaign) => isCampaignUpcoming(campaign, nowMs))
    .sort((a, b) => compareNumericAsc(parseCampaignDate(a.startDate), parseCampaignDate(b.startDate)))
  if (upcomingCampaigns.length > 0) {
    return upcomingCampaigns[0] ?? null
  }

  return (
    eligible.sort((a, b) =>
      compareNumericDesc(parseCampaignDate(a.updatedAt ?? a.startDate), parseCampaignDate(b.updatedAt ?? b.startDate)),
    )[0] ?? null
  )
}

function selectTopCampaignVariant(campaign: DiscountCampaign) {
  if (!campaign.variants || campaign.variants.length === 0) {
    return null
  }
  const sorted = [...campaign.variants].sort((a, b) => {
    if (b.discountPercent !== a.discountPercent) {
      return b.discountPercent - a.discountPercent
    }
    if (a.basePrice !== b.basePrice) {
      return a.basePrice - b.basePrice
    }
    return a.id - b.id
  })
  return sorted[0] ?? null
}

function isCampaignActive(campaign: DiscountCampaign, nowMs: number): boolean {
  const start = parseCampaignDate(campaign.startDate)
  const end = addEndOfDayTimestamp(parseCampaignDate(campaign.endDate))
  if (start === null || end === null) return false
  return start <= nowMs && nowMs <= end
}

function isCampaignUpcoming(campaign: DiscountCampaign, nowMs: number): boolean {
  const start = parseCampaignDate(campaign.startDate)
  if (start === null) return false
  return start > nowMs
}

function parseCampaignDate(value?: string | null): number | null {
  if (!value) return null
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? null : timestamp
}

function addEndOfDayTimestamp(timestamp: number | null): number | null {
  if (timestamp === null) return null
  const date = new Date(timestamp)
  date.setHours(23, 59, 59, 999)
  return date.getTime()
}

function formatDiscountPercent(value: number): string {
  if (!Number.isFinite(value)) return "0%"
  if (Number.isInteger(value)) {
    return `${value}%`
  }
  return `${Number(value.toFixed(1))}%`
}

function formatCampaignDeadline(endDate?: string): string {
  const timestamp = parseCampaignDate(endDate ?? null)
  if (timestamp === null) return ""
  return ` · Ends ${new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
}

function buildCampaignSlideId(campaignId: string): number {
  let hash = 0
  for (let index = 0; index < campaignId.length; index += 1) {
    hash = (hash * 31 + campaignId.charCodeAt(index)) >>> 0
  }
  return DISCOUNT_SLIDE_ID_BASE + hash
}

function compareNumericAsc(a: number | null, b: number | null): number {
  const left = a ?? Number.POSITIVE_INFINITY
  const right = b ?? Number.POSITIVE_INFINITY
  return left - right
}

function compareNumericDesc(a: number | null, b: number | null): number {
  const left = a ?? Number.NEGATIVE_INFINITY
  const right = b ?? Number.NEGATIVE_INFINITY
  return right - left
}

function formatRecentSubtitle(createdAt: string | undefined, categoryName?: string) {
  if (!createdAt) {
    return categoryName ? `Newest in ${categoryName}` : "Freshly added to the collection"
  }

  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) {
    return categoryName ? `Newest in ${categoryName}` : "Freshly added to the collection"
  }

  const formatted = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return categoryName ? `Newest in ${categoryName} · Added ${formatted}` : `Added ${formatted}`
}

export async function getCatalogData(): Promise<CatalogData> {
  const supabase = getSupabaseServiceRoleClient()

  const [
    { data: productRows, error: productError },
    { data: orderRows, error: orderError },
    { data: categoryRows, error: categoryError },
    { data: brandRows, error: brandError },
    { data: settingsRow, error: settingsError },
    { data: discountCampaignRows, error: discountCampaignError },
  ] = await Promise.all([
    supabase.from("products").select(PRODUCT_SELECT_FIELDS),
    supabase.from("orders").select("order_items, created_at"),
    supabase.from("categories").select("id, name"),
    supabase.from("brands").select("id, name"),
    supabase
      .from("storefront_settings")
      .select(
        "id, home_collection_mode, home_banner_manual_product_ids, highlight_popular_hero, highlight_latest_hero, nav_collections_enabled, updated_at",
      )
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle<StorefrontSettingsRow>(),
    supabase
      .from("discount_campaigns")
      .select(DISCOUNT_CAMPAIGN_SELECT)
      .order("start_date", { ascending: true })
      .limit(10),
  ])

  if (productError) {
    console.error("[storefront] Failed to load products from Supabase", productError)
    throw new Error("Failed to load catalog products")
  }

  if (orderError) {
    console.error("[storefront] Failed to load orders from Supabase", orderError)
    throw new Error("Failed to load order insights")
  }

  if (categoryError) {
    console.error("[storefront] Failed to load categories from Supabase", categoryError)
    throw new Error("Failed to load categories")
  }

  if (brandError) {
    console.error("[storefront] Failed to load brands from Supabase", brandError)
    throw new Error("Failed to load brands")
  }

  if (settingsError) {
    console.error("[storefront] Failed to load storefront settings", settingsError)
  }

  if (discountCampaignError) {
    console.error("[storefront] Failed to load discount campaigns", discountCampaignError)
  }

  const highlightPopular = settingsRow?.highlight_popular_hero ?? true
  const highlightLatest = settingsRow?.highlight_latest_hero ?? true
  const navCollectionsEnabled =
    typeof settingsRow?.nav_collections_enabled === "boolean" ? settingsRow.nav_collections_enabled : true
  const discountCampaigns =
    (discountCampaignRows as DiscountCampaignRowWithVariants[] | null)?.map((row) => mapDiscountCampaignRow(row)) ?? []

  const UNBRANDED_BRAND_ID = -1
  const UNBRANDED_LABEL = "Unbranded"

  const productEntries = ((productRows ?? []) as ProductRowWithVariants[]).map((row) => mapProductRowToProduct(row))
  const productMap = new Map<number, ReturnType<typeof mapProductRowToProduct>>()
  const productCategoryMap = new Map<number, Set<number>>()
  const brandProductMap = new Map<number, Set<number>>()

  for (const product of productEntries) {
    productMap.set(product.id, product)

    for (const category of product.categories ?? []) {
      if (typeof category.id !== "number") continue
      if (!productCategoryMap.has(category.id)) {
        productCategoryMap.set(category.id, new Set<number>())
      }
      productCategoryMap.get(category.id)!.add(product.id)
    }

    const brandId = typeof product.brand?.id === "number" ? product.brand.id : UNBRANDED_BRAND_ID
    if (!brandProductMap.has(brandId)) {
      brandProductMap.set(brandId, new Set<number>())
    }
    brandProductMap.get(brandId)!.add(product.id)
  }

  const categoryFilterNames = new Set<string>()
  const categoryNameMap = new Map<number, string>()
  const brandNameMap = new Map<number, string>()

  for (const category of categoryRows ?? []) {
    if (!category) continue
    if (category.name && category.name.trim().length > 0) {
      const name = category.name.trim()
      categoryFilterNames.add(name)
      categoryNameMap.set(category.id, name)
    }
  }

  const productSales = new Map<number, number>()
  const orders = (orderRows ?? []) as OrderRow[]

  for (const order of orders) {
    const items = Array.isArray(order.order_items) ? (order.order_items as any[]) : []

    for (const item of items) {
      if (!item) continue
      const productId = Number(item.productId ?? item.id ?? 0)
      const quantity = Number(item.quantity ?? 0)

      if (!Number.isFinite(productId) || productId <= 0 || !Number.isFinite(quantity) || quantity <= 0) {
        continue
      }

      productSales.set(productId, (productSales.get(productId) ?? 0) + quantity)

      const product = productMap.get(productId)
      if (!product) continue
      for (const category of product.categories ?? []) {
        if (typeof category.id !== "number") continue
      }
    }
  }

  const variants: CatalogVariant[] = []
  const brandNames = new Set<string>()

  for (const product of productEntries) {
    const categories = product.categories?.map((category) => category.name) ?? []
    const brandName = product.brand?.name ?? null
    if (brandName && brandName.trim().length > 0) {
      brandNames.add(brandName.trim())
    }

    const activeVariants = getActiveVariants(product)
    for (const variant of activeVariants) {
      const sizeEntries = variant.sizes.map((entry) => ({
        label: entry.size && entry.size.trim().length > 0 ? entry.size.trim() : "Default",
        price: Number(entry.price),
        stock: Number(entry.stock),
      }))

      const prices = sizeEntries.map((entry) => entry.price).filter((price) => Number.isFinite(price))
      const minPrice = prices.length > 0 ? Math.min(...prices) : Number(variant.price ?? 0)
      const maxPrice = prices.length > 0 ? Math.max(...prices) : Number(variant.price ?? 0)
      const totalStock = sizeEntries.reduce((sum, entry) => sum + (Number.isFinite(entry.stock) ? entry.stock : 0), 0)
      const detailPath = `/shop/${createVariantSlug(variant.id, product.name, variant.color ?? variant.sku ?? null)}`

      variants.push({
        id: variant.id,
        productId: product.id,
        productName: product.name,
        variantLabel: variant.color ?? variant.sku ?? null,
        displayName: buildVariantDisplayName(product.name, variant.color ?? null, variant.sku ?? null),
        image: pickProductLeadImage(product.image, [variant.image, product.image]),
        description: variant.description ?? null,
        brandName,
        categories,
        sizes: sizeEntries,
        minPrice,
        maxPrice,
        totalStock,
        detailPath,
        isPreorder: Boolean(variant.isPreorder),
      })
    }
  }

  const allPrices = variants.flatMap((variant) => variant.sizes.map((entry) => entry.price).filter(Number.isFinite))
  const priceMin = allPrices.length > 0 ? Math.floor(Math.min(...allPrices)) : 0
  const priceMax = allPrices.length > 0 ? Math.ceil(Math.max(...allPrices)) : priceMin

  let popularProductHighlight: HeroProductHighlight | null = null
  let latestProductHighlight: HeroProductHighlight | null = null
  const manualProductHighlights: HeroProductHighlight[] = []
  const manualProductIdSet = new Set<number>()
  const heroImageExclusions = new Set<string>()
  let highlightedPopularProductId: number | null = null

  if (productEntries.length > 0) {
    const productsBySales = [...productEntries].sort((a, b) => {
      const salesA = productSales.get(a.id) ?? 0
      const salesB = productSales.get(b.id) ?? 0
      if (salesB !== salesA) return salesB - salesA
      return (b.stock ?? 0) - (a.stock ?? 0)
    })

    const topProduct = productsBySales[0] ?? null
    if (topProduct) {
      const totalSold = productSales.get(topProduct.id) ?? 0
      const topCategoryName = topProduct.categories?.[0]?.name
      const heroImage = pickProductLeadImage(topProduct.image, getActiveVariantImages(topProduct))

      popularProductHighlight = {
        id: topProduct.id,
        productId: topProduct.id,
        title: topProduct.name,
        subtitle: formatSoldSubtitle(totalSold, topCategoryName),
        image: heroImage,
        href: `/catalog?q=${encodeURIComponent(topProduct.name)}`,
        accent: topProduct.brand?.name ?? topCategoryName ?? undefined,
      }
      highlightedPopularProductId = topProduct.id

      if (highlightPopular) {
        heroImageExclusions.add(heroImage)
      }
    }

    const productsByRecency = [...productEntries].sort((a, b) => {
      const createdA = a.createdAt ?? ""
      const createdB = b.createdAt ?? ""
      if (createdA === createdB) return 0
      return createdA > createdB ? -1 : 1
    })

    const latestProduct =
      productsByRecency.find((product) => (highlightedPopularProductId === null ? true : product.id !== highlightedPopularProductId)) ??
      productsByRecency[0] ??
      null
    if (latestProduct) {
      const latestCategoryName = latestProduct.categories?.[0]?.name
      const heroImage = pickProductLeadImage(latestProduct.image, getActiveVariantImages(latestProduct))

      latestProductHighlight = {
        id: latestProduct.id,
        productId: latestProduct.id,
        title: latestProduct.name,
        subtitle: formatRecentSubtitle(latestProduct.createdAt, latestCategoryName),
        image: heroImage,
        href: `/catalog?q=${encodeURIComponent(latestProduct.name)}`,
        accent: latestProduct.brand?.name ?? latestCategoryName ?? undefined,
      }

      if (highlightLatest) {
        heroImageExclusions.add(heroImage)
      }
    }
  }

  const manualProductIds = Array.isArray(settingsRow?.home_banner_manual_product_ids)
    ? (settingsRow?.home_banner_manual_product_ids as unknown[])
    : []

  for (const entry of manualProductIds) {
    const productId = Number(entry)
    if (!Number.isInteger(productId) || productId <= 0 || manualProductIdSet.has(productId)) {
      continue
    }

    const product = productMap.get(productId)
    if (!product) {
      continue
    }

    const topCategoryName = product.categories?.[0]?.name
    const heroImage = pickProductLeadImage(product.image, getActiveVariantImages(product), {
      exclude: heroImageExclusions,
    })

    heroImageExclusions.add(heroImage)
    manualProductIdSet.add(product.id)

    const totalSold = productSales.get(product.id) ?? 0
    const subtitle =
      totalSold > 0
        ? formatSoldSubtitle(totalSold, topCategoryName)
        : formatRecentSubtitle(product.createdAt, topCategoryName)

    manualProductHighlights.push({
      id: product.id,
      productId: product.id,
      title: product.name,
      subtitle,
      image: heroImage,
      href: `/catalog?q=${encodeURIComponent(product.name)}`,
      accent: product.brand?.name ?? topCategoryName ?? undefined,
    })
  }

  const discountPromotion = buildDiscountPromotion(discountCampaigns)
  const discountPercentMap = new Map<number, number>()
  if (discountPromotion) {
    const featuredCampaign = discountCampaigns.find((campaign) => campaign.id === discountPromotion.campaignId)
    if (featuredCampaign) {
      for (const variant of featuredCampaign.variants ?? []) {
        const variantId = Number(variant.variantId)
        const percent = Number(variant.discountPercent)
        if (!Number.isInteger(variantId) || variantId <= 0) continue
        if (!Number.isFinite(percent) || percent <= 0) continue
        discountPercentMap.set(variantId, percent)
      }
    }
  }

  const campaignSlide = discountPromotion?.slide
  const discountFilter =
    discountPromotion && discountPromotion.variantIds.length > 0
      ? {
        campaignId: discountPromotion.campaignId,
        name: discountPromotion.campaignName,
        description: discountPromotion.description,
        variantIds: discountPromotion.variantIds,
      }
      : undefined

  if (discountPercentMap.size > 0) {
    for (const variant of variants) {
      const percent = discountPercentMap.get(variant.id)
      if (typeof percent === "number") {
        variant.discountPercent = percent
      }
    }
  }

  if (campaignSlide) {
    heroImageExclusions.add(campaignSlide.image)
  }

  const heroSlides: HeroProductHighlight[] = []
  const usedProductIds = new Set<number>()

  if (campaignSlide) {
    heroSlides.push(campaignSlide)
    if (typeof campaignSlide.productId === "number") {
      usedProductIds.add(campaignSlide.productId)
    }
  }

  for (const manualHighlight of manualProductHighlights) {
    heroSlides.push(manualHighlight)
    if (typeof manualHighlight.productId === "number") {
      usedProductIds.add(manualHighlight.productId)
    }
  }

  if (
    highlightPopular &&
    popularProductHighlight &&
    !usedProductIds.has(popularProductHighlight.productId ?? popularProductHighlight.id)
  ) {
    heroSlides.push(popularProductHighlight)
    usedProductIds.add(popularProductHighlight.productId ?? popularProductHighlight.id)
  }

  if (
    highlightLatest &&
    latestProductHighlight &&
    !usedProductIds.has(latestProductHighlight.productId ?? latestProductHighlight.id)
  ) {
    heroSlides.push(latestProductHighlight)
    usedProductIds.add(latestProductHighlight.productId ?? latestProductHighlight.id)
  }

  const buildTileSummary = ({
    id,
    name,
    productIds,
    href,
    kind,
  }: {
    id: number
    name: string
    productIds: number[]
    href: string
    kind: CollectionTileKind
  }): CollectionTile | null => {
    if (productIds.length === 0) return null

    const productCount = productIds.length
    let totalSold = 0
    let totalVariants = 0

    let bestProductId: number | null = null
    let bestSales = -1
    let bestVariantCount = -1
    let newestCreatedAt: string | null = null

    for (const productId of productIds) {
      const sales = productSales.get(productId) ?? 0
      totalSold += sales
      const product = productMap.get(productId)
      if (!product) continue

      const activeVariantCount = getActiveVariants(product).length
      totalVariants += activeVariantCount
      const createdAt = product.createdAt ?? ""

      let isBetter = false
      if (sales > bestSales) {
        isBetter = true
      } else if (sales === bestSales) {
        if (activeVariantCount > bestVariantCount) {
          isBetter = true
        } else if (activeVariantCount === bestVariantCount) {
          if (!newestCreatedAt || (createdAt && createdAt > newestCreatedAt)) {
            isBetter = true
          }
        }
      }

      if (isBetter) {
        bestProductId = productId
        bestSales = sales
        bestVariantCount = activeVariantCount
        newestCreatedAt = createdAt || null
      }
    }

    if (bestProductId === null && productIds.length > 0) {
      bestProductId = productIds[0] ?? null
    }

    let leadImage = PLACEHOLDER_IMAGE
    if (bestProductId !== null) {
      const leadProduct = productMap.get(bestProductId)
      if (leadProduct) {
        leadImage = pickProductLeadImage(leadProduct.image, getActiveVariantImages(leadProduct), {
          exclude: heroImageExclusions,
        })
      }
    }

    return {
      id,
      name,
      image: leadImage,
      href,
      totalSold,
      productCount,
      variantCount: totalVariants,
      kind,
    }
  }

  const tileSortComparator = (a: CollectionTile, b: CollectionTile) => {
    if (b.totalSold !== a.totalSold) return b.totalSold - a.totalSold
    if (b.productCount !== a.productCount) return b.productCount - a.productCount
    return a.name.localeCompare(b.name)
  }

  const brandSummaries: CollectionTile[] = []
  const processedBrandIds = new Set<number>()

  const resolveBrandName = (brandId: number): string => {
    if (brandId === UNBRANDED_BRAND_ID) return UNBRANDED_LABEL
    return brandNameMap.get(brandId) ?? `Brand ${brandId}`
  }

  const buildBrandSummary = (brandId: number, displayName: string) => {
    const productIds = Array.from(brandProductMap.get(brandId) ?? [])
    const tile = buildTileSummary({
      id: brandId,
      name: displayName,
      productIds,
      href: `/catalog?brand=${encodeURIComponent(displayName)}`,
      kind: "brand",
    })
    if (tile) {
      brandSummaries.push(tile)
    }
  }

  for (const brand of brandRows ?? []) {
    if (!brand) continue
    const name = typeof brand.name === "string" ? brand.name.trim() : ""
    if (name.length === 0) continue
    brandNameMap.set(brand.id, name)
    processedBrandIds.add(brand.id)
    buildBrandSummary(brand.id, name)
  }

  for (const [brandId] of brandProductMap) {
    if (processedBrandIds.has(brandId)) continue
    const name = resolveBrandName(brandId)
    buildBrandSummary(brandId, name)
  }

  brandSummaries.sort(tileSortComparator)

  const categorySummaries: CollectionTile[] = []
  const processedCategoryIds = new Set<number>()

  const resolveCategoryName = (categoryId: number): string => {
    return categoryNameMap.get(categoryId) ?? `Category ${categoryId}`
  }

  const buildCategorySummary = (categoryId: number, displayName: string) => {
    const productIds = Array.from(productCategoryMap.get(categoryId) ?? [])
    const tile = buildTileSummary({
      id: categoryId,
      name: displayName,
      productIds,
      href: `/catalog?category=${encodeURIComponent(displayName)}`,
      kind: "category",
    })
    if (tile) {
      categorySummaries.push(tile)
    }
  }

  for (const category of categoryRows ?? []) {
    if (!category) continue
    const name = typeof category.name === "string" ? category.name.trim() : ""
    if (name.length === 0) continue
    processedCategoryIds.add(category.id)
    buildCategorySummary(category.id, name)
  }

  for (const [categoryId] of productCategoryMap) {
    if (processedCategoryIds.has(categoryId)) continue
    const name = resolveCategoryName(categoryId)
    buildCategorySummary(categoryId, name)
  }

  categorySummaries.sort(tileSortComparator)

  const topBrands = brandSummaries.slice(0, 4)
  const topCategories = categorySummaries.slice(0, 4)

  const normalizeTileMode = (value: string | null | undefined): CollectionTileMode => {
    if (typeof value !== "string") return "brands"
    const normalized = value.trim().toLowerCase()
    if (normalized === "categories" || normalized === "category") {
      return "categories"
    }
    if (normalized === "brands" || normalized === "brand") {
      return "brands"
    }
    return "brands"
  }

  const tileMode = normalizeTileMode(settingsRow?.home_collection_mode)
  const activeTiles = tileMode === "categories" ? topCategories : topBrands

  const navBrands: NavCollectionItem[] = brandSummaries
    .map((brand) => ({
      id: brand.id,
      name: brand.name,
      image: brand.image,
      href: brand.href,
      kind: "brand" as const,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const navCategories: NavCollectionItem[] = categorySummaries
    .map((category) => ({
      id: category.id,
      name: category.name,
      image: category.image,
      href: category.href,
      kind: "category" as const,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const navItems = navCollectionsEnabled ? (tileMode === "categories" ? navCategories : navBrands) : []

  const categoryFilters = ["All", ...Array.from(categoryFilterNames).sort((a, b) => a.localeCompare(b))]

  const brandFilterEntries = Array.from(brandNames)
    .map((name) => name.trim())
    .filter((name) => name.length > 0 && name.localeCompare(UNBRANDED_LABEL, undefined, { sensitivity: "accent" }) !== 0)
    .sort((a, b) => a.localeCompare(b))

  const hasUnbrandedVariants = variants.some(
    (variant) => !variant.brandName || variant.brandName.trim().length === 0,
  )
  if (hasUnbrandedVariants) {
    brandFilterEntries.unshift(UNBRANDED_LABEL)
  }
  const brandFilters = ["All", ...brandFilterEntries]

  const priceRange: [number, number] = [priceMin, priceMax]

  return {
    navItems,
    navBrands,
    navCategories,
    tileMode,
    tiles: activeTiles,
    brandTiles: topBrands,
    categoryTiles: topCategories,
    hero: {
      popular: popularProductHighlight,
      latest: latestProductHighlight,
      featured: manualProductHighlights,
      slides: heroSlides,
    },
    discountFilter,
    variants,
    discountCampaigns,
    categoryFilters,
    brandFilters,
    priceRange,
  }
}

function normalizeStringValue(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function getVariantDetail(variantId: number): Promise<VariantDetailData | null> {
  if (!Number.isFinite(variantId) || variantId <= 0) {
    return null
  }

  const supabase = getSupabaseServiceRoleClient()

  const { data: variantMeta, error: variantMetaError } = await supabase
    .from("product_variants")
    .select("id, product_id")
    .eq("id", variantId)
    .maybeSingle()

  if (variantMetaError) {
    console.error("[storefront] Failed to lookup variant metadata", variantMetaError)
    throw new Error("Failed to lookup product variant")
  }

  if (!variantMeta || typeof variantMeta.product_id !== "number") {
    return null
  }

  const productId = variantMeta.product_id
  const { data: productRow, error: productError } = await supabase
    .from("products")
    .select(PRODUCT_SELECT_FIELDS)
    .eq("id", productId)
    .maybeSingle()

  if (productError) {
    console.error("[storefront] Failed to load product for variant", productError)
    throw new Error("Failed to load product for variant")
  }

  if (!productRow) {
    return null
  }

  const product = mapProductRowToProduct(productRow as ProductRowWithVariants)
  const activeVariants = getActiveVariants(product)
  const targetVariant = activeVariants.find((entry) => entry.id === variantId)

  if (!targetVariant) {
    return null
  }

  const sizeOptions: VariantDetailSizeOption[] = targetVariant.sizes.map((entry) => {
    const normalizedSize = normalizeStringValue(entry.size ?? null)
    const label = normalizedSize ?? "Default"
    return {
      size: normalizedSize,
      label,
      price: Number(entry.price),
      stock: Number(entry.stock),
    }
  })

  const priceValues = sizeOptions.map((entry) => entry.price).filter((price) => Number.isFinite(price))
  const minPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0
  const maxPrice = priceValues.length > 0 ? Math.max(...priceValues) : minPrice
  const totalStock = sizeOptions.reduce(
    (sum, entry) => sum + (Number.isFinite(entry.stock) ? Math.max(0, entry.stock) : 0),
    0,
  )

  const productCategories = product.categories.map((category) => category.name).filter((name) => name.length > 0)
  const brandName = product.brand?.name ?? null
  const variantLabel = targetVariant.color ?? targetVariant.sku ?? null
  const displayName = buildVariantDisplayName(product.name, targetVariant.color ?? null, targetVariant.sku ?? null)
  const gallery: string[] = []
  const seenGalleryImages = new Set<string>()
  const pushGalleryImage = (value: string | null | undefined) => {
    const normalized = normalizeStringValue(value)
    if (!normalized || seenGalleryImages.has(normalized)) {
      return
    }
    seenGalleryImages.add(normalized)
    gallery.push(normalized)
  }

  const variantImages = Array.isArray(targetVariant.images) ? targetVariant.images : []
  if (variantImages.length > 0) {
    for (const image of variantImages) {
      pushGalleryImage(image)
    }
  } else {
    pushGalleryImage(targetVariant.image ?? null)
  }

  if (gallery.length === 0) {
    pushGalleryImage(product.image ?? null)
  }

  if (gallery.length === 0) {
    gallery.push(PLACEHOLDER_IMAGE)
  }

  const galleryCaptions = gallery.map((_, index) => `${displayName} image ${index + 1}`)
  const primaryImage = gallery[0] ?? PLACEHOLDER_IMAGE

  const siblingVariants: VariantDetailSibling[] = activeVariants.map((entry) => {
    const siblingLabel = entry.color ?? entry.sku ?? product.name
    const siblingPath = `/shop/${createVariantSlug(
      entry.id,
      product.name,
      entry.color ?? entry.sku ?? null,
    )}`
    const siblingSources: Array<string | null> = [
      ...(Array.isArray(entry.images) ? entry.images : []),
      entry.image ?? null,
      product.image ?? null,
    ]
    let siblingImage = PLACEHOLDER_IMAGE
    for (const value of siblingSources) {
      const normalized = normalizeStringValue(value)
      if (normalized) {
        siblingImage = normalized
        break
      }
    }

    return {
      id: entry.id,
      label: siblingLabel,
      detailPath: siblingPath,
      image: siblingImage,
      isActive: entry.id === targetVariant.id,
    }
  })

  const breadcrumbs: Array<{ label: string; href?: string }> = [
    { label: "Shop", href: "/catalog" },
    { label: displayName },
  ]

  return {
    product: {
      id: product.id,
      name: product.name,
      brandName,
      categories: productCategories,
    },
    variant: {
      id: targetVariant.id,
      label: variantLabel,
      displayName,
      sku: targetVariant.sku ?? null,
      description: targetVariant.description ?? null,
      image: primaryImage,
      isPreorder: Boolean(targetVariant.isPreorder),
      preorderMessage: targetVariant.preorderMessage ?? null,
      preorderDownPayment: targetVariant.preorderDownPayment ?? null,
      sizeOptions,
      minPrice,
      maxPrice,
      totalStock,
    },
    breadcrumbs,
    gallery,
    galleryCaptions,
    siblingVariants,
  }
}
