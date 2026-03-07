"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
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

interface CheckoutRecommendationsCarouselProps {
  variants: CatalogVariant[]
  onAddToCart: (payload: AddToCartPayload) => void
}

function getPrimarySize(variant: CatalogVariant) {
  return variant.sizes.find((size) => Number.isFinite(size.stock) && size.stock > 0) ?? variant.sizes[0] ?? null
}

export default function CheckoutRecommendationsCarousel({ variants, onAddToCart }: CheckoutRecommendationsCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (variants.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % variants.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [variants.length])

  const slides = useMemo(() => variants.map((variant) => ({ variant })), [variants])

  const goToSlide = (index: number) => setCurrentSlide(index)
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  const handleQuickAdd = (variant: CatalogVariant) => {
    const primarySize = getPrimarySize(variant)
    if (!primarySize) return

    onAddToCart({
      variantId: variant.id,
      productId: variant.productId,
      name: variant.displayName,
      image: variant.image,
      size: primarySize.label === "Default" ? null : primarySize.label,
      price: primarySize.price,
      quantity: 1,
      brandName: variant.brandName,
    })
  }

  if (slides.length === 0) {
    return null
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-muted/40 min-h-[28rem] md:min-h-[24rem]">
      {slides.map(({ variant }, index) => {
        const brandLabel =
          variant.brandName && variant.brandName.trim().length > 0 ? variant.brandName.trim() : "Unbranded"
        const categoriesLabel =
          variant.categories && variant.categories.length > 0 ? variant.categories.join(" · ") : "Featured pick"
        const primarySize = getPrimarySize(variant)
        const priceLabel =
          variant.minPrice === variant.maxPrice
            ? formatCurrency(variant.minPrice)
            : `${formatCurrency(variant.minPrice)} – ${formatCurrency(variant.maxPrice)}`
        const quickAddDisabled = !primarySize || primarySize.stock <= 0

        return (
          <div
            key={variant.id}
            className={cn(
              "absolute inset-0 flex h-full w-full flex-col md:flex-row transition-opacity duration-700",
              index === currentSlide ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <div className="relative h-72 w-full md:h-full md:w-1/2">
              <img src={variant.image} alt={variant.displayName} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
              <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-white">
                {brandLabel}
              </div>
              <div className="absolute bottom-6 left-6 right-6 space-y-3 text-white">
                <p className="text-sm uppercase tracking-[0.3em] text-white/80">You May Also Like</p>
                <h3 className="text-2xl font-semibold">{variant.displayName}</h3>
                <p className="text-sm text-white/80">{categoriesLabel}</p>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-center gap-6 p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-muted-foreground">Price</p>
                <p className="text-2xl font-semibold text-foreground">{priceLabel}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-muted-foreground">Size</p>
                <p className="text-base text-foreground">
                  {primarySize
                    ? `${primarySize.label === "Default" ? "Standard fit" : primarySize.label} · ${primarySize.stock} in stock`
                    : "Out of stock"}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => router.push(variant.detailPath)}
                  variant="outline"
                >
                  View details
                </Button>
                <Button
                  type="button"
                  onClick={() => handleQuickAdd(variant)}
                  disabled={quickAddDisabled}
                  className="inline-flex items-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Quick add
                </Button>
              </div>
            </div>
          </div>
        )
      })}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous recommendation"
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/70 p-2 text-foreground shadow hover:bg-background"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next recommendation"
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/70 p-2 text-foreground shadow hover:bg-background"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map(({ variant }, index) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Go to ${variant.displayName}`}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentSlide ? "w-8 bg-foreground" : "w-2 bg-foreground/40",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
