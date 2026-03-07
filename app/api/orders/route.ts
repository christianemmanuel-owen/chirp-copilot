import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import { mapOrderInputToInsert, mapOrderRowToOrder } from "@/lib/supabase/transformers"
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

    const supabase = getSupabaseServiceRoleClient()
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (!isNaN(limit)) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error("[orders][GET] Supabase error", error)
      return NextResponse.json({ error: "Failed to load orders" }, { status: 500 })
    }

    const orders = (data ?? []).map(mapOrderRowToOrder)
    return NextResponse.json({ data: orders })
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
    const supabase = getSupabaseServiceRoleClient()
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

    const fulfillmentMethod: FulfillmentMethod =
      payload.fulfillmentMethod === "pickup" ? "pickup" : "delivery"

    const requiredDelivery = ["street", "city", "region", "zipCode", "country"] as const
    if (fulfillmentMethod === "delivery") {
      const missingDelivery = requiredDelivery.filter((field) => !payload.delivery?.[field])
      if (missingDelivery.length > 0) {
        return NextResponse.json(
          { error: `Missing delivery fields: ${missingDelivery.join(", ")}` },
          { status: 400 },
        )
      }
    }

    let pickupRequest: { scheduledDate: string; scheduledTime: string } | null = null
    if (fulfillmentMethod === "pickup") {
      const scheduledDate =
        typeof payload.pickup?.scheduledDate === "string" ? payload.pickup.scheduledDate.trim() : ""
      const scheduledTime =
        typeof payload.pickup?.scheduledTime === "string" ? payload.pickup.scheduledTime.trim() : ""
      if (!scheduledDate || !scheduledTime) {
        return NextResponse.json(
          { error: "Pickup date and time are required for pickup orders" },
          { status: 400 },
        )
      }
      pickupRequest = { scheduledDate, scheduledTime }
    }

    if (!payload.items || payload.items.length === 0) {
      return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400 })
    }

    if (!payload.paymentMethod) {
      return NextResponse.json({ error: "Payment method is required" }, { status: 400 })
    }

    let shippingConfig: ShippingFeeConfig | undefined
    let pickupGloballyEnabled = true
    let pickupLocationSettings:
      | {
        name: string | null
        unit: string | null
        lot: string | null
        street: string
        city: string
        region: string
        zipCode: string
        country: string
        notes: string | null
      }
      | null = null
    try {
      const { data: shippingSettings, error: shippingError } = await supabase
        .from("storefront_settings")
        .select(
          "shipping_default_fee, shipping_region_overrides, pickup_enabled, pickup_location_name, pickup_location_unit, pickup_location_lot, pickup_location_street, pickup_location_city, pickup_location_region, pickup_location_zip_code, pickup_location_country, pickup_location_notes",
        )
        .eq("id", 1)
        .maybeSingle()

      if (shippingError) {
        console.error("[orders][POST] Failed to load shipping settings", shippingError)
      } else if (shippingSettings) {
        const overrides =
          shippingSettings.shipping_region_overrides &&
            typeof shippingSettings.shipping_region_overrides === "object" &&
            !Array.isArray(shippingSettings.shipping_region_overrides)
            ? (shippingSettings.shipping_region_overrides as Record<string, number>)
            : undefined

        shippingConfig = {
          baseFee:
            typeof shippingSettings.shipping_default_fee === "number"
              ? Number(shippingSettings.shipping_default_fee)
              : undefined,
          regionOverrides: overrides,
        }

        if (typeof shippingSettings.pickup_enabled === "boolean") {
          pickupGloballyEnabled = shippingSettings.pickup_enabled
        }

        if (
          pickupGloballyEnabled &&
          typeof shippingSettings.pickup_location_street === "string" &&
          typeof shippingSettings.pickup_location_city === "string" &&
          typeof shippingSettings.pickup_location_region === "string" &&
          typeof shippingSettings.pickup_location_zip_code === "string"
        ) {
          pickupLocationSettings = {
            name: typeof shippingSettings.pickup_location_name === "string" ? shippingSettings.pickup_location_name : null,
            unit: typeof shippingSettings.pickup_location_unit === "string" ? shippingSettings.pickup_location_unit : null,
            lot: typeof shippingSettings.pickup_location_lot === "string" ? shippingSettings.pickup_location_lot : null,
            street: shippingSettings.pickup_location_street,
            city: shippingSettings.pickup_location_city,
            region: shippingSettings.pickup_location_region,
            zipCode: shippingSettings.pickup_location_zip_code,
            country:
              typeof shippingSettings.pickup_location_country === "string"
                ? shippingSettings.pickup_location_country
                : "Philippines",
            notes:
              typeof shippingSettings.pickup_location_notes === "string" ? shippingSettings.pickup_location_notes : null,
          }
        }
      }
    } catch (settingsError) {
      console.error("[orders][POST] Unexpected error while retrieving shipping settings", settingsError)
    }

    if (fulfillmentMethod === "pickup" && !pickupGloballyEnabled) {
      return NextResponse.json(
        { error: "Pickup is currently unavailable. Please choose delivery." },
        { status: 400 },
      )
    }

    if (fulfillmentMethod === "pickup" && !pickupLocationSettings) {
      return NextResponse.json(
        { error: "Pickup location is not configured. Please contact the store." },
        { status: 400 },
      )
    }

    const shippingFee =
      fulfillmentMethod === "pickup" ? 0 : calculateShippingFee(payload.delivery?.region, shippingConfig)
    const total = Number((payload.subtotal + payload.vat + shippingFee).toFixed(2))

    const deliveryDetails =
      fulfillmentMethod === "pickup" && pickupLocationSettings
        ? {
          unit: pickupLocationSettings.unit ?? "",
          lot: pickupLocationSettings.lot ?? "",
          street: pickupLocationSettings.street,
          city: pickupLocationSettings.city,
          region: pickupLocationSettings.region,
          zipCode: pickupLocationSettings.zipCode,
          country: pickupLocationSettings.country,
        }
        : {
          unit: payload.delivery?.unit ?? "",
          lot: payload.delivery?.lot ?? "",
          street: payload.delivery?.street ?? "",
          city: payload.delivery?.city ?? "",
          region: payload.delivery?.region ?? "",
          zipCode: payload.delivery?.zipCode ?? "",
          country: payload.delivery?.country ?? "",
        }

    const pickupDetails =
      fulfillmentMethod === "pickup" && pickupLocationSettings && pickupRequest
        ? {
          locationName: pickupLocationSettings.name ?? pickupLocationSettings.street,
          unit: pickupLocationSettings.unit ?? "",
          lot: pickupLocationSettings.lot ?? "",
          street: pickupLocationSettings.street,
          city: pickupLocationSettings.city,
          region: pickupLocationSettings.region,
          zipCode: pickupLocationSettings.zipCode,
          country: pickupLocationSettings.country,
          notes: pickupLocationSettings.notes ?? "",
          scheduledDate: pickupRequest.scheduledDate,
          scheduledTime: pickupRequest.scheduledTime,
        }
        : null

    const normalizedHandle =
      typeof payload.customer?.instagramHandle === "string"
        ? payload.customer.instagramHandle.trim() || null
        : null

    const normalizedPayload: NewOrderInput = {
      ...payload,
      customer: {
        ...payload.customer,
        instagramHandle: normalizedHandle,
      },
      delivery: deliveryDetails,
      fulfillmentMethod,
      pickup: pickupDetails,
      trackingId: payload.trackingId && payload.trackingId.trim().length > 0 ? payload.trackingId.trim() : null,
      shippingFee,
      total,
    }

    const id = generateOrderId()
    const insertPayload = mapOrderInputToInsert(id, normalizedPayload)

    const { data, error } = await supabase.from("orders").insert(insertPayload).select().single()

    if (error) {
      console.error("[orders][POST] Supabase error", error)
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    const order = mapOrderRowToOrder(data)
    return NextResponse.json({ data: order }, { status: 201 })
  } catch (error) {
    console.error("[orders][POST] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error creating order" }, { status: 500 })
  }
}
