"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
    DragDropContext,
    Droppable,
    Draggable,
    type DropResult,
} from "@hello-pangea/dnd"
import {
    Check,
    X,
    ChevronRight,
    ChevronDown,
    Clock,
    Truck,
    PackageCheck,
    AlertTriangle,
    ShoppingBag,
    ImageOff,
    Eye,
    GripVertical,
    ClipboardPen,
    ArrowUpRight,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Order, OrderStatus } from "@/lib/types"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/* ── Column definitions ── */

interface ColumnDef {
    id: string
    title: string
    statuses: OrderStatus[]
    /** The status to assign when a card is dropped into this column */
    dropStatus: OrderStatus
    icon: React.ReactNode
    accentHue: number
    collapsible: boolean
}

const COLUMNS: ColumnDef[] = [
    { id: "evaluation", title: "Evaluation", statuses: ["For Evaluation"], dropStatus: "For Evaluation", icon: <Clock className="w-3.5 h-3.5" />, accentHue: 85, collapsible: true },
    { id: "confirmed", title: "Confirmed", statuses: ["Confirmed"], dropStatus: "Confirmed", icon: <Check className="w-3.5 h-3.5" />, accentHue: 200, collapsible: true },
    { id: "shipping", title: "Shipping", statuses: ["Out for Delivery"], dropStatus: "Out for Delivery", icon: <Truck className="w-3.5 h-3.5" />, accentHue: 250, collapsible: true },
    { id: "done", title: "Done", statuses: ["Completed"], dropStatus: "Completed", icon: <PackageCheck className="w-3.5 h-3.5" />, accentHue: 145, collapsible: true },
    { id: "for_refund", title: "For Refund", statuses: ["For Refund"], dropStatus: "For Refund", icon: <AlertTriangle className="w-3.5 h-3.5" />, accentHue: 25, collapsible: true },
    { id: "refunded", title: "Refunded", statuses: ["Refunded"], dropStatus: "Refunded", icon: <X className="w-3.5 h-3.5" />, accentHue: 15, collapsible: true },
    { id: "cancelled", title: "Cancelled", statuses: ["Cancelled"], dropStatus: "Cancelled", icon: <X className="w-3.5 h-3.5" />, accentHue: 0, collapsible: true },
]

/* ── Quick-action config ── */

interface QuickAction {
    label: string
    nextStatus: OrderStatus
    variant: "confirm" | "advance" | "complete" | "reject"
}

function getQuickActions(order: Order): QuickAction[] {
    const isPickup = order.fulfillmentMethod === "pickup"
    switch (order.status) {
        case "For Evaluation":
            return [
                { label: "Confirm", nextStatus: "Confirmed", variant: "confirm" },
                { label: "Reject", nextStatus: "Cancelled", variant: "reject" },
            ]
        case "Confirmed":
            return [
                {
                    label: isPickup ? "Ready for Pickup" : "Ready to Ship",
                    nextStatus: "Out for Delivery",
                    variant: "advance"
                }
            ]
        case "Out for Delivery":
            return [{ label: "Mark Completed", nextStatus: "Completed", variant: "complete" }]
        default:
            return []
    }
}

/* ── Status badge helper ── */

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

/* ── Props ── */

interface OrdersKanbanViewProps {
    orders: Order[]
    onStatusChange: (orderId: string, currentStatus: string, nextStatus: OrderStatus, trackingId?: string) => void
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export function OrdersKanbanView({ orders, onStatusChange }: OrdersKanbanViewProps) {
    const router = useRouter()
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
        done: true,
        refund: true,
        cancelled: true
    })

    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean
        order: Order | null
        nextStatus: OrderStatus | null
        trackingId: string
    }>({
        open: false,
        order: null,
        nextStatus: null,
        trackingId: ""
    })

    const [dontAskAgain, setDontAskAgain] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("chirp-kanban-skip-confirm") === "true"
        }
        return false
    })

    const columns = useMemo(() =>
        COLUMNS.map(col => ({
            ...col,
            orders: orders
                .filter(o => col.statuses.includes(o.status))
                .sort((a, b) => {
                    const timeA = new Date(a.updatedAt || a.date).getTime()
                    const timeB = new Date(b.updatedAt || b.date).getTime()
                    return timeB - timeA
                }),
        })),
        [orders])

    const toggleCollapse = (colId: string) => {
        setCollapsed(prev => ({ ...prev, [colId]: !prev[colId] }))
    }

    const triggerStatusChange = (order: Order, nextStatus: OrderStatus) => {
        // Define statuses that typically require a tracking ID for delivery orders
        const shippingStatuses: OrderStatus[] = ["Out for Delivery", "Completed"]
        const needsTracking = shippingStatuses.includes(nextStatus) &&
            order.fulfillmentMethod === "delivery" &&
            !order.trackingId

        if (dontAskAgain && !needsTracking) {
            onStatusChange(order.id, order.status, nextStatus)
            return
        }
        setConfirmDialog({
            open: true,
            order,
            nextStatus,
            trackingId: order.trackingId || ""
        })
    }

    const handleConfirm = () => {
        if (!confirmDialog.order || !confirmDialog.nextStatus) return

        // If it's a "Ready to Ship" (Out for Delivery) move for a delivery order, 
        // we might want to save the tracking ID.
        onStatusChange(confirmDialog.order.id, confirmDialog.order.status, confirmDialog.nextStatus, confirmDialog.trackingId)

        if (dontAskAgain) {
            localStorage.setItem("chirp-kanban-skip-confirm", "true")
        } else {
            localStorage.removeItem("chirp-kanban-skip-confirm")
        }

        setConfirmDialog(prev => ({ ...prev, open: false }))
    }

    const handleDragEnd = (result: DropResult) => {
        const { draggableId, destination } = result
        if (!destination) return

        const targetColumnId = destination.droppableId
        const targetColumn = COLUMNS.find(c => c.id === targetColumnId)
        if (!targetColumn) return

        const order = orders.find(o => o.id === draggableId)
        if (!order) return

        const sourceColumn = COLUMNS.find(c => c.statuses.includes(order.status))
        if (sourceColumn?.id === targetColumnId) return

        triggerStatusChange(order, targetColumn.dropStatus)
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="ord-pipeline-board">
                {columns.map(column => {
                    const isCollapsed = column.collapsible && collapsed[column.id]

                    return (
                        <div
                            key={column.id}
                            className={`ord-pipeline-column ${isCollapsed ? "ord-pipeline-column-collapsed" : "ord-pipeline-column-open"}`}
                        >
                            {/* ── Collapsed state: minimal pill ── */}
                            {isCollapsed ? (
                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`ord-pipeline-pill ${snapshot.isDraggingOver ? "ord-pipeline-pill-active" : ""}`}
                                            onClick={() => toggleCollapse(column.id)}
                                        >
                                            <span
                                                className="ord-pipeline-dot"
                                                style={{ background: `oklch(0.65 0.18 ${column.accentHue})` }}
                                            />
                                            <span className="ord-pipeline-pill-count">{column.orders.length}</span>
                                            <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            ) : (
                                /* ── Expanded state: full column ── */
                                <div className="ord-pipeline-column-wrap">
                                    {/* Header */}
                                    <div
                                        className={`ord-pipeline-column-head ${column.collapsible ? "cursor-pointer" : ""}`}
                                        onClick={column.collapsible ? () => toggleCollapse(column.id) : undefined}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="ord-pipeline-dot"
                                                style={{ background: `oklch(0.65 0.18 ${column.accentHue})` }}
                                            />
                                            <h3 className="ord-pipeline-column-title">{column.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="ord-pipeline-count">{column.orders.length}</span>
                                            {column.collapsible && (
                                                <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Card list */}
                                    <Droppable droppableId={column.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`ord-pipeline-card-list ${snapshot.isDraggingOver ? "ord-pipeline-card-list-active" : ""}`}
                                            >
                                                {column.orders.length === 0 && !snapshot.isDraggingOver ? (
                                                    <div className="ord-pipeline-empty">
                                                        <ShoppingBag className="w-5 h-5 text-muted-foreground/40" />
                                                        <p>No orders</p>
                                                    </div>
                                                ) : (
                                                    column.orders.map((order, index) => (
                                                        <Draggable key={order.id} draggableId={order.id} index={index}>
                                                            {(dragProvided, dragSnapshot) => (
                                                                <div
                                                                    ref={dragProvided.innerRef}
                                                                    {...dragProvided.draggableProps}
                                                                    className={`ord-pipeline-card ${dragSnapshot.isDragging ? "ord-pipeline-card-dragging" : ""}`}
                                                                >
                                                                    <PipelineCard
                                                                        order={order}
                                                                        columnId={column.id}
                                                                        dragHandleProps={dragProvided.dragHandleProps}
                                                                        onStatusChange={triggerStatusChange}
                                                                        onNavigate={() => router.push(`/admin/orders/${order.id}`)}
                                                                    />
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))
                                                )}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
                <AlertDialogContent className="max-w-[400px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <ClipboardPen className="w-5 h-5 text-primary" />
                            Update Order Status
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Change order <strong>#{confirmDialog.order?.id}</strong> from
                            <span className="mx-1 font-medium">{confirmDialog.order?.status}</span> to
                            <span className="ml-1 font-bold text-foreground">{confirmDialog.nextStatus}</span>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* Show tracking input if moving to/past shipping for delivery orders */}
                    {["Out for Delivery", "Completed"].includes(confirmDialog.nextStatus || "") &&
                        confirmDialog.order?.fulfillmentMethod === "delivery" && (
                            <div className="space-y-2 py-2">
                                <Label htmlFor="trackingId" className="text-xs">
                                    {confirmDialog.nextStatus === "Completed" ? "Final Tracking ID" : "Tracking ID (Optional)"}
                                </Label>
                                <Input
                                    id="trackingId"
                                    placeholder="Enter carrier tracking number"
                                    value={confirmDialog.trackingId}
                                    onChange={(e) => setConfirmDialog(prev => ({ ...prev, trackingId: e.target.value }))}
                                    className="h-9 text-sm"
                                />
                            </div>
                        )}

                    <div className="flex items-center space-x-2 py-2">
                        <Checkbox
                            id="dontAskAgain"
                            checked={dontAskAgain}
                            onCheckedChange={(checked) => setDontAskAgain(checked === true)}
                        />
                        <label
                            htmlFor="dontAskAgain"
                            className="text-[11px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                            Don't ask me again for status changes
                        </label>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm} className="bg-primary hover:bg-primary/90">
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DragDropContext>
    )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function PipelineCard({
    order,
    columnId,
    dragHandleProps,
    onStatusChange,
    onNavigate,
}: {
    order: Order
    columnId: string
    dragHandleProps: React.HTMLAttributes<HTMLElement> | null | undefined
    onStatusChange: (order: Order, nextStatus: OrderStatus) => void
    onNavigate: () => void
}) {
    const itemCount = order.items.reduce((s, i) => s + i.quantity, 0)
    const itemSummary = order.items.length <= 2
        ? order.items.map(i => `${i.quantity}× ${i.name}`).join(", ")
        : `${order.items[0].quantity}× ${order.items[0].name} +${order.items.length - 1} more`

    const actions = getQuickActions(order)
    const isPickup = order.fulfillmentMethod === "pickup"
    const showProof = columnId === "evaluation"
    const timeAgo = getRelativeTime(order.updatedAt || order.date)

    const handleAction = (e: React.MouseEvent, nextStatus: OrderStatus) => {
        e.stopPropagation()
        onStatusChange(order, nextStatus)
    }

    return (
        <>
            {/* Top row: drag handle + ID + badges + view */}
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                    <span
                        {...(dragHandleProps ?? {})}
                        className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
                    >
                        <GripVertical className="w-3 h-3" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground font-mono">
                        #{order.id}
                    </span>
                    <span className={`ord-badge ${isPickup ? "ord-badge-pickup" : "ord-badge-delivery"}`}>
                        {order.fulfillmentMethod}
                    </span>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onNavigate() }}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    title="View details"
                >
                    <Eye className="w-3 h-3" />
                </button>
            </div>

            {/* Customer */}
            <div onClick={onNavigate} className="cursor-pointer">
                <p className="text-[0.8125rem] font-semibold text-foreground leading-tight truncate">
                    {order.customer.firstName} {order.customer.lastName}
                </p>
                {order.customer.instagramHandle && (
                    <p className="text-[11px] text-muted-foreground truncate">
                        {order.customer.instagramHandle}
                    </p>
                )}

                {/* Items summary */}
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">
                    {itemCount} item{itemCount !== 1 ? "s" : ""} · {itemSummary}
                </p>

                {/* Total + payment */}
                <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold tabular-nums">{formatCurrency(order.total)}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        {order.paymentMethod}
                    </span>
                </div>
            </div>

            {/* Sub-status badge (for multi-status columns) */}
            {(columnId === "refund") && (
                <div className="mt-2">
                    <span className={`ord-badge ${statusBadgeClass(order.status)}`}>{order.status}</span>
                </div>
            )}

            {/* Proof of payment thumbnail (New column only) */}
            {showProof && (
                <div className="mt-3 rounded-lg overflow-hidden border border-border bg-muted/30">
                    {order.proofOfPayment ? (
                        <div className="relative aspect-[4/3] w-full">
                            <Image src={order.proofOfPayment} alt="Proof" fill className="object-cover" />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-5 text-muted-foreground/40">
                            <ImageOff className="w-5 h-5 mb-1" />
                            <p className="text-[10px] font-semibold uppercase tracking-wider">No proof</p>
                        </div>
                    )}
                </div>
            )}

            {/* Quick actions */}
            {actions.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-border/40">
                    <div className={`grid gap-2 ${actions.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
                        {actions.map(action => (
                            <button
                                key={action.nextStatus}
                                type="button"
                                onClick={(e) => handleAction(e, action.nextStatus)}
                                className={`ord-pipeline-action ord-pipeline-action-${action.variant}`}
                            >
                                {action.variant === "confirm" && <Check className="w-3 h-3" />}
                                {action.variant === "reject" && <X className="w-3 h-3" />}
                                {action.variant === "advance" && <ChevronRight className="w-3 h-3" />}
                                {action.variant === "complete" && <PackageCheck className="w-3 h-3" />}
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Timestamp */}
            <p className="text-[10px] text-muted-foreground/60 mt-2">{timeAgo}</p>
        </>
    )
}

/* ── Helpers ── */

function getRelativeTime(dateStr: string): string {
    const now = Date.now()
    const then = new Date(dateStr).getTime()
    const diff = now - then
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}
