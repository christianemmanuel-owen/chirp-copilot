"use client"

import Link from "next/link"
import { useCallback, useMemo, useState } from "react"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
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

interface ProductCardProps {
  variant: CatalogVariant
  onAddToCart: (item: AddToCartPayload) => void
  actionLabel?: string
}

export default function ProductCard({ variant, onAddToCart, actionLabel = "Add to Cart" }: ProductCardProps) {
  const hasMultipleSizes = variant.sizes.length > 1
  const defaultSelectedIndex = hasMultipleSizes ? -1 : 0
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(defaultSelectedIndex)
  const [quantity, setQuantity] = useState<number>(0)
  const [hovered, setHovered] = useState(false)
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

  const selectedSize =
    selectedSizeIndex >= 0 && selectedSizeIndex < variant.sizes.length
      ? variant.sizes[selectedSizeIndex]
      : null

  const totalStockForSelectedSize = selectedSize?.stock ?? variant.totalStock
  const effectiveMaxStock = isPreorder ? Number.POSITIVE_INFINITY : totalStockForSelectedSize
  const isOutOfStock = !isPreorder && (variant.totalStock ?? 0) <= 0
  const applyDiscount = useCallback(
    (price: number) => Number((price * discountMultiplier).toFixed(2)),
    [discountMultiplier],
  )

  const canAddToCart = selectedSize !== null && quantity > 0 && quantity <= effectiveMaxStock

  const handleSelectSize = (index: number) => {
    setSelectedSizeIndex(index)
    setQuantity((prev) => {
      if (prev === 0) return prev
      const size = variant.sizes[index]
      if (!size) return prev
      if (isPreorder) return prev
      return Math.min(size.stock, prev)
    })
  }

  const adjustQuantity = (delta: number) => {
    setQuantity((prev) => {
      const next = Math.max(0, prev + delta)
      if (!selectedSize || isPreorder) return next
      return Math.min(next, selectedSize.stock)
    })
  }

  const handleManualQuantity = (value: string) => {
    const parsed = Number.parseInt(value, 10)
    if (Number.isNaN(parsed)) {
      setQuantity(0)
      return
    }
    if (parsed < 0) {
      setQuantity(0)
      return
    }
    if (isPreorder) {
      setQuantity(parsed)
      return
    }
    const max = selectedSize ? selectedSize.stock : variant.totalStock
    setQuantity(Math.min(parsed, max))
  }

  const handleAddToCart = () => {
    if (!selectedSize || !canAddToCart || isOutOfStock) return

    onAddToCart({
      variantId: variant.id,
      productId: variant.productId,
      name: variant.displayName,
      image: variant.image,
      size: selectedSize.label === "Default" ? null : selectedSize.label,
      price: hasDiscount ? applyDiscount(selectedSize.price) : selectedSize.price,
      quantity,
      brandName: variant.brandName,
    })

    setQuantity(0)
  }

  const brandLabel = variant.brandName && variant.brandName.trim().length > 0 ? variant.brandName : "Unbranded"
  const categoriesLabel =
    variant.categories && variant.categories.length > 0 ? variant.categories.join(" · ") : undefined

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden border border-border bg-card transition hover:-translate-y-1 hover:shadow-lg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={variant.detailPath}
        className="relative block h-72 w-full overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <span className="sr-only">View details for {variant.displayName}</span>
        <img
          src={variant.image}
          alt={variant.displayName}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500",
            hovered ? "scale-105" : "scale-100",
          )}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 transition-colors group-hover:from-black/45" />
        <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-foreground shadow-sm">
          {brandLabel}
        </div>
        {discountLabel && (
          <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-primary-foreground shadow-sm">
            {discountLabel}
          </div>
        )}
        {isOutOfStock && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-semibold uppercase tracking-[0.35em] text-white">
            Out of stock
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <header className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">
            <Link
              href={variant.detailPath}
              className="transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              {variant.displayName}
            </Link>
          </h3>
          {categoriesLabel && <p className="text-sm text-muted-foreground">{categoriesLabel}</p>}
        </header>

        <div className="flex flex-col gap-1">
          {discountedPriceLabel ? (
            <>
              <p className="text-base font-semibold text-primary">{discountedPriceLabel}</p>
              <p className="text-sm text-muted-foreground line-through">{basePriceLabel}</p>
            </>
          ) : (
            <p className="text-base font-semibold text-foreground">{basePriceLabel}</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">Sizing</p>
          <div className="flex flex-wrap gap-2">
            {variant.sizes.map((size, index) => {
              const isSelected = index === selectedSizeIndex
              const isDisabled = !isPreorder && size.stock <= 0
              const label = size.label

              return (
                <button
                  key={`${variant.id}-${label}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectSize(index)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/60",
                    isDisabled && "cursor-not-allowed border-border bg-muted text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>
          {selectedSize && (
            <p className="text-xs text-muted-foreground">
              {hasDiscount ? (
                <>
                  <span className="font-semibold text-primary">{formatCurrency(applyDiscount(selectedSize.price))}</span>
                  <span className="ml-2 line-through">{formatCurrency(selectedSize.price)}</span>
                </>
              ) : (
                <span>{formatCurrency(selectedSize.price)}</span>
              )}
              <span className="mx-2 text-muted-foreground/70">•</span>
              {isPreorder ? "For pre-order" : `${selectedSize.stock} in stock`}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">Quantity</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => adjustQuantity(-1)}
              className="flex size-8 items-center justify-center rounded-full border border-border text-sm transition hover:border-primary/60 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={quantity === 0}
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>

            <input
              type="number"
              min={0}
              max={isPreorder ? undefined : totalStockForSelectedSize}
              value={quantity}
              onChange={(event) => handleManualQuantity(event.target.value)}
              className="w-16 rounded-md border border-border bg-background py-1 text-center text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />

            <button
              type="button"
              onClick={() => adjustQuantity(1)}
              className="flex size-8 items-center justify-center rounded-full border border-border text-sm transition hover:border-primary/60 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={selectedSize ? quantity >= selectedSize.stock : false}
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || !canAddToCart}
          className="mt-auto flex w-full items-center justify-center gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          {isOutOfStock ? "Out of Stock" : actionLabel}
        </Button>
      </div>
    </article>
  )
}
