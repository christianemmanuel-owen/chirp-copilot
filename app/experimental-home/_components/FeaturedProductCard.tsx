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
}

export default function FeaturedProductCard({ variant, onAddToCart, isSpotlight }: FeaturedProductCardProps) {
    const [hovered, setHovered] = useState(false)
    const [quantity, setQuantity] = useState(1)
    const isPreorder = Boolean(variant.isPreorder)

    const discountPercent = variant.discountPercent ?? null
    const hasDiscount = typeof discountPercent === "number" && discountPercent > 0
    const discountMultiplier = useMemo(
        () => (hasDiscount ? Math.max(0, 1 - (discountPercent ?? 0) / 100) : 1),
        [discountPercent, hasDiscount],
    )

    const basePriceLabel = useMemo(() => {
        if (variant.minPrice === variant.maxPrice) {
            return formatCurrency(variant.minPrice)
        }
        return `${formatCurrency(variant.minPrice)} - ${formatCurrency(variant.maxPrice)}`
    }, [variant.maxPrice, variant.minPrice])

    const discountedPriceLabel = useMemo(() => {
        if (!hasDiscount) return null
        const min = variant.minPrice * discountMultiplier
        const max = variant.maxPrice * discountMultiplier
        if (Math.abs(min - max) < 0.01) {
            return formatCurrency(min)
        }
        return `${formatCurrency(min)} - ${formatCurrency(max)}`
    }, [discountMultiplier, hasDiscount, variant.maxPrice, variant.minPrice])

    const discountLabel = useMemo(() => {
        if (!hasDiscount || typeof discountPercent !== "number") return null
        const formatted = Number.isInteger(discountPercent) ? discountPercent.toString() : discountPercent.toFixed(1)
        return `${formatted}% OFF`
    }, [discountPercent, hasDiscount])

    const isOutOfStock = !isPreorder && (variant.totalStock ?? 0) <= 0

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const defaultSize = variant.sizes.find(s => s.stock > 0) || variant.sizes[0]
        if (!defaultSize || isOutOfStock) return

        onAddToCart({
            variantId: variant.id,
            productId: variant.productId,
            name: variant.displayName,
            image: variant.image,
            size: defaultSize.label === "Default" ? null : defaultSize.label,
            price: hasDiscount ? Number((defaultSize.price * discountMultiplier).toFixed(2)) : defaultSize.price,
            quantity: quantity,
            brandName: variant.brandName,
        })
        setQuantity(1)
    }

    return (
        <article
            className={cn(
                "group relative w-full rounded-[2.5rem] overflow-hidden isolate transform-gpu shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.2)] transition-all duration-700 ease-out border border-white/10 z-10",
                isSpotlight ? "aspect-auto h-full min-h-[400px]" : "aspect-[3/4]"
            )}
            style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                clipPath: 'inset(0 round 2.5rem)',
                WebkitClipPath: 'inset(0 round 2.5rem)',
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
            <div className="relative z-10 h-full flex flex-col justify-end p-8 text-white">
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
                            isSpotlight ? "text-4xl md:text-6xl lg:text-7xl" : "text-2xl"
                        )}>
                            {variant.productName}
                        </h3>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                        {discountedPriceLabel ? (
                            <div className="flex items-center gap-2">
                                <span className={cn("font-black text-white", isSpotlight ? "text-3xl" : "text-xl")}>{discountedPriceLabel}</span>
                                <span className="text-sm text-white/50 line-through font-semibold">{basePriceLabel}</span>
                            </div>
                        ) : (
                            <span className={cn("font-black text-white", isSpotlight ? "text-3xl" : "text-xl")}>{basePriceLabel}</span>
                        )}
                    </div>
                </Link>

                {/* Action Row - slides up on hover for a cleaner look */}
                <div className={cn(
                    "flex flex-col gap-4 transition-all duration-500 transform",
                    hovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 lg:opacity-100 lg:translate-y-0"
                )}>
                    <div className="flex items-center justify-between gap-4">
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity(Math.max(1, quantity - 1)) }}
                                className="text-white/70 hover:text-white transition-colors outline-none"
                            >
                                <Minus className="size-3.5" strokeWidth={3} />
                            </button>
                            <span className="w-4 text-center text-white font-black text-sm">{quantity}</span>
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity(quantity + 1) }}
                                className="text-white/70 hover:text-white transition-colors outline-none"
                            >
                                <Plus className="size-3.5" strokeWidth={3} />
                            </button>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className={cn(
                                "flex-1 bg-white hover:bg-white/90 text-black shadow-xl transition-all rounded-full py-3.5 px-6 text-[10px] font-black uppercase tracking-widest",
                                isOutOfStock && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {isOutOfStock ? "Sold Out" : "Add to Cart"}
                        </button>
                    </div>
                </div>
            </div>
        </article>
    )
}
