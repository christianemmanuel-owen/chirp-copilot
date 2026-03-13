import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDb } from "@/lib/db"
import { orders as ordersSchema, storefrontSettings } from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, desc, and } from "drizzle-orm"
import type { FulfillmentMethod, NewOrderInput } from "@/lib/types"
import { generateOrderId } from "@/lib/utils"
import { calculateShippingFee, type ShippingFeeConfig } from "../../../lib/shipping"

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY
const TURNSTILE_EXPECTED_ACTION = "checkout_submission"
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX_ATTEMPTS = 5
const checkoutAttemptLog = new Map<string, number[]>()

function getClientIp(request: Request): string | null {
  const headers = request.headers
  const forwardHeader = headers.get("x-forwarded-for")
  if (forwardHeader) {
    const [ip] = forwardHeader.split(",").map((entry) => entry.trim())
    if (ip) return ip
  }
  const realIp = headers.get("x-real-ip")
  if (realIp) return realIp
  const cfConnecting = headers.get("cf-connecting-ip")
  if (cfConnecting) return cfConnecting
  return null
}

function registerAndCheckRateLimit(ip: string): boolean {
  const now = Date.now()
  const existing = checkoutAttemptLog.get(ip) ?? []
  const recent = existing.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS)
  recent.push(now)
  checkoutAttemptLog.set(ip, recent)
  return recent.length > RATE_LIMIT_MAX_ATTEMPTS
}

async function verifyTurnstileToken(token: string, remoteIp?: string | null): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY) {
    console.error("[orders][POST] Turnstile secret is not configured")
    return false
  }

  try {
    const params = new URLSearchParams({
      secret: TURNSTILE_SECRET_KEY,
      response: token,
    })
    if (remoteIp) {
      params.append("remoteip", remoteIp)
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    })

    if (!response.ok) {
      console.error("[orders][POST] Turnstile verification failed to respond", response.status, response.statusText)
      return false
    }

    const result = (await response.json()) as {
      success: boolean
      action?: string
      "error-codes"?: string[]
    }

    if (!result.success) {
      console.warn("[orders][POST] Invalid Turnstile response", result["error-codes"])
      return false
    }

    if (result.action && result.action !== TURNSTILE_EXPECTED_ACTION) {
      console.warn("[orders][POST] Unexpected Turnstile action", result.action)
      return false
    }

    return true
  } catch (error) {
    console.error("[orders][POST] Error verifying Turnstile token", error)
    return false
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? parseInt(limitParam, 10) : 200

    const d1 = (process.env as any).DB as D1Database
    if (!d1) {
      return NextResponse.json({ error: "Database binding not found" }, { status: 500 })
    }

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const data = await db.select()
      .from(ordersSchema)
      .where(eq(ordersSchema.projectId, tenantId))
      .orderBy(desc(ordersSchema.createdAt))
      .limit(isNaN(limit) ? 200 : limit)

    return NextResponse.json({ data })
  } catch (error) {
    console.error("[orders][GET] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error retrieving orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const rawPayload = (await request.json()) as (NewOrderInput & { captchaToken?: string }) | null

    if (!rawPayload) {
      return NextResponse.json({ error: "Missing order payload" }, { status: 400 })
    }

    const { captchaToken, ...payload } = rawPayload

    const d1 = (process.env as any).DB as D1Database
    if (!d1) {
      return NextResponse.json({ error: "Database binding not found" }, { status: 500 })
    }

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const cookieStore = await cookies()
    const isAdminRequest = cookieStore.get("admin_auth")?.value === "1"
    const clientIp = isAdminRequest ? null : getClientIp(request)

    if (!isAdminRequest) {
      if (!TURNSTILE_SECRET_KEY) {
        return NextResponse.json({ error: "Captcha verification is not configured" }, { status: 500 })
      }

      const sanitizedToken = typeof captchaToken === "string" ? captchaToken : ""
      if (!sanitizedToken) {
        return NextResponse.json({ error: "Captcha token is required" }, { status: 400 })
      }

      if (clientIp && registerAndCheckRateLimit(clientIp)) {
        return NextResponse.json({ error: "Too many checkout attempts. Please try again later." }, { status: 429 })
      }

      const isCaptchaValid = await verifyTurnstileToken(sanitizedToken, clientIp)
      if (!isCaptchaValid) {
        return NextResponse.json({ error: "Captcha verification failed" }, { status: 400 })
      }
    }

    const requiredPersonal = ["firstName", "lastName", "email", "phone"] as const
    const missingPersonal = requiredPersonal.filter((field) => !payload.customer?.[field])
    if (missingPersonal.length > 0) {
      return NextResponse.json({ error: `Missing customer fields: ${missingPersonal.join(", ")}` }, { status: 400 })
    }

    const fulfillmentMethod: FulfillmentMethod = payload.fulfillmentMethod === "pickup" ? "pickup" : "delivery"

    if (fulfillmentMethod === "delivery") {
      const requiredDelivery = ["street", "city", "region", "zipCode", "country"] as const
      const missingDelivery = requiredDelivery.filter((field) => !payload.delivery?.[field])
      if (missingDelivery.length > 0) {
        return NextResponse.json({ error: `Missing delivery fields: ${missingDelivery.join(", ")}` }, { status: 400 })
      }
    }

    let pickupRequest: { scheduledDate: string; scheduledTime: string } | null = null
    if (fulfillmentMethod === "pickup") {
      const scheduledDate = typeof payload.pickup?.scheduledDate === "string" ? payload.pickup.scheduledDate.trim() : ""
      const scheduledTime = typeof payload.pickup?.scheduledTime === "string" ? payload.pickup.scheduledTime.trim() : ""
      if (!scheduledDate || !scheduledTime) {
        return NextResponse.json({ error: "Pickup date and time are required for pickup orders" }, { status: 400 })
      }
      pickupRequest = { scheduledDate, scheduledTime }
    }

    if (!payload.items || payload.items.length === 0) {
      return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400 })
    }

    if (!payload.paymentMethod) {
      return NextResponse.json({ error: "Payment method is required" }, { status: 400 })
    }

    // Load storefront settings for shipping/pickup
    const settings = await db.query.storefrontSettings.findFirst({
      where: eq(storefrontSettings.projectId, tenantId)
    })

    let shippingConfig: ShippingFeeConfig | undefined
    let pickupGloballyEnabled = false
    let pickupLocationSettings: any = null

    if (settings) {
      shippingConfig = {
        baseFee: settings.shippingDefaultFee,
        regionOverrides: (settings.shippingRegionOverrides as any) || {},
      }
      pickupGloballyEnabled = settings.pickupEnabled

      if (pickupGloballyEnabled && settings.pickupLocationStreet && settings.pickupLocationCity) {
        pickupLocationSettings = {
          name: settings.pickupLocationName,
          unit: settings.pickupLocationUnit,
          lot: settings.pickupLocationLot,
          street: settings.pickupLocationStreet,
          city: settings.pickupLocationCity,
          region: settings.pickupLocationRegion,
          zipCode: settings.pickupLocationZipCode,
          country: settings.pickupLocationCountry || "Philippines",
          notes: settings.pickupLocationNotes,
        }
      }
    }

    if (fulfillmentMethod === "pickup" && !pickupGloballyEnabled) {
      return NextResponse.json({ error: "Pickup is currently unavailable. Please choose delivery." }, { status: 400 })
    }

    if (fulfillmentMethod === "pickup" && !pickupLocationSettings) {
      return NextResponse.json({ error: "Pickup location is not configured. Please contact the store." }, { status: 400 })
    }

    const shippingFee = fulfillmentMethod === "pickup" ? 0 : calculateShippingFee(payload.delivery?.region, shippingConfig)
    const total = Number((payload.subtotal + payload.vat + shippingFee).toFixed(2))

    const orderId = generateOrderId()

    const [newOrder] = await db.insert(ordersSchema).values({
      id: orderId,
      projectId: tenantId,
      paymentMethod: payload.paymentMethod,
      proofOfPaymentUrl: payload.proofOfPayment,
      customerFirstName: payload.customer.firstName,
      customerLastName: payload.customer.lastName,
      customerPhone: payload.customer.phone,
      customerEmail: payload.customer.email,
      instagramHandle: payload.customer.instagramHandle?.trim() || null,
      deliveryStreet: fulfillmentMethod === "pickup" ? pickupLocationSettings.street : payload.delivery?.street,
      deliveryCity: fulfillmentMethod === "pickup" ? pickupLocationSettings.city : payload.delivery?.city,
      deliveryRegion: fulfillmentMethod === "pickup" ? pickupLocationSettings.region : payload.delivery?.region,
      deliveryZipCode: fulfillmentMethod === "pickup" ? pickupLocationSettings.zipCode : payload.delivery?.zipCode,
      deliveryCountry: (fulfillmentMethod === "pickup" ? pickupLocationSettings.country : payload.delivery?.country) || "Philippines",
      fulfillmentMethod,
      orderItems: JSON.stringify(payload.items),
      subtotal: payload.subtotal,
      total: total,
      status: "For Evaluation",
    }).returning()

    return NextResponse.json({ data: newOrder }, { status: 201 })
  } catch (error) {
    console.error("[orders][POST] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error creating order" }, { status: 500 })
  }
}
