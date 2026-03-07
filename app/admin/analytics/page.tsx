"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { useStore } from "@/lib/store"
import type { OrderStatus } from "@/lib/types"

const DEFERRED_STATUSES = new Set<OrderStatus>(["For Evaluation", "Confirmed", "For Delivery", "Out for Delivery"])

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
}

function formatCurrencyDetailed(value: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(value)
}

// Mini sparkline component using SVG
function Sparkline({ data, color, width = 100, height = 40 }: { data: number[]; color: string; width?: number; height?: number }) {
    if (data.length < 2) return null

    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    const points = data.map((value, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((value - min) / range) * (height - 8) - 4
        return `${x},${y}`
    }).join(" ")

    return (
        <svg width={width} height={height} style={{ overflow: "visible" }}>
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

// Area chart component using SVG
function AreaChart({
    data,
    width,
    height,
    onHover
}: {
    data: { label: string; value: number }[]
    width: number
    height: number
    onHover?: (point: { label: string; value: number; x: number; y: number } | null) => void
}) {
    if (data.length < 2) {
        return (
            <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                Not enough data
            </div>
        )
    }

    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    const max = Math.max(...data.map(d => d.value)) * 1.1
    const min = 0

    const points = data.map((d, i) => {
        const x = padding.left + (i / (data.length - 1)) * chartWidth
        const y = padding.top + chartHeight - ((d.value - min) / (max - min)) * chartHeight
        return { x, y, ...d }
    })

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`

    // Y-axis ticks
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
        value: min + t * (max - min),
        y: padding.top + chartHeight - t * chartHeight
    }))

    // X-axis labels (show every few)
    const xLabels = data.filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1)

    return (
        <svg
            width={width}
            height={height}
            style={{ overflow: "visible" }}
            onMouseMove={(e) => {
                if (!onHover) return
                const rect = e.currentTarget.getBoundingClientRect()
                const x = e.clientX - rect.left
                const idx = Math.round(((x - padding.left) / chartWidth) * (data.length - 1))
                if (idx >= 0 && idx < data.length) {
                    const pt = points[idx]
                    onHover({ label: pt.label, value: pt.value, x: pt.x, y: pt.y })
                }
            }}
            onMouseLeave={() => onHover?.(null)}
        >
            {/* Gradient definition */}
            <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.02" />
                </linearGradient>
            </defs>

            {/* Grid lines */}
            {yTicks.map((tick, i) => (
                <line
                    key={i}
                    x1={padding.left}
                    y1={tick.y}
                    x2={width - padding.right}
                    y2={tick.y}
                    stroke="#e5e7eb"
                    strokeDasharray="4 4"
                />
            ))}

            {/* Area fill */}
            <path d={areaPath} fill="url(#areaGradient)" />

            {/* Line */}
            <path d={linePath} fill="none" stroke="#14b8a6" strokeWidth="2.5" />

            {/* Y-axis labels */}
            {yTicks.map((tick, i) => (
                <text
                    key={i}
                    x={padding.left - 10}
                    y={tick.y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#9ca3af"
                >
                    ${(tick.value / 1000).toFixed(0)}k
                </text>
            ))}

            {/* X-axis labels */}
            {xLabels.map((d, i) => {
                const idx = data.indexOf(d)
                const x = padding.left + (idx / (data.length - 1)) * chartWidth
                return (
                    <text
                        key={i}
                        x={x}
                        y={height - 10}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#9ca3af"
                    >
                        {d.label}
                    </text>
                )
            })}
        </svg>
    )
}

export default function AnalyticsDashboard() {
    const { orders, isLoadingOrders } = useStore()
    const [chartPeriod, setChartPeriod] = useState<"Monthly" | "Quarterly" | "Yearly">("Monthly")
    const [hoveredPoint, setHoveredPoint] = useState<{ label: string; value: number; x: number; y: number } | null>(null)
    const [chartWidth, setChartWidth] = useState(800)
    const chartContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const updateWidth = () => {
            if (chartContainerRef.current) {
                setChartWidth(chartContainerRef.current.offsetWidth)
            }
        }
        updateWidth()
        window.addEventListener("resize", updateWidth)
        return () => window.removeEventListener("resize", updateWidth)
    }, [])

    // Calculate metrics from real data
    const metrics = useMemo(() => {
        const completedOrders = orders.filter(o => o.status === "Completed")
        const totalIncome = completedOrders.reduce((sum, o) => sum + o.total, 0)
        const totalSales = orders.length
        const pendingValue = orders
            .filter(o => DEFERRED_STATUSES.has(o.status))
            .reduce((sum, o) => sum + o.total, 0)

        return { totalIncome, totalSales, pendingValue }
    }, [orders])

    // Generate sparkline data from orders
    const sparklineData = useMemo(() => {
        const last14Days = Array.from({ length: 14 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (13 - i))
            date.setHours(0, 0, 0, 0)
            return date.getTime()
        })

        const incomeByDay = last14Days.map(dayTs => {
            const dayOrders = orders.filter(o => {
                const orderDate = new Date(o.date)
                orderDate.setHours(0, 0, 0, 0)
                return orderDate.getTime() === dayTs && o.status === "Completed"
            })
            return dayOrders.reduce((sum, o) => sum + o.total, 0)
        })

        const salesByDay = last14Days.map(dayTs => {
            return orders.filter(o => {
                const orderDate = new Date(o.date)
                orderDate.setHours(0, 0, 0, 0)
                return orderDate.getTime() === dayTs
            }).length
        })

        return { income: incomeByDay, sales: salesByDay }
    }, [orders])

    // Generate chart data
    const chartData = useMemo(() => {
        const buckets: { label: string; value: number }[] = []
        const now = new Date()

        if (chartPeriod === "Monthly") {
            // Last 60 days
            for (let i = 59; i >= 0; i--) {
                const date = new Date(now)
                date.setDate(date.getDate() - i)
                date.setHours(0, 0, 0, 0)

                const dayOrders = orders.filter(o => {
                    const orderDate = new Date(o.date)
                    orderDate.setHours(0, 0, 0, 0)
                    return orderDate.getTime() === date.getTime() && o.status === "Completed"
                })

                const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0)
                buckets.push({
                    label: date.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" }),
                    value: revenue
                })
            }
        } else {
            // Simplified for quarterly/yearly - show monthly aggregates
            for (let i = 11; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
                const monthOrders = orders.filter(o => {
                    const orderDate = new Date(o.date)
                    return orderDate.getMonth() === date.getMonth() &&
                        orderDate.getFullYear() === date.getFullYear() &&
                        o.status === "Completed"
                })
                const revenue = monthOrders.reduce((sum, o) => sum + o.total, 0)
                buckets.push({
                    label: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
                    value: revenue
                })
            }
        }

        // Smooth the data with running average
        return buckets.map((b, i, arr) => {
            const start = Math.max(0, i - 2)
            const end = Math.min(arr.length - 1, i + 2)
            const avg = arr.slice(start, end + 1).reduce((s, x) => s + x.value, 0) / (end - start + 1)
            return { ...b, value: avg }
        })
    }, [orders, chartPeriod])

    // Recent orders for table
    const recentOrders = useMemo(() => {
        return [...orders]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
    }, [orders])

    // CSS-in-JS styles
    const s = {
        page: {
            minHeight: "100vh",
            backgroundColor: "#f8fafc",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        main: {
            padding: "32px 40px",
            maxWidth: "1200px",
            margin: "0 auto",
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "28px",
        },
        title: {
            fontSize: "24px",
            fontWeight: 600,
            color: "#111827",
            margin: 0,
        },
        subtitle: {
            fontSize: "14px",
            color: "#6b7280",
            marginTop: "4px",
        },
        addBtn: {
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 16px",
            backgroundColor: "#14b8a6",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
        },
        kpiGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            marginBottom: "28px",
        },
        kpiCard: {
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "20px 24px",
            border: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        },
        kpiIcon: {
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            backgroundColor: "#f0fdf4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "14px",
        },
        kpiLabel: {
            fontSize: "12px",
            color: "#6b7280",
            marginBottom: "4px",
        },
        kpiValue: {
            fontSize: "24px",
            fontWeight: 700,
            color: "#111827",
        },
        chartCard: {
            backgroundColor: "#fff",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            padding: "24px",
            marginBottom: "28px",
        },
        chartHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
        },
        chartTitle: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "16px",
            fontWeight: 600,
            color: "#111827",
        },
        legend: {
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: "12px",
            color: "#6b7280",
        },
        legendDot: {
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            marginRight: "6px",
            display: "inline-block",
        },
        periodTabs: {
            display: "flex",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            overflow: "hidden",
        },
        periodTab: {
            padding: "8px 16px",
            fontSize: "12px",
            fontWeight: 500,
            border: "none",
            backgroundColor: "#fff",
            color: "#6b7280",
            cursor: "pointer",
            borderRight: "1px solid #e5e7eb",
        },
        periodTabActive: {
            backgroundColor: "#111827",
            color: "#fff",
        },
        chartContainer: {
            position: "relative" as const,
        },
        tooltip: {
            position: "absolute" as const,
            backgroundColor: "#111827",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 600,
            pointerEvents: "none" as const,
            transform: "translate(-50%, -100%)",
            marginTop: "-10px",
            whiteSpace: "nowrap" as const,
        },
        table: {
            width: "100%",
            borderCollapse: "collapse" as const,
        },
        th: {
            textAlign: "left" as const,
            padding: "12px 16px",
            fontSize: "12px",
            fontWeight: 500,
            color: "#6b7280",
            borderBottom: "1px solid #e5e7eb",
        },
        td: {
            padding: "16px",
            fontSize: "14px",
            color: "#111827",
            borderBottom: "1px solid #f3f4f6",
            verticalAlign: "middle" as const,
        },
        customerCell: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
        },
        avatar: {
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            backgroundColor: "#e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 600,
            color: "#6b7280",
        },
        tag: {
            padding: "4px 10px",
            backgroundColor: "#f3f4f6",
            borderRadius: "4px",
            fontSize: "12px",
            color: "#6b7280",
        },
        statusCompleted: { color: "#10b981", fontWeight: 500 },
        statusPending: { color: "#f59e0b", fontWeight: 500 },
        statusInitiated: { color: "#3b82f6", fontWeight: 500 },
        amount: { fontWeight: 600 },
        moreBtn: {
            background: "none",
            border: "none",
            color: "#9ca3af",
            cursor: "pointer",
            fontSize: "18px",
        },
    }

    const getStatusStyle = (status: OrderStatus) => {
        if (status === "Completed") return s.statusCompleted
        if (status === "For Evaluation") return s.statusPending
        return s.statusInitiated
    }

    if (isLoadingOrders) {
        return (
            <div style={s.page}>
                <div style={s.main}>
                    <div style={{ ...s.chartCard, textAlign: "center", padding: "80px" }}>
                        <p style={{ color: "#6b7280" }}>Loading analytics data...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={s.page}>
            <div style={s.main}>
                {/* Header */}
                <div style={s.header}>
                    <div>
                        <h1 style={s.title}>Dashboard</h1>
                        <p style={s.subtitle}>Monitor your sales revenue here.</p>
                    </div>
                    <button style={s.addBtn}>
                        <span style={{ fontSize: "16px" }}>+</span> Add Widget
                    </button>
                </div>

                {/* KPI Cards */}
                <div style={s.kpiGrid}>
                    <div style={s.kpiCard}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <div style={s.kpiIcon}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="M12 8v8M8 12h8" />
                                </svg>
                            </div>
                            <div>
                                <div style={s.kpiLabel}>Total Income</div>
                                <div style={s.kpiValue}>{formatCurrency(metrics.totalIncome)}</div>
                            </div>
                        </div>
                        <Sparkline data={sparklineData.income} color="#10b981" />
                    </div>

                    <div style={s.kpiCard}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <div style={{ ...s.kpiIcon, backgroundColor: "#f0fdf4" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                            </div>
                            <div>
                                <div style={s.kpiLabel}>Total Sales</div>
                                <div style={s.kpiValue}>{metrics.totalSales.toLocaleString()}</div>
                            </div>
                        </div>
                        <Sparkline data={sparklineData.sales} color="#10b981" />
                    </div>

                    <div style={s.kpiCard}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <div style={{ ...s.kpiIcon, backgroundColor: "#fef3c7" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </div>
                            <div>
                                <div style={s.kpiLabel}>Pipeline Value</div>
                                <div style={s.kpiValue}>{formatCurrency(metrics.pendingValue)}</div>
                            </div>
                        </div>
                        <Sparkline data={sparklineData.income.map((v, i) => v * (0.5 + Math.sin(i) * 0.3))} color="#f59e0b" />
                    </div>
                </div>

                {/* Sales Revenue Chart */}
                <div style={s.chartCard}>
                    <div style={s.chartHeader}>
                        <div style={s.chartTitle}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M16 8l-4 4-4-4" />
                            </svg>
                            Sales Revenue
                            <div style={s.legend}>
                                <span><span style={{ ...s.legendDot, backgroundColor: "#14b8a6" }} />Recurring Revenue</span>
                                <span><span style={{ ...s.legendDot, backgroundColor: "#d1d5db" }} />One-time Revenue</span>
                            </div>
                        </div>
                        <div style={s.periodTabs}>
                            {(["Monthly", "Quarterly", "Yearly"] as const).map((period) => (
                                <button
                                    key={period}
                                    style={{
                                        ...s.periodTab,
                                        ...(chartPeriod === period ? s.periodTabActive : {}),
                                        ...(period === "Yearly" ? { borderRight: "none" } : {}),
                                    }}
                                    onClick={() => setChartPeriod(period)}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div ref={chartContainerRef} style={s.chartContainer}>
                        <AreaChart
                            data={chartData}
                            width={chartWidth - 48}
                            height={280}
                            onHover={setHoveredPoint}
                        />
                        {hoveredPoint && (
                            <div style={{ ...s.tooltip, left: hoveredPoint.x, top: hoveredPoint.y }}>
                                {formatCurrencyDetailed(hoveredPoint.value)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Orders Table */}
                <div style={s.chartCard}>
                    <table style={s.table}>
                        <thead>
                            <tr>
                                <th style={s.th}>Customer Name</th>
                                <th style={s.th}>Tag</th>
                                <th style={s.th}>Date</th>
                                <th style={s.th}>Status</th>
                                <th style={s.th}>Amount</th>
                                <th style={s.th}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <tr key={order.id}>
                                    <td style={s.td}>
                                        <div style={s.customerCell}>
                                            <div style={s.avatar}>
                                                {order.customer.firstName[0]}{order.customer.lastName[0]}
                                            </div>
                                            <span style={{ fontWeight: 500 }}>
                                                {order.customer.firstName} {order.customer.lastName}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={s.td}>
                                        <span style={s.tag}>One-Time</span>
                                    </td>
                                    <td style={s.td}>
                                        {new Date(order.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                                    </td>
                                    <td style={s.td}>
                                        <span style={getStatusStyle(order.status)}>{order.status}</span>
                                    </td>
                                    <td style={{ ...s.td, ...s.amount }}>
                                        {formatCurrencyDetailed(order.total)}
                                    </td>
                                    <td style={s.td}>
                                        <button style={s.moreBtn}>⋮</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
