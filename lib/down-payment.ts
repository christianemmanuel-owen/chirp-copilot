import type { PreorderDownPaymentSummary, ProductVariant } from "@/lib/types"

type VariantSource = Pick<ProductVariant, "isPreorder" | "preorderDownPayment">

export function calculateVariantDownPaymentSummary(
  variant: VariantSource,
  unitPrice: number,
  quantity: number,
): PreorderDownPaymentSummary | null {
  if (!variant.isPreorder) {
    return null
  }

  const config = variant.preorderDownPayment
  if (!config || (config.type !== "percent" && config.type !== "amount")) {
    return null
  }

  const normalizedPrice = Number(unitPrice)
  if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
    return null
  }

  const normalizedQuantity = Number(quantity)
  if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
    return null
  }

  const rawValue = Number(config.value)
  if (!Number.isFinite(rawValue) || rawValue <= 0) {
    return null
  }

  let perUnitAmount = 0
  if (config.type === "percent") {
    perUnitAmount = Number(((normalizedPrice * rawValue) / 100).toFixed(2))
  } else {
    perUnitAmount = Number(rawValue.toFixed(2))
  }

  if (!Number.isFinite(perUnitAmount) || perUnitAmount <= 0) {
    return null
  }

  const cappedPerUnit = Math.min(perUnitAmount, normalizedPrice)
  const totalAmount = Number((cappedPerUnit * normalizedQuantity).toFixed(2))

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    return null
  }

  return {
    type: config.type,
    value: config.type === "percent" ? Math.min(Math.max(rawValue, 0), 100) : Math.max(rawValue, 0),
    perUnitAmount: cappedPerUnit,
    totalAmount,
  }
}
