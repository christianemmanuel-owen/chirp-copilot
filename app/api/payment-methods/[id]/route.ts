import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import {
  mapPaymentMethodRow,
  mapPaymentMethodUpdateToUpdate,
} from "@/lib/supabase/transformers"
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

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const payload = (await request.json()) as Partial<UpdatePaymentMethodInput> | null

    if (!id) {
      return NextResponse.json({ error: "Payment method ID is required" }, { status: 400 })
    }

    if (!payload || Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "No fields provided for update" }, { status: 400 })
    }

    const updateInput: UpdatePaymentMethodInput = {}

    if (payload.provider !== undefined) {
      if (typeof payload.provider !== "string") {
        return NextResponse.json({ error: "Invalid provider value" }, { status: 400 })
      }

      const provider = normalizeProvider(payload.provider)
      if (!isSupportedPaymentProvider(provider) || !getPaymentMethodCatalogEntry(provider)) {
        return NextResponse.json({ error: "Unsupported payment provider" }, { status: 400 })
      }
      updateInput.provider = provider
    }

    if (payload.qrCodeUrl !== undefined) {
      if (payload.qrCodeUrl === null) {
        updateInput.qrCodeUrl = null
      } else if (typeof payload.qrCodeUrl === "string") {
        const trimmed = payload.qrCodeUrl.trim()
        updateInput.qrCodeUrl = trimmed.length > 0 ? trimmed : null
      } else {
        return NextResponse.json({ error: "Invalid QR code URL" }, { status: 400 })
      }
    }

    if (payload.accountName !== undefined) {
      if (payload.accountName === null) {
        updateInput.accountName = null
      } else if (typeof payload.accountName === "string") {
        updateInput.accountName = payload.accountName.trim().length > 0 ? payload.accountName.trim() : null
      } else {
        return NextResponse.json({ error: "Invalid account name" }, { status: 400 })
      }
    }

    if (payload.instructions !== undefined) {
      if (payload.instructions === null) {
        updateInput.instructions = null
      } else if (typeof payload.instructions === "string") {
        updateInput.instructions = payload.instructions.trim().length > 0 ? payload.instructions.trim() : null
      } else {
        return NextResponse.json({ error: "Invalid instructions" }, { status: 400 })
      }
    }

    if (payload.isActive !== undefined) {
      const parsed = parseBoolean(payload.isActive)
      if (parsed === undefined) {
        return NextResponse.json({ error: "Invalid isActive flag" }, { status: 400 })
      }
      updateInput.isActive = parsed
    }

    if (Object.keys(updateInput).length === 0) {
      return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 })
    }

    const supabase = getSupabaseServiceRoleClient()

    if (updateInput.provider) {
      const { data: existingRows, error: existingError } = await supabase
        .from("payment_methods")
        .select("id")
        .eq("provider", updateInput.provider)
        .neq("id", id)
        .limit(1)

      if (existingError) {
        console.error("[payment-methods][PATCH] Failed to check existing provider", existingError)
        return NextResponse.json({ error: "Failed to update payment method" }, { status: 500 })
      }

      if (existingRows && existingRows.length > 0) {
        return NextResponse.json({ error: "Payment provider already configured" }, { status: 409 })
      }
    }

    const updatePayload = mapPaymentMethodUpdateToUpdate(updateInput)

    const { data, error } = await supabase
      .from("payment_methods")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if ((error as { code?: string }).code === "PGRST116") {
        return NextResponse.json({ error: "Payment method not found" }, { status: 404 })
      }
      console.error("[payment-methods][PATCH] Supabase error", error)
      return NextResponse.json({ error: "Failed to update payment method" }, { status: 500 })
    }

    const record = mapPaymentMethodRow(data)
    return NextResponse.json({ data: record })
  } catch (error) {
    console.error("[payment-methods][PATCH] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error updating payment method" }, { status: 500 })
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ error: "Payment method ID is required" }, { status: 400 })
    }

    const supabase = getSupabaseServiceRoleClient()
    const { error } = await supabase.from("payment_methods").delete().eq("id", id)

    if (error) {
      console.error("[payment-methods][DELETE] Supabase error", error)
      return NextResponse.json({ error: "Failed to delete payment method" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[payment-methods][DELETE] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error deleting payment method" }, { status: 500 })
  }
}
