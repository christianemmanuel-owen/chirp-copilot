export const PHILIPPINE_REGIONS = [
  "National Capital Region (NCR)",
  "Cordillera Administrative Region (CAR)",
  "Ilocos Region (Region I)",
  "Cagayan Valley (Region II)",
  "Central Luzon (Region III)",
  "CALABARZON (Region IV-A)",
  "MIMAROPA (Region IV-B)",
  "Bicol Region (Region V)",
  "Western Visayas (Region VI)",
  "Central Visayas (Region VII)",
  "Eastern Visayas (Region VIII)",
  "Zamboanga Peninsula (Region IX)",
  "Northern Mindanao (Region X)",
  "Davao Region (Region XI)",
  "SOCCSKSARGEN (Region XII)",
  "Caraga (Region XIII)",
  "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)",
] as const

const DEFAULT_BASE_SHIPPING_FEE = 300

export interface ShippingFeeConfig {
  baseFee?: number | null
  regionOverrides?: Record<string, number | null | undefined>
}

/**
 * Approximate great-circle distances (km) from Metro Manila (NCR) to each region's
 * administrative center. Values were derived from publicly available distance data
 * between Manila and the respective regional capitals.
 */
const REGION_DISTANCE_KM: Record<string, number> = {
  "national capital region (ncr)": 0,
  "central luzon (region iii)": 70,
  "calabarzon (region iv-a)": 60,
  "cordillera administrative region (car)": 250,
  "ilocos region (region i)": 340,
  "cagayan valley (region ii)": 480,
  "mimaropa (region iv-b)": 600,
  "bicol region (region v)": 520,
  "western visayas (region vi)": 470,
  "central visayas (region vii)": 570,
  "eastern visayas (region viii)": 570,
  "zamboanga peninsula (region ix)": 860,
  "northern mindanao (region x)": 780,
  "davao region (region xi)": 960,
  "soccsksargen (region xii)": 1030,
  "caraga (region xiii)": 780,
  "bangsamoro autonomous region in muslim mindanao (barmm)": 870,
}

const DISTANCE_BRACKETS: Array<{ max: number; surcharge: number }> = [
  { max: 0, surcharge: 0 }, // NCR
  { max: 150, surcharge: 60 }, // adjacent Luzon provinces
  { max: 400, surcharge: 120 }, // Northern Luzon belt
  { max: 700, surcharge: 220 }, // South Luzon / Visayas
  { max: 1000, surcharge: 320 }, // Northern Mindanao
  { max: Infinity, surcharge: 420 }, // Southern Mindanao & beyond
]

const NORMALIZED_REGION_CACHE = new Map<string, string>(
  PHILIPPINE_REGIONS.map((region) => [normalizeRegion(region), region]),
)

function normalizeRegion(region: string) {
  return region.trim().toLowerCase()
}

function normalizeBaseFee(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return DEFAULT_BASE_SHIPPING_FEE
  }
  return Number(value.toFixed(2))
}

function resolveOverride(
  region: string | null | undefined,
  overrides?: Record<string, number | null | undefined>,
): number | null {
  if (!region || !overrides) return null

  const normalizedTarget = normalizeRegion(region)
  for (const [key, rawValue] of Object.entries(overrides)) {
    if (typeof rawValue !== "number" || !Number.isFinite(rawValue) || rawValue < 0) {
      continue
    }

    const normalizedKey = normalizeRegion(key)
    if (normalizedKey !== normalizedTarget) {
      continue
    }

    return Number(rawValue.toFixed(2))
  }

  return null
}

export function calculateShippingFee(region: string | null | undefined, config?: ShippingFeeConfig): number {
  const baseFee = normalizeBaseFee(config?.baseFee ?? null)

  if (!region) return baseFee

  const override = resolveOverride(region, config?.regionOverrides)
  if (override !== null) {
    return override
  }

  const normalizedKey = normalizeRegion(region)
  const canonicalRegion = NORMALIZED_REGION_CACHE.get(normalizedKey)
  const distanceKm =
    REGION_DISTANCE_KM[canonicalRegion ? normalizeRegion(canonicalRegion) : normalizedKey] ?? 600

  const { surcharge } =
    DISTANCE_BRACKETS.find((bracket) => distanceKm <= bracket.max) ?? DISTANCE_BRACKETS.at(-1)!

  return Number((baseFee + surcharge).toFixed(2))
}
