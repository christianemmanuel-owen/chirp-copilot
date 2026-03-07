"use client"

import { useStore } from "@/lib/store"
import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Plus, List, LayoutGrid } from "lucide-react"
import type { NewOrderInput, OrderStatus } from "@/lib/types"
import ManualOrderDialog from "@/components/manual-order-dialog"
import { OrderFilterBar } from "./_components/OrderFilterBar"
import { OrdersTable, type SortColumn, type SortDirection } from "./_components/OrdersTable"
import { OrdersKanbanView } from "./_components/OrdersKanbanView"

export default function OrdersPage() {
  const { orders, updateOrderStatus, isLoadingOrders, products, addOrder } = useStore()
  const searchParams = useSearchParams()
  const highlightId = searchParams.get("highlight")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>("all")
  const [sortColumn, setSortColumn] = useState<SortColumn>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false)
  const [recentlyCreatedId, setRecentlyCreatedId] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(25)
  const [page, setPage] = useState(1)
  const [view, setView] = useState<"table" | "pipeline">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("chirp-orders-view") as "table" | "pipeline") || "pipeline"
    }
    return "pipeline"
  })

  useEffect(() => {
    localStorage.setItem("chirp-orders-view", view)
  }, [view])
  const highlightTargetId = highlightId ?? recentlyCreatedId

  useEffect(() => {
    setPage(1)
  }, [searchTerm, statusFilter, paymentFilter, fulfillmentFilter, sortColumn, sortDirection])

  useEffect(() => {
    setPage(1)
  }, [pageSize])

  const handleCreateManualOrder = async (orderData: NewOrderInput) => {
    const newId = await addOrder(orderData)
    setRecentlyCreatedId(newId)
  }

  const handleSortChange = (column: SortColumn, direction: SortDirection | null) => {
    if (column === null || direction === null) {
      setSortColumn(null)
      setSortDirection("asc")
    } else {
      setSortColumn(column)
      setSortDirection(direction)
    }
  }

  const filteredAndSortedOrders = useMemo(() => {
    const filtered = orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      const matchesPayment = paymentFilter === "all" || order.paymentMethod === paymentFilter
      const matchesFulfillment = fulfillmentFilter === "all" || order.fulfillmentMethod === fulfillmentFilter
      return matchesSearch && matchesStatus && matchesPayment && matchesFulfillment
    })

    if (sortColumn && sortDirection) {
      filtered.sort((a, b) => {
        let cmp = 0
        switch (sortColumn) {
          case "order":
            cmp = a.id.localeCompare(b.id)
            break
          case "date":
            cmp = new Date(a.date).getTime() - new Date(b.date).getTime()
            break
          case "customer":
            cmp = `${a.customer.firstName} ${a.customer.lastName}`.localeCompare(
              `${b.customer.firstName} ${b.customer.lastName}`,
            )
            break
          case "items":
            cmp = a.items.reduce((s, i) => s + i.quantity, 0) - b.items.reduce((s, i) => s + i.quantity, 0)
            break
          case "total":
            cmp = a.total - b.total
            break
        }
        return sortDirection === "desc" ? -cmp : cmp
      })
    }

    return filtered
  }, [orders, searchTerm, statusFilter, paymentFilter, fulfillmentFilter, sortColumn, sortDirection])

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedOrders.length / pageSize))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const startIndex = (safePage - 1) * pageSize
  const paginatedOrders = filteredAndSortedOrders.slice(startIndex, startIndex + pageSize)

  useEffect(() => {
    if (!highlightTargetId) return
    const index = filteredAndSortedOrders.findIndex((order) => order.id === highlightTargetId)
    if (index === -1) return
    const targetPage = Math.floor(index / pageSize) + 1
    if (targetPage !== safePage) {
      setPage(targetPage)
    }
  }, [highlightTargetId, filteredAndSortedOrders, pageSize, safePage])

  useEffect(() => {
    if (safePage !== page) {
      setPage(safePage)
    }
  }, [safePage, page])

  useEffect(() => {
    if (!highlightTargetId) return
    const element = document.getElementById(`order-${highlightTargetId}`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [highlightTargetId, safePage])

  const handleStatusChange = async (orderId: string, currentStatus: string, nextStatus: OrderStatus, trackingId?: string) => {
    try {
      await updateOrderStatus(orderId, nextStatus, trackingId)
    } catch (error) {
      console.error("Failed to update order status", error)
      alert("Failed to update order status. Please try again.")
    }
  }

  if (isLoadingOrders) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-[95vw]">
        <div className="ord-page-header">
          <div>
            <h1 className="ord-page-title">Orders</h1>
            <p className="ord-page-subtitle">Track and manage all customer orders.</p>
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

  return (
    <div className="container mx-auto py-6 px-4 max-w-[95vw]">
      {/* Header */}
      <div className="ord-page-header">
        <div>
          <h1 className="ord-page-title">Orders</h1>
          <p className="ord-page-subtitle">
            Track and manage all customer orders · {orders.length} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="ord-view-toggle">
            <button
              type="button"
              className={`ord-view-toggle-btn ${view === "table" ? "ord-view-toggle-btn-active" : "ord-view-toggle-btn-idle"}`}
              onClick={() => setView("table")}
            >
              <List className="w-3 h-3" />
              Table
            </button>
            <button
              type="button"
              className={`ord-view-toggle-btn ${view === "pipeline" ? "ord-view-toggle-btn-active" : "ord-view-toggle-btn-idle"}`}
              onClick={() => setView("pipeline")}
            >
              <LayoutGrid className="w-3 h-3" />
              Pipeline
            </button>
          </div>
          <button
            type="button"
            className="ord-page-btn ord-page-btn-accent"
            onClick={() => setIsManualOrderOpen(true)}
            disabled={products.length === 0}
          >
            <Plus className="w-3.5 h-3.5" />
            Create Order
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <OrderFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        paymentFilter={paymentFilter}
        onPaymentFilterChange={setPaymentFilter}
        fulfillmentFilter={fulfillmentFilter}
        onFulfillmentFilterChange={setFulfillmentFilter}
        orders={orders}
      />

      {/* Orders View */}
      {view === "table" ? (
        <OrdersTable
          orders={paginatedOrders}
          highlightId={highlightTargetId}
          onStatusChange={handleStatusChange}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          page={safePage}
          onPageChange={setPage}
          totalFiltered={filteredAndSortedOrders.length}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
        />
      ) : (
        <OrdersKanbanView
          orders={filteredAndSortedOrders}
          onStatusChange={handleStatusChange}
        />
      )}

      <ManualOrderDialog
        open={isManualOrderOpen}
        onOpenChange={setIsManualOrderOpen}
        products={products}
        onCreate={handleCreateManualOrder}
      />
    </div>
  )
}
