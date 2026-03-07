export const BUSINESS_NAME = (() => {
  const raw = process.env.NEXT_PUBLIC_BUSINESS_NAME
  if (typeof raw !== "string") return "CHIRP"
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : "CHIRP"
})()

