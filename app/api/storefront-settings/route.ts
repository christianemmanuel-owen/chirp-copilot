import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
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
      type: 'hero' | 'categories' | 'about' | 'featured' | 'footer'
      enabled: boolean
      content?: Record<string, any>
      styles?: Record<string, any>
    }>
  }
}) => NextResponse.json({ data: payload }, { status: 200 })

export async function GET() {
  try {
    const supabase = getSupabaseServiceRoleClient()
    const { data, error } = await supabase
      .from("storefront_settings")
      .select(
        "home_collection_mode, home_banner_manual_product_ids, favicon_url, highlight_popular_hero, highlight_latest_hero, nav_collections_enabled, shipping_default_fee, shipping_region_overrides, vat_enabled, theme_config, pickup_enabled, pickup_location_name, pickup_location_unit, pickup_location_lot, pickup_location_street, pickup_location_city, pickup_location_region, pickup_location_zip_code, pickup_location_country, pickup_location_notes",
      )
      .eq("id", 1)
      .maybeSingle()

    if (error) {
      console.error("[storefront-settings][GET] Supabase error", error)
      return NextResponse.json(
        { error: "Failed to load storefront settings" },
        { status: 500 },
      )
    }

    const mode = normalizeMode(data?.home_collection_mode) ?? DEFAULT_MODE
    const bannerProductIds = sanitizeBannerProductIds(data?.home_banner_manual_product_ids ?? []) ?? []
    const faviconUrl = normalizeFaviconUrl(data?.favicon_url) ?? null
    const highlightPopular =
      typeof data?.highlight_popular_hero === "boolean" ? data.highlight_popular_hero : DEFAULT_HIGHLIGHT_POPULAR
    const highlightLatest =
      typeof data?.highlight_latest_hero === "boolean" ? data.highlight_latest_hero : DEFAULT_HIGHLIGHT_LATEST
    const navCollectionsEnabled =
      typeof data?.nav_collections_enabled === "boolean"
        ? data.nav_collections_enabled
        : DEFAULT_NAV_COLLECTIONS_ENABLED
    const shippingBaseFee =
      typeof data?.shipping_default_fee === "number" ? Number(data.shipping_default_fee) : DEFAULT_SHIPPING_BASE_FEE
    const shippingRegionOverrides = normalizeShippingOverridesInput(data?.shipping_region_overrides ?? {}) ?? {}
    const vatEnabled = typeof data?.vat_enabled === "boolean" ? data.vat_enabled : DEFAULT_VAT_ENABLED
    const theme = buildThemeConfig(data?.theme_config)
    const pickupEnabled = typeof data?.pickup_enabled === "boolean" ? data.pickup_enabled : true

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
        name: data?.pickup_location_name ?? null,
        unit: data?.pickup_location_unit ?? null,
        lot: data?.pickup_location_lot ?? null,
        street: data?.pickup_location_street ?? null,
        city: data?.pickup_location_city ?? null,
        region: data?.pickup_location_region ?? null,
        zipCode: data?.pickup_location_zip_code ?? null,
        country: data?.pickup_location_country ?? null,
        notes: data?.pickup_location_notes ?? null,
      }),
      experimental: {
        ...theme.experimental,
        content: theme.experimental?.content || {},
        layout: theme.experimental?.layout ?? [
          { id: "hero-1", type: "hero", enabled: true },
          { id: "categories-1", type: "categories", enabled: true },
          { id: "about-1", type: "about", enabled: theme.experimental?.aboutUsEnabled ?? true },
          { id: "featured-1", type: "featured", enabled: theme.experimental?.featuredProductsEnabled ?? true },
          { id: "footer-1", type: "footer", enabled: true },
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

    if (
      !hasMode &&
      !hasBannerProductIds &&
      !hasFaviconUrl &&
      !hasHighlightPopular &&
      !hasHighlightLatest &&
      !hasShippingBaseFee &&
      !hasShippingOverrides &&
      !hasVatEnabled &&
      !hasPickupLocation &&
      !hasPickupEnabled &&
      !hasTheme &&
      !hasNavCollectionsEnabled &&
      !hasExperimental
    ) {
      return NextResponse.json({ error: "No storefront settings provided" }, { status: 400 })
    }

    let mode: CollectionTileMode | undefined
    if (hasMode) {
      const normalizedMode = normalizeMode((payload as { mode?: unknown }).mode)
      if (!normalizedMode) {
        return NextResponse.json(
          { error: "Mode must be either \"brand(s)\" or \"category(ies)\"" },
          { status: 400 },
        )
      }
      mode = normalizedMode

    }
    let bannerProductIds: number[] | undefined
    if (hasBannerProductIds) {
      const sanitized = sanitizeBannerProductIds(
        (payload as { bannerProductIds?: unknown }).bannerProductIds,
      )
      if (sanitized === null) {
        return NextResponse.json(
          { error: "bannerProductIds must be an array of positive integers" },
          { status: 400 },
        )
      }
      bannerProductIds = sanitized
    }

    let faviconUrl: string | null | undefined
    if (hasFaviconUrl) {
      const raw = (payload as { faviconUrl?: unknown }).faviconUrl
      if (raw === null || raw === undefined) {
        faviconUrl = null
      } else if (typeof raw === "string") {
        const normalized = normalizeFaviconUrl(raw)
        if (!normalized) {
          faviconUrl = null
        } else {
          faviconUrl = normalized
        }
      } else {
        return NextResponse.json(
          { error: "faviconUrl must be a string or null" },
          { status: 400 },
        )
      }
    }

    let highlightPopular: boolean | undefined
    if (hasHighlightPopular) {
      const raw = (payload as { highlightPopular?: unknown }).highlightPopular
      if (typeof raw !== "boolean") {
        return NextResponse.json(
          { error: "highlightPopular must be a boolean value" },
          { status: 400 },
        )
      }
      highlightPopular = raw
    }

    let highlightLatest: boolean | undefined
    if (hasHighlightLatest) {
      const raw = (payload as { highlightLatest?: unknown }).highlightLatest
      if (typeof raw !== "boolean") {
        return NextResponse.json(
          { error: "highlightLatest must be a boolean value" },
          { status: 400 },
        )
      }
      highlightLatest = raw
    }

    let navCollectionsEnabled: boolean | undefined
    if (hasNavCollectionsEnabled) {
      const raw = (payload as { navCollectionsEnabled?: unknown }).navCollectionsEnabled
      if (typeof raw !== "boolean") {
        return NextResponse.json(
          { error: "navCollectionsEnabled must be a boolean" },
          { status: 400 },
        )
      }
      navCollectionsEnabled = raw
    }

    let shippingBaseFee: number | undefined
    if (hasShippingBaseFee) {
      const normalized = normalizeShippingBaseFeeInput((payload as { shippingBaseFee?: unknown }).shippingBaseFee)
      if (normalized === null) {
        return NextResponse.json(
          { error: "shippingBaseFee must be a non-negative number" },
          { status: 400 },
        )
      }
      shippingBaseFee = normalized
    }

    let shippingRegionOverrides: ShippingOverrideRecord | undefined
    if (hasShippingOverrides) {
      const raw = (payload as { shippingRegionOverrides?: unknown }).shippingRegionOverrides
      if (raw === null) {
        shippingRegionOverrides = {}
      } else {
        const normalized = normalizeShippingOverridesInput(raw)
        if (normalized === null) {
          return NextResponse.json(
            { error: "shippingRegionOverrides must be an object with region -> fee mappings" },
            { status: 400 },
          )
        }
        shippingRegionOverrides = normalized
      }
    }

    let vatEnabled: boolean | undefined
    if (hasVatEnabled) {
      const raw = (payload as { vatEnabled?: unknown }).vatEnabled
      if (typeof raw !== "boolean") {
        return NextResponse.json(
          { error: "vatEnabled must be a boolean value" },
          { status: 400 },
        )
      }
      vatEnabled = raw
    }

    let pickupLocation:
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
      | undefined
    if (hasPickupLocation) {
      const normalized = normalizePickupLocationInput((payload as { pickupLocation?: unknown }).pickupLocation)
      if (!normalized) {
        return NextResponse.json(
          { error: "pickupLocation must include street, city, region, and zipCode strings" },
          { status: 400 },
        )
      }
      pickupLocation = normalized
    }

    let pickupEnabled: boolean | undefined
    if (hasPickupEnabled) {
      const raw = (payload as { pickupEnabled?: unknown }).pickupEnabled
      if (typeof raw !== "boolean") {
        return NextResponse.json({ error: "pickupEnabled must be a boolean value" }, { status: 400 })
      }
      pickupEnabled = raw
    }

    let themeConfigPayload: StorefrontThemeConfig | undefined
    if (hasTheme || hasExperimental) {
      const rawTheme = (payload as { theme?: unknown }).theme ?? {}
      if (typeof rawTheme !== "object") {
        return NextResponse.json(
          { error: "theme must be an object" },
          { status: 400 },
        )
      }
      themeConfigPayload = buildThemeConfig(rawTheme)

      // If we have experimental flags in the payload, merge them into the theme config
      if (hasExperimental) {
        const exp = (payload as any).experimental
        themeConfigPayload.experimental = {
          ...themeConfigPayload.experimental,
          ...exp,
          content: {
            ...(themeConfigPayload.experimental?.content || {}),
            ...(exp.content || {})
          },
          navbar: {
            ...(themeConfigPayload.experimental?.navbar || {}),
            ...(exp.navbar || {})
          },
          layout: exp.layout ?? (themeConfigPayload.experimental?.layout)
        }
      }
    }

    // Revalidate the experimental home page to reflect changes immediately
    revalidatePath("/experimental-home")

    const supabase = getSupabaseServiceRoleClient()

    const { data, error } = await supabase
      .from("storefront_settings")
      .upsert(
        {
          id: 1,
          ...(mode ? { home_collection_mode: toDatabaseMode(mode) } : {}),
          ...(bannerProductIds ? { home_banner_manual_product_ids: bannerProductIds } : {}),
          ...(hasFaviconUrl ? { favicon_url: faviconUrl ?? null } : {}),
          ...(hasHighlightPopular ? { highlight_popular_hero: highlightPopular } : {}),
          ...(hasHighlightLatest ? { highlight_latest_hero: highlightLatest } : {}),
          ...(hasNavCollectionsEnabled ? { nav_collections_enabled: navCollectionsEnabled } : {}),
          ...(hasShippingBaseFee ? { shipping_default_fee: shippingBaseFee } : {}),
          ...(hasShippingOverrides ? { shipping_region_overrides: shippingRegionOverrides ?? {} } : {}),
          ...(hasVatEnabled ? { vat_enabled: vatEnabled } : {}),
          ...(hasPickupEnabled ? { pickup_enabled: pickupEnabled } : {}),
          ...(hasPickupLocation
            ? {
              pickup_location_name: pickupLocation?.name ?? null,
              pickup_location_unit: pickupLocation?.unit ?? null,
              pickup_location_lot: pickupLocation?.lot ?? null,
              pickup_location_street: pickupLocation?.street ?? null,
              pickup_location_city: pickupLocation?.city ?? null,
              pickup_location_region: pickupLocation?.region ?? null,
              pickup_location_zip_code: pickupLocation?.zipCode ?? null,
              pickup_location_country: pickupLocation?.country ?? null,
              pickup_location_notes: pickupLocation?.notes ?? null,
            }
            : {}),
          ...(themeConfigPayload ? { theme_config: themeConfigPayload as any } : {}),
        },
        { onConflict: "id" },
      )
      .select(
        "home_collection_mode, home_banner_manual_product_ids, favicon_url, highlight_popular_hero, highlight_latest_hero, nav_collections_enabled, shipping_default_fee, shipping_region_overrides, vat_enabled, theme_config, pickup_enabled, pickup_location_name, pickup_location_unit, pickup_location_lot, pickup_location_street, pickup_location_city, pickup_location_region, pickup_location_zip_code, pickup_location_country, pickup_location_notes",
      )
      .single()

    if (error) {
      console.error("[storefront-settings][PATCH] Supabase error", error)
      return NextResponse.json(
        { error: "Failed to update storefront settings" },
        { status: 500 },
      )
    }

    const appliedMode = normalizeMode(data?.home_collection_mode) ?? mode ?? DEFAULT_MODE
    const appliedBannerProductIds = sanitizeBannerProductIds(data?.home_banner_manual_product_ids ?? []) ?? []
    const appliedFaviconUrl = normalizeFaviconUrl(data?.favicon_url) ?? (faviconUrl ?? null)
    const appliedHighlightPopular =
      typeof data?.highlight_popular_hero === "boolean"
        ? data.highlight_popular_hero
        : highlightPopular ?? DEFAULT_HIGHLIGHT_POPULAR
    const appliedHighlightLatest =
      typeof data?.highlight_latest_hero === "boolean"
        ? data.highlight_latest_hero
        : highlightLatest ?? DEFAULT_HIGHLIGHT_LATEST

    const appliedNavCollectionsEnabled =
      typeof data?.nav_collections_enabled === "boolean"
        ? data.nav_collections_enabled
        : navCollectionsEnabled ?? DEFAULT_NAV_COLLECTIONS_ENABLED

    const appliedShippingBaseFee =
      typeof data?.shipping_default_fee === "number"
        ? Number(data.shipping_default_fee)
        : shippingBaseFee ?? DEFAULT_SHIPPING_BASE_FEE
    const appliedShippingOverrides =
      normalizeShippingOverridesInput(data?.shipping_region_overrides ?? shippingRegionOverrides ?? {}) ??
      shippingRegionOverrides ??
      {}
    const appliedVatEnabled =
      typeof data?.vat_enabled === "boolean" ? data.vat_enabled : vatEnabled ?? DEFAULT_VAT_ENABLED
    const appliedTheme = buildThemeConfig(data?.theme_config ?? themeConfigPayload ?? DEFAULT_THEME_CONFIG)
    const appliedPickupEnabled =
      typeof data?.pickup_enabled === "boolean" ? data.pickup_enabled : pickupEnabled ?? true

    const appliedPickupLocation = buildPickupLocationResponse({
      name: data?.pickup_location_name ?? pickupLocation?.name ?? null,
      unit: data?.pickup_location_unit ?? pickupLocation?.unit ?? null,
      lot: data?.pickup_location_lot ?? pickupLocation?.lot ?? null,
      street: data?.pickup_location_street ?? pickupLocation?.street ?? null,
      city: data?.pickup_location_city ?? pickupLocation?.city ?? null,
      region: data?.pickup_location_region ?? pickupLocation?.region ?? null,
      zipCode: data?.pickup_location_zip_code ?? pickupLocation?.zipCode ?? null,
      country: data?.pickup_location_country ?? pickupLocation?.country ?? null,
      notes: data?.pickup_location_notes ?? pickupLocation?.notes ?? null,
    })

    return buildSuccess({
      mode: appliedMode,
      bannerProductIds: appliedBannerProductIds,
      faviconUrl: appliedFaviconUrl,
      highlightPopular: appliedHighlightPopular ?? DEFAULT_HIGHLIGHT_POPULAR,
      highlightLatest: appliedHighlightLatest ?? DEFAULT_HIGHLIGHT_LATEST,
      navCollectionsEnabled: appliedNavCollectionsEnabled ?? DEFAULT_NAV_COLLECTIONS_ENABLED,
      shippingBaseFee: appliedShippingBaseFee,
      shippingRegionOverrides: appliedShippingOverrides,
      vatEnabled: appliedVatEnabled,
      theme: appliedTheme,
      pickupEnabled: appliedPickupEnabled,
      pickupLocation: appliedPickupLocation,
      experimental: {
        aboutUsEnabled: appliedTheme.experimental?.aboutUsEnabled ?? true,
        featuredProductsEnabled: appliedTheme.experimental?.featuredProductsEnabled ?? true,
        testimonialsEnabled: appliedTheme.experimental?.testimonialsEnabled ?? false,
        navbar: {
          useLogo: appliedTheme.experimental?.navbar?.useLogo ?? false,
          dropdownMode: appliedTheme.experimental?.navbar?.dropdownMode ?? "categories",
        },
        content: {
          heroTitle: appliedTheme.experimental?.content?.heroTitle ?? "Exquisite Pieces.",
          heroTitleHighlight: appliedTheme.experimental?.content?.heroTitleHighlight ?? "Designed for life.",
          heroDescription: appliedTheme.experimental?.content?.heroDescription ?? "Elevate your lifestyle with our premium collection of hand-picked goods.",
          featuredTitle: appliedTheme.experimental?.content?.featuredTitle ?? "Featured Collection",
          featuredSubtitle: appliedTheme.experimental?.content?.featuredSubtitle ?? "Our most coveted pieces, selected for you.",
          aboutTitle: appliedTheme.experimental?.content?.aboutTitle ?? "Our Commitment to Quality",
          aboutContent: appliedTheme.experimental?.content?.aboutContent ?? "We believe that the objects you surround yourself with should be as intentional as the life you lead. Each piece in our collection is selected for its superior craftsmanship, timeless design, and functional excellence.",
          footerMission: appliedTheme.experimental?.content?.footerMission ?? "Elevating your lifestyle with curated, high-end essentials designed for intentional living.",
          footerNewsletterBlurb: appliedTheme.experimental?.content?.footerNewsletterBlurb ?? "Join our inner circle for exclusive drops and design stories."
        },
        layout: appliedTheme.experimental?.layout ?? [
          { id: "hero-1", type: "hero", enabled: true },
          { id: "categories-1", type: "categories", enabled: true },
          { id: "about-1", type: "about", enabled: appliedTheme.experimental?.aboutUsEnabled ?? true },
          { id: "featured-1", type: "featured", enabled: appliedTheme.experimental?.featuredProductsEnabled ?? true },
          { id: "footer-1", type: "footer", enabled: true },
        ]
      },
    })
  } catch (error) {
    console.error("[storefront-settings][PATCH] Unexpected error", error)
    return NextResponse.json(
      { error: "Unexpected error updating storefront settings" },
      { status: 500 },
    )
  }
}
