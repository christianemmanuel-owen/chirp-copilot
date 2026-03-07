"use client"

import Link from "next/link"
import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Minus, Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import CartSidebar from "@/components/cart-sidebar"
import CheckoutRecommendationsCarousel from "@/components/checkout-recommendations-carousel"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import type { CatalogVariant, VariantDetailData } from "@/lib/storefront-data"
import { cn, createVariantSlug, formatCurrency } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { useCart } from "@/lib/cart"
import { calculateVariantDownPaymentSummary } from "@/lib/down-payment"

interface VariantDetailClientProps {
  detail: VariantDetailData
}

interface StoreVariantSummary {
  sizeOptions: Array<{ size: string | null; stock: number }>
  isPreorder: boolean
  totalStock: number
  brandName: string | null
}

const DEFAULT_SIZE_KEY = "__default__"

const normalizeSizeValue = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  if (trimmed.toLowerCase() === "default") return null
  return trimmed
}

const buildSizeKey = (value: string | null) => (value && value.length > 0 ? value.toLowerCase() : DEFAULT_SIZE_KEY)

const computeInitialSizeIndex = (variant: VariantDetailData["variant"]) => {
  if (variant.sizeOptions.length === 0) return -1
  const firstInStock = variant.sizeOptions.findIndex((option) => option.stock > 0)
  if (firstInStock >= 0) return firstInStock
  return variant.sizeOptions.length === 1 ? 0 : -1
}

export default function VariantDetailClient({ detail }: VariantDetailClientProps) {
  const { variant, product, gallery, galleryCaptions, siblingVariants, breadcrumbs } = detail
  const router = useRouter()
  const { products } = useStore()

  const initialSizeIndex = computeInitialSizeIndex(variant)
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(initialSizeIndex)
  const [quantity, setQuantity] = useState(() =>
    variant.isPreorder ? 1 : initialSizeIndex >= 0 && variant.sizeOptions[initialSizeIndex]?.stock > 0 ? 1 : 0,
  )
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [galleryCarouselApi, setGalleryCarouselApi] = useState<CarouselApi | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
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

  useEffect(() => {
    const nextIndex = computeInitialSizeIndex(variant)
    setSelectedSizeIndex(nextIndex)
    setQuantity(variant.isPreorder ? 1 : nextIndex >= 0 && variant.sizeOptions[nextIndex]?.stock > 0 ? 1 : 0)
    setActiveImageIndex(0)
    if (galleryCarouselApi) {
      galleryCarouselApi.scrollTo(0, true)
    }
  }, [variant.id, variant.isPreorder, variant.sizeOptions, galleryCarouselApi])

  useEffect(() => {
    if (!galleryCarouselApi) {
      return undefined
    }

    const handleSelect = () => {
      setActiveImageIndex(galleryCarouselApi.selectedScrollSnap())
    }

    handleSelect()
    galleryCarouselApi.on("select", handleSelect)

    return () => {
      galleryCarouselApi.off("select", handleSelect)
    }
  }, [galleryCarouselApi])

  useEffect(() => {
    if (!galleryCarouselApi) return
    if (gallery.length === 0) return
    const boundedIndex = Math.max(0, Math.min(activeImageIndex, gallery.length - 1))
    if (galleryCarouselApi.selectedScrollSnap() !== boundedIndex) {
      galleryCarouselApi.scrollTo(boundedIndex)
    }
  }, [activeImageIndex, gallery.length, galleryCarouselApi])

  useEffect(() => {
    if (activeImageIndex >= gallery.length) {
      setActiveImageIndex(gallery.length > 0 ? gallery.length - 1 : 0)
    }
  }, [gallery.length, activeImageIndex])

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

  const selectedSize =
    selectedSizeIndex >= 0 && selectedSizeIndex < variant.sizeOptions.length
      ? variant.sizeOptions[selectedSizeIndex]
      : null

  const priceLabel = useMemo(() => {
    if (variant.minPrice === variant.maxPrice) {
      return formatCurrency(variant.minPrice)
    }
    return `${formatCurrency(variant.minPrice)} – ${formatCurrency(variant.maxPrice)}`
  }, [variant.maxPrice, variant.minPrice])

  const selectedPriceLabel = selectedSize ? formatCurrency(selectedSize.price) : null
  const selectedDownPaymentSummary = useMemo(() => {
    if (!variant.isPreorder || !variant.preorderDownPayment) {
      return null
    }
    const unitPrice = selectedSize ? selectedSize.price : variant.minPrice
    return calculateVariantDownPaymentSummary(
      {
        isPreorder: true,
        preorderDownPayment: variant.preorderDownPayment,
      },
      unitPrice,
      1,
    )
  }, [selectedSize, variant.isPreorder, variant.minPrice, variant.preorderDownPayment])

  const resolveVariantFromStore = useCallback(
    (variantId: number): StoreVariantSummary | null => {
      if (variantId === variant.id) {
        return {
          sizeOptions: variant.sizeOptions.map((option) => ({
            size: option.size,
            stock: option.stock,
          })),
          isPreorder: variant.isPreorder,
          totalStock: variant.totalStock,
          brandName: product.brandName,
        }
      }

      for (const productEntry of products) {
        const matchedVariant = productEntry.variants.find((entry) => entry.id === variantId)
        if (matchedVariant) {
          return {
            sizeOptions: matchedVariant.sizes.map((entry) => ({
              size: normalizeSizeValue(entry.size),
              stock: entry.stock,
            })),
            isPreorder: matchedVariant.isPreorder,
            totalStock: matchedVariant.stock,
            brandName: productEntry.brand?.name ?? null,
          }
        }
      }

      return null
    },
    [product.brandName, products, variant.id, variant.isPreorder, variant.sizeOptions, variant.totalStock],
  )

  const resolveBrandForVariant = useCallback(
    (variantId: number): string | null => {
      if (variantId === variant.id) {
        return product.brandName ?? null
      }

      for (const productEntry of products) {
        if (productEntry.variants.some((entry) => entry.id === variantId)) {
          return productEntry.brand?.name ?? null
        }
      }

      return null
    },
    [product.brandName, products, variant.id],
  )

  const resolveMaxStock = useCallback(
    (variantId: number, sizeValue: string | null, fallbackQuantity: number) => {
      const summary = resolveVariantFromStore(variantId)
      if (!summary) {
        return Math.max(fallbackQuantity, 1)
      }

      if (summary.isPreorder) {
        return Number.POSITIVE_INFINITY
      }

      const sizeKey = buildSizeKey(sizeValue)
      const matchingSize = summary.sizeOptions.find((entry) => buildSizeKey(entry.size) === sizeKey)
      const stock = matchingSize ? matchingSize.stock : summary.totalStock
      return Math.max(stock, 0)
    },
    [resolveVariantFromStore],
  )

  const addItemToCart = useCallback(
    (payload: {
      variantId: number
      productId: number
      name: string
      image: string
      brandName: string | null
      sizeValue: string | null
      price: number
      quantity: number
      maxStock: number
    }) => {
      const displaySize = payload.sizeValue ?? null
      const fallbackImage = gallery[0] ?? "/placeholder.svg?height=400&width=400"
      const sanitizedImage =
        typeof payload.image === "string" && payload.image.trim().length > 0 ? payload.image.trim() : fallbackImage

      const requestedQuantity = payload.quantity > 0 ? payload.quantity : 1
      const effectiveMaxStock =
        payload.maxStock === Number.POSITIVE_INFINITY
          ? Number.POSITIVE_INFINITY
          : payload.maxStock > 0
            ? payload.maxStock
            : Math.max(requestedQuantity, 1)

      const initialQuantity =
        effectiveMaxStock === Number.POSITIVE_INFINITY
          ? requestedQuantity
          : Math.min(requestedQuantity, effectiveMaxStock)

      addCartItem({
        variantId: payload.variantId,
        productId: payload.productId,
        name: payload.name,
        image: sanitizedImage,
        brandName: payload.brandName ?? null,
        attributes: displaySize ? { Size: displaySize } : undefined,
        price: payload.price,
        quantity: initialQuantity,
        maxStock: effectiveMaxStock,
      })

      setIsCartOpen(true)
    },
    [addCartItem, gallery],
  )

  const brandLabel =
    product.brandName && product.brandName.trim().length > 0 ? product.brandName : "Unbranded"

  const handleSelectSize = (index: number) => {
    setSelectedSizeIndex(index)
    setQuantity((current) => {
      if (variant.isPreorder) {
        return Math.max(current, 1)
      }
      const option = variant.sizeOptions[index]
      if (!option) return 0
      if (option.stock <= 0) return 0
      return Math.min(Math.max(current, 1), option.stock)
    })
  }

  const adjustQuantity = (delta: number) => {
    setQuantity((prev) => {
      const next = Math.max(0, prev + delta)
      if (!selectedSize || variant.isPreorder) {
        return next
      }
      return Math.min(next, selectedSize.stock)
    })
  }

  const handleManualQuantity = (value: string) => {
    const parsed = Number.parseInt(value, 10)
    if (Number.isNaN(parsed) || parsed < 0) {
      setQuantity(0)
      return
    }
    if (!selectedSize || variant.isPreorder) {
      setQuantity(parsed)
      return
    }
    setQuantity(Math.min(parsed, selectedSize.stock))
  }

  const handleAddCurrentVariant = () => {
    if (!selectedSize) return
    const sizeValue = normalizeSizeValue(selectedSize.size)
    const maxStock = resolveMaxStock(variant.id, sizeValue, quantity)
    if (!variant.isPreorder && maxStock <= 0) {
      return
    }

    addItemToCart({
      variantId: variant.id,
      productId: product.id,
      name: variant.displayName,
      image: gallery[activeImageIndex] ?? variant.image,
      brandName: product.brandName ?? null,
      sizeValue,
      price: selectedSize.price,
      quantity: quantity > 0 ? quantity : 1,
      maxStock: variant.isPreorder ? Number.POSITIVE_INFINITY : maxStock,
    })
  }

  const handleAddRecommendedVariant = useCallback(
    (payload: {
      variantId: number
      productId: number
      name: string
      image: string
      size: string | null
      price: number
      quantity: number
      brandName: string | null
    }) => {
      const sizeValue = normalizeSizeValue(payload.size)
      const maxStock = resolveMaxStock(payload.variantId, sizeValue, payload.quantity)
      const brandName = payload.brandName ?? resolveBrandForVariant(payload.variantId)

      addItemToCart({
        variantId: payload.variantId,
        productId: payload.productId,
        name: payload.name,
        image: payload.image,
        brandName,
        sizeValue,
        price: payload.price,
        quantity: payload.quantity,
        maxStock,
      })
    },
    [addItemToCart, resolveBrandForVariant, resolveMaxStock],
  )

  const handleRemoveItem = (lineId: string) => {
    removeCartItem(lineId)
  }

  const handleUpdateCartQuantity = (lineId: string, nextQuantity: number) => {
    updateCartQuantity(lineId, nextQuantity)
  }

  const handleProceedToCheckout = useCallback(() => {
    if (cartItems.length === 0) return

    setIsCartOpen(false)
    router.push("/checkout")
  }, [cartItems.length, router])

  const handleStartShopping = useCallback(() => {
    setIsCartOpen(false)
    router.push("/catalog")
  }, [router])

  const canAddToCart =
    Boolean(selectedSize) &&
    quantity > 0 &&
    (variant.isPreorder || (selectedSize ? selectedSize.stock > 0 && quantity <= selectedSize.stock : true))

  const featureItems = [
    { label: "SKU", value: variant.sku ?? "N/A" },
    {
      label: "Availability",
      value: variant.isPreorder
        ? "Pre-order"
        : variant.totalStock > 0
          ? `${variant.totalStock} in stock`
          : "Out of stock",
    },
    { label: "Brand", value: brandLabel },
    {
      label: "Categories",
      value: product.categories.length > 0 ? product.categories.join(", ") : "Uncategorized",
    },
  ]

  const recommendedVariants = useMemo<CatalogVariant[]>(() => {
    if (!products || products.length === 0) return []

    const categoryKeys = new Set(product.categories.map((name) => name.toLowerCase()))
    const entries: CatalogVariant[] = []

    const buildDisplayName = (productName: string, label: string | null, sku?: string | null) => {
      const normalizedLabel = label && label.trim().length > 0 ? label.trim() : null
      if (normalizedLabel) return `${productName} · ${normalizedLabel}`
      const normalizedSku = sku && sku.trim().length > 0 ? sku.trim() : null
      if (normalizedSku) return `${productName} · ${normalizedSku}`
      return `${productName} · Classic`
    }

    for (const productEntry of products) {
      const categories =
        productEntry.categories?.map((category) => category.name).filter((name): name is string => Boolean(name)) ?? []
      const brandName =
        productEntry.brand && typeof productEntry.brand.name === "string" && productEntry.brand.name.trim().length > 0
          ? productEntry.brand.name.trim()
          : null

      for (const variantEntry of productEntry.variants) {
        const rawSizes =
          variantEntry.sizes && variantEntry.sizes.length > 0
            ? variantEntry.sizes
            : [{ size: variantEntry.size ?? null, price: variantEntry.price, stock: variantEntry.stock }]

        const mappedSizes = rawSizes.map((entry) => ({
          label: entry.size && entry.size.trim().length > 0 ? entry.size.trim() : "Default",
          price: Number(entry.price),
          stock: Number(entry.stock),
        }))

        const prices = mappedSizes.map((entry) => entry.price).filter((value) => Number.isFinite(value))
        const minPrice = prices.length > 0 ? Math.min(...prices) : Number(variantEntry.price ?? 0)
        const maxPrice = prices.length > 0 ? Math.max(...prices) : Number(variantEntry.price ?? 0)
        const totalStock = mappedSizes.reduce(
          (sum, entry) => sum + (Number.isFinite(entry.stock) ? entry.stock : 0),
          0,
        )

        entries.push({
          id: variantEntry.id,
          productId: productEntry.id,
          productName: productEntry.name,
          variantLabel: variantEntry.color ?? variantEntry.sku ?? null,
          displayName: buildDisplayName(productEntry.name, variantEntry.color ?? null, variantEntry.sku ?? null),
          image: variantEntry.image ?? productEntry.image,
          description: variantEntry.description ?? null,
          brandName,
          categories,
          sizes: mappedSizes,
          minPrice,
          maxPrice,
          totalStock,
          detailPath: `/shop/${createVariantSlug(
            variantEntry.id,
            productEntry.name,
            variantEntry.color ?? variantEntry.sku ?? null,
          )}`,
          isPreorder: Boolean(variantEntry.isPreorder),
        })
      }
    }

    const filtered = entries.filter((entry) => entry.id !== variant.id)

    const preferred: CatalogVariant[] = []
    const fallback: CatalogVariant[] = []
    for (const entry of filtered) {
      const matchesBrand =
        product.brandName && entry.brandName && entry.brandName.toLowerCase() === product.brandName.toLowerCase()
      const matchesCategory = entry.categories.some((category) => categoryKeys.has(category.toLowerCase()))
      if (matchesBrand || matchesCategory) {
        preferred.push(entry)
      } else {
        fallback.push(entry)
      }
    }

    const ordered = [...preferred, ...fallback]
    const unique: CatalogVariant[] = []
    const seen = new Set<number>()

    for (const entry of ordered) {
      if (seen.has(entry.id)) continue
      seen.add(entry.id)
      unique.push(entry)
      if (unique.length >= 8) break
    }

    return unique
  }, [product.brandName, product.categories, products, variant.id])

  return (
    <div className="pb-20">
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <Fragment key={`${crumb.label}-${index}`}>
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="rounded-full border border-border bg-background px-4 py-1 text-xs uppercase tracking-[0.28em]">
                  {brandLabel}
                </Badge>
                {variant.isPreorder && (
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.24em]">
                    Pre-order
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">{variant.displayName}</h1>
              {variant.description && (
                <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">{variant.description}</p>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-3xl font-semibold text-foreground sm:text-4xl">{priceLabel}</p>
              {selectedSize && (
                <p className="text-sm text-muted-foreground">
                  Selected size · {selectedSize.size ?? "Default"} · {selectedPriceLabel}
                </p>
              )}
            </div>
            <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              {featureItems.map((item) => (
                <div key={item.label} className="flex gap-2">
                  <span className="font-semibold text-foreground">{item.label}:</span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Size</p>
              <div className="flex flex-wrap gap-2">
                {variant.sizeOptions.map((option, index) => {
                  const isSelected = index === selectedSizeIndex
                  const isDisabled = !variant.isPreorder && option.stock <= 0
                  return (
                    <button
                      key={`${variant.id}-${option.size ?? DEFAULT_SIZE_KEY}`}
                      type="button"
                      onClick={() => handleSelectSize(index)}
                      disabled={isDisabled}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-semibold transition",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background text-foreground hover:border-primary/60",
                        isDisabled && "cursor-not-allowed border-border bg-muted text-muted-foreground",
                      )}
                    >
                      {option.size ?? "Default"}
                    </button>
                  )
                })}
              </div>
              {!variant.isPreorder && selectedSize && (
                <p className="text-xs text-muted-foreground">
                  {selectedSize.stock > 0 ? `${selectedSize.stock} units available` : "Currently out of stock"}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Quantity</p>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-10 rounded-full"
                  onClick={() => adjustQuantity(-1)}
                  disabled={quantity <= 0}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <input
                  type="number"
                  min={0}
                  value={quantity}
                  onChange={(event) => handleManualQuantity(event.target.value)}
                  className="w-20 rounded-md border border-border bg-background py-2 text-center text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-10 rounded-full"
                  onClick={() => adjustQuantity(1)}
                  disabled={!variant.isPreorder && selectedSize !== null && quantity >= selectedSize.stock}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {variant.isPreorder && (
                <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-amber-900">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em]">Pre-order information</p>
                  {variant.preorderMessage ? (
                    <p className="text-sm">{variant.preorderMessage}</p>
                  ) : (
                    <p className="text-sm">
                      Reserve this item ahead of time. We&apos;ll notify you as soon as it&apos;s ready for pickup or
                      delivery.
                    </p>
                  )}
                  {variant.preorderDownPayment ? (
                    <div className="text-sm">
                      {selectedDownPaymentSummary ? (
                        <p>
                          Down payment due now: <strong>{formatCurrency(selectedDownPaymentSummary.perUnitAmount)}</strong>{" "}
                          per item (
                          {variant.preorderDownPayment.type === "percent"
                            ? `${variant.preorderDownPayment.value}% of the selected size price`
                            : `${formatCurrency(variant.preorderDownPayment.value)} each`}
                          ). Remaining balance is settled when your order is fulfilled.
                        </p>
                      ) : (
                        <p>
                          A down payment is required when placing this pre-order. Choose a size to preview the exact
                          amount.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm">No deposit needed today—pay in full when your pre-order is fulfilled.</p>
                  )}
                </div>
              )}
            </div>
            <Button
                type="button"
                size="lg"
                className="w-full rounded-full py-6 text-base font-semibold"
                onClick={handleAddCurrentVariant}
                disabled={!canAddToCart}
              >
                Add To Cart
              </Button>
          </div>

          <div className="flex flex-col gap-6">
            <Carousel
              className="relative w-full"
              setApi={setGalleryCarouselApi}
              opts={{ align: "start" }}
            >
              <CarouselContent className="-ml-4">
                {gallery.map((image, index) => {
                  const caption = galleryCaptions[index] ?? `${variant.displayName} image ${index + 1}`
                  return (
                    <CarouselItem key={`${image}-${index}`} className="pl-4">
                      <div className="relative overflow-hidden rounded-3xl border border-border bg-muted/40">
                        <img
                          src={image}
                          alt={caption}
                          className="aspect-square w-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
              {gallery.length > 1 && (
                <>
                  <CarouselPrevious className="left-4 top-1/2 -translate-y-1/2 border-0 bg-background/85 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60" />
                  <CarouselNext className="right-4 top-1/2 -translate-y-1/2 border-0 bg-background/85 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60" />
                </>
              )}
            </Carousel>

            {gallery.length > 1 && (
              <div className="flex items-center justify-center gap-2">
                {gallery.map((_, index) => {
                  const isActive = index === activeImageIndex
                  return (
                    <button
                      key={`indicator-${index}`}
                      type="button"
                      className={cn(
                        "h-2 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                        isActive
                          ? "w-10 bg-primary"
                          : "w-6 bg-border hover:bg-primary/50",
                      )}
                      onClick={() => {
                        setActiveImageIndex(index)
                        galleryCarouselApi?.scrollTo(index)
                      }}
                      aria-label={galleryCaptions[index] ?? `Go to image ${index + 1}`}
                    >
                      <span className="sr-only">{galleryCaptions[index] ?? `View image ${index + 1}`}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {siblingVariants.length > 1 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Also Available In
                </p>
                <div className="flex flex-wrap gap-3">
                  {siblingVariants.map((entry) => (
                    <Link
                      key={entry.id}
                      href={entry.detailPath}
                      className={cn(
                        "flex items-center gap-3 rounded-full border px-4 py-2 text-sm transition hover:border-primary/60",
                        entry.isActive ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground",
                      )}
                    >
                      <img src={entry.image} alt="" className="h-10 w-10 rounded-full object-cover" />
                      <span>{entry.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <section className="mt-20 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Recommended for you</h2>
            <p className="text-sm text-muted-foreground">
              Keep exploring coordinating pieces that customers love pairing together.
            </p>
          </div>
          {recommendedVariants.length > 0 ? (
            <CheckoutRecommendationsCarousel variants={recommendedVariants} onAddToCart={handleAddRecommendedVariant} />
          ) : (
            <p className="text-sm text-muted-foreground">Check back soon for more curated picks.</p>
          )}
        </section>
      </div>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        isHydrated={isCartHydrated}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateCartQuantity}
        onProceedToCheckout={handleProceedToCheckout}
        onStartShopping={handleStartShopping}
      />
    </div>
  )
}
