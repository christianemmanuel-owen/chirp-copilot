"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { MoreVertical, Package, ChevronDown, ChevronRight } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"
import {
    DEFAULT_SIZE_KEY,
    PLACEHOLDER_IMAGE,
    type GroupByMode,
    type InventoryTableProps,
    type ProductGroup,
    type SizeViewMode,
    type VariantSizeEntry,
    type VariantTableRow,
} from "./types"
import type { Product } from "@/lib/types"

/* ─── Helpers ─── */

function normalizeSizeKey(value?: string | null) {
    const trimmed = (value ?? "").trim()
    return trimmed.length > 0 ? trimmed : DEFAULT_SIZE_KEY
}

function getSizeLabelFromKey(key: string) {
    return key === DEFAULT_SIZE_KEY ? "Default" : key
}

function getVariantSizeEntries(variant: Product["variants"][number]): VariantSizeEntry[] {
    const baseEntries =
        variant.sizes && variant.sizes.length > 0
            ? variant.sizes
            : [
                {
                    size: variant.size ?? "",
                    price: variant.price,
                    stock: variant.stock,
                },
            ]

    return baseEntries.map((entry) => {
        const value = normalizeSizeKey(entry.size)
        const trimmedSize = (entry.size ?? "").trim()
        return {
            value,
            label: getSizeLabelFromKey(value),
            price: Number(entry.price),
            stock: Number(entry.stock),
            size: value === DEFAULT_SIZE_KEY ? null : trimmedSize || null,
        }
    })
}

function buildGroups(
    products: Product[],
    filteredProducts: Product[],
    groupBy: GroupByMode,
): ProductGroup[] {
    if (groupBy === "product") {
        return filteredProducts.map((product) => ({
            key: `product-${product.id}`,
            label: product.brand ? `${product.brand.name} ${product.name}` : product.name,
            product,
            rows: product.variants.map((variant) => ({
                product,
                variant,
                sizeEntries: getVariantSizeEntries(variant),
            })),
        }))
    }

    if (groupBy === "category") {
        const categoryMap = new Map<string, { id: number | null; name: string; rows: VariantTableRow[] }>()
        const uncategorizedKey = "__uncategorized__"

        for (const product of filteredProducts) {
            const variantRows = product.variants.map((variant) => ({
                product,
                variant,
                sizeEntries: getVariantSizeEntries(variant),
            }))

            if (product.categories.length === 0) {
                const existing = categoryMap.get(uncategorizedKey)
                if (existing) {
                    existing.rows.push(...variantRows)
                } else {
                    categoryMap.set(uncategorizedKey, { id: null, name: "Uncategorized", rows: [...variantRows] })
                }
            } else {
                for (const category of product.categories) {
                    const key = `category-${category.id}`
                    const existing = categoryMap.get(key)
                    if (existing) {
                        existing.rows.push(...variantRows)
                    } else {
                        categoryMap.set(key, { id: category.id, name: category.name, rows: [...variantRows] })
                    }
                }
            }
        }

        return Array.from(categoryMap.entries()).map(([key, { name, rows }]) => ({
            key,
            label: name,
            product: null,
            rows,
        }))
    }

    // groupBy === "brand"
    const brandMap = new Map<string, { name: string; rows: VariantTableRow[] }>()
    const unbrandedKey = "__unbranded__"

    for (const product of filteredProducts) {
        const variantRows = product.variants.map((variant) => ({
            product,
            variant,
            sizeEntries: getVariantSizeEntries(variant),
        }))

        const brandKey = product.brand ? `brand-${product.brand.id}` : unbrandedKey
        const brandName = product.brand ? product.brand.name : "Unbranded"
        const existing = brandMap.get(brandKey)
        if (existing) {
            existing.rows.push(...variantRows)
        } else {
            brandMap.set(brandKey, { name: brandName, rows: [...variantRows] })
        }
    }

    return Array.from(brandMap.entries()).map(([key, { name, rows }]) => ({
        key,
        label: name,
        product: null,
        rows,
    }))
}

/* ─── Inline Edit Cell ─── */

function InlineEditCell({
    value,
    field,
    onSave,
    disabled,
    isPreorder,
}: {
    value: number
    field: "price" | "stock"
    onSave: (newValue: number) => Promise<void>
    disabled?: boolean
    isPreorder?: boolean
}) {
    const [editing, setEditing] = useState(false)
    const [editValue, setEditValue] = useState("")
    const [saving, setSaving] = useState(false)

    if (isPreorder && field === "stock") {
        return <span className="text-muted-foreground text-xs">—</span>
    }

    const commitEdit = async () => {
        const numValue = Number(editValue)
        if (Number.isFinite(numValue) && numValue >= 0 && numValue !== value) {
            setSaving(true)
            try {
                await onSave(numValue)
            } catch {
                // revert silently
            } finally {
                setSaving(false)
            }
        }
        setEditing(false)
    }

    if (editing) {
        return (
            <input
                type="number"
                min="0"
                step={field === "price" ? "0.01" : "1"}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); commitEdit() }
                    if (e.key === "Escape") setEditing(false)
                }}
                autoFocus
                className="inv-table-edit-input"
                disabled={saving || disabled}
            />
        )
    }

    const displayValue = field === "price" ? formatCurrency(value) : value

    return (
        <button
            type="button"
            className="inv-table-editable"
            onClick={() => { setEditValue(String(value)); setEditing(true) }}
            disabled={disabled}
            title={`Click to edit ${field}`}
        >
            {displayValue}
        </button>
    )
}

/* ─── Status Badge ─── */

function StatusBadge({ variant }: { variant: Product["variants"][number] }) {
    const isPreorder = Boolean(variant.isPreorder)
    const isInactive = variant.isActive === false

    if (isInactive) {
        return <span className="inv-table-badge inv-table-badge-hidden">Hidden</span>
    }
    if (isPreorder) {
        return <span className="inv-table-badge inv-table-badge-preorder">Pre-order</span>
    }

    const totalStock = variant.sizes && variant.sizes.length > 0
        ? variant.sizes.reduce((sum, s) => sum + Number(s.stock), 0)
        : variant.stock

    if (totalStock <= 0) {
        return <span className="inv-table-badge inv-table-badge-out">Out</span>
    }
    if (totalStock <= 5) {
        return <span className="inv-table-badge inv-table-badge-low">Low</span>
    }
    return <span className="inv-table-badge inv-table-badge-instock">In Stock</span>
}

/* ─── Main Table ─── */

export function InventoryTable({
    products,
    filteredProducts,
    groupBy,
    sizeView,
    isBulkEditMode,
    bulkSelection,
    onBulkSelectionToggle,
    onEditProduct,
    onDeleteProduct,
    onAddVariant,
    onEditVariant,
    selectedVariantSizes,
    onSelectedVariantSizeChange,
    onInlineEdit,
}: InventoryTableProps) {
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

    const groups = useMemo(
        () => buildGroups(products, filteredProducts, groupBy),
        [products, filteredProducts, groupBy],
    )

    const toggleGroupCollapse = (key: string) => {
        setCollapsedGroups((prev) => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }

    if (products.length === 0) {
        return (
            <div className="inv-table-empty space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Package className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">No products yet</h2>
                    <p className="text-sm text-muted-foreground">
                        Add your first product to start tracking inventory by variant and size.
                    </p>
                </div>
            </div>
        )
    }

    if (filteredProducts.length === 0) {
        return (
            <div className="inv-table-empty">
                <p className="text-muted-foreground">No products match your search.</p>
            </div>
        )
    }

    const colCount = isBulkEditMode ? 9 : 8
    const extraProductCol = groupBy !== "product" ? 1 : 0

    return (
        <div className="inv-table-wrap">
            <div className="overflow-x-auto">
                <table className="inv-table-root">
                    <thead className="inv-table-head">
                        <tr>
                            {isBulkEditMode && <th className="inv-table-th w-10" />}
                            <th className="inv-table-th w-14 text-left">Image</th>
                            {groupBy !== "product" && (
                                <th className="inv-table-th text-left">Product</th>
                            )}
                            <th className="inv-table-th text-left">Variant</th>
                            <th className="inv-table-th text-left">SKU</th>
                            <th className="inv-table-th text-left">Size</th>
                            <th className="inv-table-th text-right">Price</th>
                            <th className="inv-table-th text-right">Stock</th>
                            <th className="inv-table-th text-center">Status</th>
                            <th className="inv-table-th w-12" />
                        </tr>
                    </thead>
                    <tbody>
                        {groups.map((group) => {
                            const isCollapsed = collapsedGroups.has(group.key)

                            const uniqueProducts = new Map<number, Product>()
                            for (const row of group.rows) {
                                if (!uniqueProducts.has(row.product.id)) {
                                    uniqueProducts.set(row.product.id, row.product)
                                }
                            }

                            return (
                                <GroupSection
                                    key={group.key}
                                    group={group}
                                    groupBy={groupBy}
                                    sizeView={sizeView}
                                    isCollapsed={isCollapsed}
                                    onToggleCollapse={() => toggleGroupCollapse(group.key)}
                                    isBulkEditMode={isBulkEditMode}
                                    bulkSelection={bulkSelection}
                                    onBulkSelectionToggle={onBulkSelectionToggle}
                                    colCount={colCount}
                                    extraProductCol={extraProductCol}
                                    onEditProduct={onEditProduct}
                                    onDeleteProduct={onDeleteProduct}
                                    onAddVariant={onAddVariant}
                                    onEditVariant={onEditVariant}
                                    selectedVariantSizes={selectedVariantSizes}
                                    onSelectedVariantSizeChange={onSelectedVariantSizeChange}
                                    onInlineEdit={onInlineEdit}
                                    uniqueProducts={Array.from(uniqueProducts.values())}
                                />
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

/* ─── Group Section ─── */

function GroupSection({
    group,
    groupBy,
    sizeView,
    isCollapsed,
    onToggleCollapse,
    isBulkEditMode,
    bulkSelection,
    onBulkSelectionToggle,
    colCount,
    extraProductCol,
    onEditProduct,
    onDeleteProduct,
    onAddVariant,
    onEditVariant,
    selectedVariantSizes,
    onSelectedVariantSizeChange,
    onInlineEdit,
    uniqueProducts,
}: {
    group: ProductGroup
    groupBy: GroupByMode
    sizeView: SizeViewMode
    isCollapsed: boolean
    onToggleCollapse: () => void
    isBulkEditMode: boolean
    bulkSelection: Set<number>
    onBulkSelectionToggle: (variantId: number, isChecked: boolean) => void
    colCount: number
    extraProductCol: number
    onEditProduct: (product: Product) => void
    onDeleteProduct: (product: Product) => void
    onAddVariant: (product: Product) => void
    onEditVariant: (product: Product, variant: Product["variants"][number]) => void
    selectedVariantSizes: Record<number, string>
    onSelectedVariantSizeChange: (variantId: number, value: string) => void
    onInlineEdit: (
        productId: number,
        variantId: number,
        sizeValue: string,
        field: "price" | "stock",
        newValue: number,
    ) => Promise<void>
    uniqueProducts: Product[]
}) {
    return (
        <>
            {/* Group header */}
            <tr className="inv-table-group-header">
                <td colSpan={colCount + extraProductCol}>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="inv-table-group-toggle"
                            onClick={onToggleCollapse}
                        >
                            {isCollapsed ? (
                                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                            ) : (
                                <ChevronDown className="h-4 w-4 flex-shrink-0" />
                            )}
                            {group.product && (
                                <div className="inv-table-group-thumb">
                                    <Image
                                        src={group.product.image || PLACEHOLDER_IMAGE}
                                        alt={group.label}
                                        width={28}
                                        height={28}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            )}
                            <span>{group.label}</span>
                        </button>
                        <span className="inv-table-group-count">
                            {group.rows.length}
                        </span>

                        {/* Product group header actions */}
                        {groupBy === "product" && group.product && (
                            <div className="ml-auto">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="inv-table-action-btn"
                                            aria-label="Product actions"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44">
                                        <DropdownMenuItem onSelect={() => onAddVariant(group.product!)}>
                                            Add Variant
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => onEditProduct(group.product!)}>
                                            Edit Product
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onSelect={() => onDeleteProduct(group.product!)}
                                        >
                                            Delete Product
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </div>
                </td>
            </tr>

            {/* Variant rows */}
            {!isCollapsed && (
                <>
                    {group.rows.map((row) => (
                        <VariantRow
                            key={`${group.key}-${row.variant.id}`}
                            row={row}
                            groupBy={groupBy}
                            sizeView={sizeView}
                            isBulkEditMode={isBulkEditMode}
                            bulkSelection={bulkSelection}
                            onBulkSelectionToggle={onBulkSelectionToggle}
                            onAddVariant={onAddVariant}
                            onEditVariant={onEditVariant}
                            selectedVariantSizes={selectedVariantSizes}
                            onSelectedVariantSizeChange={onSelectedVariantSizeChange}
                            onInlineEdit={onInlineEdit}
                        />
                    ))}
                </>
            )}
        </>
    )
}

/* ─── Variant Row ─── */

function VariantRow({
    row,
    groupBy,
    sizeView,
    isBulkEditMode,
    bulkSelection,
    onBulkSelectionToggle,
    onAddVariant,
    onEditVariant,
    selectedVariantSizes,
    onSelectedVariantSizeChange,
    onInlineEdit,
}: {
    row: VariantTableRow
    groupBy: GroupByMode
    sizeView: SizeViewMode
    isBulkEditMode: boolean
    bulkSelection: Set<number>
    onBulkSelectionToggle: (variantId: number, isChecked: boolean) => void
    onAddVariant: (product: Product) => void
    onEditVariant: (product: Product, variant: Product["variants"][number]) => void
    selectedVariantSizes: Record<number, string>
    onSelectedVariantSizeChange: (variantId: number, value: string) => void
    onInlineEdit: (
        productId: number,
        variantId: number,
        sizeValue: string,
        field: "price" | "stock",
        newValue: number,
    ) => Promise<void>
}) {
    const { product, variant, sizeEntries } = row
    const isPreorder = Boolean(variant.isPreorder)

    // Expanded mode: one row per size
    if (sizeView === "expanded" && sizeEntries.length > 1) {
        return (
            <>
                {sizeEntries.map((entry, index) => (
                    <tr key={`${variant.id}-${entry.value}`} className="inv-table-row">
                        {isBulkEditMode && (
                            <td className="text-center">
                                {index === 0 && (
                                    <Checkbox
                                        checked={bulkSelection.has(variant.id)}
                                        onCheckedChange={(checked) => onBulkSelectionToggle(variant.id, checked === true)}
                                        aria-label="Select variant for bulk edit"
                                        className="border-border data-[state=checked]:bg-foreground"
                                    />
                                )}
                            </td>
                        )}
                        <td>
                            {index === 0 && (
                                <div className="inv-table-img">
                                    <img
                                        src={variant.image ?? product.image ?? PLACEHOLDER_IMAGE}
                                        alt={`${product.name} variant`}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE
                                        }}
                                    />
                                </div>
                            )}
                        </td>
                        {groupBy !== "product" && (
                            <td className="text-xs">
                                {index === 0 ? (product.brand ? `${product.brand.name} ${product.name}` : product.name) : ""}
                            </td>
                        )}
                        <td className="text-xs">{index === 0 ? (variant.color ?? "—") : ""}</td>
                        <td className="text-xs text-muted-foreground">{index === 0 ? (variant.sku ?? "—") : ""}</td>
                        <td>
                            <span className="text-xs font-medium">{entry.label}</span>
                        </td>
                        <td className="text-right">
                            <InlineEditCell
                                value={entry.price}
                                field="price"
                                onSave={(newValue) => onInlineEdit(product.id, variant.id, entry.value, "price", newValue)}
                                isPreorder={false}
                            />
                        </td>
                        <td className="text-right">
                            <InlineEditCell
                                value={entry.stock}
                                field="stock"
                                onSave={(newValue) => onInlineEdit(product.id, variant.id, entry.value, "stock", newValue)}
                                isPreorder={isPreorder}
                            />
                        </td>
                        <td className="text-center">
                            {index === 0 && <StatusBadge variant={variant} />}
                        </td>
                        <td className="text-right">
                            {index === 0 && !isBulkEditMode && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button type="button" className="inv-table-action-btn" aria-label="Variant actions">
                                            <MoreVertical className="w-3.5 h-3.5" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44">
                                        <DropdownMenuItem onSelect={() => onEditVariant(product, variant)}>Edit Variant</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => onAddVariant(product)}>Add Variant</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </td>
                    </tr>
                ))}
            </>
        )
    }

    // Compact mode: single row with size selector
    const activeEntry =
        sizeEntries.find((entry) => entry.value === selectedVariantSizes[variant.id]) ??
        sizeEntries[0] ??
        null
    const currentValue = activeEntry ? activeEntry.value : sizeEntries[0]?.value ?? DEFAULT_SIZE_KEY
    const activePrice = activeEntry ? activeEntry.price : variant.price
    const activeStock = activeEntry ? activeEntry.stock : variant.stock

    return (
        <tr className="inv-table-row">
            {isBulkEditMode && (
                <td className="text-center">
                    <Checkbox
                        checked={bulkSelection.has(variant.id)}
                        onCheckedChange={(checked) => onBulkSelectionToggle(variant.id, checked === true)}
                        aria-label="Select variant for bulk edit"
                        className="border-border data-[state=checked]:bg-foreground"
                    />
                </td>
            )}
            <td>
                <div className="inv-table-img">
                    <img
                        src={variant.image ?? product.image ?? PLACEHOLDER_IMAGE}
                        alt={`${product.name} variant`}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE
                        }}
                    />
                </div>
            </td>
            {groupBy !== "product" && (
                <td className="text-xs">
                    {product.brand ? `${product.brand.name} ${product.name}` : product.name}
                </td>
            )}
            <td className="text-xs">{variant.color ?? "—"}</td>
            <td className="text-xs text-muted-foreground">{variant.sku ?? "—"}</td>
            <td>
                {sizeEntries.length > 1 ? (
                    <Select
                        value={currentValue}
                        onValueChange={(value) => onSelectedVariantSizeChange(variant.id, value)}
                    >
                        <SelectTrigger className="h-7 min-w-[7rem] text-xs border-border/60">
                            <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                            {sizeEntries.map((entry) => (
                                <SelectItem key={`${variant.id}-${entry.value}`} value={entry.value}>
                                    {entry.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <span className="text-xs font-medium">
                        {sizeEntries[0]?.label ?? (variant.size?.trim().length ? variant.size : "Default")}
                    </span>
                )}
            </td>
            <td className="text-right">
                <InlineEditCell
                    value={activePrice}
                    field="price"
                    onSave={(newValue) => onInlineEdit(product.id, variant.id, currentValue, "price", newValue)}
                    isPreorder={false}
                />
            </td>
            <td className="text-right">
                <InlineEditCell
                    value={activeStock}
                    field="stock"
                    onSave={(newValue) => onInlineEdit(product.id, variant.id, currentValue, "stock", newValue)}
                    isPreorder={isPreorder}
                />
            </td>
            <td className="text-center">
                <StatusBadge variant={variant} />
            </td>
            <td className="text-right">
                {isBulkEditMode ? null : (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button type="button" className="inv-table-action-btn" aria-label="Variant actions">
                                <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onSelect={() => onEditVariant(product, variant)}>Edit Variant</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onAddVariant(product)}>Add Variant</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </td>
        </tr>
    )
}
