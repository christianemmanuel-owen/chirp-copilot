"use client"

import { useCallback, useMemo, useState } from "react"
import { Loader2, MapPin, PackageSearch, RefreshCcw, Truck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { Order, OrderItem, OrderStatus } from "@/lib/types"
import { cn, formatCurrency } from "@/lib/utils"

const STATUS_BADGE_STYLES: Record<OrderStatus, string> = {
  "For Evaluation": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  Confirmed: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  "For Delivery": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "Out for Delivery": "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  "For Refund": "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  Refunded: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Completed: "bg-green-500/10 text-green-700 dark:text-green-400",
  Cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
}

const STATUS_HINTS: Partial<Record<OrderStatus, string>> = {
  "For Evaluation": "We are reviewing your order details and payment confirmation.",
  Confirmed: "Your order is confirmed and is now being prepared.",
  "For Delivery": "Your package is being prepared for handoff to our couriers.",
  "Out for Delivery": "Your order is currently with our rider and on the way.",
  Completed: "Your order has been delivered successfully. Thank you!",
  Cancelled: "The order has been cancelled. Please reach out if this is unexpected.",
  "For Refund": "We are processing your refund request.",
  Refunded: "The refund has been released. Please allow processing time for your bank.",
}

export default function OrderTrackingDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [orderCode, setOrderCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<Order | null>(null)

  const normalizedCode = useMemo(() => orderCode.trim(), [orderCode])

  const handleLookup = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!normalizedCode) {
        setError("Enter the order code from your confirmation email.")
        setOrder(null)
        return
      }

      setIsLoading(true)
      setError(null)
      setOrder(null)

      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(normalizedCode)}`, {
          cache: "no-store",
        })
        const payload = (await response.json()) as { data?: Order; error?: string }

        if (!response.ok || !payload?.data) {
          throw new Error(payload?.error || "Order not found. Double-check your code and try again.")
        }

        setOrder(payload.data)
      } catch (lookupError) {
        console.error("[OrderTrackingDialog] Failed to fetch order", lookupError)
        setError(
          lookupError instanceof Error ? lookupError.message : "Something went wrong. Please try again shortly.",
        )
      } finally {
        setIsLoading(false)
      }
    },
    [normalizedCode],
  )

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setOrder(null)
      setOrderCode("")
      setError(null)
      setIsLoading(false)
    }
  }

  return (
    <>
      {children ? (
        <div onClick={() => setOpen(true)} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={() => setOpen(true)}>
          Track Order
        </Button>
      )}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Track my order</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Enter the order code from your confirmation email or receipt to view the latest status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLookup} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="order-code">Order code</Label>
              <Input
                id="order-code"
                placeholder="e.g. ORD-20240518-1234"
                autoComplete="off"
                value={orderCode}
                onChange={(event) => setOrderCode(event.target.value.toUpperCase())}
                aria-invalid={Boolean(error)}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={!normalizedCode || isLoading}
              aria-live="polite"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Locating order...
                </>
              ) : (
                <>
                  <PackageSearch className="h-4 w-4" />
                  Find my order
                </>
              )}
            </Button>
          </form>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {order && (
            <OrderDetailsCard
              order={order}
              onReset={() => {
                setOrder(null)
                setOrderCode("")
                setError(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function OrderDetailsCard({ order, onReset }: { order: Order; onReset: () => void }) {
  const statusHint = STATUS_HINTS[order.status]
  const statusClass = STATUS_BADGE_STYLES[order.status] ?? "bg-muted text-foreground"

  const fulfillmentLabel = order.fulfillmentMethod === "delivery" ? "Delivery address" : "Pickup details"

  const fulfillmentDetails =
    order.fulfillmentMethod === "delivery"
      ? formatAddress(order.delivery)
      : formatPickupDetails(order.pickup)

  return (
    <div className="space-y-4 rounded-lg border border-border/70 bg-muted/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Order ID</p>
          <p className="font-semibold text-foreground">{order.id}</p>
          <p className="text-xs text-muted-foreground">{formatOrderDate(order.date)}</p>
        </div>
        <div className="text-right">
          <Badge className={cn("px-3 py-1 text-xs font-semibold", statusClass)}>{order.status}</Badge>
          {order.trackingId && (
            <p className="mt-1 text-xs text-muted-foreground">Tracking #: {order.trackingId}</p>
          )}
        </div>
      </div>

      {statusHint && <p className="text-sm text-muted-foreground">{statusHint}</p>}

      <div className="space-y-2 rounded-md border border-border/60 bg-background/80 p-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          {order.fulfillmentMethod === "delivery" ? <Truck className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
          <p className="text-xs uppercase tracking-wide">{fulfillmentLabel}</p>
        </div>
        <p className="font-medium leading-relaxed text-foreground">{fulfillmentDetails}</p>
        <p className="text-xs text-muted-foreground">
          Contact: {order.customer.firstName} {order.customer.lastName} • {order.customer.phone}
        </p>
      </div>

      <ItemsList items={order.items} />

      <div className="space-y-3 rounded-md border border-border/60 bg-background/80 p-3">
        <AmountRow label="Subtotal" value={order.subtotal} />
        <AmountRow label="VAT" value={order.vat} />
        <AmountRow label={order.fulfillmentMethod === "delivery" ? "Shipping" : "Pickup fee"} value={order.shippingFee} />
        <div className="flex items-center justify-between border-t border-dashed border-border/80 pt-3">
          <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Total</span>
          <span className="text-lg font-bold text-foreground">{formatCurrency(order.total)}</span>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        className="w-full justify-center"
        onClick={onReset}
      >
        <RefreshCcw className="h-4 w-4" />
        Look up another order
      </Button>
    </div>
  )
}

function ItemsList({ items }: { items: OrderItem[] }) {
  return (
    <div className="rounded-md border border-border/60">
      <div className="border-b border-border/60 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Order items
      </div>
      <div className="divide-y divide-border/60">
        {items.map((item) => {
          const customizationLabel = formatCustomizations(item.customizations)
          const lineTotal = formatCurrency(item.price * item.quantity)
          return (
            <div key={`${item.productId}-${item.variantId}-${item.name}`} className="flex items-start justify-between gap-4 px-3 py-2">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  Qty {item.quantity} · {formatCurrency(item.price)}
                </p>
                {customizationLabel && <p className="text-xs text-muted-foreground">{customizationLabel}</p>}
              </div>
              <p className="text-sm font-semibold text-foreground">{lineTotal}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AmountRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{formatCurrency(value)}</span>
    </div>
  )
}

function formatOrderDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function formatAddress(delivery: Order["delivery"]) {
  return [delivery.unit, delivery.lot, delivery.street, delivery.city, delivery.region, delivery.zipCode, delivery.country]
    .filter((segment) => typeof segment === "string" && segment.trim().length > 0)
    .join(", ")
}

function formatPickupDetails(pickup?: Order["pickup"] | null) {
  if (!pickup) {
    return "Pickup details will be shared separately."
  }
  const scheduled =
    pickup.scheduledDate && pickup.scheduledTime
      ? `Scheduled for ${pickup.scheduledDate} at ${pickup.scheduledTime}`
      : null
  const address = [pickup.locationName, pickup.unit, pickup.lot, pickup.street, pickup.city, pickup.region, pickup.zipCode]
    .filter((segment) => typeof segment === "string" && segment.trim().length > 0)
    .join(", ")

  return [address, scheduled, pickup.notes].filter(Boolean).join(" • ")
}

function formatCustomizations(customizations: Record<string, string>) {
  return Object.entries(customizations ?? {})
    .filter(([, value]) => typeof value === "string" && value.trim().length > 0)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" • ")
}
