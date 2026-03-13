import { NextRequest, NextResponse } from "next/server"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb } from "@/lib/db"
import { paymentMethods as paymentMethodsSchema } from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, and } from "drizzle-orm"
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


export async function GET(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext()
    const d1 = env.DB
    if (!d1) return NextResponse.json({ error: "DB binding missing" }, { status: 500 })

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const url = new URL(request.url)
    const scope = url.searchParams.get("scope") ?? ""
    const includeInactive =
      scope === "admin" ||
      url.searchParams.get("includeInactive") === "true" ||
      url.searchParams.get("all") === "true"

    const records = await db.query.paymentMethods.findMany({
      where: and(
        eq(paymentMethodsSchema.projectId, tenantId),
        includeInactive ? undefined : eq(paymentMethodsSchema.isActive, true)
      ),
      orderBy: (pm, { asc }) => [asc(pm.createdAt)]
    })

    const transformedRecords = records.map(r => ({
      id: r.id,
      provider: r.provider,
      accountName: r.accountName,
      instructions: r.instructions,
      qrCodeUrl: r.qrCodeUrl,
      isActive: r.isActive,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }))

    const responsePayload: Record<string, unknown> = { data: transformedRecords }

    if (scope === "admin") {
      const usedProviders = new Set(transformedRecords.map((entry) => entry.provider))
      responsePayload.availableProviders = PAYMENT_METHOD_CATALOG.filter((entry) => !usedProviders.has(entry.id))
    }

    return NextResponse.json(responsePayload)
  } catch (error) {
    console.error("[payment-methods][GET] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error retrieving payment methods" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext()
    const d1 = env.DB
    if (!d1) return NextResponse.json({ error: "DB binding missing" }, { status: 500 })

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const payload = (await request.json()) as Partial<NewPaymentMethodInput> | null

    if (!payload) {
      return NextResponse.json({ error: "Missing payment method payload" }, { status: 400 })
    }

    const provider = typeof payload.provider === "string" ? normalizeProvider(payload.provider) : ""
    let qrCodeUrl: string = ""
    if (typeof payload.qrCodeUrl === "string") {
      qrCodeUrl = normalizeUrl(payload.qrCodeUrl)
    }
    const accountName = typeof payload.accountName === "string" ? payload.accountName : null
    const instructions = typeof payload.instructions === "string" ? payload.instructions : null
    const isActive = payload.isActive === undefined ? true : !!payload.isActive

    if (!provider) {
      return NextResponse.json({ error: "Payment provider is required" }, { status: 400 })
    }

    if (!isSupportedPaymentProvider(provider)) {
      return NextResponse.json({ error: "Unsupported payment provider" }, { status: 400 })
    }

    const existing = await db.query.paymentMethods.findFirst({
      where: and(
        eq(paymentMethodsSchema.projectId, tenantId),
        eq(paymentMethodsSchema.provider, provider)
      )
    })

    if (existing) {
      return NextResponse.json({ error: "Payment provider already configured" }, { status: 409 })
    }

    const [inserted] = await db.insert(paymentMethodsSchema).values({
      projectId: tenantId,
      provider,
      qrCodeUrl,
      accountName,
      instructions,
      isActive
    }).returning()

    return NextResponse.json({ data: inserted }, { status: 201 })
  } catch (error) {
    console.error("[payment-methods][POST] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error creating payment method" }, { status: 500 })
  }
}
