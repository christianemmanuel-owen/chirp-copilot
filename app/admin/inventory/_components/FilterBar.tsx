"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X, ChevronDown, Layers, Grid3X3, Tag, Bookmark, CheckSquare, LayoutList, LayoutGrid } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { FilterBarProps, GroupByMode, SizeViewMode } from "./types"

/* ─── Segmented Control ─── */
function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    size = "sm",
}: {
    options: { value: T; label: string; icon?: React.ReactNode }[]
    value: T
    onChange: (value: T) => void
    size?: "sm" | "md"
}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({})

    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        const activeIndex = options.findIndex((o) => o.value === value)
        const buttons = container.querySelectorAll<HTMLButtonElement>("[data-segment-btn]")
        const activeBtn = buttons[activeIndex]
        if (!activeBtn) return
        setIndicatorStyle({
            width: activeBtn.offsetWidth,
            transform: `translateX(${activeBtn.offsetLeft}px)`,
        })
    }, [value, options])

    const pad = size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"

    return (
        <div
            ref={containerRef}
            className="inv-segment-track relative inline-flex items-center rounded-lg p-0.5"
        >
            <div
                className="inv-segment-indicator absolute top-0.5 left-0 h-[calc(100%-4px)] rounded-md transition-all duration-200 ease-out"
                style={indicatorStyle}
            />
            {options.map((opt) => (
                <button
                    key={opt.value}
                    data-segment-btn
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={`relative z-10 flex items-center gap-1.5 rounded-md font-semibold uppercase tracking-[0.08em] transition-colors duration-150 ${pad} ${opt.value === value ? "inv-segment-active" : "inv-segment-inactive"
                        }`}
                >
                    {opt.icon}
                    {opt.label}
                </button>
            ))}
        </div>
    )
}

/* ─── Chip Button ─── */
function FilterChip({
    label,
    active,
    count,
    icon,
    onClick,
}: {
    label: string
    active: boolean
    count?: number
    icon: React.ReactNode
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inv-chip group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all duration-150 ${active ? "inv-chip-active" : "inv-chip-idle"
                }`}
        >
            <span className="inv-chip-icon flex-shrink-0">{icon}</span>
            <span>{label}</span>
            {count !== undefined && count > 0 && (
                <span className="inv-chip-badge ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none">
                    {count}
                </span>
            )}
        </button>
    )
}

/* ─── Dropdown Panel ─── */
function DropdownPanel({
    open,
    onClose,
    anchorRef,
    children,
}: {
    open: boolean
    onClose: () => void
    anchorRef: React.RefObject<HTMLElement | null>
    children: React.ReactNode
}) {
    const panelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node) && anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
                onClose()
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [open, onClose, anchorRef])

    if (!open) return null

    return (
        <div
            ref={panelRef}
            className="inv-dropdown absolute top-full left-0 z-50 mt-2 min-w-[240px] rounded-xl border p-3 shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150"
        >
            {children}
        </div>
    )
}

export function FilterBar({
    searchTerm,
    onSearchChange,
    isBulkEditMode,
    bulkSelectionCount,
    onBulkModeToggle,
    groupBy,
    onGroupByChange,
    sizeView,
    onSizeViewChange,
    productCategories,
    productBrands,
    categoryFilterIds,
    brandFilterId,
    onCategoryFilterToggle,
    onBrandFilterChange,
    onClearAllFilters,
}: FilterBarProps) {
    const [catOpen, setCatOpen] = useState(false)
    const [brandOpen, setBrandOpen] = useState(false)
    const catAnchorRef = useRef<HTMLDivElement>(null)
    const brandAnchorRef = useRef<HTMLDivElement>(null)

    const hasActiveFilters = categoryFilterIds.length > 0 || brandFilterId !== null

    return (
        <div className="inv-filter-bar mb-6 space-y-3">
            {/* ─── Row 1: Search + Bulk Toggle ─── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search */}
                <div className="inv-search-box relative flex flex-1 items-center rounded-xl">
                    <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search products, variants, SKUs…"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="inv-search-input h-10 w-full rounded-xl pl-10 pr-9 text-sm font-medium bg-transparent outline-none placeholder:text-muted-foreground/60"
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

                {/* Bulk edit toggle */}
                <label
                    htmlFor="inv-bulk-toggle"
                    className={`inv-bulk-toggle flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-150 ${isBulkEditMode ? "inv-bulk-active" : ""
                        }`}
                >
                    <Checkbox
                        id="inv-bulk-toggle"
                        checked={isBulkEditMode}
                        onCheckedChange={onBulkModeToggle}
                        className="border-border/60 data-[state=checked]:bg-foreground data-[state=checked]:text-background"
                    />
                    <div className="flex flex-col leading-tight">
                        <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-foreground">
                            Select Variants
                        </span>
                        <span className="text-[11px] font-normal text-muted-foreground">
                            {isBulkEditMode ? `${bulkSelectionCount} selected` : "Bulk edit mode"}
                        </span>
                    </div>
                </label>
            </div>

            {/* ─── Row 2: Controls ─── */}
            <div className="inv-controls-row flex flex-wrap items-center gap-2">
                {/* Group by */}
                <SegmentedControl<GroupByMode>
                    value={groupBy}
                    onChange={onGroupByChange}
                    options={[
                        { value: "product", label: "Product", icon: <Layers className="h-3.5 w-3.5" /> },
                        { value: "category", label: "Category", icon: <Tag className="h-3.5 w-3.5" /> },
                        { value: "brand", label: "Brand", icon: <Bookmark className="h-3.5 w-3.5" /> },
                    ]}
                />

                <div className="inv-divider mx-1 h-5 w-px" />

                {/* Category filter chip + dropdown */}
                <div className="relative" ref={catAnchorRef}>
                    <FilterChip
                        label="Categories"
                        active={categoryFilterIds.length > 0}
                        count={categoryFilterIds.length}
                        icon={<Tag className="h-3.5 w-3.5" />}
                        onClick={() => { setCatOpen((p) => !p); setBrandOpen(false) }}
                    />
                    <DropdownPanel open={catOpen} onClose={() => setCatOpen(false)} anchorRef={catAnchorRef}>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                            Filter by category
                        </p>
                        {productCategories.length === 0 ? (
                            <p className="py-2 text-xs text-muted-foreground">No categories yet.</p>
                        ) : (
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                                {productCategories.map((cat) => {
                                    const checked = categoryFilterIds.includes(cat.id)
                                    return (
                                        <label
                                            key={cat.id}
                                            className={`inv-dropdown-item flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition ${checked ? "inv-dropdown-item-active" : ""
                                                }`}
                                        >
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={(v) => onCategoryFilterToggle(cat.id, Boolean(v))}
                                                className="border-border/60 data-[state=checked]:bg-foreground data-[state=checked]:text-background"
                                            />
                                            {cat.name}
                                        </label>
                                    )
                                })}
                            </div>
                        )}
                        {categoryFilterIds.length > 0 && (
                            <button
                                type="button"
                                onClick={() => { onClearAllFilters(); setCatOpen(false) }}
                                className="mt-2 w-full rounded-lg py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground transition hover:text-foreground hover:bg-muted"
                            >
                                Clear all
                            </button>
                        )}
                    </DropdownPanel>
                </div>

                {/* Brand filter chip + dropdown */}
                <div className="relative" ref={brandAnchorRef}>
                    <FilterChip
                        label={brandFilterId !== null ? (productBrands.find((b) => b.id === brandFilterId)?.name ?? "Brand") : "Brands"}
                        active={brandFilterId !== null}
                        icon={<Bookmark className="h-3.5 w-3.5" />}
                        onClick={() => { setBrandOpen((p) => !p); setCatOpen(false) }}
                    />
                    <DropdownPanel open={brandOpen} onClose={() => setBrandOpen(false)} anchorRef={brandAnchorRef}>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                            Filter by brand
                        </p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                            <button
                                type="button"
                                onClick={() => { onBrandFilterChange(null); setBrandOpen(false) }}
                                className={`inv-dropdown-item flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition ${brandFilterId === null ? "inv-dropdown-item-active" : ""
                                    }`}
                            >
                                All brands
                            </button>
                            {productBrands.map((brand) => (
                                <button
                                    key={brand.id}
                                    type="button"
                                    onClick={() => { onBrandFilterChange(brand.id); setBrandOpen(false) }}
                                    className={`inv-dropdown-item flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition ${brandFilterId === brand.id ? "inv-dropdown-item-active" : ""
                                        }`}
                                >
                                    {brand.name}
                                </button>
                            ))}
                        </div>
                    </DropdownPanel>
                </div>

                {/* Clear filters */}
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClearAllFilters}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-destructive transition hover:bg-destructive/10"
                    >
                        <X className="h-3 w-3" />
                        Clear
                    </button>
                )}

                {/* Size view */}
                <div className="ml-auto">
                    <SegmentedControl<SizeViewMode>
                        value={sizeView}
                        onChange={onSizeViewChange}
                        options={[
                            { value: "compact", label: "Compact", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
                            { value: "expanded", label: "Expanded", icon: <LayoutList className="h-3.5 w-3.5" /> },
                        ]}
                    />
                </div>
            </div>
        </div>
    )
}
