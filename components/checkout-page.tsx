"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Paperclip } from "lucide-react"
import Navigation from "@/components/navigation"
import PaymentOptions from "@/components/payment-options"
import CartItem from "@/components/cart-item"
import CheckoutRecommendationsCarousel from "@/components/checkout-recommendations-carousel"
import QRCodeModal from "@/components/qr-code-modal"
import { useStore } from "@/lib/store"
import { mapPaymentConfigsToOptions, type PaymentMethodOption } from "@/lib/payment-methods"
import { createVariantSlug, formatCurrency } from "@/lib/utils"
import { calculateShippingFee, PHILIPPINE_REGIONS, type ShippingFeeConfig } from "../lib/shipping"
import { useRouter, useSearchParams } from "next/navigation"
import { decompressFromEncodedURIComponent } from "lz-string"
import type { CatalogVariant, CollectionTileMode } from "@/lib/storefront-data"
import { calculateVariantDownPaymentSummary } from "@/lib/down-payment"
import type { PreorderDownPaymentSummary } from "@/lib/types"
import TurnstileWidget from "@/components/turnstile-widget"
import { useCart } from "@/lib/cart"

interface CartItemType {
  lineId: string
  productId: number
  variantId: number
  name: string
  image: string
  customizations: Record<string, string>
  price: number
  quantity: number
  preorderDownPayment?: PreorderDownPaymentSummary | null
}

type DecodedCartItem = Omit<CartItemType, "lineId">

type CheckoutPickupLocation = {
  name: string
  unit: string
  lot: string
  street: string
  city: string
  region: string
  zipCode: string
  country: string
  notes: string
}

function decodeCartParam(value: string): DecodedCartItem[] | null {
  try {
    const decompressed = decompressFromEncodedURIComponent(value)
    if (!decompressed) return null
    const parsed = JSON.parse(decompressed)
    if (!Array.isArray(parsed)) return null
    return parsed
      .map((item) => {
        const productId = Number(item?.productId ?? item?.id ?? 0)
        const variantId = Number(item?.variantId ?? item?.id ?? 0)
        const quantity = Number(item?.quantity ?? 0)
        const price = Number(item?.price ?? 0)

        if (!variantId) return null

        return {
          productId,
          variantId,
          name: typeof item?.name === "string" ? item.name : "Unknown Item",
          image: typeof item?.image === "string" ? item.image : "/placeholder.svg",
          customizations:
            item?.customizations && typeof item.customizations === "object"
              ? (item.customizations as Record<string, string>)
              : {},
          price,
          quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
        }
      })
      .filter((item): item is DecodedCartItem => Boolean(item))
  } catch (error) {
    console.error("Failed to parse cart from URL:", error)
    return null
  }
}

export default function CheckoutPage() {
  const { addOrder, paymentMethods, isLoadingPaymentMethods, productBrands, productCategories, products } = useStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const honeypotRef = useRef<HTMLInputElement | null>(null)
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaErrorMessage, setCaptchaErrorMessage] = useState<string | null>(null)
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0)
  const [navMode, setNavMode] = useState<CollectionTileMode>("brands")
  const [shippingConfig, setShippingConfig] = useState<ShippingFeeConfig | undefined>(undefined)
  const [isVatEnabledSetting, setIsVatEnabledSetting] = useState(true)
  const [isPickupEnabledSetting, setIsPickupEnabledSetting] = useState(true)
  const [navCollectionsEnabled, setNavCollectionsEnabled] = useState(true)
  const [isCartHydrated, setIsCartHydrated] = useState(false)
  const [pickupLocation, setPickupLocation] = useState<CheckoutPickupLocation | null>(null)
  const [minPickupDate, setMinPickupDate] = useState<string | null>(null)

  const {
    items: cartLines,
    addItem: addCartItem,
    updateQuantity: updateCartQuantity,
    removeItem: removeCartItem,
    replaceCart,
    clearCart,
  } = useCart()
  const hasInitialized = useRef(false)

  useEffect(() => {
    setMinPickupDate(new Date().toISOString().split("T")[0])
  }, [])

  const cartItems = useMemo<CartItemType[]>(
    () =>
      cartLines.map((line) => ({
        lineId: line.lineId,
        productId: line.productId,
        variantId: line.variantId,
        name: line.name,
        image: line.image,
        customizations:
          line.attributes && Object.keys(line.attributes).length > 0 ? { ...line.attributes } : {},
        price: line.price,
        quantity: line.quantity,
      })),
    [cartLines],
  )
  const variantMetadata = useMemo(() => {
    const map = new Map<number, (typeof products)[number]["variants"][number]>()
    products.forEach((product) => {
      product.variants.forEach((variant) => {
        map.set(variant.id, variant)
      })
    })
    return map
  }, [products])

  const cartItemsWithDownPayment = useMemo<CartItemType[]>(() => {
    return cartItems.map((item) => {
      const variant = variantMetadata.get(item.variantId)
      if (!variant) {
        return { ...item, preorderDownPayment: null }
      }
      const downPaymentSummary = calculateVariantDownPaymentSummary(variant, item.price, item.quantity)
      return {
        ...item,
        preorderDownPayment: downPaymentSummary,
      }
    })
  }, [cartItems, variantMetadata])

  const displayCartItems = useMemo(
    () => (isCartHydrated ? cartItemsWithDownPayment : []),
    [isCartHydrated, cartItemsWithDownPayment],
  )

  const orderItems = useMemo(
    () => cartItemsWithDownPayment.map(({ lineId, ...rest }) => ({ ...rest })),
    [cartItemsWithDownPayment],
  )

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""
  const isCaptchaEnabled = Boolean(turnstileSiteKey)

  const paymentOptions = useMemo(
    () =>
      mapPaymentConfigsToOptions(
        paymentMethods.filter((method) => method.isActive),
      ),
    [paymentMethods],
  )

  const selectedPaymentOption = useMemo(
    () => paymentOptions.find((option) => option.configId === selectedPaymentId) ?? null,
    [paymentOptions, selectedPaymentId],
  )

    const navigationItems = useMemo(() => {
    if (!navCollectionsEnabled) {
      return []
    }
    if (navMode === "categories") {
      return (
        productCategories
          ?.filter((category) => typeof category.name === "string" && category.name.trim().length > 0)
          .map((category) => ({
            id: category.id,
            name: category.name.trim(),
            href: `/catalog?category=${encodeURIComponent(category.name.trim())}`,
            kind: "category" as const,
          }))
          .sort((a, b) => a.name.localeCompare(b.name)) ?? []
      )
    }

    const entries =
      productBrands
        ?.filter((brand) => typeof brand.name === "string" && brand.name.trim().length > 0)
        .map((brand) => ({
          id: brand.id,
          name: brand.name.trim(),
          href: `/catalog?brand=${encodeURIComponent(brand.name.trim())}`,
          kind: "brand" as const,
        })) ?? []

    const hasUnbrandedProducts = products.some((product) => !product.brand || product.brand.name.trim().length === 0)
    if (hasUnbrandedProducts) {
      entries.push({
        id: -1,
        name: "Unbranded",
        href: `/catalog?brand=${encodeURIComponent("Unbranded")}`,
        kind: "brand" as const,
      })
    }

    return entries.sort((a, b) => a.name.localeCompare(b.name))
  }, [navMode, navCollectionsEnabled, productCategories, productBrands, products])

  useEffect(() => {
    if (paymentOptions.length === 0) {
      setSelectedPaymentId(null)
      return
    }

    if (!selectedPaymentId || !paymentOptions.some((option) => option.configId === selectedPaymentId)) {
      setSelectedPaymentId(paymentOptions[0].configId)
    }
  }, [paymentOptions, selectedPaymentId])

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    unit: "",
    lot: "",
    street: "",
    city: "",
    region: "",
    zipCode: "",
    country: "Philippines",
    instagramHandle: "",
    fulfillmentMethod: "delivery",
    pickupDate: "",
    pickupTime: "",
  })

  useEffect(() => {
    if (!isPickupEnabledSetting && formData.fulfillmentMethod === "pickup") {
      setFormData((prev) => ({
        ...prev,
        fulfillmentMethod: "delivery",
      }))
    }
  }, [isPickupEnabledSetting, formData.fulfillmentMethod])

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const cartParam = searchParams.get("cart")
    if (cartParam) {
      const decodedCart = decodeCartParam(cartParam)
      if (decodedCart) {
        replaceCart(
          decodedCart.map((item) => ({
            variantId: item.variantId,
            productId: item.productId,
            name: item.name,
            image: item.image,
            brandName: null,
            attributes: item.customizations,
            price: item.price,
            quantity: item.quantity,
            maxStock: Number.POSITIVE_INFINITY,
          })),
        )
      }
    }
  }, [replaceCart, searchParams])

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const loadStorefrontSettings = async () => {
      try {
        const response = await fetch("/api/storefront-settings", { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Failed to load storefront settings (${response.status})`)
        }
        const payload = (await response.json()) as {
          data?: {
            mode?: CollectionTileMode | string
            shippingBaseFee?: number
            shippingRegionOverrides?: Record<string, number>
            vatEnabled?: boolean
            pickupEnabled?: boolean
            navCollectionsEnabled?: boolean
            pickupLocation?: {
              name?: string | null
              unit?: string | null
              lot?: string | null
              street?: string | null
              city?: string | null
              region?: string | null
              zipCode?: string | null
              country?: string | null
              notes?: string | null
            }
          }
        }

        if (!isMounted) {
          return
        }

        const settings = payload?.data ?? {}
        const mode = settings.mode
        if (typeof mode === "string") {
          const normalized = mode.trim().toLowerCase()
          if (normalized === "categories" || normalized === "category") {
            setNavMode("categories")
          } else if (normalized === "brands" || normalized === "brand") {
            setNavMode("brands")
          }
        }

        const baseFee = typeof settings.shippingBaseFee === "number" ? Number(settings.shippingBaseFee) : undefined
        const overrides =
          settings.shippingRegionOverrides &&
          typeof settings.shippingRegionOverrides === "object" &&
          !Array.isArray(settings.shippingRegionOverrides)
            ? (settings.shippingRegionOverrides as Record<string, number>)
            : undefined

        if (baseFee !== undefined || overrides) {
          setShippingConfig({ baseFee, regionOverrides: overrides })
        } else {
          setShippingConfig(undefined)
        }

        const pickupEnabled =
          typeof settings.pickupEnabled === "boolean" ? settings.pickupEnabled : true
        setIsPickupEnabledSetting(pickupEnabled)

        if (pickupEnabled && settings.pickupLocation) {
          setPickupLocation({
            name: settings.pickupLocation.name ?? "",
            unit: settings.pickupLocation.unit ?? "",
            lot: settings.pickupLocation.lot ?? "",
            street: settings.pickupLocation.street ?? "",
            city: settings.pickupLocation.city ?? "",
            region: settings.pickupLocation.region ?? "",
            zipCode: settings.pickupLocation.zipCode ?? "",
            country: settings.pickupLocation.country ?? "Philippines",
            notes: settings.pickupLocation.notes ?? "",
          })
        } else {
          setPickupLocation(null)
        }

        if (typeof settings.vatEnabled === "boolean") {
          setIsVatEnabledSetting(settings.vatEnabled)
        }

        if (typeof settings.navCollectionsEnabled === "boolean") {
          setNavCollectionsEnabled(settings.navCollectionsEnabled)
        } else {
          setNavCollectionsEnabled(true)
        }
      } catch (error) {
        if (controller.signal.aborted) return
        console.error("Failed to load storefront settings", error)
      }
    }

    loadStorefrontSettings()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  const handleCaptchaVerify = useCallback((token: string) => {
    setCaptchaToken(token)
    setCaptchaErrorMessage(null)
  }, [])

  const handleCaptchaExpire = useCallback(() => {
    setCaptchaToken(null)
  }, [])

  const handleCaptchaError = useCallback(() => {
    setCaptchaToken(null)
    setCaptchaErrorMessage("Captcha verification failed. Please retry the challenge.")
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFulfillmentMethodChange = (method: "delivery" | "pickup") => {
    if (method === "pickup") {
      if (!isPickupEnabledSetting) {
        alert("Pickup is currently unavailable. Please select delivery instead.")
        return
      }
      if (!pickupLocation) {
        alert("Pickup is currently unavailable. Please select delivery instead.")
        return
      }
    }
    setFormData((prev) => ({
      ...prev,
      fulfillmentMethod: method,
      ...(method === "delivery" ? { pickupDate: "", pickupTime: "" } : {}),
    }))
  }

  const handlePaymentSelect = (option: PaymentMethodOption) => {
    setSelectedPaymentId(option.configId)
    setShowQRModal(true)
  }

  const handleUpdateQuantity = (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeCartItem(lineId)
      return
    }
    updateCartQuantity(lineId, quantity)
  }

  const handleRemoveItem = (lineId: string) => {
    removeCartItem(lineId)
  }

  const handleProofOfPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofOfPayment(file)
    }
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (honeypotRef.current?.value) {
      console.warn("Checkout submission blocked by honeypot field")
      return
    }

    if (isCaptchaEnabled && !captchaToken) {
      setCaptchaErrorMessage("Please complete the CAPTCHA challenge before placing your order.")
      return
    }

    setIsSubmitting(true)

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      alert("Please fill in all required personal information fields")
      setIsSubmitting(false)
      return
    }

    const isPickupOrder = formData.fulfillmentMethod === "pickup"

    if (isPickupOrder && (!pickupLocation || !isPickupEnabledSetting)) {
      alert("Pickup is currently unavailable. Please choose delivery.")
      setIsSubmitting(false)
      return
    }

    if (!isPickupOrder && (!formData.street || !formData.city || !formData.region || !formData.zipCode)) {
      alert("Please fill in all required delivery address fields")
      setIsSubmitting(false)
      return
    }

    if (isPickupOrder && (!formData.pickupDate || !formData.pickupTime)) {
      alert("Please choose a pickup date and time")
      setIsSubmitting(false)
      return
    }

    if (!proofOfPayment) {
      alert("Please upload proof of payment")
      setIsSubmitting(false)
      return
    }

    if (!selectedPaymentOption) {
      alert("Please select a payment method")
      setIsSubmitting(false)
      return
    }

    let proofOfPaymentUrl = ""

    try {
      const uploadData = new FormData()
      uploadData.append("file", proofOfPayment)
      uploadData.append("prefix", `proof-${Date.now()}`)

      const uploadResponse = await fetch("/api/uploads/payments", {
        method: "POST",
        body: uploadData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Upload failed")
      }

      const uploadPayload = await uploadResponse.json()
      proofOfPaymentUrl = uploadPayload.url

      if (!proofOfPaymentUrl) {
        throw new Error("Missing uploaded file URL")
      }
    } catch (error) {
      console.error("Failed to upload proof of payment", error)
      alert("Failed to upload proof of payment. Please try again.")
      setIsSubmitting(false)
      return
    }

    try {
      const orderId = await addOrder({
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          instagramHandle: formData.instagramHandle.trim() ? formData.instagramHandle.trim() : null,
        },
        delivery:
          isPickupOrder && pickupLocation
            ? {
                unit: pickupLocation.unit,
                lot: pickupLocation.lot,
                street: pickupLocation.street,
                city: pickupLocation.city,
                region: pickupLocation.region,
                zipCode: pickupLocation.zipCode,
                country: pickupLocation.country,
              }
            : {
                unit: formData.unit,
                lot: formData.lot,
                street: formData.street,
                city: formData.city,
                region: formData.region,
                zipCode: formData.zipCode,
                country: formData.country,
              },
        fulfillmentMethod: formData.fulfillmentMethod as "delivery" | "pickup",
        pickup:
          isPickupOrder && pickupLocation
            ? {
                locationName: pickupLocation.name || pickupLocation.street,
                unit: pickupLocation.unit,
                lot: pickupLocation.lot,
                street: pickupLocation.street,
                city: pickupLocation.city,
                region: pickupLocation.region,
                zipCode: pickupLocation.zipCode,
                country: pickupLocation.country,
                notes: pickupLocation.notes,
                scheduledDate: formData.pickupDate,
                scheduledTime: formData.pickupTime,
              }
            : null,
        items: orderItems,
        paymentMethod: selectedPaymentOption.provider,
        proofOfPayment: proofOfPaymentUrl,
        subtotal,
        vat,
        shippingFee,
        trackingId: null,
        total,
        captchaToken: captchaToken ?? undefined,
      })

      clearCart()
      router.push(`/thank-you?orderId=${orderId}`)
    } catch (error) {
      console.error("Failed to place order", error)
      setCaptchaToken(null)
      setCaptchaResetSignal((prev) => prev + 1)
      setCaptchaErrorMessage("Order submission failed. Please complete the CAPTCHA again.")
      alert("Failed to place order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    setIsCartHydrated(true)
  }, [])

  const subtotal = displayCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const effectiveVatRate = isVatEnabledSetting ? 0.12 : 0
  const vat = Number((subtotal * effectiveVatRate).toFixed(2))
  const isPickupSelected =
    formData.fulfillmentMethod === "pickup" && Boolean(pickupLocation) && isPickupEnabledSetting
  const shippingFee = isPickupSelected ? 0 : calculateShippingFee(formData.region, shippingConfig)
  const total = Number((subtotal + vat + shippingFee).toFixed(2))
  const vatLabel = isVatEnabledSetting ? "VAT (12%)" : "VAT (0%)"

  const productMap = useMemo(() => {
    const entries = new Map<number, (typeof products)[number]>()
    products.forEach((product) => {
      entries.set(product.id, product)
    })
    return entries
  }, [products])

  const cartCategorySet = useMemo(() => {
    const set = new Set<string>()
    for (const item of displayCartItems) {
      const product = productMap.get(item.productId)
      if (!product) continue
      product.categories?.forEach((category) => {
        if (category?.name) {
          set.add(category.name)
        }
      })
    }
    return set
  }, [displayCartItems, productMap])

  const catalogVariants = useMemo<CatalogVariant[]>(() => {
    const variants: CatalogVariant[] = []

    const buildDisplayName = (productName: string, label: string | null, sku?: string | null) => {
      const cleaned = label && label.trim().length > 0 ? label.trim() : null
      if (cleaned) return `${productName} · ${cleaned}`
      const cleanedSku = sku && sku.trim().length > 0 ? sku.trim() : null
      if (cleanedSku) return `${productName} · ${cleanedSku}`
      return `${productName} · Classic`
    }

    products.forEach((product) => {
      const categories = (product.categories ?? []).map((category) => category.name).filter(Boolean)
      const brandName =
        product.brand && typeof product.brand.name === "string" && product.brand.name.trim().length > 0
          ? product.brand.name.trim()
          : null

      product.variants.forEach((variant) => {
        const sizes =
          variant.sizes && variant.sizes.length > 0
            ? variant.sizes
            : [{ size: variant.size ?? null, price: variant.price, stock: variant.stock }]

        const mappedSizes = sizes.map((entry) => ({
          label: entry.size && entry.size.trim().length > 0 ? entry.size.trim() : "Default",
          price: Number(entry.price),
          stock: Number(entry.stock),
        }))

        const prices = mappedSizes.map((entry) => entry.price)
        const minPrice = prices.length > 0 ? Math.min(...prices) : Number(variant.price ?? 0)
        const maxPrice = prices.length > 0 ? Math.max(...prices) : Number(variant.price ?? 0)
        const totalStock = mappedSizes.reduce((sum, entry) => sum + (Number.isFinite(entry.stock) ? entry.stock : 0), 0)

          variants.push({
            id: variant.id,
            productId: product.id,
            productName: product.name,
            variantLabel: variant.color ?? variant.sku ?? null,
            displayName: buildDisplayName(product.name, variant.color ?? null, variant.sku ?? undefined),
            image: variant.image ?? product.image,
            description: variant.description ?? null,
            brandName,
            categories,
            sizes: mappedSizes,
            minPrice,
            maxPrice,
            totalStock,
            detailPath: `/shop/${createVariantSlug(
              variant.id,
              product.name,
              variant.color ?? variant.sku ?? null,
            )}`,
            isPreorder: Boolean(variant.isPreorder),
          })
      })
    })

    return variants
  }, [products])

  const suggestedVariants = useMemo(() => {
    if (catalogVariants.length === 0) return []

    const inCartVariantIds = new Set(displayCartItems.map((item) => item.variantId))

    const filtered = catalogVariants.filter((variant) => {
      if (inCartVariantIds.has(variant.id)) return false
      if (cartCategorySet.size === 0) return true
      return variant.categories.some((category) => cartCategorySet.has(category))
    })

    return filtered.slice(0, 8)
  }, [catalogVariants, cartCategorySet, displayCartItems])

  const handleAddVariantToCart = useCallback(
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
      addCartItem({
        variantId: payload.variantId,
        productId: payload.productId,
        name: payload.name,
        image: payload.image,
        brandName: payload.brandName ?? null,
        attributes: payload.size ? { Size: payload.size } : undefined,
        price: payload.price,
        quantity: payload.quantity > 0 ? payload.quantity : 1,
        maxStock: Number.POSITIVE_INFINITY,
      })
    },
    [addCartItem],
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation items={navigationItems} hideAdminLink showCartButton={false} showLoginIcon />

      <QRCodeModal
        open={showQRModal && Boolean(selectedPaymentOption)}
        onOpenChange={setShowQRModal}
        paymentMethod={selectedPaymentOption?.name ?? "Payment"}
        qrCodeUrl={selectedPaymentOption?.qrCodeUrl ?? undefined}
        accountName={selectedPaymentOption?.accountName}
        instructions={selectedPaymentOption?.instructions}
      />

      <form onSubmit={handlePlaceOrder}>
        <input
          ref={honeypotRef}
          type="text"
          name="contactPreference"
          autoComplete="off"
          tabIndex={-1}
          className="hidden"
          aria-hidden="true"
        />
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
            <p className="text-sm text-muted-foreground">Review your order and enter your delivery details.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentOptions
                    options={paymentOptions}
                    selected={selectedPaymentId ?? undefined}
                    onSelect={handlePaymentSelect}
                    isLoading={isLoadingPaymentMethods}
                    disabled={isSubmitting}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-0">
                  <CardTitle>Proof of Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="proof-of-payment">Upload Screenshot or Photo *</Label>
                    <div className="flex items-center gap-4">
                      <label
                        htmlFor="proof-of-payment"
                        className="flex items-center gap-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent transition-colors"
                      >
                        <Paperclip className="w-4 h-4" />
                        <span className="text-sm">
                          {proofOfPayment ? proofOfPayment.name : "Attach proof of payment"}
                        </span>
                      </label>
                      <Input
                        id="proof-of-payment"
                        type="file"
                        accept="image/*"
                        onChange={handleProofOfPaymentChange}
                        className="hidden"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Please upload a clear screenshot or photo of your payment confirmation
                    </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Fulfillment Method</CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose between home delivery or picking up your order at our studio.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant={isPickupSelected ? "outline" : "default"}
                className="flex-1 min-w-[120px]"
                onClick={() => handleFulfillmentMethodChange("delivery")}
                disabled={isSubmitting}
              >
                Delivery
              </Button>
              <Button
                type="button"
                variant={isPickupSelected ? "default" : "outline"}
                className="flex-1 min-w-[120px]"
                onClick={() => handleFulfillmentMethodChange("pickup")}
                disabled={!pickupLocation || !isPickupEnabledSetting || isSubmitting}
              >
                Pickup
              </Button>
            </div>
            {!pickupLocation || !isPickupEnabledSetting ? (
              <p className="text-xs text-muted-foreground">
                {isPickupEnabledSetting
                  ? "Pickup will be available once the store configures a pickup location."
                  : "Pickup is currently disabled. Please choose delivery."}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="Juan"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Dela Cruz"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+63 912 345 6789"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="juan@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagramHandle">Instagram Handle</Label>
                <Input
                  id="instagramHandle"
                  name="instagramHandle"
                  placeholder="@kazumatcha"
                  value={formData.instagramHandle}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{isPickupSelected ? "Pickup Details" : "Delivery Details"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isPickupSelected ? (
                <>
                  {pickupLocation ? (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-dashed border-border/60 p-4">
                        <p className="text-sm font-semibold">{pickupLocation.name || "Pickup Counter"}</p>
                        <address className="mt-2 space-y-1 text-sm text-muted-foreground not-italic">
                          {pickupLocation.unit && <p>{pickupLocation.unit}</p>}
                          {pickupLocation.lot && <p>{pickupLocation.lot}</p>}
                          <p>{pickupLocation.street}</p>
                          <p>
                            {pickupLocation.city}, {pickupLocation.region} {pickupLocation.zipCode}
                          </p>
                          <p>{pickupLocation.country}</p>
                        </address>
                        {pickupLocation.notes && (
                          <p className="mt-2 text-xs text-muted-foreground">{pickupLocation.notes}</p>
                        )}
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="pickupDate">Pickup Date *</Label>
                          <Input
                            id="pickupDate"
                            name="pickupDate"
                            type="date"
                            min={minPickupDate ?? undefined}
                            value={formData.pickupDate}
                            onChange={handleInputChange}
                            required={isPickupSelected}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pickupTime">Pickup Time *</Label>
                          <Input
                            id="pickupTime"
                            name="pickupTime"
                            type="time"
                            step={900}
                            value={formData.pickupTime}
                            onChange={handleInputChange}
                            required={isPickupSelected}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Pickup location is not available right now. Please choose delivery instead.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit/Floor/Building</Label>
                    <Input
                      id="unit"
                      name="unit"
                      placeholder="Unit 123, 4th Floor"
                      value={formData.unit}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lot">Lot/Block</Label>
                    <Input
                      id="lot"
                      name="lot"
                      placeholder="Block 5, Lot 10"
                      value={formData.lot}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">Street *</Label>
                    <Input
                      id="street"
                      name="street"
                      placeholder="Bonifacio Street"
                      value={formData.street}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="Makati"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">Region *</Label>
                      <Select
                        value={formData.region || undefined}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            region: value,
                          }))
                        }
                      >
                        <SelectTrigger id="region" className="max-w-[18rem] w-full">
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {PHILIPPINE_REGIONS.map((regionOption: string) => (
                            <SelectItem key={regionOption} value={regionOption}>
                              {regionOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip Code *</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        placeholder="1200"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={formData.country || undefined}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          country: value,
                        }))
                      }
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Philippines">Philippines</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-22">
                <CardHeader className="pb-3">
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {displayCartItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">Your cart is empty</p>
                    ) : (
                      displayCartItems.map((item) => (
                        <CartItem
                          key={item.lineId}
                          item={item}
                          onUpdateQuantity={handleUpdateQuantity}
                          onRemove={handleRemoveItem}
                        />
                      ))
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{vatLabel}</span>
                      <span className="text-foreground">{formatCurrency(vat)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{isPickupSelected ? "Pickup" : "Shipping"}</span>
                      <span className="text-foreground">
                        {shippingFee === 0
                          ? isPickupSelected
                            ? "Free pickup"
                            : "Free"
                          : formatCurrency(shippingFee)}
                      </span>
                    </div>
                    {isPickupSelected && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pickup slot</span>
                        <span className="text-foreground">
                          {formData.pickupDate && formData.pickupTime
                            ? `${formData.pickupDate} • ${formData.pickupTime}`
                            : "To be scheduled"}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>

                  {isCaptchaEnabled ? (
                    <div className="space-y-2">
                      <TurnstileWidget
                        siteKey={turnstileSiteKey}
                        action="checkout_submission"
                        onVerify={handleCaptchaVerify}
                        onExpire={handleCaptchaExpire}
                        onError={handleCaptchaError}
                        resetSignal={captchaResetSignal}
                      />
                      {captchaErrorMessage ? <p className="text-xs text-destructive">{captchaErrorMessage}</p> : null}
                    </div>
                  ) : (
                    <p className="rounded-md border border-dashed border-yellow-500/40 bg-yellow-500/10 p-3 text-xs text-yellow-700 dark:text-yellow-400">
                      CAPTCHA is not configured. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY to enable bot protection.
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={
                      displayCartItems.length === 0 ||
                      isSubmitting ||
                      !selectedPaymentOption ||
                      !isCaptchaEnabled ||
                      (isCaptchaEnabled && !captchaToken)
                    }
                  >
                    {isSubmitting ? "Processing..." : "Place Order"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="mb-4 text-2xl font-bold text-foreground">You May Also Like</h2>
            {suggestedVariants.length === 0 ? (
              <p className="text-sm text-muted-foreground">Add items to your cart to see recommendations.</p>
            ) : (
              <CheckoutRecommendationsCarousel variants={suggestedVariants} onAddToCart={handleAddVariantToCart} />
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
