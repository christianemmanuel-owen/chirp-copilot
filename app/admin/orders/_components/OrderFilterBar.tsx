"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Search, X, Filter } from "lucide-react"
import type { Order } from "@/lib/types"

const STATUS_OPTIONS = [
    "For Evaluation",
    "Confirmed",
    "Out for Delivery",
    "Completed",
    "For Refund",
    "Refunded",
    "Cancelled",
] as const

const FULFILLMENT_OPTIONS = ["delivery", "pickup"] as const

function statusBadgeClass(status: string): string {
    switch (status) {
        case "For Evaluation": return "ord-badge-evaluation"
        case "Confirmed": return "ord-badge-confirmed"
        case "Out for Delivery": return "ord-badge-out-for-delivery"
        case "For Refund": return "ord-badge-for-refund"
        case "Refunded": return "ord-badge-refunded"
        case "Completed": return "ord-badge-completed"
        case "Cancelled": return "ord-badge-cancelled"
        default: return ""
    }
}

interface OrderFilterBarProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    statusFilter: string
    onStatusFilterChange: (value: string) => void
    paymentFilter: string
    onPaymentFilterChange: (value: string) => void
    fulfillmentFilter: string
    onFulfillmentFilterChange: (value: string) => void
    orders: Order[]
}

/* ── Generic dropdown hook ── */
function useDropdown() {
    const [open, setOpen] = useState(false)
    const triggerRef = useRef<HTMLDivElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            if (
                panelRef.current && !panelRef.current.contains(e.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(e.target as Node)
            ) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [open])

    return { open, setOpen, triggerRef, panelRef }
}

export function OrderFilterBar({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    paymentFilter,
    onPaymentFilterChange,
    fulfillmentFilter,
    onFulfillmentFilterChange,
    orders,
}: OrderFilterBarProps) {
    const status = useDropdown()
    const payment = useDropdown()
    const fulfillment = useDropdown()

    // Derive unique payment methods from actual order data
    const paymentMethods = useMemo(() => {
        const methods = new Set<string>()
        orders?.forEach((o) => {
            if (o.paymentMethod) methods.add(o.paymentMethod)
        })
        return Array.from(methods).sort((a, b) => a.localeCompare(b))
    }, [orders])

    const hasAnyFilter = statusFilter !== "all" || paymentFilter !== "all" || fulfillmentFilter !== "all"

    return (
        <div className="ord-filter-bar mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search */}
                <div className="ord-search-box relative flex flex-1 items-center rounded-xl">
                    <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Customer Name…"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="ord-search-input h-10 w-full rounded-xl pl-10 pr-9 text-sm font-medium bg-transparent outline-none placeholder:text-muted-foreground/60"
                    />
                    {searchTerm.length > 0 && (
                        <button
                            type="button"
                            onClick={() => onSearchChange("")}
                            className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition hover:text-foreground hover:bg-muted"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Status filter */}
                    <div className="relative" ref={status.triggerRef}>
                        <button
                            type="button"
                            onClick={() => status.setOpen((p) => !p)}
                            className={`ord-chip flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all duration-150 whitespace-nowrap ${statusFilter !== "all" ? "ord-chip-active" : "ord-chip-idle"
                                }`}
                        >
                            <Filter className="h-3.5 w-3.5" />
                            <span>{statusFilter === "all" ? "Status" : statusFilter}</span>
                        </button>
                        {status.open && (
                            <div
                                ref={status.panelRef}
                                className="absolute top-full right-0 z-50 mt-2 min-w-[220px] rounded-xl border border-border bg-card p-2 shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150"
                            >
                                <p className="mb-1.5 px-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                                    Filter by status
                                </p>
                                <button
                                    type="button"
                                    onClick={() => { onStatusFilterChange("all"); status.setOpen(false) }}
                                    className={`flex w-full items-center rounded-lg px-2.5 py-2 text-left text-sm font-medium transition hover:bg-muted ${statusFilter === "all" ? "bg-muted/60 text-foreground" : "text-muted-foreground"
                                        }`}
                                >
                                    All Statuses
                                </button>
                                {STATUS_OPTIONS.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => { onStatusFilterChange(s); status.setOpen(false) }}
                                        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition hover:bg-muted ${statusFilter === s ? "bg-muted/60 text-foreground" : "text-muted-foreground"
                                            }`}
                                    >
                                        <span className={`ord-badge ${statusBadgeClass(s)}`}>{s}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Payment filter */}
                    <div className="relative" ref={payment.triggerRef}>
                        <button
                            type="button"
                            onClick={() => payment.setOpen((p) => !p)}
                            className={`ord-chip flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all duration-150 whitespace-nowrap ${paymentFilter !== "all" ? "ord-chip-active" : "ord-chip-idle"
                                }`}
                        >
                            <Filter className="h-3.5 w-3.5" />
                            <span>{paymentFilter === "all" ? "Payment" : paymentFilter}</span>
                        </button>
                        {payment.open && (
                            <div
                                ref={payment.panelRef}
                                className="absolute top-full right-0 z-50 mt-2 min-w-[180px] rounded-xl border border-border bg-card p-2 shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150"
                            >
                                <p className="mb-1.5 px-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                                    Filter by payment
                                </p>
                                <button
                                    type="button"
                                    onClick={() => { onPaymentFilterChange("all"); payment.setOpen(false) }}
                                    className={`flex w-full items-center rounded-lg px-2.5 py-2 text-left text-sm font-medium transition hover:bg-muted ${paymentFilter === "all" ? "bg-muted/60 text-foreground" : "text-muted-foreground"
                                        }`}
                                >
                                    All Payments
                                </button>
                                {paymentMethods.map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => { onPaymentFilterChange(m); payment.setOpen(false) }}
                                        className={`flex w-full items-center rounded-lg px-2.5 py-2 text-left text-sm font-medium capitalize transition hover:bg-muted ${paymentFilter === m ? "bg-muted/60 text-foreground" : "text-muted-foreground"
                                            }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Fulfillment filter */}
                    <div className="relative" ref={fulfillment.triggerRef}>
                        <button
                            type="button"
                            onClick={() => fulfillment.setOpen((p) => !p)}
                            className={`ord-chip flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all duration-150 whitespace-nowrap ${fulfillmentFilter !== "all" ? "ord-chip-active" : "ord-chip-idle"
                                }`}
                        >
                            <Filter className="h-3.5 w-3.5" />
                            <span>{fulfillmentFilter === "all" ? "Fulfillment" : fulfillmentFilter}</span>
                        </button>
                        {fulfillment.open && (
                            <div
                                ref={fulfillment.panelRef}
                                className="absolute top-full right-0 z-50 mt-2 min-w-[180px] rounded-xl border border-border bg-card p-2 shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150"
                            >
                                <p className="mb-1.5 px-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                                    Filter by fulfillment
                                </p>
                                <button
                                    type="button"
                                    onClick={() => { onFulfillmentFilterChange("all"); fulfillment.setOpen(false) }}
                                    className={`flex w-full items-center rounded-lg px-2.5 py-2 text-left text-sm font-medium transition hover:bg-muted ${fulfillmentFilter === "all" ? "bg-muted/60 text-foreground" : "text-muted-foreground"
                                        }`}
                                >
                                    All
                                </button>
                                {FULFILLMENT_OPTIONS.map((f) => (
                                    <button
                                        key={f}
                                        type="button"
                                        onClick={() => { onFulfillmentFilterChange(f); fulfillment.setOpen(false) }}
                                        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition hover:bg-muted ${fulfillmentFilter === f ? "bg-muted/60 text-foreground" : "text-muted-foreground"
                                            }`}
                                    >
                                        <span className={`ord-badge ${f === "pickup" ? "ord-badge-pickup" : "ord-badge-delivery"}`}>
                                            {f}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Clear all filters */}
                    {hasAnyFilter && (
                        <button
                            type="button"
                            onClick={() => {
                                onStatusFilterChange("all")
                                onPaymentFilterChange("all")
                                onFulfillmentFilterChange("all")
                            }}
                            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-destructive transition hover:bg-destructive/10"
                        >
                            <X className="h-3 w-3" />
                            Clear
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
