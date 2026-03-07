"use client"

import { use, useEffect, useMemo, useRef, useState } from "react"
import type { ChangeEvent } from "react"
import { useStore } from "@/lib/store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  cn,
  formatCurrency,
} from "@/lib/utils"
import {
  ArrowLeft,
  Copy,
  Download,
  User,
  MapPin,
  CreditCard,
  Package,
  Upload,
  Trash2,
  ImageOff,
  RefreshCcw,
  ExternalLink,
  Loader2,
  Check,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Order, OrderStatus } from "@/lib/types"

const RECEIPT_READY_STATUSES = new Set<OrderStatus>(["Confirmed", "For Delivery", "Out for Delivery", "Completed"])

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { orders, updateOrderStatus, updateOrderProof, updateOrderTracking, isLoadingOrders } = useStore()
  const order = orders.find((o) => o.id === id)
  const [isUpdatingProof, setIsUpdatingProof] = useState(false)
  const [trackingValue, setTrackingValue] = useState(order?.trackingId ?? "")
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState("")
  const [isCopyingReceiptLink, setIsCopyingReceiptLink] = useState(false)
  const [linkCopyFeedback, setLinkCopyFeedback] = useState<"idle" | "success" | "error">("idle")
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const currentTrackingId = order?.trackingId ?? ""

  useEffect(() => {
    setTrackingValue(currentTrackingId)
  }, [currentTrackingId])

  useEffect(() => {
    if (!order) return
    const basePath = `/receipt/${order.id}`
    if (typeof window === "undefined") {
      setReceiptUrl(basePath)
      return
    }
    setReceiptUrl(`${window.location.origin}${basePath}`)
  }, [order?.id])

  const fallbackReceiptUrl = order ? `/receipt/${order?.id}` : ""
  const resolvedReceiptUrl = receiptUrl && receiptUrl.length > 0 ? receiptUrl : fallbackReceiptUrl
  const isReceiptEligible = Boolean(order && RECEIPT_READY_STATUSES.has(order.status))

  if (!order) {
    if (isLoadingOrders) {
      return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="ord-page-header">
            <div>
              <h1 className="ord-page-title">Order Details</h1>
              <p className="ord-page-subtitle">Loading order…</p>
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="ord-page-skeleton" />
            ))}
          </div>
        </div>
      )
    }
    notFound()
    return null
  }

  const isPickupOrder = order.fulfillmentMethod === "pickup"
  const pickupDetails = order.pickup ?? {
    locationName: order.delivery.street,
    unit: order.delivery.unit ?? "",
    lot: order.delivery.lot ?? "",
    street: order.delivery.street,
    city: order.delivery.city,
    region: order.delivery.region,
    zipCode: order.delivery.zipCode,
    country: order.delivery.country,
    notes: null,
    scheduledDate: null,
    scheduledTime: null,
  }
  const pickupSlotLabel =
    pickupDetails.scheduledDate && pickupDetails.scheduledTime
      ? `${pickupDetails.scheduledDate} | ${pickupDetails.scheduledTime}`
      : pickupDetails.scheduledDate ?? "To be scheduled"

  const handleProofFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const confirmed = window.confirm("Replace the current proof of payment with the selected file?")
    if (!confirmed) {
      event.target.value = ""
      return
    }

    setIsUpdatingProof(true)

    try {
      const uploadData = new FormData()
      uploadData.append("file", file)
      uploadData.append("prefix", `admin-proof-${order.id}`)

      const uploadResponse = await fetch("/api/uploads/payments", {
        method: "POST",
        body: uploadData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Upload failed")
      }

      const uploadPayload = await uploadResponse.json()
      await updateOrderProof(order.id, uploadPayload.url ?? null)
    } catch (error) {
      console.error("Failed to update proof of payment", error)
      alert("Failed to update proof of payment. Please try again.")
    } finally {
      setIsUpdatingProof(false)
      event.target.value = ""
    }
  }

  const handleRemoveProof = async () => {
    const confirmed = window.confirm("Remove the proof of payment for this order?")
    if (!confirmed) {
      return
    }

    setIsUpdatingProof(true)
    try {
      await updateOrderProof(order.id, null)
    } catch (error) {
      console.error("Failed to remove proof of payment", error)
      alert("Failed to remove proof of payment. Please try again.")
    } finally {
      setIsUpdatingProof(false)
    }
  }

  const handleUpdateTracking = async () => {
    if (!order) return
    setIsUpdatingTracking(true)
    try {
      const nextValue = trackingValue.trim()
      await updateOrderTracking(order.id, nextValue.length > 0 ? nextValue : null)
    } catch (error) {
      console.error("Failed to update tracking ID", error)
      alert("Failed to update tracking ID. Please try again.")
    } finally {
      setIsUpdatingTracking(false)
    }
  }


  const handleCopyReceiptLink = async () => {
    if (!resolvedReceiptUrl) {
      return
    }

    try {
      setIsCopyingReceiptLink(true)
      await copyTextToClipboard(resolvedReceiptUrl)
      setLinkCopyFeedback("success")
    } catch (error) {
      console.error("Failed to copy e-receipt link", error)
      setLinkCopyFeedback("error")
    } finally {
      setIsCopyingReceiptLink(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <div className="ord-page-header">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders">
            <button type="button" className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-background text-foreground transition hover:bg-foreground hover:text-background">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="ord-page-title">Order Details</h1>
            <p className="ord-page-subtitle">Order {order.id}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* ══════════════ Main column ══════════════ */}
        <div className="lg:col-span-2 space-y-5">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* ─── Order Status ─── */}
            <div className="p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Order Status</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className={cn(
                      "inbox-rp-badge",
                      isPickupOrder ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                    )}>
                      {order.fulfillmentMethod}
                    </span>
                    <span className={cn(
                      "inbox-rp-badge",
                      order.status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <Select
                  value={order.status}
                  onValueChange={async (value) => {
                    const nextStatus = value as OrderStatus
                    const confirmed = window.confirm(`Change order ${order.id} status from ${order.status} to ${nextStatus}?`)
                    if (!confirmed) return
                    try {
                      await updateOrderStatus(order.id, nextStatus)
                    } catch (error) {
                      console.error("Failed to update order status", error)
                      alert("Failed to update order status. Please try again.")
                    }
                  }}
                >
                  <SelectTrigger className="h-9 w-[180px] rounded-lg border-slate-200 bg-slate-50/50 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="For Evaluation">For Evaluation</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="For Delivery">For Delivery</SelectItem>
                    <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="For Refund">For Refund</SelectItem>
                    <SelectItem value="Refunded">Refunded</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-[11px] text-slate-400">
                Created on {new Date(order.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>

            <div className="border-t border-slate-100" />

            {/* ─── Order Items ─── */}
            <div className="p-4">
              <div className="mb-4 flex items-center gap-2">
                <Package className="size-4 text-slate-400" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Order Items</p>
              </div>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={`${order.id}-item-${index}`}>
                    <div className="flex gap-4">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                            {Object.keys(item.customizations).length > 0 && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                {Object.entries(item.customizations).map(([key, value]) => `${key}: ${value}`).join(" · ")}
                              </p>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-slate-900 tabular-nums">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-slate-400">Qty: {item.quantity}</span>
                        </div>
                        {item.preorderDownPayment && (
                          <div className="mt-2 rounded-md bg-amber-50/50 px-2 py-1">
                            <p className="text-[10px] font-medium text-amber-600">
                              Pre-order DP: {formatCurrency(item.preorderDownPayment.perUnitAmount)} each · {formatCurrency(item.preorderDownPayment.totalAmount)} total
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="mt-6 space-y-2 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>VAT (12%)</span>
                  <span className="font-medium text-slate-900">{formatCurrency(order.vat)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{isPickupOrder ? "Handling Fee" : "Shipping Fee"}</span>
                  <span className="font-medium text-slate-900">{formatCurrency(order.shippingFee)}</span>
                </div>
                <div className="mt-4 flex justify-between pt-4 border-t border-slate-200">
                  <span className="text-base font-bold text-slate-900">Total</span>
                  <span className="text-xl font-bold text-slate-900">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* ─── Proof of Payment ─── */}
            <div className="p-4">
              <div className="mb-4 flex items-center gap-2">
                <CreditCard className="size-4 text-slate-400" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Proof of Payment</p>
              </div>
              <div className="space-y-4">
                {order.proofOfPayment ? (
                  <div className="relative aspect-auto min-h-[600px] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                    <Image src={order.proofOfPayment || "/placeholder.svg"} alt="Proof of Payment" fill className="object-contain" />
                  </div>
                ) : (
                  <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
                    <ImageOff className="size-8 mb-2" />
                    <p className="text-xs">No proof of payment uploaded</p>
                  </div>
                )}

                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProofFileChange} />

                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" className="flex-1 rounded-full border-slate-200 hover:bg-slate-50 gap-2" onClick={() => fileInputRef.current?.click()} disabled={isUpdatingProof}>
                    <Upload className="size-3.5" />
                    {order.proofOfPayment ? "Replace Proof" : "Upload Proof"}
                  </Button>
                  {order.proofOfPayment && (
                    <Button type="button" variant="ghost" size="sm" className="px-4 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full gap-2" onClick={handleRemoveProof} disabled={isUpdatingProof}>
                      <Trash2 className="size-3.5" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════ Sidebar ══════════════ */}
        <div className="space-y-5">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* ─── Tracking ─── */}
            <div className="p-4">
              <div className="mb-4 flex items-center gap-2">
                <Package className="size-4 text-slate-400" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tracking</p>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={trackingValue}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTrackingValue(event.target.value)}
                    placeholder="Enter tracking ID"
                    className="h-9 flex-1 rounded-lg border-slate-200 bg-slate-50/50 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setTrackingValue(currentTrackingId)}
                    disabled={isUpdatingTracking || trackingValue === currentTrackingId}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <RefreshCcw className="size-3.5" />
                    <span className="sr-only">Reset</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" className="flex-1 rounded-full bg-slate-900 text-white hover:bg-slate-800" onClick={handleUpdateTracking} disabled={isUpdatingTracking || trackingValue.trim() === currentTrackingId}>
                    {isUpdatingTracking ? "Saving…" : "Save tracking"}
                  </Button>
                  {order.trackingId && (
                    <Button type="button" size="sm" variant="outline" className="rounded-full border-slate-200" onClick={() => setTrackingValue("")} disabled={isUpdatingTracking}>
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* ─── E-Receipt ─── */}
            <div className="p-4">
              <div className="mb-4 flex items-center gap-2">
                <Download className="size-4 text-slate-400" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">E-Receipt</p>
              </div>
              <div className="flex gap-2">
                <Button
                  asChild
                  className="flex-1 rounded-full bg-slate-900 text-white hover:bg-slate-800 h-9 text-xs font-bold uppercase tracking-wider"
                  disabled={!resolvedReceiptUrl}
                >
                  <a href={resolvedReceiptUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 size-3.5" />
                    Go to Receipt
                  </a>
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="size-9 shrink-0 rounded-full border-slate-200 hover:bg-slate-50"
                  onClick={handleCopyReceiptLink}
                  disabled={isCopyingReceiptLink || !resolvedReceiptUrl}
                  title="Copy receipt link"
                >
                  {isCopyingReceiptLink ? (
                    <Loader2 className="size-4 animate-spin text-slate-400" />
                  ) : linkCopyFeedback === "success" ? (
                    <Check className="size-4 text-emerald-600" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
              {!isReceiptEligible && (
                <p className="text-[10px] text-slate-400 mt-2">
                  Receipt available once order is Confirmed or later.
                </p>
              )}
            </div>

            <div className="border-t border-slate-100" />

            {/* ─── Customer ─── */}
            <div className="p-4">
              <div className="mb-4 flex items-center gap-2">
                <User className="size-4 text-slate-400" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Customer</p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Name</p>
                  <p className="text-sm font-semibold text-slate-900">{order.customer.firstName} {order.customer.lastName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Email</p>
                  <p className="text-sm font-semibold text-slate-900 break-all">{order.customer.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Phone</p>
                  <p className="text-sm font-semibold text-slate-900">{order.customer.phone}</p>
                </div>
                {order.customer.instagramHandle && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Instagram</p>
                    <p className="text-[11px] font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded-md inline-block">
                      @{order.customer.instagramHandle.replace(/^@/, '')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* ─── Address / Pickup ─── */}
            <div className="p-4">
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="size-4 text-slate-400" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {isPickupOrder ? "Pickup details" : "Delivery address"}
                </p>
              </div>
              <div className="text-sm text-slate-600 leading-relaxed">
                {isPickupOrder ? (
                  <div className="space-y-1">
                    <address className="not-italic">
                      {pickupDetails.unit && <p>{pickupDetails.unit}</p>}
                      {pickupDetails.lot && <p>{pickupDetails.lot}</p>}
                      <p>{pickupDetails.street}</p>
                      <p>{pickupDetails.city}, {pickupDetails.region} {pickupDetails.zipCode}</p>
                      <p>{pickupDetails.country}</p>
                    </address>
                    <div className="mt-3 space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Schedule</p>
                      <p className="text-xs font-semibold text-slate-900">{pickupSlotLabel}</p>
                      {pickupDetails.notes && (
                        <div className="mt-2 text-[11px] text-slate-400 italic bg-slate-50 p-2 rounded-lg">
                          "{pickupDetails.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <address className="space-y-1 not-italic">
                    {order.delivery.unit && <p className="font-semibold text-slate-900">{order.delivery.unit}</p>}
                    {order.delivery.lot && <p>{order.delivery.lot}</p>}
                    <p>{order.delivery.street}</p>
                    <p>{order.delivery.city}, {order.delivery.region} {order.delivery.zipCode}</p>
                    <p className="text-xs text-slate-400">{order.delivery.country}</p>
                  </address>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* ─── Payment Method ─── */}
            <div className="p-4">
              <div className="mb-4 flex items-center gap-2">
                <CreditCard className="size-4 text-slate-400" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payment method</p>
              </div>
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span className="size-2 rounded-full bg-slate-900" />
                {order.paymentMethod}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textArea = document.createElement("textarea")
  textArea.value = text
  textArea.style.position = "fixed"
  textArea.style.top = "-9999px"
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  document.execCommand("copy")
  document.body.removeChild(textArea)
}


function formatDeliveryAddress(order: Order) {
  const parts = [
    order.delivery.unit,
    order.delivery.lot,
    order.delivery.street,
    `${order.delivery.city}, ${order.delivery.region} ${order.delivery.zipCode}`,
    order.delivery.country,
  ]

  return parts.filter((part) => typeof part === "string" && part.trim().length > 0).join(", ")
}

function formatPickupSummary(order: Order) {
  const pickup = order.pickup
  if (!pickup) {
    return ""
  }

  const parts = [
    pickup.locationName,
    pickup.unit,
    pickup.lot,
    pickup.street,
    `${pickup.city}, ${pickup.region} ${pickup.zipCode}`,
    pickup.country,
    pickup.notes,
    pickup.scheduledDate && pickup.scheduledTime ? `${pickup.scheduledDate} ${pickup.scheduledTime}` : pickup.scheduledDate,
  ]

  return parts.filter((part) => typeof part === "string" && part.trim().length > 0).join(", ")
}
