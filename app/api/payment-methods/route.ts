import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import {
  mapPaymentMethodInputToInsert,
  mapPaymentMethodRow,
} from "@/lib/supabase/transformers"
import {
  getPaymentMethodCatalogEntry,
  isSupportedPaymentProvider,
  PAYMENT_METHOD_CATALOG,
} from "@/lib/payment-methods"
import type { NewPaymentMethodInput } from "@/lib/types"

function normalizeProvider(value: string) {
  return value.trim().toLowerCase()
}

function normalizeUrl(value: string) {
  return value.trim()
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const scope = url.searchParams.get("scope") ?? ""
    const includeInactive =
      scope === "admin" ||
      url.searchParams.get("includeInactive") === "true" ||
      url.searchParams.get("all") === "true"

    const supabase = getSupabaseServiceRoleClient()
    let query = supabase.from("payment_methods").select("*").order("created_at", { ascending: true })

    if (!includeInactive) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query

    if (error) {
      console.error("[payment-methods][GET] Supabase error", error)
      return NextResponse.json({ error: "Failed to load payment methods" }, { status: 500 })
    }

    const records = (data ?? []).map(mapPaymentMethodRow)
    const responsePayload: Record<string, unknown> = { data: records }

    if (scope === "admin") {
      const usedProviders = new Set(records.map((entry) => entry.provider))
      responsePayload.availableProviders = PAYMENT_METHOD_CATALOG.filter((entry) => !usedProviders.has(entry.id))
    }

    return NextResponse.json(responsePayload)
  } catch (error) {
    console.error("[payment-methods][GET] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error retrieving payment methods" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<NewPaymentMethodInput> | null

    if (!payload) {
      return NextResponse.json({ error: "Missing payment method payload" }, { status: 400 })
    }

    const provider = typeof payload.provider === "string" ? normalizeProvider(payload.provider) : ""
    let qrCodeUrl: string | null = null
    if (payload.qrCodeUrl === null) {
      qrCodeUrl = null
    } else if (typeof payload.qrCodeUrl === "string") {
      const normalized = normalizeUrl(payload.qrCodeUrl)
      qrCodeUrl = normalized.length > 0 ? normalized : null
    }
    const accountName = typeof payload.accountName === "string" ? payload.accountName : undefined
    const instructions = typeof payload.instructions === "string" ? payload.instructions : undefined
    const isActive =
      payload.isActive === undefined ? true : typeof payload.isActive === "boolean" ? payload.isActive : Boolean(payload.isActive)

    if (!provider) {
      return NextResponse.json({ error: "Payment provider is required" }, { status: 400 })
    }

    if (!isSupportedPaymentProvider(provider)) {
      return NextResponse.json({ error: "Unsupported payment provider" }, { status: 400 })
    }

    if (!getPaymentMethodCatalogEntry(provider)) {
      return NextResponse.json({ error: "Unsupported payment provider" }, { status: 400 })
    }

    const supabase = getSupabaseServiceRoleClient()

    const { data: existingRows, error: existingError } = await supabase
      .from("payment_methods")
      .select("id")
      .eq("provider", provider)
      .limit(1)

    if (existingError) {
      console.error("[payment-methods][POST] Failed to check existing provider", existingError)
      return NextResponse.json({ error: "Failed to create payment method" }, { status: 500 })
    }

    if (existingRows && existingRows.length > 0) {
      return NextResponse.json({ error: "Payment provider already configured" }, { status: 409 })
    }

    const insertPayload = mapPaymentMethodInputToInsert({
      provider,
      qrCodeUrl,
      accountName,
      instructions,
      isActive,
    })

    const { data, error } = await supabase.from("payment_methods").insert(insertPayload).select().single()

    if (error) {
      console.error("[payment-methods][POST] Supabase error", error)
      return NextResponse.json({ error: "Failed to create payment method" }, { status: 500 })
    }

    const record = mapPaymentMethodRow(data)
    return NextResponse.json({ data: record }, { status: 201 })
  } catch (error) {
    console.error("[payment-methods][POST] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error creating payment method" }, { status: 500 })
  }
}
