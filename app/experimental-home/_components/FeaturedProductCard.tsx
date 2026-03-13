"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Minus, Plus } from "lucide-react"
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

interface FeaturedProductCardProps {
    variant: CatalogVariant
    onAddToCart: (item: AddToCartPayload) => void
    isSpotlight?: boolean
    isCompact?: boolean
}

export default function FeaturedProductCard({ variant, onAddToCart, isSpotlight, isCompact }: FeaturedProductCardProps) {
    const [hovered, setHovered] = useState(false)
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
        if (selectedSize) {
            return formatCurrency(selectedSize.price)
        }
        if (variant.minPrice === variant.maxPrice) {
            return formatCurrency(variant.minPrice)
        }
        return `${formatCurrency(variant.minPrice)} - ${formatCurrency(variant.maxPrice)}`
    }, [variant.maxPrice, variant.minPrice, selectedSize])

    const discountedPriceLabel = useMemo(() => {
        if (!hasDiscount) return null
        if (selectedSize) {
            return formatCurrency(selectedSize.price * discountMultiplier)
        }
        const min = variant.minPrice * discountMultiplier
        const max = variant.maxPrice * discountMultiplier
        if (Math.abs(min - max) < 0.01) {
            return formatCurrency(min)
        }
        return `${formatCurrency(min)} - ${formatCurrency(max)}`
    }, [discountMultiplier, hasDiscount, variant.maxPrice, variant.minPrice, selectedSize])

    const discountLabel = useMemo(() => {
        if (!hasDiscount || typeof discountPercent !== "number") return null
        const formatted = Number.isInteger(discountPercent) ? discountPercent.toString() : discountPercent.toFixed(1)
        return `${formatted}% OFF`
    }, [discountPercent, hasDiscount])

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
        <article
            className={cn(
                "group relative w-full rounded-[2.5rem] overflow-hidden isolate transform-gpu shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.2)] transition-all duration-700 ease-out border border-white/10 z-10",
                isSpotlight ? "aspect-auto h-full min-h-[400px]" : "aspect-[3/4]",
                isCompact && "rounded-2xl"
            )}
            style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                clipPath: `inset(0 round ${isCompact ? '1rem' : '2.5rem'})`,
                WebkitClipPath: `inset(0 round ${isCompact ? '1rem' : '2.5rem'})`,
                WebkitMaskImage: '-webkit-radial-gradient(white, black)'
            } as React.CSSProperties}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Full Bleed Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={variant.image}
                    alt={variant.displayName}
                    className={cn(
                        "h-full w-full object-cover transition-transform duration-1000 ease-out",
                        hovered ? "scale-110" : "scale-100",
                    )}
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Content Container */}
            <div className={cn(
                "relative z-10 h-full flex flex-col justify-end text-white",
                isCompact ? "p-4" : "p-8"
            )}>
                <Link href={variant.detailPath} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 mb-4 text-left group-hover:scale-[1.02] transition-transform duration-500">
                    {/* Badges */}
                    <div className="absolute top-6 left-6 lg:top-10 lg:left-10 flex flex-col gap-2 pointer-events-none">
                        {isSpotlight && (
                            <span className="bg-primary/20 backdrop-blur-xl text-primary border border-primary/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-2">
                                Seasonal Highlight
                            </span>
                        )}
                        {isOutOfStock && (
                            <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full w-fit">
                                Sold Out
                            </span>
                        )}
                        {discountLabel && (
                            <span className="bg-primary/90 text-primary-foreground backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full w-fit">
                                {discountLabel}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 mb-2 lg:mb-4">
                        {variant.variantLabel && variant.variantLabel !== "Default" && (
                            <span className="self-start bg-white/10 backdrop-blur-md text-white/80 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-white/20">
                                {variant.variantLabel}
                            </span>
                        )}
                        <h3 className={cn(
                            "font-black tracking-tight leading-[0.9] drop-shadow-md uppercase",
                            isSpotlight ? "text-4xl md:text-6xl lg:text-7xl" : isCompact ? "text-sm" : "text-2xl"
                        )}>
                            {variant.productName}
                        </h3>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                        {discountedPriceLabel ? (
                            <div className="flex items-center gap-2">
                                <span className={cn("font-black text-white", isSpotlight ? "text-3xl" : isCompact ? "text-xs" : "text-xl")}>{discountedPriceLabel}</span>
                                {!isCompact && <span className="text-sm text-white/50 line-through font-semibold">{basePriceLabel}</span>}
                            </div>
                        ) : (
                            <span className={cn("font-black text-white", isSpotlight ? "text-3xl" : isCompact ? "text-xs" : "text-xl")}>{basePriceLabel}</span>
                        )}
                    </div>
                </Link>

                {/* Size Selection */}
                {variant.sizes.length > 1 && variant.sizes[0].label !== "Default" && (
                    <div className={cn(
                        "transition-all duration-500 mb-4",
                        isCompact ? "flex gap-1 overflow-x-auto no-scrollbar" : "flex flex-wrap gap-2",
                        hovered || isSpotlight ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none lg:opacity-100 lg:translate-y-0 lg:pointer-events-auto"
                    )}>
                        {variant.sizes.map((size, idx) => {
                            const isSelected = selectedSizeIndex === idx
                            const isSizeOutOfStock = !isPreorder && size.stock <= 0
                            return (
                                <button
                                    key={size.label}
                                    disabled={isSizeOutOfStock}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedSizeIndex(idx); }}
                                    className={cn(
                                        "transition-all duration-300 rounded-full font-black uppercase tracking-widest flex items-center justify-center border-2",
                                        isCompact ? "h-6 px-2 text-[8px]" : "h-9 px-4 text-[10px]",
                                        isSelected
                                            ? "bg-white text-black border-white shadow-lg shadow-white/20"
                                            : "bg-white/10 text-white border-white/20 hover:border-white/50",
                                        isSizeOutOfStock && "opacity-20 cursor-not-allowed strike-through"
                                    )}
                                >
                                    {size.label}
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* Action Row - slides up on hover for a cleaner look */}
                <div className={cn(
                    "flex flex-col gap-4 transition-all duration-500 transform",
                    hovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 lg:opacity-100 lg:translate-y-0"
                )}>
                    <div className="flex items-center justify-between gap-4">
                        {/* Quantity Selector */}
                        <div className={cn(
                            "flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full",
                            isCompact ? "gap-2 px-2 py-1" : "gap-4 px-4 py-2"
                        )}>
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity(Math.max(1, quantity - 1)) }}
                                className="text-white/70 hover:text-white transition-colors outline-none"
                            >
                                <Minus className={isCompact ? "size-2.5" : "size-3.5"} strokeWidth={3} />
                            </button>
                            <span className={cn("text-center text-white font-black", isCompact ? "w-3 text-xs" : "w-4 text-sm")}>{quantity}</span>
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity(quantity + 1) }}
                                className="text-white/70 hover:text-white transition-colors outline-none"
                            >
                                <Plus className={isCompact ? "size-2.5" : "size-3.5"} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className={cn(
                                "flex-1 bg-white hover:bg-white/90 text-black shadow-xl transition-all rounded-full font-black uppercase tracking-widest",
                                isCompact ? "py-2 px-3 text-[8px]" : "py-3.5 px-6 text-[10px]",
                                isOutOfStock && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {isOutOfStock ? "Sold Out" : "Add"}
                        </button>
                    </div>
                </div>
            </div>
        </article>
    )
}
