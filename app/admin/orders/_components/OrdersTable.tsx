"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, ShoppingBag, ArrowUp, ArrowDown } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import type { Order, OrderStatus } from "@/lib/types"

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

export type SortColumn = "order" | "date" | "customer" | "items" | "total" | null
export type SortDirection = "asc" | "desc"

function statusBadgeClass(status: string): string {
    switch (status) {
        case "For Evaluation": return "ord-badge-evaluation"
        case "Confirmed": return "ord-badge-confirmed"
        case "For Delivery": return "ord-badge-for-delivery"
        case "Out for Delivery": return "ord-badge-out-for-delivery"
        case "For Refund": return "ord-badge-for-refund"
        case "Refunded": return "ord-badge-refunded"
        case "Completed": return "ord-badge-completed"
        case "Cancelled": return "ord-badge-cancelled"
        default: return ""
    }
}

interface OrdersTableProps {
    orders: Order[]
    highlightId: string | null
    onStatusChange: (orderId: string, currentStatus: string, nextStatus: OrderStatus, trackingId?: string) => void
    pageSize: number
    onPageSizeChange: (size: number) => void
    page: number
    onPageChange: (page: number) => void
    totalFiltered: number
    sortColumn: SortColumn
    sortDirection: SortDirection
    onSortChange: (column: SortColumn, direction: SortDirection | null) => void
}

function SortableHeader({
    label,
    column,
    activeColumn,
    activeDirection,
    onSort,
    align = "left",
}: {
    label: string
    column: SortColumn
    activeColumn: SortColumn
    activeDirection: SortDirection
    onSort: (column: SortColumn, direction: SortDirection | null) => void
    align?: "left" | "right" | "center"
}) {
    const isActive = activeColumn === column
    const alignClass = align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"

    const handleClick = () => {
        if (!isActive) {
            // First click: asc for text columns, desc for numeric/date
            const defaultDir = column === "date" || column === "total" || column === "items" ? "desc" : "asc"
            onSort(column, defaultDir)
        } else if (
            (activeDirection === "asc" && (column === "date" || column === "total" || column === "items")) ||
            (activeDirection === "desc" && column !== "date" && column !== "total" && column !== "items")
        ) {
            // Second click: flip direction
            onSort(column, activeDirection === "asc" ? "desc" : "asc")
        } else if (
            (activeDirection === "desc" && (column === "date" || column === "total" || column === "items")) ||
            (activeDirection === "asc" && column !== "date" && column !== "total" && column !== "items")
        ) {
            // Second click: flip direction
            onSort(column, activeDirection === "asc" ? "desc" : "asc")
        } else {
            // Third click: remove sort
            onSort(null, null)
        }
    }

    // Simpler 3-state cycle: click1 = default, click2 = opposite, click3 = none
    const handleClickSimple = () => {
        if (!isActive) {
            // First click: high-to-low for numbers/dates, A-Z for text
            const defaultDir: SortDirection = (column === "date" || column === "total" || column === "items") ? "desc" : "asc"
            onSort(column, defaultDir)
        } else if (activeDirection === "asc") {
            // Second click if asc: flip to desc
            onSort(column, "desc")
        } else if (activeDirection === "desc") {
            // If we started with desc (numbers), next is asc; if we started with asc (text) and are now desc, next is clear
            // Simplify: asc was second click for numbers → third click clears
            // desc was second click for text → third click clears
            // But since we already flipped once, the third state is always "none"
            // Actually let's just do: first click = default, second click = flip, third click = clear
            onSort(column, "asc")
        } else {
            onSort(null, null)
        }
    }

    // Even simpler: 3 cycles: none → default → opposite → none
    const handleCycle = () => {
        if (!isActive) {
            // Not sorted by this column: activate with default direction
            const defaultDir: SortDirection = (column === "date" || column === "total" || column === "items") ? "desc" : "asc"
            onSort(column, defaultDir)
        } else if (
            (activeDirection === "desc" && (column === "date" || column === "total" || column === "items")) ||
            (activeDirection === "asc" && (column === "order" || column === "customer"))
        ) {
            // Currently at default direction → flip
            onSort(column, activeDirection === "asc" ? "desc" : "asc")
        } else {
            // Currently at flipped direction → clear
            onSort(null, null)
        }
    }

    return (
        <th className={`ord-table-th text-${align}`}>
            <button
                type="button"
                onClick={handleCycle}
                className={`inline-flex items-center gap-1 ${alignClass} transition-colors hover:text-foreground ${isActive ? "text-foreground" : ""}`}
            >
                <span>{label}</span>
                {isActive && activeDirection === "asc" && <ArrowUp className="h-3 w-3" />}
                {isActive && activeDirection === "desc" && <ArrowDown className="h-3 w-3" />}
            </button>
        </th>
    )
}

export function OrdersTable({
    orders,
    highlightId,
    onStatusChange,
    pageSize,
    onPageSizeChange,
    page,
    onPageChange,
    totalFiltered,
    sortColumn,
    sortDirection,
    onSortChange,
}: OrdersTableProps) {
    const router = useRouter()
    const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize))
    const safePage = Math.min(Math.max(page, 1), totalPages)
    const showingFrom = totalFiltered === 0 ? 0 : (safePage - 1) * pageSize + 1
    const showingTo = (safePage - 1) * pageSize + orders.length

    if (totalFiltered === 0) {
        return (
            <div className="ord-table-empty space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">No orders found</h2>
                    <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filters.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="ord-table-wrap">
            <div className="overflow-x-auto">
                <table className="ord-table-root">
                    <thead className="ord-table-head">
                        <tr>
                            <SortableHeader label="Order" column="order" activeColumn={sortColumn} activeDirection={sortDirection} onSort={onSortChange} />
                            <SortableHeader label="Date" column="date" activeColumn={sortColumn} activeDirection={sortDirection} onSort={onSortChange} />
                            <SortableHeader label="Customer" column="customer" activeColumn={sortColumn} activeDirection={sortDirection} onSort={onSortChange} />
                            <SortableHeader label="Items" column="items" activeColumn={sortColumn} activeDirection={sortDirection} onSort={onSortChange} align="right" />
                            <SortableHeader label="Total" column="total" activeColumn={sortColumn} activeDirection={sortDirection} onSort={onSortChange} align="right" />
                            <th className="ord-table-th text-left">Payment</th>
                            <th className="ord-table-th text-center">Fulfillment</th>
                            <th className="ord-table-th text-center">Status</th>
                            <th className="ord-table-th w-10" />
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => {
                            const isPickup = order.fulfillmentMethod === "pickup"
                            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

                            return (
                                <tr
                                    key={order.id}
                                    id={`order-${order.id}`}
                                    className={`ord-table-row cursor-pointer transition-colors hover:bg-muted/30 ${highlightId === order.id ? "ord-table-row-highlight" : ""}`}
                                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                                >
                                    {/* Order ID */}
                                    <td>
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="text-[10px] font-bold uppercase tracking-[0.06em] text-foreground hover:underline font-mono"
                                        >
                                            {order.id}
                                        </Link>
                                    </td>

                                    {/* Date */}
                                    <td className="text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(order.date).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </td>

                                    {/* Customer */}
                                    <td className="text-xs font-medium whitespace-nowrap">
                                        {order.customer.firstName} {order.customer.lastName}
                                    </td>

                                    {/* Item count */}
                                    <td className="text-xs text-right font-medium tabular-nums">
                                        {itemCount}
                                    </td>

                                    {/* Total */}
                                    <td className="text-xs text-right font-medium tabular-nums">
                                        {formatCurrency(order.total)}
                                    </td>

                                    {/* Payment Method */}
                                    <td className="text-xs capitalize text-muted-foreground">
                                        {order.paymentMethod}
                                    </td>

                                    {/* Fulfillment */}
                                    <td className="text-center">
                                        <span className={`ord-badge ${isPickup ? "ord-badge-pickup" : "ord-badge-delivery"}`}>
                                            {order.fulfillmentMethod}
                                        </span>
                                    </td>

                                    {/* Status (inline select) */}
                                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                                        <Select
                                            value={order.status}
                                            onValueChange={(value) =>
                                                onStatusChange(order.id, order.status, value as OrderStatus)
                                            }
                                        >
                                            <SelectTrigger
                                                className={`inline-flex h-6 min-w-[9rem] items-center justify-center gap-1 rounded-full border-0 px-2.5 text-[10px] font-bold uppercase tracking-[0.08em] shadow-none ord-badge ${statusBadgeClass(order.status)}`}
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-lg border border-border bg-card shadow-lg">
                                                <SelectItem value="For Evaluation">For Evaluation</SelectItem>
                                                <SelectItem value="Confirmed">Confirmed</SelectItem>
                                                <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                                                <SelectItem value="Completed">Completed</SelectItem>
                                                <SelectItem value="For Refund">For Refund</SelectItem>
                                                <SelectItem value="Refunded">Refunded</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </td>

                                    {/* View details */}
                                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                            title="View order details"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                        </Link>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination footer */}
            <div className="ord-table-footer">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                        Showing {showingFrom}–{showingTo} of {totalFiltered} orders
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                            <span>Per page</span>
                            <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
                                <SelectTrigger className="h-7 w-[80px] rounded-lg border border-border bg-[#f5f5f5] px-2 text-[11px] uppercase tracking-[0.1em]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg border border-border bg-card shadow-lg">
                                    {PAGE_SIZE_OPTIONS.map((size) => (
                                        <SelectItem key={size} value={String(size)}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => onPageChange(safePage - 1)}
                                disabled={safePage === 1}
                                className="ord-chip ord-chip-idle rounded-lg px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Prev
                            </button>
                            <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground tabular-nums">
                                {safePage} / {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => onPageChange(safePage + 1)}
                                disabled={safePage === totalPages}
                                className="ord-chip ord-chip-idle rounded-lg px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
