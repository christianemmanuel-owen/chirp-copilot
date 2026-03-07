const parsePositiveInt = (value: string | undefined, fallback: number) => {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return parsed
}

const DEFAULT_WINDOW_MS = 60_000
const DEFAULT_MAX_REQUESTS = 120

export const RATE_LIMIT_WINDOW_MS = parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, DEFAULT_WINDOW_MS)
export const RATE_LIMIT_MAX_REQUESTS = parsePositiveInt(process.env.RATE_LIMIT_MAX_REQUESTS, DEFAULT_MAX_REQUESTS)

type RateLimitEntry = {
  count: number
  expiresAt: number
}

const buckets = new Map<string, RateLimitEntry>()

const getClientIdentifier = (ip: string | null | undefined, forwardedFor: string | null | undefined) => {
  if (ip && ip.trim().length > 0) return ip.trim()
  if (!forwardedFor) return "unknown"
  const [first] = forwardedFor.split(",")
  if (!first) return "unknown"
  const normalized = first.trim()
  return normalized.length > 0 ? normalized : "unknown"
}

export function evaluateRateLimit(identifier: string) {
  const now = Date.now()
  const entry = buckets.get(identifier)

  if (!entry || entry.expiresAt <= now) {
    buckets.set(identifier, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAt: now + RATE_LIMIT_WINDOW_MS }
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.expiresAt }
  }

  entry.count += 1
  buckets.set(identifier, entry)
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, resetAt: entry.expiresAt }
}

export function getClientKey(ip: string | null | undefined, forwardedFor: string | null | undefined) {
  return getClientIdentifier(ip, forwardedFor)
}

