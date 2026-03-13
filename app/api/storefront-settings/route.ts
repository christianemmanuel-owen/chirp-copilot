import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { getCloudflareContext } from "@/lib/cloudflare/context"
import { getDb } from "@/lib/db"
import { storefrontSettings as settingsSchema } from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq } from "drizzle-orm"

import type { CollectionTileMode } from "@/lib/storefront-data"
import { PHILIPPINE_REGIONS } from "@/lib/shipping"
import {
  DEFAULT_THEME_CONFIG,
  buildThemeConfig,
  type StorefrontThemeConfig,
} from "@/lib/storefront-theme"

const DEFAULT_MODE: CollectionTileMode = "brands"
const MAX_MANUAL_BANNER_PRODUCTS = 6
const DEFAULT_HIGHLIGHT_POPULAR = true
const DEFAULT_HIGHLIGHT_LATEST = true
const DEFAULT_SHIPPING_BASE_FEE = 300
const DEFAULT_VAT_ENABLED = true
const DEFAULT_NAV_COLLECTIONS_ENABLED = true

const normalizeRegionKey = (value: string) => value.trim().toLowerCase()
const REGION_NAME_MAP = new Map<string, string>(
  PHILIPPINE_REGIONS.map((region) => [normalizeRegionKey(region), region]),
)

type ShippingOverrideRecord = Record<string, number>

const normalizeShippingBaseFeeInput = (value: unknown): number | null => {
  const numeric = typeof value === "string" ? Number(value) : value
  if (typeof numeric !== "number" || !Number.isFinite(numeric) || numeric < 0) {
    return null
  }
  return Number(numeric.toFixed(2))
}

const normalizeShippingOverridesInput = (value: unknown): ShippingOverrideRecord | null => {
  if (value === null || value === undefined) {
    return {}
  }

  if (typeof value !== "object") {
    return null
  }

  const entries = value as Record<string, unknown>
  const result: ShippingOverrideRecord = {}

  for (const [key, raw] of Object.entries(entries)) {
    if (typeof raw !== "number" && typeof raw !== "string") {
      continue
    }

    const numeric = typeof raw === "string" ? Number(raw) : raw
    if (!Number.isFinite(numeric) || numeric < 0) {
      continue
    }

    const canonical = REGION_NAME_MAP.get(normalizeRegionKey(key))
    if (!canonical) {
      continue
    }

    result[canonical] = Number(numeric.toFixed(2))
  }

  return result
}

const normalizeMode = (value: unknown): CollectionTileMode | null => {
  if (typeof value !== "string") return null
  const normalized = value.trim().toLowerCase()
  if (normalized === "categories" || normalized === "category") return "categories"
  if (normalized === "brands" || normalized === "brand") return "brands"
  return null
}

const toDatabaseMode = (mode: CollectionTileMode): "brand" | "category" => {
  return mode === "categories" ? "category" : "brand"
}

const sanitizeBannerProductIds = (value: unknown): number[] | null => {
  if (!Array.isArray(value)) {
    return null
  }

  const seen = new Set<number>()
  const result: number[] = []

  for (const entry of value) {
    const numeric = Number(entry)
    if (!Number.isInteger(numeric) || numeric <= 0) {
      continue
    }

    if (seen.has(numeric)) {
      continue
    }

    seen.add(numeric)
    result.push(numeric)

    if (result.length >= MAX_MANUAL_BANNER_PRODUCTS) {
      break
    }
  }

  return result
}

const normalizeFaviconUrl = (value: unknown): string | null => {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  return trimmed
}

const normalizePickupLocationInput = (value: unknown):
  | {
    name: string | null
    unit: string | null
    lot: string | null
    street: string
    city: string
    region: string
    zipCode: string
    country: string | null
    notes: string | null
  }
  | null => {
  if (!value || typeof value !== "object") {
    return null
  }

  const input = value as Record<string, unknown>
  const street = sanitizePickupLocationValue(input.street)
  const city = sanitizePickupLocationValue(input.city)
  const region = sanitizePickupLocationValue(input.region)
  const zipCode = sanitizePickupLocationValue(input.zipCode)

  if (!street || !city || !region || !zipCode) {
    return null
  }

  return {
    name: sanitizePickupLocationValue(input.name),
    unit: sanitizePickupLocationValue(input.unit),
    lot: sanitizePickupLocationValue(input.lot),
    street,
    city,
    region,
    zipCode,
    country: sanitizePickupLocationValue(input.country) ?? "Philippines",
    notes: sanitizePickupLocationValue(input.notes),
  }
}

type PickupLocationResponse = {
  name: string
  unit: string
  lot: string
  street: string
  city: string
  region: string
  zipCode: string
  country: string
  notes: string
}

const DEFAULT_PICKUP_LOCATION: PickupLocationResponse = {
  name: "",
  unit: "",
  lot: "",
  street: "",
  city: "",
  region: "",
  zipCode: "",
  country: "Philippines",
  notes: "",
}

const sanitizePickupLocationValue = (value: unknown): string | null => {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const buildPickupLocationResponse = (payload?: {
  name?: string | null
  unit?: string | null
  lot?: string | null
  street?: string | null
  city?: string | null
  region?: string | null
  zipCode?: string | null
  country?: string | null
  notes?: string | null
}): PickupLocationResponse => ({
  name: payload?.name ?? DEFAULT_PICKUP_LOCATION.name,
  unit: payload?.unit ?? DEFAULT_PICKUP_LOCATION.unit,
  lot: payload?.lot ?? DEFAULT_PICKUP_LOCATION.lot,
  street: payload?.street ?? DEFAULT_PICKUP_LOCATION.street,
  city: payload?.city ?? DEFAULT_PICKUP_LOCATION.city,
  region: payload?.region ?? DEFAULT_PICKUP_LOCATION.region,
  zipCode: payload?.zipCode ?? DEFAULT_PICKUP_LOCATION.zipCode,
  country: payload?.country ?? DEFAULT_PICKUP_LOCATION.country,
  notes: payload?.notes ?? DEFAULT_PICKUP_LOCATION.notes,
})

const buildSuccess = (payload: {
  mode: CollectionTileMode
  bannerProductIds: number[]
  faviconUrl: string | null
  highlightPopular: boolean
  highlightLatest: boolean
  navCollectionsEnabled: boolean
  shippingBaseFee: number
  shippingRegionOverrides: ShippingOverrideRecord
  vatEnabled: boolean
  theme: StorefrontThemeConfig
  pickupEnabled: boolean
  pickupLocation: PickupLocationResponse
  experimental: {
    aboutUsEnabled: boolean
    featuredProductsEnabled: boolean
    testimonialsEnabled: boolean
    navbar: {
      useLogo: boolean
      dropdownMode: "categories" | "brands"
    }
    content: {
      heroTitle: string
      heroTitleHighlight: string
      heroDescription: string
      featuredTitle: string
      featuredSubtitle: string
      aboutTitle: string
      aboutContent: string
      footerMission: string
      footerNewsletterBlurb: string
    }
    layout: Array<{
      id: string
      type: 'hero' | 'categories' | 'about' | 'featured' | 'footer' | 'catalog-grid' | 'collection-spotlight'
      enabled: boolean
      content?: Record<string, any>
      styles?: Record<string, any>
    }>
    catalogLayout?: Array<{
      id: string
      type: 'hero' | 'categories' | 'about' | 'featured' | 'footer' | 'catalog-grid' | 'collection-spotlight'
      enabled: boolean
      content?: Record<string, any>
      styles?: Record<string, any>
    }>
  }
}) => NextResponse.json({ data: payload }, { status: 200 })

export async function GET(request: Request) {
  try {
    const { env } = await getCloudflareContext()
    const d1 = env.DB
    if (!d1) {
      return NextResponse.json({ error: "Database binding not found" }, { status: 500 })
    }

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const data = await db.query.storefrontSettings.findFirst({
      where: eq(settingsSchema.projectId, tenantId)
    })

    const mode = normalizeMode(data?.homeCollectionMode) ?? DEFAULT_MODE
    const bannerProductIds = sanitizeBannerProductIds(data?.homeBannerManualProductIds ? (typeof data.homeBannerManualProductIds === 'string' ? JSON.parse(data.homeBannerManualProductIds) : data.homeBannerManualProductIds) : []) ?? []
    const faviconUrl = normalizeFaviconUrl(data?.faviconUrl) ?? null
    const highlightPopular = typeof data?.highlightPopularHero === "boolean" ? data.highlightPopularHero : DEFAULT_HIGHLIGHT_POPULAR
    const highlightLatest = typeof data?.highlightLatestHero === "boolean" ? data.highlightLatestHero : DEFAULT_HIGHLIGHT_LATEST
    const navCollectionsEnabled = typeof data?.navCollectionsEnabled === "boolean" ? data.navCollectionsEnabled : DEFAULT_NAV_COLLECTIONS_ENABLED
    const shippingBaseFee = typeof data?.shippingDefaultFee === "number" ? Number(data.shippingDefaultFee) : DEFAULT_SHIPPING_BASE_FEE
    const shippingRegionOverrides = normalizeShippingOverridesInput(data?.shippingRegionOverrides ?? {}) ?? {}
    const vatEnabled = typeof data?.vatEnabled === "boolean" ? data.vatEnabled : DEFAULT_VAT_ENABLED
    const theme = buildThemeConfig(data?.themeConfig)
    const pickupEnabled = typeof data?.pickupEnabled === "boolean" ? data.pickupEnabled : true

    return buildSuccess({
      mode,
      bannerProductIds,
      faviconUrl,
      highlightPopular,
      highlightLatest,
      navCollectionsEnabled,
      shippingBaseFee,
      shippingRegionOverrides,
      vatEnabled,
      theme,
      pickupEnabled,
      pickupLocation: buildPickupLocationResponse({
        name: data?.pickupLocationName ?? null,
        unit: data?.pickupLocationUnit ?? null,
        lot: data?.pickupLocationLot ?? null,
        street: data?.pickupLocationStreet ?? null,
        city: data?.pickupLocationCity ?? null,
        region: data?.pickupLocationRegion ?? null,
        zipCode: data?.pickupLocationZipCode ?? null,
        country: data?.pickupLocationCountry ?? null,
        notes: data?.pickupLocationNotes ?? null,
      }),
      experimental: {
        ...theme.experimental,
        content: theme.experimental?.content || {},
        layout: theme.experimental?.layout ?? [
          { id: "hero-1", type: "hero", enabled: true },
          { id: "categories-1", type: "categories", enabled: true },
          { id: "about-1", type: "about", enabled: true },
          { id: "featured-1", type: "featured", enabled: true },
          { id: "footer-1", type: "footer", enabled: true },
        ],
        catalogLayout: theme.experimental?.catalogLayout ?? [
          { id: "catalog-grid-1", type: "catalog-grid", enabled: true },
          { id: "footer-1", type: "footer", enabled: true }
        ]
      } as any,
    })
  } catch (error) {
    console.error("[storefront-settings][GET] Unexpected error", error)
    return NextResponse.json(
      { error: "Unexpected error retrieving storefront settings" },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { env } = await getCloudflareContext()
    const d1 = env.DB
    if (!d1) return NextResponse.json({ error: "Database binding not found" }, { status: 500 })

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const payload = await request.json().catch(() => null)

    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 })
    }

    const hasMode = Object.prototype.hasOwnProperty.call(payload, "mode")
    const hasBannerProductIds = Object.prototype.hasOwnProperty.call(payload, "bannerProductIds")
    const hasFaviconUrl = Object.prototype.hasOwnProperty.call(payload, "faviconUrl")
    const hasHighlightPopular = Object.prototype.hasOwnProperty.call(payload, "highlightPopular")
    const hasHighlightLatest = Object.prototype.hasOwnProperty.call(payload, "highlightLatest")
    const hasShippingBaseFee = Object.prototype.hasOwnProperty.call(payload, "shippingBaseFee")
    const hasShippingOverrides = Object.prototype.hasOwnProperty.call(payload, "shippingRegionOverrides")
    const hasVatEnabled = Object.prototype.hasOwnProperty.call(payload, "vatEnabled")
    const hasPickupLocation = Object.prototype.hasOwnProperty.call(payload, "pickupLocation")
    const hasPickupEnabled = Object.prototype.hasOwnProperty.call(payload, "pickupEnabled")
    const hasTheme = Object.prototype.hasOwnProperty.call(payload, "theme")
    const hasNavCollectionsEnabled = Object.prototype.hasOwnProperty.call(payload, "navCollectionsEnabled")
    const hasExperimental = Object.prototype.hasOwnProperty.call(payload, "experimental")

    let mode: CollectionTileMode | undefined
    if (hasMode) {
      const normalizedMode = normalizeMode((payload as any).mode)
      if (!normalizedMode) return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
      mode = normalizedMode
    }

    let bannerProductIds: number[] | undefined
    if (hasBannerProductIds) {
      const sanitized = sanitizeBannerProductIds((payload as any).bannerProductIds)
      if (sanitized === null) return NextResponse.json({ error: "Invalid bannerProductIds" }, { status: 400 })
      bannerProductIds = sanitized
    }

    let faviconUrl: string | null | undefined
    if (hasFaviconUrl) {
      const raw = (payload as any).faviconUrl
      faviconUrl = raw ? normalizeFaviconUrl(raw) : null
    }

    let highlightPopular: boolean | undefined
    if (hasHighlightPopular) highlightPopular = !!(payload as any).highlightPopular

    let highlightLatest: boolean | undefined
    if (hasHighlightLatest) highlightLatest = !!(payload as any).highlightLatest

    let navCollectionsEnabled: boolean | undefined
    if (hasNavCollectionsEnabled) navCollectionsEnabled = !!(payload as any).navCollectionsEnabled

    let shippingBaseFee: number | undefined
    if (hasShippingBaseFee) {
      const normalized = normalizeShippingBaseFeeInput((payload as any).shippingBaseFee)
      if (normalized === null) return NextResponse.json({ error: "Invalid shippingBaseFee" }, { status: 400 })
      shippingBaseFee = normalized
    }

    let shippingRegionOverrides: ShippingOverrideRecord | undefined
    if (hasShippingOverrides) {
      const normalized = normalizeShippingOverridesInput((payload as any).shippingRegionOverrides)
      if (normalized === null) return NextResponse.json({ error: "Invalid shippingRegionOverrides" }, { status: 400 })
      shippingRegionOverrides = normalized
    }

    let vatEnabled: boolean | undefined
    if (hasVatEnabled) vatEnabled = !!(payload as any).vatEnabled

    let pickupEnabled: boolean | undefined
    if (hasPickupEnabled) pickupEnabled = !!(payload as any).pickupEnabled

    let pickupLocation: any
    if (hasPickupLocation) {
      pickupLocation = normalizePickupLocationInput((payload as any).pickupLocation)
      if (!pickupLocation) return NextResponse.json({ error: "Invalid pickupLocation" }, { status: 400 })
    }

    let themeConfigPayload: StorefrontThemeConfig | undefined
    if (hasTheme || hasExperimental) {
      const rawTheme = (payload as any).theme ?? {}
      themeConfigPayload = buildThemeConfig(rawTheme)
      if (hasExperimental) {
        const exp = (payload as any).experimental
        themeConfigPayload.experimental = {
          ...themeConfigPayload.experimental,
          ...exp,
          content: { ...(themeConfigPayload.experimental?.content || {}), ...(exp.content || {}) },
          navbar: { ...(themeConfigPayload.experimental?.navbar || {}), ...(exp.navbar || {}) },
          layout: exp.layout ?? (themeConfigPayload.experimental?.layout),
          catalogLayout: exp.catalogLayout ?? (themeConfigPayload.experimental?.catalogLayout)
        }
      }
    }

    const updateData: any = {
      ...(mode ? { homeCollectionMode: toDatabaseMode(mode) } : {}),
      ...(bannerProductIds ? { homeBannerManualProductIds: bannerProductIds } : {}),
      ...(hasFaviconUrl ? { faviconUrl: faviconUrl } : {}),
      ...(hasHighlightPopular ? { highlightPopularHero: highlightPopular } : {}),
      ...(hasHighlightLatest ? { highlightLatestHero: highlightLatest } : {}),
      ...(hasNavCollectionsEnabled ? { navCollectionsEnabled: navCollectionsEnabled } : {}),
      ...(hasShippingBaseFee ? { shippingDefaultFee: shippingBaseFee } : {}),
      ...(hasShippingOverrides ? { shippingRegionOverrides: shippingRegionOverrides } : {}),
      ...(hasVatEnabled ? { vatEnabled: vatEnabled } : {}),
      ...(hasPickupEnabled ? { pickupEnabled: pickupEnabled } : {}),
      ...(hasPickupLocation ? {
        pickupLocationName: pickupLocation.name,
        pickupLocationUnit: pickupLocation.unit,
        pickupLocationLot: pickupLocation.lot,
        pickupLocationStreet: pickupLocation.street,
        pickupLocationCity: pickupLocation.city,
        pickupLocationRegion: pickupLocation.region,
        pickupLocationZipCode: pickupLocation.zipCode,
        pickupLocationCountry: pickupLocation.country,
        pickupLocationNotes: pickupLocation.notes,
      } : {}),
      ...(themeConfigPayload ? { themeConfig: themeConfigPayload } : {}),
      updatedAt: new Date()
    }

    await db.insert(settingsSchema)
      .values({ projectId: tenantId, ...updateData })
      .onConflictDoUpdate({
        target: settingsSchema.projectId,
        set: updateData
      })

    revalidatePath("/experimental-home")

    const data = await db.query.storefrontSettings.findFirst({
      where: eq(settingsSchema.projectId, tenantId)
    })

    if (!data) return NextResponse.json({ error: "Failed to reload settings" }, { status: 500 })

    return buildSuccess({
      mode: normalizeMode(data.homeCollectionMode) ?? DEFAULT_MODE,
      bannerProductIds: sanitizeBannerProductIds(data.homeBannerManualProductIds) ?? [],
      faviconUrl: normalizeFaviconUrl(data.faviconUrl) ?? null,
      highlightPopular: data.highlightPopularHero,
      highlightLatest: data.highlightLatestHero,
      navCollectionsEnabled: data.navCollectionsEnabled,
      shippingBaseFee: data.shippingDefaultFee,
      shippingRegionOverrides: (data.shippingRegionOverrides as any) ?? {},
      vatEnabled: data.vatEnabled,
      theme: buildThemeConfig(data.themeConfig),
      pickupEnabled: data.pickupEnabled,
      pickupLocation: buildPickupLocationResponse({
        name: data.pickupLocationName,
        unit: data.pickupLocationUnit,
        lot: data.pickupLocationLot,
        street: data.pickupLocationStreet,
        city: data.pickupLocationCity,
        region: data.pickupLocationRegion,
        zipCode: data.pickupLocationZipCode,
        country: data.pickupLocationCountry,
        notes: data.pickupLocationNotes,
      }),
      experimental: buildThemeConfig(data.themeConfig).experimental as any
    })

  } catch (error) {
    console.error("[storefront-settings][PATCH] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
