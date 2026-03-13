export const runtime = "edge"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb } from "@/lib/db"
import { orders as ordersSchema, projects as projectsSchema, storefrontSettings as storefrontSettingsSchema } from "@/lib/db/schema"
import { getTenantIdFromHeaders } from "@/lib/db/tenant"
import { eq, and } from "drizzle-orm"
import type { Order } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { headers } from "next/headers"
import DownloadReceiptButton from "./download-receipt-button"
import { CreditCard, Package, User, MapPin, Receipt, CheckCircle2 } from "lucide-react"

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { env } = getRequestContext()
  const d1 = env.DB
  if (!d1) {
    notFound()
  }

  const db = getDb(d1)
  const headerList = await headers()
  const tenantId = await getTenantIdFromHeaders(headerList, d1)

  if (!tenantId) {
    notFound()
  }

  // Fetch the order and join with project settings
  const orderRecord = await db.query.orders.findFirst({
    where: and(
      eq(ordersSchema.id, id),
      eq(ordersSchema.projectId, tenantId)
    ),
  })

  if (!orderRecord) {
    notFound()
  }

  // Fetch project name
  const project = await db.query.projects.findFirst({
    where: eq(projectsSchema.id, tenantId)
  })

  const businessName = project?.name || "CHIRP"

  const order: Order = {
    ...orderRecord,
    date: orderRecord.createdAt?.toISOString() || new Date().toISOString(),
    customer: {
      firstName: orderRecord.customerFirstName || "",
      lastName: orderRecord.customerLastName || "",
      email: orderRecord.customerEmail || "",
      phone: orderRecord.customerPhone || "",
      instagramHandle: orderRecord.instagramHandle,
    },
    delivery: {
      unit: orderRecord.deliveryUnit || "",
      lot: orderRecord.deliveryLot || "",
      street: orderRecord.deliveryStreet || "",
      city: orderRecord.deliveryCity || "",
      region: orderRecord.deliveryRegion || "",
      zipCode: orderRecord.deliveryZipCode || "",
      country: orderRecord.deliveryCountry || "",
    },
    items: JSON.parse(orderRecord.orderItems as string),
    status: orderRecord.status as any,
    fulfillmentMethod: orderRecord.fulfillmentMethod as any,
    total: orderRecord.total || 0,
    subtotal: orderRecord.subtotal || 0,
    vat: (orderRecord.total || 0) * 0.12 / 1.12, // Approximation
    shippingFee: orderRecord.shippingFee || 0,
    paymentMethod: orderRecord.paymentMethod as any,
    updatedAt: orderRecord.updatedAt?.toISOString() || undefined,
  } as any
  const isPickup = order.fulfillmentMethod === "pickup"
  const orderDate = new Date(order.date)
  const formattedDate = orderDate.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const formattedTime = orderDate.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const deliveryLines = isPickup
    ? buildPickupLines(order)
    : [
      order.delivery.unit,
      order.delivery.lot,
      order.delivery.street,
      `${order.delivery.city}, ${order.delivery.region} ${order.delivery.zipCode}`,
      order.delivery.country,
    ].filter((line) => Boolean(line && line.trim()))

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 font-sans">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        {/* Receipt Container */}
        <section
          id="receipt-view"
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50"
        >
          {/* Header Section */}
          <header className="relative bg-slate-900 px-8 py-10 text-center text-white">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-700 via-slate-400 to-slate-700 opacity-30" />
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">{businessName}</p>
            <h1 className="text-2xl font-black uppercase tracking-[0.2em]">Official E-Receipt</h1>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
              <Receipt className="size-3.5" />
              Order #{order.id}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Badge variant="outline" className="rounded-full border-white/20 bg-white/5 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors">
                {order.fulfillmentMethod}
              </Badge>
              <div className="flex items-center gap-1.5 rounded-full border-white/20 bg-white/5 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                <CheckCircle2 className="size-3 text-emerald-400" />
                {order.status}
              </div>
            </div>
          </header>

          <div className="divide-y divide-slate-100">
            {/* Order Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 italic font-medium lowercase tracking-normal">Placed on</span>
                <span className="text-slate-700 font-mono">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 italic font-medium lowercase tracking-normal">at</span>
                <span className="text-slate-700 font-mono">{formattedTime}</span>
              </div>
            </div>

            {/* Customer & Delivery Sections */}
            <div className="grid gap-0 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="p-8">
                <div className="mb-4 flex items-center gap-2">
                  <User className="size-3.5 text-slate-400" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Billed To</p>
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-slate-900 leading-tight">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p className="text-sm font-medium text-slate-500">{order.customer.email}</p>
                  <p className="text-sm font-medium text-slate-500">{order.customer.phone}</p>
                  {order.customer.instagramHandle && (
                    <div className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                      @{order.customer.instagramHandle.replace(/^@/, '')}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="size-3.5 text-slate-400" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {isPickup ? "Pickup Details" : "Delivery Address"}
                  </p>
                </div>
                <div className="space-y-1">
                  {deliveryLines.map((line, index) => (
                    <p key={`${line}-${index}`} className="text-sm font-medium text-slate-600 leading-relaxed tabular-nums">
                      {line}
                    </p>
                  ))}
                  {isPickup && order.pickup?.scheduledDate && (
                    <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pick-up Schedule</p>
                      <p className="text-sm font-bold text-slate-900">
                        {order.pickup.scheduledDate}
                        {order.pickup.scheduledTime ? ` · ${order.pickup.scheduledTime}` : ""}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="px-8 py-10">
              <div className="mb-6 flex items-center gap-2">
                <Package className="size-3.5 text-slate-400" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order Summary</p>
              </div>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={`${item.productId}-${item.variantId}-${index}`}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-slate-50 bg-slate-50/30 p-4 transition-colors hover:bg-slate-50/60"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="text-sm font-bold uppercase tracking-wide text-slate-900">{item.name}</p>
                        <p className="text-sm font-bold text-slate-900 tabular-nums">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-slate-500">
                        <span className="text-slate-400 font-bold uppercase tracking-wider">Qty: {item.quantity}</span>
                        {Object.entries(item.customizations).map(([key, value]) => (
                          <span key={key} className="flex items-center gap-1">
                            <span className="text-slate-300">/</span> {key}: {value}
                          </span>
                        ))}
                      </div>
                      {item.preorderDownPayment && (
                        <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">
                          <span className="size-1.5 rounded-full bg-amber-400" />
                          DP: {formatCurrency(item.preorderDownPayment.totalAmount)} total
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Section */}
            <div className="grid gap-0 md:grid-cols-2 bg-slate-50/50">
              <div className="p-8 space-y-6">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <CreditCard className="size-3.5 text-slate-400" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Payment</p>
                  </div>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <span className="size-2 rounded-full bg-slate-900" />
                    {order.paymentMethod}
                  </p>
                </div>

                {order.trackingId && (
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Package className="size-3.5 text-slate-400" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tracking ID</p>
                    </div>
                    <p className="inline-block rounded-lg border border-slate-200 bg-white px-3 py-1 font-mono text-xs font-bold text-slate-900 shadow-sm">
                      {order.trackingId}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-8 space-y-3 bg-slate-900 text-white">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white tabular-nums">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>VAT (12%)</span>
                  <span className="text-white tabular-nums">{formatCurrency(order.vat)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 pb-4">
                  <span>{isPickup ? "Handling" : "Shipping"}</span>
                  <span className="text-white tabular-nums">{formatCurrency(order.shippingFee)}</span>
                </div>
                <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                  <span className="text-sm font-black uppercase tracking-[0.2em]">Total Paid</span>
                  <span className="text-2xl font-black tracking-tight tabular-nums">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <footer className="bg-slate-50/80 px-8 py-10 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 leading-relaxed max-w-sm mx-auto">
              This e-receipt serves as an official record of your purchase from {businessName}. Verified secure electronic document.
            </p>
          </footer>
        </section>

        <div className="flex justify-center pb-12">
          <DownloadReceiptButton receiptId={order.id} containerId="receipt-view" />
        </div>
      </div>
    </main>
  )
}

function buildPickupLines(order: Order) {
  const pickup = order.pickup
  if (!pickup) return []

  return [
    pickup.locationName,
    pickup.unit,
    pickup.lot,
    pickup.street,
    `${pickup.city}, ${pickup.region} ${pickup.zipCode}`,
    pickup.country,
    pickup.notes,
  ].filter((line) => Boolean(line && line.trim()))
}
