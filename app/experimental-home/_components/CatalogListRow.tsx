"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import type { CatalogVariant } from "@/lib/storefront-data"

interface AddToCartPayload {
    variantId: number
    productId: number
    name: string
    image: string
    size: string | null
    price: number
    quantity: number
    brandName: string | null
}

interface CatalogListRowProps {
    variant: CatalogVariant
    onAddToCart: (item: AddToCartPayload) => void
}

export default function CatalogListRow({ variant, onAddToCart }: CatalogListRowProps) {
    const [quantity, setQuantity] = useState(1)
    const [selectedSizeIndex, setSelectedSizeIndex] = useState(() => {
        const firstInStock = variant.sizes.findIndex(s => s.stock > 0)
        return firstInStock !== -1 ? firstInStock : 0
    })
    const isPreorder = Boolean(variant.isPreorder)

    const discountPercent = variant.discountPercent ?? null
    const hasDiscount = typeof discountPercent === "number" && discountPercent > 0
    const discountMultiplier = useMemo(
        () => (hasDiscount ? Math.max(0, 1 - (discountPercent ?? 0) / 100) : 1),
        [discountPercent, hasDiscount],
    )

    const selectedSize = variant.sizes[selectedSizeIndex]

    const basePriceLabel = useMemo(() => {
        if (selectedSize) return formatCurrency(selectedSize.price)
        if (variant.minPrice === variant.maxPrice) return formatCurrency(variant.minPrice)
        return `${formatCurrency(variant.minPrice)} - ${formatCurrency(variant.maxPrice)}`
    }, [variant.maxPrice, variant.minPrice, selectedSize])

    const discountedPriceLabel = useMemo(() => {
        if (!hasDiscount) return null
        if (selectedSize) return formatCurrency(selectedSize.price * discountMultiplier)
        const min = variant.minPrice * discountMultiplier
        const max = variant.maxPrice * discountMultiplier
        if (Math.abs(min - max) < 0.01) return formatCurrency(min)
        return `${formatCurrency(min)} - ${formatCurrency(max)}`
    }, [discountMultiplier, hasDiscount, variant.maxPrice, variant.minPrice, selectedSize])

    const isOutOfStock = !isPreorder && (variant.totalStock ?? 0) <= 0

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!selectedSize || isOutOfStock) return

        onAddToCart({
            variantId: variant.id,
            productId: variant.productId,
            name: variant.displayName,
            image: variant.image,
            size: selectedSize.label === "Default" ? null : selectedSize.label,
            price: hasDiscount ? Number((selectedSize.price * discountMultiplier).toFixed(2)) : selectedSize.price,
            quantity: quantity,
            brandName: variant.brandName,
        })
        setQuantity(1)
    }

    return (
        <div className="group relative w-full bg-white/5 backdrop-blur-sm border border-border/50 hover:border-primary/50 rounded-3xl p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Image Section */}
                <div className="relative w-full md:w-32 lg:w-48 aspect-square rounded-2xl overflow-hidden shrink-0">
                    <img
                        src={variant.image}
                        alt={variant.displayName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {hasDiscount && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-full">
                            {discountPercent}% OFF
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="space-y-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight text-foreground leading-tight">
                                    {variant.productName}
                                </h3>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                    {variant.brandName || "Premium Collection"}
                                </p>
                            </div>
                            <div className="text-right">
                                {discountedPriceLabel ? (
                                    <div className="flex flex-col items-end">
                                        <span className="text-xl font-black text-primary leading-none">{discountedPriceLabel}</span>
                                        <span className="text-[10px] text-muted-foreground line-through font-bold">{basePriceLabel}</span>
                                    </div>
                                ) : (
                                    <span className="text-xl font-black text-foreground leading-none">{basePriceLabel}</span>
                                )}
                            </div>
                        </div>

                        {/* Description (Optional/Short) */}
                        {variant.description && (
                            <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed max-w-xl">
                                {variant.description}
                            </p>
                        )}
                    </div>

                    {/* Controls & Selection */}
                    <div className="flex flex-wrap items-center gap-6 mt-4">
                        {/* Size Selection */}
                        {variant.sizes.length > 1 && variant.sizes[0].label !== "Default" && (
                            <div className="flex flex-wrap gap-1.5">
                                {variant.sizes.map((size, idx) => {
                                    const isSelected = selectedSizeIndex === idx
                                    const isSizeOutOfStock = !isPreorder && size.stock <= 0
                                    return (
                                        <button
                                            key={size.label}
                                            disabled={isSizeOutOfStock}
                                            onClick={() => setSelectedSizeIndex(idx)}
                                            className={cn(
                                                "h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all duration-200",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                    : "bg-muted/50 text-muted-foreground border-border/50 hover:border-primary/50",
                                                isSizeOutOfStock && "opacity-20 cursor-not-allowed strike-through"
                                            )}
                                        >
                                            {size.label}
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        <div className="flex items-center gap-4 ml-auto">
                            {/* Quantity */}
                            <div className="flex items-center bg-muted/50 rounded-full h-10 px-4 border border-border/50">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <Minus className="size-3" strokeWidth={3} />
                                </button>
                                <span className="w-8 text-center text-xs font-black">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <Plus className="size-3" strokeWidth={3} />
                                </button>
                            </div>

                            {/* Add Button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className={cn(
                                    "h-10 px-6 rounded-full font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2",
                                    isOutOfStock
                                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                                        : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95"
                                )}
                            >
                                <ShoppingCart className="size-3.5" />
                                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
