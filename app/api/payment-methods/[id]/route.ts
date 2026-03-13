import { NextRequest, NextResponse } from "next/server"
import { getCloudflareContext } from "@/lib/cloudflare/context"
import { getDb } from "@/lib/db"
import { paymentMethods as paymentMethodsSchema } from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, and, ne } from "drizzle-orm"
import { getPaymentMethodCatalogEntry, isSupportedPaymentProvider } from "@/lib/payment-methods"
import type { UpdatePaymentMethodInput } from "@/lib/types"

function normalizeProvider(value: string) {
  return value.trim().toLowerCase()
}

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    if (["1", "true", "yes", "on"].includes(normalized)) return true
    if (["0", "false", "no", "off"].includes(normalized)) return false
  }
  if (typeof value === "number") {
    if (value === 1) return true
    if (value === 0) return false
  }
  return undefined
}


export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const { env } = await getCloudflareContext()
    const d1 = env.DB
    if (!d1) return NextResponse.json({ error: "DB binding missing" }, { status: 500 })

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const payload = (await request.json()) as Partial<UpdatePaymentMethodInput> | null

    if (!id) {
      return NextResponse.json({ error: "Payment method ID is required" }, { status: 400 })
    }

    if (!payload || Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "No fields provided for update" }, { status: 400 })
    }

    const updateData: any = {
      updatedAt: new Date()
    }

    if (payload.provider !== undefined) {
      const provider = normalizeProvider(payload.provider as string)
      if (!isSupportedPaymentProvider(provider) || !getPaymentMethodCatalogEntry(provider)) {
        return NextResponse.json({ error: "Unsupported payment provider" }, { status: 400 })
      }

      const existing = await db.query.paymentMethods.findFirst({
        where: and(
          eq(paymentMethodsSchema.projectId, tenantId),
          eq(paymentMethodsSchema.provider, provider),
          ne(paymentMethodsSchema.id, id)
        )
      })

      if (existing) {
        return NextResponse.json({ error: "Payment provider already configured" }, { status: 409 })
      }
      updateData.provider = provider
    }

    if (payload.qrCodeUrl !== undefined) {
      updateData.qrCodeUrl = payload.qrCodeUrl?.trim() ?? ""
    }

    if (payload.accountName !== undefined) {
      updateData.accountName = payload.accountName?.trim() ?? null
    }

    if (payload.instructions !== undefined) {
      updateData.instructions = payload.instructions?.trim() ?? null
    }

    if (payload.isActive !== undefined) {
      const parsed = parseBoolean(payload.isActive)
      if (parsed === undefined) return NextResponse.json({ error: "Invalid isActive" }, { status: 400 })
      updateData.isActive = parsed
    }

    const [updated] = await db.update(paymentMethodsSchema)
      .set(updateData)
      .where(and(
        eq(paymentMethodsSchema.id, id),
        eq(paymentMethodsSchema.projectId, tenantId)
      ))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 })
    }

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error("[payment-methods][PATCH] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const { env } = await getCloudflareContext()
    const d1 = env.DB
    if (!d1) return NextResponse.json({ error: "DB binding missing" }, { status: 500 })

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    if (!id) {
      return NextResponse.json({ error: "Payment method ID is required" }, { status: 400 })
    }

    const result = await db.delete(paymentMethodsSchema)
      .where(and(
        eq(paymentMethodsSchema.id, id),
        eq(paymentMethodsSchema.projectId, tenantId)
      ))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[payment-methods][DELETE] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
