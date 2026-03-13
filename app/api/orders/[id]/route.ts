import { NextRequest, NextResponse } from "next/server"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb } from "@/lib/db"
import { orders, productVariants, variantSizes } from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, and, sql } from "drizzle-orm"
import type { OrderStatus } from "@/lib/types"


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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { env } = await getCloudflareContext()
    const d1 = env.DB
    if (!d1) return NextResponse.json({ error: "DB binding missing" }, { status: 500 })

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, id),
        eq(orders.projectId, tenantId)
      )
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ data: order })
  } catch (error) {
    console.error("[orders][GET:id] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error retrieving order" }, { status: 500 })
  }
}

interface OrderUpdatePayload {
  status?: OrderStatus
  isRead?: boolean
  proofOfPayment?: string
  trackingId?: string
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { env } = await getCloudflareContext()
    const d1 = env.DB
    if (!d1) return NextResponse.json({ error: "DB binding missing" }, { status: 500 })

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const payload = await request.json() as OrderUpdatePayload

    const existingOrder = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, id),
        eq(orders.projectId, tenantId)
      )
    })

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const updateData: any = {
      updatedAt: new Date()
    }

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
      updateData.proofOfPaymentUrl = payload.proofOfPayment
    }

    if (payload.trackingId !== undefined) {
      const trimmed = typeof payload.trackingId === "string" ? payload.trackingId.trim() : null
      updateData.trackingId = trimmed && trimmed.length > 0 ? trimmed : null
    }

    const incomingStatus = updateData.status ?? existingOrder.status
    let inventoryAdjustment: "deduct" | "restock" | null = null
    let nextInventoryAdjusted = existingOrder.inventoryAdjusted

    if (updateData.status !== undefined) {
      if (!existingOrder.inventoryAdjusted && INVENTORY_DEDUCT_STATUSES.has(incomingStatus)) {
        inventoryAdjustment = "deduct"
        nextInventoryAdjusted = true
      } else if (existingOrder.inventoryAdjusted && INVENTORY_REPLENISH_STATUSES.has(incomingStatus)) {
        inventoryAdjustment = "restock"
        nextInventoryAdjusted = false
      }
    }

    if (inventoryAdjustment !== null) {
      updateData.inventoryAdjusted = nextInventoryAdjusted

      const adjustResult = await adjustInventoryForOrder(db, existingOrder.orderItems, inventoryAdjustment)
      if (!adjustResult.ok) {
        return NextResponse.json(
          { error: adjustResult.message ?? "Failed to adjust inventory" },
          { status: 400 }
        )
      }
    }

    const [updatedOrder] = await db.update(orders)
      .set(updateData)
      .where(and(
        eq(orders.id, id),
        eq(orders.projectId, tenantId)
      ))
      .returning()

    return NextResponse.json({ data: updatedOrder })
  } catch (error) {
    console.error("[orders][PATCH:id] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}

async function adjustInventoryForOrder(
  db: ReturnType<typeof getDb>,
  orderItems: any,
  action: "deduct" | "restock"
) {
  const items = Array.isArray(orderItems) ? orderItems : []

  for (const item of items) {
    const variantId = Number(item?.variantId ?? item?.id)
    const quantity = Number(item?.quantity ?? 0)

    if (!variantId || quantity <= 0) continue

    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, variantId)
    })

    if (!variant || variant.isPreorder) continue

    const sizes = await db.query.variantSizes.findMany({
      where: eq(variantSizes.variantId, variantId)
    })

    if (!sizes || sizes.length === 0) continue

    const normalizedSizeLabel = (() => {
      const customValue = item.customizations?.["Size"]
      const rawLabel = typeof customValue === "string" ? customValue.trim() : ""
      const lower = rawLabel.toLowerCase()
      if (lower === "default") return ""
      return rawLabel
    })()

    const targetRow = sizes.find((row) => {
      const rowLabel = (row.size ?? "").trim()
      if (normalizedSizeLabel.length === 0) return rowLabel.length === 0
      return rowLabel.toLowerCase() === normalizedSizeLabel.toLowerCase()
    }) ?? sizes[0]

    const delta = action === "deduct" ? -quantity : quantity
    const newStock = targetRow.stockQuantity + delta

    if (newStock < 0) {
      return { ok: false, message: `Insufficient stock for ${targetRow.size || 'default'} size` }
    }

    await db.update(variantSizes)
      .set({
        stockQuantity: newStock,
        updatedAt: new Date()
      })
      .where(eq(variantSizes.id, targetRow.id))
  }

  return { ok: true }
}
