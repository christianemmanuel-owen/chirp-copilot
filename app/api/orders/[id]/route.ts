import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import { mapOrderRowToOrder, mapOrderUpdate } from "@/lib/supabase/transformers"
import type { Order, OrderStatus } from "@/lib/types"

const ORDER_STATUS_VALUES: OrderStatus[] = [
  "For Evaluation",
  "Confirmed",
  "For Delivery",
  "Out for Delivery",
  "For Refund",
  "Refunded",
  "Completed",
  "Cancelled",
]

const INVENTORY_DEDUCT_STATUSES = new Set<OrderStatus>(["For Delivery", "Out for Delivery", "For Refund", "Completed"])
const INVENTORY_REPLENISH_STATUSES = new Set<OrderStatus>(["For Evaluation", "Confirmed", "Cancelled", "Refunded"])

function isValidStatus(value: string): value is OrderStatus {
  return ORDER_STATUS_VALUES.includes(value as OrderStatus)
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = getSupabaseServiceRoleClient()
    const { data, error } = await supabase.from("orders").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }
      console.error("[orders][GET:id] Supabase error", error)
      return NextResponse.json({ error: "Failed to load order" }, { status: 500 })
    }

    const order = mapOrderRowToOrder(data)
    return NextResponse.json({ data: order })
  } catch (error) {
    console.error("[orders][GET:id] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error retrieving order" }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const payload = (await request.json()) as Partial<
      Pick<Order, "status" | "isRead" | "proofOfPayment" | "trackingId">
    > | null

    if (!payload || Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "No order fields provided for update" }, { status: 400 })
    }

    const supabase = getSupabaseServiceRoleClient()
    const { data: existingRow, error: existingError } = await supabase.from("orders").select("*").eq("id", id).single()

    if (existingError) {
      if (existingError.code === "PGRST116") {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }
      console.error("[orders][PATCH:id] Failed to load existing order", existingError)
      return NextResponse.json({ error: "Failed to load order before update" }, { status: 500 })
    }

    const updateData: Partial<Order> = {}

    if (payload.status !== undefined) {
      if (!isValidStatus(payload.status)) {
        return NextResponse.json({ error: "Invalid order status value" }, { status: 400 })
      }
      updateData.status = payload.status
    }

    if (payload.isRead !== undefined) {
      updateData.isRead = payload.isRead
    }

    if (payload.proofOfPayment !== undefined) {
      updateData.proofOfPayment = payload.proofOfPayment
    }

    if (payload.trackingId !== undefined) {
      const trimmed = typeof payload.trackingId === "string" ? payload.trackingId.trim() : null
      updateData.trackingId = trimmed && trimmed.length > 0 ? trimmed : null
    }

    const updatePayload = mapOrderUpdate(updateData)

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No valid order fields provided for update" }, { status: 400 })
    }

    const existingStatus = isValidStatus(existingRow.status) ? existingRow.status : "For Evaluation"
    const incomingStatus = updateData.status ?? existingStatus

    let inventoryAdjustment: "deduct" | "restock" | null = null
    let nextInventoryAdjusted = existingRow.inventory_adjusted

    if (updateData.status !== undefined) {
      if (!existingRow.inventory_adjusted && INVENTORY_DEDUCT_STATUSES.has(incomingStatus)) {
        inventoryAdjustment = "deduct"
        nextInventoryAdjusted = true
      } else if (existingRow.inventory_adjusted && INVENTORY_REPLENISH_STATUSES.has(incomingStatus)) {
        inventoryAdjustment = "restock"
        nextInventoryAdjusted = false
      }
    }

    if (inventoryAdjustment !== null) {
      updateData.inventoryAdjusted = nextInventoryAdjusted
      updatePayload.inventory_adjusted = nextInventoryAdjusted

      const adjustResult = await adjustInventoryForOrder(supabase, existingRow.order_items, inventoryAdjustment)
      if (!adjustResult.ok) {
        console.error("[orders][PATCH:id] Inventory adjustment failed", adjustResult.error ?? adjustResult.message)
        return NextResponse.json(
          { error: adjustResult.message ?? "Failed to adjust inventory for order update" },
          { status: adjustResult.status ?? 400 },
        )
      }

      updatePayload.updated_at = new Date().toISOString()

      const { data, error } = await supabase.from("orders").update(updatePayload).eq("id", id).select().single()

      if (error) {
        console.error("[orders][PATCH:id] Supabase error", error)
        await adjustInventoryForOrder(
          supabase,
          existingRow.order_items,
          inventoryAdjustment === "deduct" ? "restock" : "deduct",
        )
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
      }

      const order = mapOrderRowToOrder(data)
      return NextResponse.json({ data: order })
    }

    updatePayload.updated_at = new Date().toISOString()

    const { data, error } = await supabase.from("orders").update(updatePayload).eq("id", id).select().single()

    if (error) {
      console.error("[orders][PATCH:id] Supabase error", error)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    const order = mapOrderRowToOrder(data)
    return NextResponse.json({ data: order })
  } catch (error) {
    console.error("[orders][PATCH:id] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error updating order" }, { status: 500 })
  }
}

async function adjustInventoryForOrder(
  supabase: ReturnType<typeof getSupabaseServiceRoleClient>,
  rawItems: unknown,
  action: "deduct" | "restock",
) {
  const items: Array<{
    id?: number
    productId?: number
    variantId?: number
    quantity?: number
    customizations?: Record<string, unknown>
  }> = Array.isArray(rawItems)
    ? (rawItems as any[])
    : []

  for (const item of items) {
    const variantId = Number(item?.variantId ?? item?.id)
    const quantity = Number(item?.quantity ?? 0)

    if (!variantId || quantity <= 0) {
      continue
    }

    const { data: variantRow, error: variantError } = await supabase
      .from("product_variants")
      .select("is_preorder")
      .eq("id", variantId)
      .single()

    if (variantError) {
      return { ok: false as const, message: "Failed to load variant", error: variantError, status: 500 }
    }

    if (variantRow?.is_preorder) {
      continue
    }

    const { data: sizeRows, error: fetchSizesError } = await supabase
      .from("variant_sizes")
      .select("id, size, stock_quantity")
      .eq("variant_id", variantId)

    if (fetchSizesError) {
      return { ok: false as const, message: "Failed to load variant sizes", error: fetchSizesError, status: 500 }
    }

    const normalizedSizeLabel = (() => {
      const customValue = item.customizations?.["Size"]
      const rawLabel = typeof customValue === "string" ? customValue.trim() : ""
      const lower = rawLabel.toLowerCase()
      if (lower === "default") return ""
      return rawLabel
    })()

    if (!sizeRows || sizeRows.length === 0) {
      return { ok: false as const, message: "Variant has no size entries", status: 500 }
    }

    const targetRow =
      sizeRows.find((row) => {
        const rowLabel = (row.size ?? "").trim()
        if (normalizedSizeLabel.length === 0) {
          return rowLabel.length === 0
        }
        return rowLabel.toLowerCase() === normalizedSizeLabel.toLowerCase()
      }) ?? sizeRows[0]

    const currentStock = Number(targetRow.stock_quantity ?? 0)
    const delta = action === "deduct" ? -quantity : quantity
    const newStock = currentStock + delta

    if (newStock < 0) {
      return {
        ok: false as const,
        message: `Insufficient stock for product variant ${variantId}`,
        status: 400,
      }
    }

    const { error: updateError } = await supabase
      .from("variant_sizes")
      .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
      .eq("id", targetRow.id as number)

    if (updateError) {
      return { ok: false as const, message: "Failed to update variant quantity", error: updateError, status: 500 }
    }
  }

  return { ok: true as const }
}
