export type DownPaymentDbValue = {
  type: "none" | "percent" | "amount"
  value: number | null
}

export type DownPaymentRequest = {
  type?: string | null
  value?: number | null
} | null

export function parseDownPaymentRequest(
  payload: DownPaymentRequest,
  isPreorder: boolean,
): { ok: true; value: DownPaymentDbValue } | { ok: false; message: string } {
  if (!isPreorder) {
    return { ok: true, value: { type: "none", value: null } }
  }

  if (!payload) {
    return { ok: true, value: { type: "none", value: null } }
  }

  const type = payload.type
  if (type !== "percent" && type !== "amount") {
    return { ok: false, message: "Down payment type must be percent or amount." }
  }

  const numericValue = Number(payload.value)
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return { ok: false, message: "Down payment value must be greater than zero." }
  }

  if (type === "percent" && numericValue > 100) {
    return { ok: false, message: "Down payment percent cannot be greater than 100%." }
  }

  return {
    ok: true,
    value: {
      type,
      value: Number(numericValue.toFixed(2)),
    },
  }
}
