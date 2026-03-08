"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { OrderStatus } from "@/lib/types"
import { cn, formatCurrency } from "@/lib/utils"
import { ArrowDownRight, ArrowUpRight, Clock, DownloadCloud, Minus, Package, ShoppingCart, TrendingUp } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"
import { toast } from "@/components/ui/use-toast"

const DEFERRED_REVENUE_STATUSES = new Set<OrderStatus>(["For Evaluation", "Confirmed", "For Delivery", "Out for Delivery"])

const ORDER_STATUSES: OrderStatus[] = [
  "For Evaluation",
  "Confirmed",
  "For Delivery",
  "Out for Delivery",
  "Completed",
  "For Refund",
  "Refunded",
  "Cancelled",
]

const TIME_RANGE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 12 months" },
  { value: "all", label: "All time" },
]

const RECENT_SORT_OPTIONS = [
  { value: "date-desc", label: "Newest first" },
  { value: "value-desc", label: "Highest value" },
  { value: "value-asc", label: "Lowest value" },
]

const CHART_PERIOD_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]

const STATUS_COLOR_MAP: Record<OrderStatus, string> = {
  "For Evaluation": "hsl(206 85% 60%)",
  Confirmed: "hsl(162 80% 55%)",
  "For Delivery": "hsl(220 70% 60%)",
  "Out for Delivery": "hsl(283 70% 60%)",
  Completed: "hsl(152 75% 45%)",
  "For Refund": "hsl(17 90% 60%)",
  Refunded: "hsl(197 80% 55%)",
  Cancelled: "hsl(0 80% 60%)",
}

const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  "For Evaluation": "bg-blue-100 text-blue-700",
  Confirmed: "bg-emerald-100 text-emerald-700",
  "For Delivery": "bg-indigo-100 text-indigo-700",
  "Out for Delivery": "bg-violet-100 text-violet-700",
  Completed: "bg-green-100 text-green-700",
  "For Refund": "bg-orange-100 text-orange-700",
  Refunded: "bg-sky-100 text-sky-700",
  Cancelled: "bg-rose-100 text-rose-700",
}

const revenueChartConfig = {
  revenue: { label: "Revenue", color: "hsl(210 90% 55%)" },
  orderCount: { label: "Orders", color: "hsl(280 75% 60%)" },
  avgOrder: { label: "Avg Order Value", color: "hsl(32 95% 55%)" },
}

const statusChartConfig = {
  count: { label: "Orders", color: "hsl(210 85% 55%)" },
}

const DAY_MS = 86_400_000

function calculateChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null
  }
  return ((current - previous) / previous) * 100
}

function formatChangeLabel(change: number | null, hasComparison: boolean): string {
  if (!hasComparison) {
    return "All-time view"
  }
  if (change === null) {
    return "No prior data"
  }
  const formatted = `${change > 0 ? "+" : ""}${change.toFixed(1)}%`
  return `${formatted} vs prev period`
}

function TrendIndicator({ change, hasComparison }: { change: number | null; hasComparison: boolean }) {
  if (!hasComparison) {
    return <span className="text-xs text-muted-foreground">All time</span>
  }
  if (change === null) {
    return <span className="text-xs text-muted-foreground">—</span>
  }
  const isPositive = change > 0
  const isNeutral = change === 0
  const Icon = isNeutral ? Minus : isPositive ? ArrowUpRight : ArrowDownRight
  const colorClass = isNeutral
    ? "text-muted-foreground"
    : isPositive
      ? "text-emerald-600"
      : "text-rose-500"

  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", colorClass)}>
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(change).toFixed(1)}%
    </span>
  )
}

export default function AdminDashboard() {
  const { orders, isLoadingOrders } = useStore()

  const [timeRange, setTimeRange] = useState<string>("30")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [recentSort, setRecentSort] = useState<"date-desc" | "value-desc" | "value-asc">("date-desc")
  const [chartPeriod, setChartPeriod] = useState<"daily" | "weekly" | "monthly">("daily")
  const [isExporting, setIsExporting] = useState(false)

  const rangeDays = timeRange === "all" ? null : Number(timeRange)

  const startDate = useMemo(() => {
    if (rangeDays === null) {
      return null
    }
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - (rangeDays - 1))
    return start
  }, [rangeDays])

  const filteredOrders = useMemo(() => {
    if (!orders.length) {
      return []
    }
    return orders.filter((order) => {
      const orderDate = new Date(order.date)
      orderDate.setHours(0, 0, 0, 0)
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      const matchesRange = startDate ? orderDate >= startDate : true
      return matchesStatus && matchesRange
    })
  }, [orders, statusFilter, startDate])

  const filteredOrdersByDateAsc = useMemo(() => {
    return [...filteredOrders].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
  }, [filteredOrders])

  const stats = useMemo(
    () =>
      filteredOrders.reduce(
        (acc, order) => {
          acc.totalOrders += 1
          if (order.status === "For Evaluation") {
            acc.pendingOrders += 1
          }
          if (order.status === "Completed") {
            acc.totalRevenue += order.total
          }
          if (DEFERRED_REVENUE_STATUSES.has(order.status)) {
            acc.deferredRevenue += order.total
          }
          return acc
        },
        {
          totalOrders: 0,
          pendingOrders: 0,
          deferredRevenue: 0,
          totalRevenue: 0,
        },
      ),
    [filteredOrders],
  )

  const statusCounts = useMemo(
    () =>
      filteredOrders.reduce<Record<OrderStatus, number>>((acc, order) => {
        acc[order.status] = (acc[order.status] ?? 0) + 1
        return acc
      }, {} as Record<OrderStatus, number>),
    [filteredOrders],
  )

  const statusDistributionData = useMemo(
    () =>
      ORDER_STATUSES.map((status) => ({
        status,
        label: status,
        count: statusCounts[status] ?? 0,
      })).filter((entry) => entry.count > 0),
    [statusCounts],
  )

  const comparison = useMemo(() => {
    if (rangeDays === null || !startDate) {
      return null
    }

    const previousStart = new Date(startDate)
    previousStart.setDate(previousStart.getDate() - rangeDays)
    previousStart.setHours(0, 0, 0, 0)

    const previousEnd = new Date(startDate)
    previousEnd.setDate(previousEnd.getDate() - 1)
    previousEnd.setHours(23, 59, 59, 999)

    const previousOrders = orders.filter((order) => {
      const orderDate = new Date(order.date)
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      return matchesStatus && orderDate >= previousStart && orderDate <= previousEnd
    })

    const previousStats = previousOrders.reduce(
      (acc, order) => {
        acc.totalOrders += 1
        if (order.status === "For Evaluation") {
          acc.pendingOrders += 1
        }
        if (order.status === "Completed") {
          acc.totalRevenue += order.total
        }
        if (DEFERRED_REVENUE_STATUSES.has(order.status)) {
          acc.deferredRevenue += order.total
        }
        return acc
      },
      {
        totalOrders: 0,
        pendingOrders: 0,
        deferredRevenue: 0,
        totalRevenue: 0,
      },
    )

    return { previousStats }
  }, [orders, rangeDays, startDate, statusFilter])

  const hasComparison = comparison !== null

  const totalOrdersChange = hasComparison
    ? calculateChange(stats.totalOrders, comparison!.previousStats.totalOrders)
    : null
  const pendingOrdersChange = hasComparison
    ? calculateChange(stats.pendingOrders, comparison!.previousStats.pendingOrders)
    : null
  const deferredRevenueChange = hasComparison
    ? calculateChange(stats.deferredRevenue, comparison!.previousStats.deferredRevenue)
    : null
  const completedRevenueChange = hasComparison
    ? calculateChange(stats.totalRevenue, comparison!.previousStats.totalRevenue)
    : null

  const revenueTrendData = useMemo(() => {
    if (!filteredOrders.length) {
      return []
    }

    const firstDate = filteredOrders.reduce((min, order) => {
      const date = new Date(order.date)
      date.setHours(0, 0, 0, 0)
      return date < min ? date : min
    }, (() => {
      const date = new Date(filteredOrders[0].date)
      date.setHours(0, 0, 0, 0)
      return date
    })())

    const timelineStart = startDate ?? firstDate

    const latestDate = filteredOrders.reduce((max, order) => {
      const date = new Date(order.date)
      date.setHours(0, 0, 0, 0)
      return date > max ? date : max
    }, (() => {
      const date = new Date(filteredOrders[0].date)
      date.setHours(0, 0, 0, 0)
      return date
    })())

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const timelineEnd = rangeDays === null ? latestDate : today

    const rawDailyData = new Map<number, { revenue: number; orderCount: number }>()
    for (let ts = timelineStart.getTime(); ts <= timelineEnd.getTime(); ts += DAY_MS) {
      rawDailyData.set(ts, { revenue: 0, orderCount: 0 })
    }

    filteredOrders.forEach((order) => {
      const date = new Date(order.date)
      date.setHours(0, 0, 0, 0)
      const ts = date.getTime()
      if (rawDailyData.has(ts)) {
        const bucket = rawDailyData.get(ts)!
        bucket.revenue += order.total
        bucket.orderCount += 1
      }
    })

    const resultBuckets: { date: Date; label: string; revenue: number; orderCount: number; avgOrder: number }[] = []

    if (chartPeriod === "daily") {
      rawDailyData.forEach((val, ts) => {
        const date = new Date(ts)
        resultBuckets.push({
          date,
          label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          revenue: val.revenue,
          orderCount: val.orderCount,
          avgOrder: val.orderCount ? val.revenue / val.orderCount : 0
        })
      })
    } else if (chartPeriod === "weekly") {
      const weeklyBuckets = new Map<string, { revenue: number; orderCount: number; date: Date }>()
      rawDailyData.forEach((val, ts) => {
        const date = new Date(ts)
        const day = date.getDay()
        const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Start of week (Monday)
        const monday = new Date(date)
        monday.setDate(diff)
        monday.setHours(0, 0, 0, 0)
        const key = monday.toISOString().split('T')[0]
        const existing = weeklyBuckets.get(key) || { revenue: 0, orderCount: 0, date: monday }
        existing.revenue += val.revenue
        existing.orderCount += val.orderCount
        weeklyBuckets.set(key, existing)
      })
      weeklyBuckets.forEach((val) => {
        resultBuckets.push({
          date: val.date,
          label: `Wk of ${val.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
          revenue: val.revenue,
          orderCount: val.orderCount,
          avgOrder: val.orderCount ? val.revenue / val.orderCount : 0
        })
      })
    } else if (chartPeriod === "monthly") {
      const monthlyBuckets = new Map<string, { revenue: number; orderCount: number; date: Date }>()
      rawDailyData.forEach((val, ts) => {
        const date = new Date(ts)
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
        const existing = monthlyBuckets.get(key) || { revenue: 0, orderCount: 0, date: monthStart }
        existing.revenue += val.revenue
        existing.orderCount += val.orderCount
        monthlyBuckets.set(key, existing)
      })
      monthlyBuckets.forEach((val) => {
        resultBuckets.push({
          date: val.date,
          label: val.date.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
          revenue: val.revenue,
          orderCount: val.orderCount,
          avgOrder: val.orderCount ? val.revenue / val.orderCount : 0
        })
      })
    }

    return resultBuckets.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [filteredOrders, rangeDays, startDate, chartPeriod])

  // Generate sparkline data (last 7 data points for mini charts in KPI cards)
  const sparklineData = useMemo(() => {
    const last7 = revenueTrendData.slice(-7)
    return {
      revenue: last7.map((d, i) => ({ x: i, y: d.revenue })),
      orders: last7.map((d, i) => ({ x: i, y: d.orderCount })),
      avgOrder: last7.map((d, i) => ({ x: i, y: d.avgOrder })),
    }
  }, [revenueTrendData])

  const totalRevenue = stats.totalRevenue
  const averageOrderValue = filteredOrders.length ? totalRevenue / filteredOrders.length : 0
  const refundsInProgress = filteredOrders.filter((order) => order.status === "For Refund").length
  const completedOrders = filteredOrders.filter((order) => order.status === "Completed")
  const totalSales = filteredOrders.reduce((acc, order) => acc + order.total, 0)

  const recentOrders = useMemo(() => {
    const sorted = [...filteredOrders]
    switch (recentSort) {
      case "value-desc":
        sorted.sort((a, b) => b.total - a.total)
        break
      case "value-asc":
        sorted.sort((a, b) => a.total - b.total)
        break
      default:
        sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
    }
    return sorted.slice(0, 6)
  }, [filteredOrders, recentSort])

  const topCustomers = useMemo(() => {
    const customerMap = new Map<
      string,
      { name: string; email: string | null; orders: number; revenue: number }
    >()

    filteredOrders.forEach((order) => {
      const key = order.customer.email || `${order.customer.firstName}-${order.customer.lastName}`
      const existing = customerMap.get(key)
      if (existing) {
        existing.orders += 1
        existing.revenue += order.total
      } else {
        customerMap.set(key, {
          name: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
          email: order.customer.email ?? null,
          orders: 1,
          revenue: order.total,
        })
      }
    })

    return Array.from(customerMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [filteredOrders])

  const productPerformance = useMemo(() => {
    const productMap = new Map<string, { name: string; image: string; units: number; revenue: number; avgUnitPrice: number }>()

    filteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const key = `${item.variantId}-${item.name}`
        const existing = productMap.get(key)
        const lineRevenue = item.price * item.quantity
        if (existing) {
          existing.units += item.quantity
          existing.revenue += lineRevenue
          existing.avgUnitPrice = existing.units ? existing.revenue / existing.units : 0
        } else {
          productMap.set(key, {
            name: item.name,
            image: item.image || "/placeholder.svg?height=40&width=40",
            units: item.quantity,
            revenue: lineRevenue,
            avgUnitPrice: item.quantity ? lineRevenue / item.quantity : 0,
          })
        }
      })
    })

    return Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue)
  }, [filteredOrders])

  const topProducts = useMemo(() => productPerformance.slice(0, 5), [productPerformance])

  const timeRangeLabel = TIME_RANGE_OPTIONS.find((option) => option.value === timeRange)?.label ?? "Custom"
  const statusLabel = statusFilter === "all" ? "All statuses" : statusFilter
  const filterDescriptor = `${timeRangeLabel}${statusFilter === "all" ? "" : ` · ${statusLabel}`}`

  const ordersPerDay = useMemo(() => {
    if (!filteredOrdersByDateAsc.length) {
      return 0
    }
    const first = new Date(filteredOrdersByDateAsc[0].date)
    first.setHours(0, 0, 0, 0)
    const last = new Date(filteredOrdersByDateAsc[filteredOrdersByDateAsc.length - 1].date)
    last.setHours(0, 0, 0, 0)
    const spanDays = Math.max(1, Math.round((last.getTime() - first.getTime()) / DAY_MS) + 1)
    return filteredOrdersByDateAsc.length / spanDays
  }, [filteredOrdersByDateAsc])

  const completionRate = stats.totalOrders === 0 ? 0 : (completedOrders.length / stats.totalOrders) * 100
  const refundRate = stats.totalOrders === 0 ? 0 : (refundsInProgress / stats.totalOrders) * 100

  const handleExportSnapshot = async () => {
    if (isExporting) {
      return
    }
    setIsExporting(true)
    try {
      const XLSX = await import("xlsx")
      const workbook = XLSX.utils.book_new()

      const orderSheetData = [
        [
          "Order ID",
          "Order Date",
          "Customer",
          "Email",
          "Status",
          "Fulfillment",
          "Payment Method",
          "Subtotal",
          "VAT",
          "Shipping Fee",
          "Total",
          "Items",
        ],
        ...filteredOrders.map((order) => {
          const customerName = `${order.customer.firstName} ${order.customer.lastName}`.trim()
          const orderDate = new Date(order.date).toLocaleString()
          const fulfillment =
            order.fulfillmentMethod === "delivery"
              ? `Delivery - ${order.delivery.city}, ${order.delivery.region}`
              : `Pickup - ${order.pickup?.locationName ?? "Location TBD"}`
          const itemsSummary = order.items && order.items.length
            ? order.items.map((item) => `${item.name} x${item.quantity}`).join("; ")
            : ""
          return [
            order.id,
            orderDate,
            customerName,
            order.customer.email ?? "",
            order.status,
            fulfillment,
            order.paymentMethod,
            Number(order.subtotal.toFixed(2)),
            Number(order.vat.toFixed(2)),
            Number(order.shippingFee.toFixed(2)),
            Number(order.total.toFixed(2)),
            itemsSummary,
          ]
        }),
      ]
      const ordersSheet = XLSX.utils.aoa_to_sheet(orderSheetData)
      ordersSheet["!autofilter"] = { ref: `A1:L${orderSheetData.length}` }
      ordersSheet["!cols"] = [
        { wch: 16 },
        { wch: 22 },
        { wch: 20 },
        { wch: 26 },
        { wch: 16 },
        { wch: 28 },
        { wch: 20 },
        { wch: 12 },
        { wch: 10 },
        { wch: 12 },
        { wch: 12 },
        { wch: 40 },
      ]
      XLSX.utils.book_append_sheet(workbook, ordersSheet, "Order History")

      const productSheetData = [
        ["Product", "Units Sold", "Revenue", "Avg Unit Price", "% of Sales"],
        ...productPerformance.map((product) => [
          product.name,
          product.units,
          Number(product.revenue.toFixed(2)),
          Number(product.avgUnitPrice.toFixed(2)),
          totalSales ? Number(((product.revenue / totalSales) * 100).toFixed(2)) : 0,
        ]),
      ]
      const productSheet = XLSX.utils.aoa_to_sheet(productSheetData)
      productSheet["!autofilter"] = { ref: `A1:E${productSheetData.length}` }
      productSheet["!cols"] = [
        { wch: 26 },
        { wch: 12 },
        { wch: 14 },
        { wch: 14 },
        { wch: 12 },
      ]
      XLSX.utils.book_append_sheet(workbook, productSheet, "Sales Performance")

      const graphSheetData = [
        ["Date", "Revenue", "Orders", "Avg Order Value"],
        ...revenueTrendData.map((entry) => [
          entry.label,
          Number(entry.revenue.toFixed(2)),
          entry.orderCount,
          Number(entry.avgOrder.toFixed(2)),
        ]),
      ]
      const graphSheet = XLSX.utils.aoa_to_sheet(graphSheetData)
      graphSheet["!autofilter"] = { ref: `A1:D${graphSheetData.length}` }
      graphSheet["!cols"] = [
        { wch: 14 },
        { wch: 14 },
        { wch: 12 },
        { wch: 18 },
        { wch: 2 },
        { wch: 18 },
        { wch: 18 },
      ]

      const statusBlock = [
        ["Status Distribution"],
        ["Status", "Orders"],
        ...statusDistributionData.map((entry) => [entry.status, entry.count]),
      ]
      const statusStartRow = graphSheetData.length + 2
      XLSX.utils.sheet_add_aoa(graphSheet, statusBlock, { origin: `A${statusStartRow}` })

      const summaryBlock = [
        ["Key Metrics"],
        ["Metric", "Value"],
        ["Total Orders", stats.totalOrders],
        ["Pending Orders", stats.pendingOrders],
        ["Deferred Revenue", Number(stats.deferredRevenue.toFixed(2))],
        ["Completed Revenue", Number(stats.totalRevenue.toFixed(2))],
        ["Orders per Day", Number(ordersPerDay.toFixed(2))],
        ["Average Order Value", Number(averageOrderValue.toFixed(2))],
        ["Completion Rate (%)", Number(completionRate.toFixed(2))],
        ["Refund Rate (%)", Number(refundRate.toFixed(2))],
        ["Filters Applied", filterDescriptor],
      ]
      XLSX.utils.sheet_add_aoa(graphSheet, summaryBlock, { origin: "F1" })
      XLSX.utils.book_append_sheet(workbook, graphSheet, "Analytics & Graphs")

      const sanitizedTimeRange = timeRangeLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      const sanitizedStatus = (statusFilter === "all" ? "all-statuses" : statusFilter)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
      const dateStamp = new Date().toISOString().split("T")[0]
      const filename = `sales-dashboard-${sanitizedTimeRange}-${sanitizedStatus}-${dateStamp}.xlsx`

      XLSX.writeFile(workbook, filename)
      toast({
        title: "Snapshot ready",
        description: `Downloaded ${filename} with the latest dashboard metrics.`,
      })
    } catch (error) {
      console.error("Failed to export dashboard snapshot", error)
      toast({
        title: "Export failed",
        description: "Something went wrong while preparing the Excel snapshot.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const cardBaseClasses = ""
  const cardHeaderClasses = "px-6 py-4 border-b border-border rounded-t-[0.75rem]"
  const cardContentClasses = "px-6 py-5"

  return (
    <div className="container mx-auto max-w-[95vw] px-4 py-8">
      <div className="flex flex-col gap-4 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.12em] sm:w-48">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border border-border bg-background shadow-lg">
                {TIME_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter === "all" ? "all" : statusFilter}
              onValueChange={(value) => setStatusFilter(value === "all" ? "all" : (value as OrderStatus))}
            >
              <SelectTrigger className="w-full rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.12em] sm:w-48">
                <SelectValue placeholder="Status filter" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border border-border bg-background shadow-lg">
                <SelectItem value="all">All statuses</SelectItem>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            onClick={handleExportSnapshot}
            disabled={isExporting}
            className="w-full rounded-full border border-border bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:w-auto"
          >
            <DownloadCloud className="mr-2 h-4 w-4" />
            {isExporting ? "Preparing snapshot..." : "Download snapshot"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {/* Total Orders Card */}
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Orders</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{isLoadingOrders ? "…" : stats.totalOrders.toLocaleString()}</p>
            </div>
            <div className="h-12 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData.orders}>
                  <defs>
                    <linearGradient id="sparklineOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="y" stroke="hsl(199, 89%, 48%)" fill="url(#sparklineOrders)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Deferred Revenue Card */}
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Deferred Revenue</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{formatCurrency(stats.deferredRevenue)}</p>
            </div>
            <div className="h-12 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData.avgOrder}>
                  <defs>
                    <linearGradient id="sparklinePipeline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="y" stroke="hsl(0, 84%, 60%)" fill="url(#sparklinePipeline)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Completed Revenue Card */}
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Completed Revenue</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="h-12 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData.revenue}>
                  <defs>
                    <linearGradient id="sparklineRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(158, 64%, 52%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(158, 64%, 52%)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="y" stroke="hsl(158, 64%, 52%)" fill="url(#sparklineRevenue)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Sales Revenue Chart */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between px-5 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <TrendingUp className="h-4 w-4" />
            Sales Revenue
          </CardTitle>
          <div className="flex items-center gap-1 rounded-lg bg-[#f0f0f0] p-1">
            {CHART_PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setChartPeriod(option.value as typeof chartPeriod)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  chartPeriod === option.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-6">
          {revenueTrendData.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Not enough data to chart this period.
            </p>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mainChartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(168, 76%, 42%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(168, 76%, 42%)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    labelStyle={{ fontWeight: 600, color: "black" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(168, 76%, 42%)"
                    fill="url(#mainChartGradient)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders Table */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border rounded-t-[0.75rem]">
          <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
          <Select value={recentSort} onValueChange={(value) => setRecentSort(value as typeof recentSort)}>
            <SelectTrigger className="h-8 w-auto gap-1 border-0 bg-transparent px-2 text-xs text-muted-foreground shadow-none hover:bg-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {RECENT_SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingOrders ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
          ) : recentOrders.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No orders found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                    <th className="px-5 py-3">Customer Name</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/admin/orders/${order.id}`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-semibold text-primary">
                            {order.customer.firstName[0]}{order.customer.lastName[0]}
                          </div>
                          <span className="text-sm font-medium">
                            {order.customer.firstName} {order.customer.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-muted-foreground">
                        {new Date(order.date).toLocaleDateString("en-PH", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn(
                          "text-xs font-medium",
                          order.status === "Completed" && "text-emerald-600",
                          order.status === "For Evaluation" && "text-amber-600",
                          order.status === "Confirmed" && "text-blue-600",
                          order.status === "Out for Delivery" && "text-indigo-600",
                          order.status === "For Refund" && "text-orange-600",
                          order.status === "Refunded" && "text-sky-600",
                          order.status === "Cancelled" && "text-rose-600"
                        )}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-sm font-semibold tabular-nums">
                        {formatCurrency(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className={cardBaseClasses}>
          <CardHeader className="px-5 py-4">
            <CardTitle className="text-base font-semibold">Top Customers</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {topCustomers.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No data</p>
            ) : (
              <div className="space-y-2">
                {topCustomers.map((customer, index) => (
                  <div
                    key={customer.email ?? customer.name}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-medium text-muted-foreground w-4">{index + 1}</span>
                      <span className="text-sm font-medium truncate">{customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {formatCurrency(customer.revenue)}
                      </span>
                      <span>·</span>
                      <span>{customer.orders} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={cardBaseClasses}>
          <CardHeader className="px-5 py-4">
            <CardTitle className="text-base font-semibold">Top Products</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {topProducts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No data</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
                  >
                    <span className="text-xs font-medium text-muted-foreground w-4">{index + 1}</span>
                    <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="flex flex-1 items-center justify-between min-w-0">
                      <span className="text-sm font-medium truncate">{product.name}</span>
                      <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                        <span className="text-sm font-semibold text-foreground tabular-nums">
                          {formatCurrency(product.revenue)}
                        </span>
                        <span className="hidden sm:inline">·</span>
                        <span className="hidden sm:inline">{product.units} sold</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={cardBaseClasses}>
          <CardHeader className="px-5 py-4">
            <CardTitle className="text-base font-semibold text-foreground">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-2">
              {ORDER_STATUSES.map((status) => {
                const count = statusCounts[status] || 0
                const percent = stats.totalOrders > 0 ? (count / stats.totalOrders) * 100 : 0
                return (
                  <div key={status} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", (STATUS_BADGE_CLASSES[status] || "").split(' ')[0])}
                        style={{ backgroundColor: STATUS_COLOR_MAP[status] }}
                      />
                      <span className="text-muted-foreground">{status}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold tabular-nums">{count}</span>
                      <span className="text-[10px] text-muted-foreground w-8 text-right">{percent.toFixed(0)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-sm font-bold">
              <span>Total</span>
              <span>{stats.totalOrders}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div >
  )
}
