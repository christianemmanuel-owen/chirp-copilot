import { eq, and, asc } from "drizzle-orm"
import { getDb, type DbClient } from "@/lib/db"
import {
  products,
  storefrontSettings,
  discountCampaigns,
  categories,
  brands,
  orders,
  productVariants,
} from "@/lib/db/schema"
import { createVariantSlug } from "@/lib/utils"

export type CollectionTileKind = "brand" | "category"

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

export interface Size {
  id: number
  size: string | null
  price: number
  stockQuantity: number
}

export interface Variant {
  id: number
  productId: number
  sku: string | null
  color: string | null
  imageUrl: string | null
  description: string | null
  isActive: boolean
  isPreorder: boolean
  preorderMessage: string | null
  preorderDownPayment: number | null
  sizes: Size[]
}

export interface Product {
  id: number
  name: string
  imageUrl: string | null
  description: string | null
  brandId: number | null
  projectId: string
  brand?: { id: number; name: string } | null
  productCategories: { category: { id: number; name: string } | null }[]
  variants: Variant[]
  createdAt?: Date
}

export interface CampaignVariant {
  id: number
  campaignId: string
  variantId: number
  productId: number
  productName: string
  variantLabel: string | null
  sku: string | null
  color: string | null
  image: string
  basePrice: number
  discountPercent: number
  createdAt?: string
  updatedAt?: string
}

export interface DiscountCampaign {
  id: string
  name: string
  description: string | null
  bannerImage: string | null
  startDate: string
  endDate: string
  isActive: boolean
  variants: CampaignVariant[]
  createdAt?: string
  updatedAt?: string
}

const getActiveVariants = (product: Product) =>
  (product.variants ?? []).filter((variant) => variant.isActive)

const getActiveVariantImages = (product: Product) =>
  getActiveVariants(product).map((variant) => variant.imageUrl ?? undefined)

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
    preorderDownPayment: number | null
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
  discountCampaignId: string
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
    discountCampaignId: featuredCampaign.id,
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

export async function getCatalogData(db: DbClient, projectId: string): Promise<CatalogData> {
  const [
    productRows,
    settingsRow,
    discountCampaignRows,
    categoryRows,
    brandRows,
    orderRows,
  ] = await Promise.all([
    db.query.products.findMany({
      where: eq(products.projectId, projectId),
      with: {
        brand: true,
        productCategories: { with: { category: true } },
        variants: { with: { sizes: true } },
      },
    }),
    db.query.storefrontSettings.findFirst({
      where: eq(storefrontSettings.projectId, projectId),
    }),
    db.query.discountCampaigns.findMany({
      where: and(eq(discountCampaigns.projectId, projectId), eq(discountCampaigns.isActive, true)),
      with: {
        variants: {
          with: {
            variant: {
              with: {
                product: true,
                sizes: true,
              }
            }
          }
        }
      },
      orderBy: [asc(discountCampaigns.startDate)],
      limit: 10,
    }),
    db.select().from(categories).where(eq(categories.projectId, projectId)),
    db.select().from(brands).where(eq(brands.projectId, projectId)),
    db.select({
      orderItems: orders.orderItems,
      createdAt: orders.createdAt,
    }).from(orders).where(eq(orders.projectId, projectId)),
  ])

  const highlightPopular = settingsRow?.highlightPopularHero ?? true
  const highlightLatest = settingsRow?.highlightLatestHero ?? true
  const navCollectionsEnabled = settingsRow?.navCollectionsEnabled ?? true

  const activeCampaigns = (discountCampaignRows ?? []).map((row) => {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      bannerImage: row.bannerImageUrl,
      startDate: row.startDate.toISOString(),
      endDate: row.endDate.toISOString(),
      isActive: row.isActive,
      variants: row.variants.map((v) => {
        const variantRow = v.variant
        const productRow = variantRow?.product
        let basePrice = 0
        if (variantRow?.sizes) {
          const prices = variantRow.sizes.map(s => s.price)
          basePrice = prices.length > 0 ? Math.min(...prices) : 0
        }

        return {
          id: v.id,
          campaignId: v.campaignId,
          variantId: v.variantId,
          productId: productRow?.id ?? 0,
          productName: productRow?.name ?? "Unknown",
          variantLabel: variantRow?.color ?? variantRow?.sku ?? null,
          sku: variantRow?.sku ?? null,
          color: variantRow?.color ?? null,
          image: variantRow?.imageUrl ?? productRow?.imageUrl ?? PLACEHOLDER_IMAGE,
          basePrice,
          discountPercent: v.discountPercent,
          createdAt: v.createdAt?.toISOString(),
          updatedAt: v.updatedAt?.toISOString(),
        }
      }),
      createdAt: row.createdAt?.toISOString(),
      updatedAt: row.updatedAt?.toISOString(),
    }
  })

  const UNBRANDED_BRAND_ID = -1
  const UNBRANDED_LABEL = "Unbranded"

  const productMap = new Map<number, any>()
  const productCategoryMap = new Map<number, Set<number>>()
  const brandProductMap = new Map<number, Set<number>>()

  for (const product of productRows) {
    productMap.set(product.id, product)

    for (const pc of product.productCategories) {
      const cat = pc.category
      if (!cat) continue
      if (!productCategoryMap.has(cat.id)) {
        productCategoryMap.set(cat.id, new Set<number>())
      }
      productCategoryMap.get(cat.id)!.add(product.id)
    }

    const brandId = product.brandId ?? UNBRANDED_BRAND_ID
    if (!brandProductMap.has(brandId)) {
      brandProductMap.set(brandId, new Set<number>())
    }
    brandProductMap.get(brandId)!.add(product.id)
  }

  const categoryFilterNames = new Set<string>()
  const categoryNameMap = new Map<number, string>()
  const brandNameMap = new Map<number, string>()

  for (const cat of categoryRows) {
    const name = (cat.name ?? "").trim()
    if (name) {
      categoryFilterNames.add(name)
      categoryNameMap.set(cat.id, name)
    }
  }

  for (const b of brandRows) {
    const name = (b.name ?? "").trim()
    if (name) {
      brandNameMap.set(b.id, name)
    }
  }

  const productSales = new Map<number, number>()
  for (const order of orderRows) {
    const items = Array.isArray(order.orderItems) ? (order.orderItems as any[]) : []
    for (const item of items) {
      if (!item) continue
      const productId = Number(item.productId ?? item.id ?? 0)
      const quantity = Number(item.quantity ?? 0)
      if (productId > 0 && quantity > 0) {
        productSales.set(productId, (productSales.get(productId) ?? 0) + quantity)
      }
    }
  }

  const variants: CatalogVariant[] = []
  const brandNames = new Set<string>()

  for (const product of productRows) {
    const categoriesList = product.productCategories.map(pc => pc.category?.name).filter(Boolean) as string[]
    const brandName = product.brand?.name ?? null
    if (brandName) brandNames.add(brandName.trim())

    const activeVariants = product.variants.filter(v => v.isActive)
    for (const variant of activeVariants) {
      const sizeEntries = variant.sizes.map(s => ({
        label: (s.size ?? "Default").trim(),
        price: s.price,
        stock: s.stockQuantity,
      }))

      const prices = sizeEntries.map(s => s.price)
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0
      const maxPrice = prices.length > 0 ? Math.max(...prices) : minPrice
      const totalStock = sizeEntries.reduce((sum, s) => sum + s.stock, 0)
      const detailPath = `/shop/${createVariantSlug(variant.id, product.name, variant.color ?? variant.sku ?? null)}`

      variants.push({
        id: variant.id,
        productId: product.id,
        productName: product.name,
        variantLabel: variant.color ?? variant.sku ?? null,
        displayName: buildVariantDisplayName(product.name, variant.color ?? null, variant.sku ?? null),
        image: pickProductLeadImage(product.imageUrl || PLACEHOLDER_IMAGE, [variant.imageUrl ?? undefined]),
        description: variant.description,
        brandName,
        categories: categoriesList,
        sizes: sizeEntries,
        minPrice,
        maxPrice,
        totalStock,
        detailPath,
        isPreorder: variant.isPreorder,
      })
    }
  }

  const allPrices = variants.flatMap(v => v.sizes.map(s => s.price))
  const priceMin = allPrices.length > 0 ? Math.floor(Math.min(...allPrices)) : 0
  const priceMax = allPrices.length > 0 ? Math.ceil(Math.max(...allPrices)) : priceMin

  let popularProductHighlight: HeroProductHighlight | null = null
  let latestProductHighlight: HeroProductHighlight | null = null
  const manualProductHighlights: HeroProductHighlight[] = []
  const heroImageExclusions = new Set<string>()
  let highlightedPopularProductId: number | null = null

  if (productRows.length > 0) {
    const sortedBySales = [...productRows].sort((a, b) => (productSales.get(b.id) ?? 0) - (productSales.get(a.id) ?? 0))
    const topProduct = sortedBySales[0]
    if (topProduct) {
      const totalSold = productSales.get(topProduct.id) ?? 0
      const topCategoryName = topProduct.productCategories[0]?.category?.name
      const heroImage = pickProductLeadImage(topProduct.imageUrl || PLACEHOLDER_IMAGE, topProduct.variants.map(v => v.imageUrl ?? undefined))

      popularProductHighlight = {
        id: topProduct.id,
        productId: topProduct.id,
        title: topProduct.name,
        subtitle: formatSoldSubtitle(totalSold, topCategoryName ?? undefined),
        image: heroImage,
        href: `/catalog?q=${encodeURIComponent(topProduct.name)}`,
        accent: topProduct.brand?.name ?? (topCategoryName || undefined),
      }
      highlightedPopularProductId = topProduct.id
      if (highlightPopular) heroImageExclusions.add(heroImage)
    }

    const sortedByRecency = [...productRows].sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
    const latestProduct = sortedByRecency.find(p => p.id !== highlightedPopularProductId) || sortedByRecency[0]
    if (latestProduct) {
      const latestCategoryName = latestProduct.productCategories[0]?.category?.name
      const heroImage = pickProductLeadImage(latestProduct.imageUrl || PLACEHOLDER_IMAGE, latestProduct.variants.map(v => v.imageUrl ?? undefined))

      latestProductHighlight = {
        id: latestProduct.id,
        productId: latestProduct.id,
        title: latestProduct.name,
        subtitle: formatRecentSubtitle(latestProduct.createdAt?.toISOString(), latestCategoryName ?? undefined),
        image: heroImage,
        href: `/catalog?q=${encodeURIComponent(latestProduct.name)}`,
        accent: latestProduct.brand?.name ?? (latestCategoryName || undefined),
      }
      if (highlightLatest) heroImageExclusions.add(heroImage)
    }
  }

  const manualIds = Array.isArray(settingsRow?.homeBannerManualProductIds) ? settingsRow!.homeBannerManualProductIds as any[] : []
  for (const entry of manualIds) {
    const pid = Number(entry)
    const product = productMap.get(pid)
    if (!product) continue

    const heroImage = pickProductLeadImage(product.imageUrl || PLACEHOLDER_IMAGE, product.variants.map((v: any) => v.imageUrl ?? undefined), { exclude: heroImageExclusions })
    heroImageExclusions.add(heroImage)

    manualProductHighlights.push({
      id: product.id,
      productId: product.id,
      title: product.name,
      subtitle: formatRecentSubtitle(product.createdAt?.toISOString(), product.productCategories[0]?.category?.name),
      image: heroImage,
      href: `/catalog?q=${encodeURIComponent(product.name)}`,
      accent: product.brand?.name ?? product.productCategories[0]?.category?.name,
    })
  }

  const discountPromotion = buildDiscountPromotion(activeCampaigns)
  const discountPercentMap = new Map<number, number>()
  if (discountPromotion) {
    const feat = activeCampaigns.find(c => c.id === discountPromotion.discountCampaignId)
    if (feat) {
      for (const v of feat.variants) {
        discountPercentMap.set(v.variantId, v.discountPercent)
      }
    }
  }

  for (const variant of variants) {
    const pct = discountPercentMap.get(variant.id)
    if (pct) variant.discountPercent = pct
  }

  const heroSlides: HeroProductHighlight[] = []
  const usedIds = new Set<number>()
  if (discountPromotion?.slide) {
    heroSlides.push(discountPromotion.slide)
    if (discountPromotion.slide.productId) usedIds.add(discountPromotion.slide.productId)
  }
  for (const m of manualProductHighlights) {
    heroSlides.push(m)
    if (m.productId) usedIds.add(m.productId)
  }
  if (highlightPopular && popularProductHighlight && !usedIds.has(popularProductHighlight.productId!)) {
    heroSlides.push(popularProductHighlight)
    usedIds.add(popularProductHighlight.productId!)
  }
  if (highlightLatest && latestProductHighlight && !usedIds.has(latestProductHighlight.productId!)) {
    heroSlides.push(latestProductHighlight)
    usedIds.add(latestProductHighlight.productId!)
  }

  const buildTileSummary = ({ id, name, productIds, href, kind }: { id: number, name: string, productIds: number[], href: string, kind: CollectionTileKind }): CollectionTile | null => {
    if (productIds.length === 0) return null
    let totalSold = 0
    let totalVariants = 0
    let bestPid: number | null = null
    let maxS = -1

    for (const pid of productIds) {
      const s = productSales.get(pid) ?? 0
      totalSold += s
      const p = productMap.get(pid)
      if (!p) continue
      totalVariants += p.variants.filter((v: any) => v.isActive).length
      if (s > maxS) {
        maxS = s
        bestPid = pid
      }
    }

    let img = PLACEHOLDER_IMAGE
    if (bestPid) {
      const p = productMap.get(bestPid)
      img = pickProductLeadImage(p.imageUrl || PLACEHOLDER_IMAGE, p.variants.map((v: any) => v.imageUrl ?? undefined), { exclude: heroImageExclusions })
    }

    return { id, name, image: img, href, totalSold, productCount: productIds.length, variantCount: totalVariants, kind }
  }

  const brandSummaries: CollectionTile[] = []
  for (const b of brandRows) {
    const tile = buildTileSummary({
      id: b.id,
      name: b.name,
      productIds: Array.from(brandProductMap.get(b.id) ?? []),
      href: `/catalog?brand=${encodeURIComponent(b.name)}`,
      kind: "brand"
    })
    if (tile) brandSummaries.push(tile)
  }
  if (brandProductMap.has(UNBRANDED_BRAND_ID)) {
    const tile = buildTileSummary({
      id: UNBRANDED_BRAND_ID,
      name: UNBRANDED_LABEL,
      productIds: Array.from(brandProductMap.get(UNBRANDED_BRAND_ID)!),
      href: `/catalog?brand=${encodeURIComponent(UNBRANDED_LABEL)}`,
      kind: "brand"
    })
    if (tile) brandSummaries.push(tile)
  }
  brandSummaries.sort((a, b) => b.totalSold - a.totalSold)

  const categorySummaries: CollectionTile[] = []
  for (const c of categoryRows) {
    const tile = buildTileSummary({
      id: c.id,
      name: c.name,
      productIds: Array.from(productCategoryMap.get(c.id) ?? []),
      href: `/catalog?category=${encodeURIComponent(c.name)}`,
      kind: "category"
    })
    if (tile) categorySummaries.push(tile)
  }
  categorySummaries.sort((a, b) => b.totalSold - a.totalSold)

  const tileMode = (settingsRow?.homeCollectionMode === "category" || settingsRow?.homeCollectionMode === "categories") ? "categories" : "brands"

  return {
    navItems: navCollectionsEnabled ? (tileMode === "categories" ? categorySummaries.map(c => ({ ...c, href: c.href })) : brandSummaries.map(b => ({ ...b, href: b.href }))) : [],
    navBrands: brandSummaries.map(b => ({ id: b.id, name: b.name, image: b.image, href: b.href, kind: "brand" })),
    navCategories: categorySummaries.map(c => ({ id: c.id, name: c.name, image: c.image, href: c.href, kind: "category" })),
    tileMode,
    tiles: tileMode === "categories" ? categorySummaries.slice(0, 4) : brandSummaries.slice(0, 4),
    brandTiles: brandSummaries.slice(0, 4),
    categoryTiles: categorySummaries.slice(0, 4),
    hero: { popular: popularProductHighlight, latest: latestProductHighlight, featured: manualProductHighlights, slides: heroSlides },
    discountFilter: discountPromotion && discountPromotion.variantIds.length > 0 ? {
      campaignId: discountPromotion.discountCampaignId,
      name: discountPromotion.slide.title,
      description: discountPromotion.slide.subtitle,
      variantIds: discountPromotion.variantIds,
    } : undefined,
    variants,
    discountCampaigns: activeCampaigns,
    categoryFilters: ["All", ...Array.from(categoryFilterNames).sort()],
    brandFilters: ["All", ...Array.from(brandNames).sort()],
    priceRange: [priceMin, priceMax],
  }
}

function normalizeStringValue(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function getVariantDetail(db: DbClient, projectId: string, variantId: number): Promise<VariantDetailData | null> {
  if (!Number.isFinite(variantId) || variantId <= 0) {
    return null
  }

  const variant = await db.query.productVariants.findFirst({
    where: and(eq(productVariants.id, variantId)),
    with: {
      sizes: true,
      product: {
        with: {
          brand: true,
          productCategories: { with: { category: true } },
          variants: {
            where: eq(productVariants.isActive, true),
            with: { sizes: true }
          }
        }
      }
    }
  })

  if (!variant || !variant.product || variant.product.projectId !== projectId) {
    return null
  }

  const product = variant.product
  const activeVariants = product.variants
  const targetVariant = variant

  const sizeOptions: VariantDetailSizeOption[] = targetVariant.sizes.map((entry) => {
    const normalizedSize = normalizeStringValue(entry.size ?? null)
    const label = normalizedSize ?? "Default"
    return {
      size: normalizedSize,
      label,
      price: Number(entry.price),
      stock: entry.stockQuantity,
    }
  })

  const priceValues = sizeOptions.map((entry) => entry.price).filter((price) => Number.isFinite(price))
  const minPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0
  const maxPrice = priceValues.length > 0 ? Math.max(...priceValues) : minPrice
  const totalStock = sizeOptions.reduce(
    (sum, entry) => sum + (Number.isFinite(entry.stock) ? Math.max(0, entry.stock) : 0),
    0,
  )

  const productCategories = product.productCategories.map((pc) => pc.category?.name).filter((name): name is string => Boolean(name))
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

  if (targetVariant.imageUrl) {
    pushGalleryImage(targetVariant.imageUrl)
  }

  // Try to find more images from sizes if needed, but usually it's in imageUrl
  if (gallery.length === 0) {
    pushGalleryImage(product.imageUrl)
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

    let siblingImage = entry.imageUrl || product.imageUrl || PLACEHOLDER_IMAGE

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
      preorderDownPayment: null, // Logic needs to be ported if needed
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
