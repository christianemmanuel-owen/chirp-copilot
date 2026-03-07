import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateOrderId() {
  const now = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14)
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `ORD-${now}-${random}`
}

export function formatCurrency(
  value: number | string | null | undefined,
  currencySymbol = "₱",
  locale = "en-PH",
) {
  const numericValue =
    typeof value === "string"
      ? Number(value)
      : typeof value === "number"
        ? value
        : value === null || value === undefined
          ? 0
          : Number(value)

  if (!Number.isFinite(numericValue)) {
    return `${currencySymbol}0.00`
  }

  return `${currencySymbol}${numericValue.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

export function createVariantSlug(id: number, productName: string, variantLabel?: string | null): string {
  const base = [productName, variantLabel].filter((entry) => typeof entry === "string" && entry.trim().length > 0).join(" ")
  const slug = slugify(base || `variant-${id}`)
  return `${id}-${slug || "variant"}`
}

export function parseVariantSlug(param: string): number | null {
  if (typeof param !== "string" || param.trim().length === 0) {
    return null
  }
  const [numericPart] = param.split("-", 1)
  const parsed = Number.parseInt(numericPart ?? "", 10)
  return Number.isFinite(parsed) ? parsed : null
}
