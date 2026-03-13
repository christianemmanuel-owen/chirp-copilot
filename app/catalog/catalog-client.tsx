"use client"

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown, ShoppingCart } from "lucide-react"
import BannerCarousel from "@/components/banner-carousel"
import HeroCategories from "@/components/hero-categories"
import ProductCard from "@/components/product-card"
import CartSidebar from "@/components/cart-sidebar"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { formatCurrency } from "@/lib/utils"
import type { CatalogData, CatalogVariant } from "@/lib/storefront-data"
import { useCart } from "@/lib/cart"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SlidersHorizontal } from "lucide-react"

declare global {
  interface Window {
    __chirpHasCartSidebar?: boolean
  }
}

interface CatalogClientProps {
  data: CatalogData
}

const normalizeLabel = (value: string | null | undefined) => value?.trim() ?? ""

const matchCategory = (categories: string[], target: string) =>
  categories.some((category) => category.toLowerCase() === target.toLowerCase())

const matchBrand = (brandName: string | null, target: string) => {
  const normalizedTarget = target.toLowerCase()
  if (normalizedTarget === "unbranded") {
    return !brandName || brandName.trim().length === 0
  }
  return normalizeLabel(brandName).toLowerCase() === normalizedTarget
}

const DEFAULT_CATEGORY = "All"
const DEFAULT_BRAND = "All"
const DEFAULT_SIZE_LABEL = "Default"

export default function CatalogClient({ data }: CatalogClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [selectedCategory, setSelectedCategory] = useState<string>(DEFAULT_CATEGORY)
  const [selectedBrand, setSelectedBrand] = useState<string>(DEFAULT_BRAND)
  const [priceRange, setPriceRange] = useState<[number, number]>(data.priceRange)
  const [minPriceInput, setMinPriceInput] = useState<string>(String(data.priceRange[0]))
  const [maxPriceInput, setMaxPriceInput] = useState<string>(String(data.priceRange[1]))
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [showDiscountedOnly, setShowDiscountedOnly] = useState<boolean>(false)
  const [expandedCategory, setExpandedCategory] = useState<boolean>(true)
  const [expandedBrand, setExpandedBrand] = useState<boolean>(false)
  const [expandedPrice, setExpandedPrice] = useState<boolean>(false)
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false)
  const [hasMounted, setHasMounted] = useState(false)
  const {
    items: cartLines,
    isHydrated: isCartHydrated,
    addItem: addCartItem,
    updateQuantity: updateCartQuantity,
    removeItem: removeCartItem,
  } = useCart()

  const cartItems = useMemo(
    () =>
      cartLines.map((line) => ({
        lineId: line.lineId,
        variantId: line.variantId,
        productId: line.productId,
        name: line.name,
        image: line.image,
        brandName: line.brandName,
        size: line.attributes.Size ?? line.attributes.size ?? null,
        price: line.price,
        quantity: line.quantity,
        maxStock: line.maxStock,
      })),
    [cartLines],
  )

  const cartItemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  )

  const showCartBadge = hasMounted && isCartHydrated && cartItemCount > 0

  const deferredSearchQuery = useDeferredValue(searchQuery)
  const deferredPriceRange = useDeferredValue(priceRange)
  const discountedVariantIds = useMemo(
    () => new Set(data.discountFilter?.variantIds ?? []),
    [data.discountFilter],
  )
  const discountVariantCount = discountedVariantIds.size

  useEffect(() => {
    const categoryParam = searchParams.get("category")
    if (categoryParam) {
      const match = data.categoryFilters.find(
        (entry) => entry.toLowerCase() === categoryParam.toLowerCase(),
      )
      if (match) {
        setSelectedCategory(match)
        setExpandedCategory(true)
      }
    }

    const brandParam = searchParams.get("brand")
    if (brandParam) {
      const match = data.brandFilters.find((entry) => entry.toLowerCase() === brandParam.toLowerCase())
      if (match) {
        setSelectedBrand(match)
        setExpandedBrand(true)
      }
    }

    const parsePriceParam = (param: string | null) => {
      if (!param) return undefined
      const value = Number.parseFloat(param)
      return Number.isFinite(value) ? value : undefined
    }

    const minParam =
      parsePriceParam(searchParams.get("minPrice")) ?? parsePriceParam(searchParams.get("price_min"))
    const maxParam =
      parsePriceParam(searchParams.get("maxPrice")) ?? parsePriceParam(searchParams.get("price_max"))

    if (minParam !== undefined || maxParam !== undefined) {
      const clamp = (value: number) =>
        Math.round(Math.min(data.priceRange[1], Math.max(data.priceRange[0], value)))

      const nextMin = clamp(minParam ?? data.priceRange[0])
      const nextMax = clamp(maxParam ?? data.priceRange[1])
      const normalizedRange: [number, number] =
        nextMin <= nextMax ? [nextMin, nextMax] : [nextMax, nextMin]

      setPriceRange(normalizedRange)
      setMinPriceInput(String(normalizedRange[0]))
      setMaxPriceInput(String(normalizedRange[1]))
      setExpandedPrice(true)
    } else {
      setPriceRange(data.priceRange)
      setMinPriceInput(String(data.priceRange[0]))
      setMaxPriceInput(String(data.priceRange[1]))
    }

    const queryParam = searchParams.get("q")
    if (queryParam) {
      setSearchQuery(queryParam)
    }

    const cartParam = searchParams.get("cart")
    if (cartParam === "open") {
      setIsCartOpen(true)
    }
  }, [data.brandFilters, data.categoryFilters, data.priceRange, searchParams])

  useEffect(() => {
    if (!data.discountFilter) {
      setShowDiscountedOnly(false)
    }
  }, [data.discountFilter])

  useEffect(() => {
    if (typeof window === "undefined") return undefined

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ query?: string; discountCampaignId?: string }>).detail
      const query = detail?.query ?? ""
      const matchesDiscountCampaign =
        detail?.discountCampaignId &&
        data.discountFilter &&
        detail.discountCampaignId === data.discountFilter.campaignId &&
        discountedVariantIds.size > 0

      setSearchQuery(query)
      setSelectedCategory(DEFAULT_CATEGORY)
      setSelectedBrand(DEFAULT_BRAND)
      setExpandedCategory(true)
      setExpandedBrand(false)
      setShowDiscountedOnly(Boolean(matchesDiscountCampaign))

      const [priceMin, priceMax] = data.priceRange
      setPriceRange([priceMin, priceMax])
      setMinPriceInput(String(priceMin))
      setMaxPriceInput(String(priceMax))

      const targetUrl = query.length > 0 ? `/catalog?q=${encodeURIComponent(query)}` : "/catalog"
      const currentUrl = `${window.location.pathname}${window.location.search}`
      if (currentUrl !== targetUrl) {
        router.replace(targetUrl)
      }
    }

    window.addEventListener("chirp:banner-filter", handler as EventListener)
    return () => window.removeEventListener("chirp:banner-filter", handler as EventListener)
  }, [data.discountFilter, data.priceRange, discountedVariantIds, router])

  const variantMap = useMemo(() => {
    const entries = new Map<number, CatalogVariant>()
    for (const variant of data.variants) {
      entries.set(variant.id, variant)
    }
    return entries
  }, [data.variants])

  const filteredVariants = useMemo(() => {
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase()
    const [minPrice, maxPrice] = deferredPriceRange

    return data.variants.filter((variant) => {
      if (selectedCategory !== DEFAULT_CATEGORY) {
        if (!matchCategory(variant.categories, selectedCategory)) {
          return false
        }
      }

      if (selectedBrand !== DEFAULT_BRAND) {
        if (!matchBrand(variant.brandName ?? null, selectedBrand)) {
          return false
        }
      }

      if (showDiscountedOnly) {
        if (discountedVariantIds.size === 0 || !discountedVariantIds.has(variant.id)) {
          return false
        }
      }

      const matchesPrice = variant.sizes.some(
        (size) => size.price >= minPrice && size.price <= maxPrice,
      )
      if (!matchesPrice) {
        return false
      }

      if (normalizedQuery.length > 0) {
        const haystack = [
          variant.displayName,
          variant.productName,
          variant.variantLabel ?? "",
          variant.brandName ?? "",
          ...variant.categories,
        ]
          .join(" ")
          .toLowerCase()

        if (!haystack.includes(normalizedQuery)) {
          return false
        }
      }

      return true
    })
  }, [
    data.variants,
    deferredPriceRange,
    deferredSearchQuery,
    discountedVariantIds,
    selectedBrand,
    selectedCategory,
    showDiscountedOnly,
  ])

  const clampToBounds = (value: number) =>
    Math.round(Math.min(data.priceRange[1], Math.max(data.priceRange[0], value)))

  const handlePriceSliderChange = (value: number[]) => {
    if (value.length < 2) return
    const [incomingMin, incomingMax] = value
    const clampedMin = clampToBounds(incomingMin)
    const clampedMax = clampToBounds(incomingMax)
    const nextRange: [number, number] =
      clampedMin <= clampedMax ? [clampedMin, clampedMax] : [clampedMax, clampedMin]
    setPriceRange(nextRange)
    setMinPriceInput(String(nextRange[0]))
    setMaxPriceInput(String(nextRange[1]))
  }

  const handleMinInputBlur = () => {
    const parsed = Number.parseFloat(minPriceInput)
    if (Number.isNaN(parsed)) {
      setMinPriceInput(String(priceRange[0]))
      return
    }
    const clamped = clampToBounds(parsed)
    const [, currentMax] = priceRange
    const nextRange: [number, number] =
      clamped <= currentMax ? [clamped, currentMax] : [clamped, clamped]
    setPriceRange(nextRange)
    setMinPriceInput(String(nextRange[0]))
    setMaxPriceInput(String(nextRange[1]))
  }

  const handleMaxInputBlur = () => {
    const parsed = Number.parseFloat(maxPriceInput)
    if (Number.isNaN(parsed)) {
      setMaxPriceInput(String(priceRange[1]))
      return
    }
    const clamped = clampToBounds(parsed)
    const [currentMin] = priceRange
    const nextRange: [number, number] =
      clamped >= currentMin ? [currentMin, clamped] : [clamped, clamped]
    setPriceRange(nextRange)
    setMinPriceInput(String(nextRange[0]))
    setMaxPriceInput(String(nextRange[1]))
  }

  const handleAddToCart = (payload: {
    variantId: number
    productId: number
    name: string
    image: string
    size: string | null
    price: number
    quantity: number
    brandName: string | null
  }) => {
    const variant = variantMap.get(payload.variantId)
    if (!variant) return

    const targetSizeLabel = payload.size ?? DEFAULT_SIZE_LABEL
    const sizeEntry = variant.sizes.find(
      (entry) => (entry.label ?? DEFAULT_SIZE_LABEL) === (payload.size ?? DEFAULT_SIZE_LABEL),
    )

    const isPreorder = Boolean(variant.isPreorder)
    const maxStock = isPreorder ? Number.POSITIVE_INFINITY : sizeEntry?.stock ?? variant.totalStock
    if (!isPreorder && maxStock <= 0) return

    addCartItem({
      variantId: payload.variantId,
      productId: payload.productId,
      name: payload.name,
      image: payload.image,
      brandName: payload.brandName ?? null,
      attributes: payload.size ? { Size: payload.size } : undefined,
      price: payload.price,
      quantity: payload.quantity,
      maxStock,
    })

    setIsCartOpen(true)
  }

  const handleRemoveItem = (lineId: string) => {
    removeCartItem(lineId)
  }

  const handleUpdateQuantity = (lineId: string, quantity: number) => {
    updateCartQuantity(lineId, quantity)
  }

  const handleProceedToCheckout = useCallback(() => {
    if (!isCartHydrated || cartItemCount === 0) {
      return
    }

    setIsCartOpen(false)
    router.push("/checkout")
  }, [cartItemCount, isCartHydrated, router])

  const handleStartShopping = useCallback(() => {
    setIsCartOpen(false)
    router.push("/catalog")
  }, [router])

  useEffect(() => {
    if (typeof window === "undefined") return undefined

    window.__chirpHasCartSidebar = true

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ mode?: "open" | "toggle" }>
      const mode = customEvent.detail?.mode ?? "toggle"
      setIsCartOpen((prev) => (mode === "toggle" ? !prev : true))
    }

    window.addEventListener("chirp:cart-toggle", handler as EventListener)

    return () => {
      window.removeEventListener("chirp:cart-toggle", handler as EventListener)
      window.__chirpHasCartSidebar = false
    }
  }, [])

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <label htmlFor="catalog-search" className="sr-only">
          Search products
        </label>
        <input
          id="catalog-search"
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {data.discountFilter && discountVariantCount > 0 && (
        <div className="rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Discount campaign</p>
              <p className="text-xs text-muted-foreground">{data.discountFilter.name}</p>
            </div>
            <Switch
              checked={showDiscountedOnly}
              onCheckedChange={setShowDiscountedOnly}
              aria-label="Show discounted items only"
            />
          </div>
          {data.discountFilter.description && (
            <p className="mt-2 text-xs text-muted-foreground">{data.discountFilter.description}</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {showDiscountedOnly
              ? `Showing ${discountVariantCount} discounted ${discountVariantCount === 1 ? "item" : "items"}.`
              : `Toggle to focus on ${discountVariantCount} discounted ${discountVariantCount === 1 ? "item" : "items"
              }.`}
          </p>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={() => setExpandedCategory((value) => !value)}
          className="flex w-full items-center justify-between text-left text-lg font-semibold transition hover:text-primary"
        >
          Categories
          <ChevronDown
            className={`h-5 w-5 transition-transform ${expandedCategory ? "rotate-180" : ""}`}
          />
        </button>
        {expandedCategory && (
          <div className="mt-4 space-y-3">
            {data.categoryFilters.map((category) => (
              <label key={category} className="flex items-center gap-3 text-sm">
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={selectedCategory === category}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-muted-foreground transition hover:text-foreground">{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setExpandedBrand((value) => !value)}
          className="flex w-full items-center justify-between text-left text-lg font-semibold transition hover:text-primary"
        >
          Brands
          <ChevronDown
            className={`h-5 w-5 transition-transform ${expandedBrand ? "rotate-180" : ""}`}
          />
        </button>
        {expandedBrand && (
          <div className="mt-4 space-y-3">
            {data.brandFilters.map((brand) => (
              <label key={brand} className="flex items-center gap-3 text-sm">
                <input
                  type="radio"
                  name="brand"
                  value={brand}
                  checked={selectedBrand === brand}
                  onChange={(event) => setSelectedBrand(event.target.value)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-muted-foreground transition hover:text-foreground">{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setExpandedPrice((value) => !value)}
          className="flex w-full items-center justify-between text-left text-lg font-semibold transition hover:text-primary"
        >
          Price Range
          <ChevronDown
            className={`h-5 w-5 transition-transform ${expandedPrice ? "rotate-180" : ""}`}
          />
        </button>
        {expandedPrice && (
          <div className="mt-4 space-y-4">
            <Slider
              min={data.priceRange[0]}
              max={data.priceRange[1]}
              step={1}
              value={priceRange}
              onValueChange={handlePriceSliderChange}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(priceRange[0])}</span>
              <span>{formatCurrency(priceRange[1])}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label htmlFor="min-price" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Min
                </label>
                <input
                  id="min-price"
                  type="number"
                  min={data.priceRange[0]}
                  max={data.priceRange[1]}
                  step={1}
                  value={minPriceInput}
                  onChange={(event) => setMinPriceInput(event.target.value)}
                  onBlur={handleMinInputBlur}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <span className="pt-6 text-muted-foreground">-</span>
              <div className="flex-1">
                <label htmlFor="max-price" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Max
                </label>
                <input
                  id="max-price"
                  type="number"
                  min={data.priceRange[0]}
                  max={data.priceRange[1]}
                  step={1}
                  value={maxPriceInput}
                  onChange={(event) => setMaxPriceInput(event.target.value)}
                  onBlur={handleMaxInputBlur}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-12 pb-16">
      <BannerCarousel slides={data.hero.slides} />

      <div className="min-h-[700px] bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-12 lg:flex-row">
            {/* Desktop Filters */}
            <aside className="hidden w-full flex-shrink-0 lg:block lg:w-72">
              <FilterContent />
            </aside>

            <section className="flex-1">
              {/* Mobile Filter Toggle */}
              <div className="mb-8 flex items-center justify-between lg:hidden border-b pb-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors">
                      <SlidersHorizontal className="size-4" /> Filters
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                    <SheetHeader className="pb-6">
                      <SheetTitle className="text-xl font-black uppercase tracking-tight">Catalog Filters</SheetTitle>
                    </SheetHeader>
                    <div className="px-1 overflow-y-auto h-full pb-20">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {filteredVariants.length} Items Found
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredVariants.map((variant) => (
                  <ProductCard key={variant.id} variant={variant} onAddToCart={handleAddToCart} />
                ))}
              </div>

              {filteredVariants.length === 0 && (
                <div className="py-24 text-center">
                  <p className="text-lg text-muted-foreground">No products matched your filters.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        isHydrated={isCartHydrated}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        onProceedToCheckout={handleProceedToCheckout}
        onStartShopping={handleStartShopping}
      />

      <button
        type="button"
        onClick={() => setIsCartOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-ring/60"
        aria-label="Toggle cart"
      >
        <ShoppingCart className="h-6 w-6" />
        {showCartBadge && (
          <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-foreground text-xs font-bold shadow">
            {cartItemCount}
          </span>
        )}
      </button>
    </div>
  )
}

