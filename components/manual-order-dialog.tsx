"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Check, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { calculateShippingFee, PHILIPPINE_REGIONS, type ShippingFeeConfig } from "../lib/shipping"
import type { FulfillmentMethod, NewOrderInput, OrderItem, Product, ProductVariant } from "@/lib/types"
import { useStore } from "@/lib/store"
import { mapPaymentConfigsToOptions } from "@/lib/payment-methods"
import { calculateVariantDownPaymentSummary } from "@/lib/down-payment"

type ManualOrderItem = OrderItem & { uid: string }

type VariantSizeOption = {
  id: string
  label: string
  price: number
  stock: number
}

type AdminPickupLocation = {
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

function getVariantSizeOptions(variant?: ProductVariant | null): VariantSizeOption[] {
  if (!variant) return []

  const baseEntries =
    variant.sizes && variant.sizes.length > 0
      ? variant.sizes
      : [{ size: variant.size ?? null, price: variant.price, stock: variant.stock }]

  return baseEntries.map((entry, index) => {
    const rawLabel = typeof entry.size === "string" ? entry.size.trim() : ""
    const label = rawLabel.length > 0 ? rawLabel : "Default"
    const price = Number(entry.price)
    const stock = Number(entry.stock)

    return {
      id: `${variant.id}-${index}`,
      label,
      price: Number.isFinite(price) && price >= 0 ? price : 0,
      stock: Number.isFinite(stock) ? Math.max(0, stock) : 0,
    }
  })
}

interface ManualOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: Product[]
  onCreate: (order: NewOrderInput) => Promise<void>
}

const initialCustomer = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  instagramHandle: "",
}

const initialDelivery = {
  unit: "",
  lot: "",
  street: "",
  city: "",
  region: "",
  zipCode: "",
  country: "Philippines",
}

const initialItemDraft = {
  productId: "",
  variantId: "",
  sizeKey: "",
  quantity: "1",
}

function getVariantLabel(variant: ProductVariant) {
  const sku = (variant.sku?.trim() ?? "").toUpperCase() || `VAR-${variant.id}`

  const variantNameParts = [variant.color?.trim()].filter(
    (value): value is string => Boolean(value && value.length > 0),
  )

  const name = variantNameParts.join(" ").trim() || "Standard"
  return `[${sku}] - ${name}`
}

export default function ManualOrderDialog({ open, onOpenChange, products, onCreate }: ManualOrderDialogProps) {
  const { paymentMethods, isLoadingPaymentMethods } = useStore()
  const paymentOptions = useMemo(
    () => mapPaymentConfigsToOptions(paymentMethods.filter((method) => method.isActive)),
    [paymentMethods],
  )
  const [customer, setCustomer] = useState(initialCustomer)
  const [delivery, setDelivery] = useState(initialDelivery)
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>("delivery")
  const [pickupSchedule, setPickupSchedule] = useState({ date: "", time: "" })
  const [pickupLocation, setPickupLocation] = useState<AdminPickupLocation | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [isProofPreviewOpen, setIsProofPreviewOpen] = useState(false)
  const [items, setItems] = useState<ManualOrderItem[]>([])
  const [itemDraft, setItemDraft] = useState(initialItemDraft)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [step, setStep] = useState(0)
  const [shippingConfig, setShippingConfig] = useState<ShippingFeeConfig | undefined>(undefined)
  const [isVatEnabledSetting, setIsVatEnabledSetting] = useState(true)
  const [pickupEnabled, setPickupEnabled] = useState(false)

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === Number(itemDraft.productId)),
    [itemDraft.productId, products],
  )

  const selectedVariant = useMemo(
    () => selectedProduct?.variants.find((variant) => variant.id === Number(itemDraft.variantId)),
    [itemDraft.variantId, selectedProduct?.variants],
  )

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
            shippingBaseFee?: number
            shippingRegionOverrides?: Record<string, number>
            vatEnabled?: boolean
            pickupEnabled?: boolean
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

        if (typeof settings.vatEnabled === "boolean") {
          setIsVatEnabledSetting(settings.vatEnabled)
        }

        const pickupIsEnabled =
          typeof settings.pickupEnabled === "boolean" ? settings.pickupEnabled : false
        setPickupEnabled(pickupIsEnabled)

        if (pickupIsEnabled && settings.pickupLocation) {
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
      } catch (error) {
        if (controller.signal.aborted) return
        console.error("[manual-order-dialog] Failed to load storefront settings", error)
      }
    }

    loadStorefrontSettings()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (!pickupEnabled && fulfillmentMethod === "pickup") {
      setFulfillmentMethod("delivery")
    }
  }, [pickupEnabled, fulfillmentMethod])

  useEffect(() => {
    if (!proofFile) {
      setProofPreview(null)
      return
    }

    const objectUrl = URL.createObjectURL(proofFile)
    setProofPreview(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [proofFile])
  useEffect(() => {
    if (!proofFile) {
      setIsProofPreviewOpen(false)
    }
  }, [proofFile])

  useEffect(() => {
    setError(null)
  }, [open, paymentOptions])

  useEffect(() => {
    if (paymentOptions.length === 0) {
      setPaymentMethod("")
      return
    }

    setPaymentMethod((current) => {
      if (current && paymentOptions.some((option) => option.provider === current)) {
        return current
      }
      return paymentOptions[0].provider
    })
  }, [paymentOptions])

  useEffect(() => {
    if (!open) {
      // reset form state whenever the dialog closes
      setStep(0)
      setCustomer(initialCustomer)
      setDelivery(initialDelivery)
      setFulfillmentMethod("delivery")
      setPickupSchedule({ date: "", time: "" })
      setPaymentMethod(paymentOptions[0]?.provider ?? "")
      setProofFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      setItems([])
      setItemDraft(initialItemDraft)
      setError(null)
      setIsSubmitting(false)
    }
  }, [open])


  const canAdvanceFromStep = useCallback(
    (s: number): boolean => {
      switch (s) {
        case 0:
          return (
            customer.firstName.trim().length > 0 &&
            customer.lastName.trim().length > 0 &&
            customer.email.trim().length > 0 &&
            customer.phone.trim().length > 0
          )
        case 1:
          if (fulfillmentMethod === "pickup") {
            return pickupEnabled && !!pickupLocation && !!pickupSchedule.date && !!pickupSchedule.time
          }
          return (
            delivery.street.trim().length > 0 &&
            delivery.city.trim().length > 0 &&
            delivery.region.trim().length > 0 &&
            delivery.zipCode.trim().length > 0 &&
            delivery.country.trim().length > 0
          )
        case 2:
          return items.length > 0
        case 3:
          return paymentMethod.trim().length > 0 && items.length > 0
        default:
          return false
      }
    },
    [customer, fulfillmentMethod, pickupEnabled, pickupLocation, pickupSchedule, delivery, items, paymentMethod],
  )

  const handleNext = useCallback(() => {
    setError(null)
    if (step < 3 && canAdvanceFromStep(step)) {
      setStep((s) => s + 1)
    }
  }, [step, canAdvanceFromStep])

  const handleBack = useCallback(() => {
    setError(null)
    if (step > 0) setStep((s) => s - 1)
  }, [step])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )

  const vatRate = isVatEnabledSetting ? 0.12 : 0
  const vat = useMemo(() => Number((subtotal * vatRate).toFixed(2)), [subtotal, vatRate])
  const shippingFee = useMemo(
    () => (fulfillmentMethod === "pickup" ? 0 : calculateShippingFee(delivery.region, shippingConfig)),
    [delivery.region, shippingConfig, fulfillmentMethod],
  )
  const minPickupDate = useMemo(() => new Date().toISOString().split("T")[0], [])
  const total = useMemo(() => Number((subtotal + vat + shippingFee).toFixed(2)), [subtotal, vat, shippingFee])
  const vatLabel = isVatEnabledSetting ? "VAT (12%)" : "VAT (0%)"

  const sizeOptions = useMemo(() => getVariantSizeOptions(selectedVariant), [selectedVariant])

  useEffect(() => {
    if (!selectedVariant) {
      setItemDraft((prev) => ({ ...prev, sizeKey: "" }))
      return
    }

    if (sizeOptions.length === 0) {
      setItemDraft((prev) => ({ ...prev, sizeKey: "" }))
      return
    }

    setItemDraft((prev) => {
      if (sizeOptions.some((option) => option.id === prev.sizeKey)) {
        return prev
      }
      return {
        ...prev,
        sizeKey: sizeOptions[0].id,
      }
    })
  }, [selectedVariant, sizeOptions])

  const selectedSizeOption = useMemo(
    () => sizeOptions.find((option) => option.id === itemDraft.sizeKey) ?? sizeOptions[0] ?? null,
    [sizeOptions, itemDraft.sizeKey],
  )

  const shouldShowSizeSelect = sizeOptions.length > 1

  const selectedVariantPrice = selectedSizeOption
    ? selectedSizeOption.price
    : selectedVariant
      ? Number(selectedVariant.price)
      : 0

  const selectedVariantStock = selectedSizeOption
    ? selectedSizeOption.stock
    : selectedVariant
      ? Math.max(0, Number(selectedVariant.stock))
      : null

  const quantityValue = useMemo(() => {
    const parsed = Number(itemDraft.quantity)
    if (!Number.isFinite(parsed)) return 0
    return Math.max(0, Math.floor(parsed))
  }, [itemDraft.quantity])

  const quantityExceedsStock =
    selectedVariantStock !== null && selectedVariantStock >= 0 ? quantityValue > selectedVariantStock : false

  useEffect(() => {
    if (!selectedVariant) {
      return
    }

    if (selectedVariantStock === 0) {
      setItemDraft((prev) => {
        if (prev.quantity === "0") return prev
        return {
          ...prev,
          quantity: "0",
        }
      })
      return
    }

    if (selectedVariantStock !== null && selectedVariantStock > 0) {
      setItemDraft((prev) => {
        const numeric = Number(prev.quantity)
        const clamped = Math.min(
          selectedVariantStock,
          Math.max(1, Number.isFinite(numeric) ? Math.floor(numeric) : 1),
        )
        if (clamped.toString() === prev.quantity) {
          return prev
        }
        return {
          ...prev,
          quantity: clamped.toString(),
        }
      })
    }
  }, [selectedVariant, selectedVariantStock])

  const handleQuantityChange = (value: string) => {
    const parsed = Number(value)
    let sanitized = Number.isFinite(parsed) ? Math.floor(parsed) : 1

    if (selectedVariantStock === 0) {
      sanitized = 0
    } else {
      if (sanitized <= 0) sanitized = 1
      if (selectedVariantStock !== null && selectedVariantStock > 0) {
        sanitized = Math.min(sanitized, selectedVariantStock)
      }
    }

    setItemDraft((prev) => ({
      ...prev,
      quantity: sanitized.toString(),
    }))
  }

  const handleAddItem = () => {
    setError(null)
    const product = selectedProduct
    const variant = selectedVariant
    if (!product || !variant) {
      setError("Select both a product and a variant before adding an item.")
      return
    }

    if (shouldShowSizeSelect && !selectedSizeOption) {
      setError("Select a size for the variant.")
      return
    }

    const price = Number(selectedVariantPrice)
    if (!Number.isFinite(price) || price <= 0) {
      setError("Unable to determine a price for the selected variant.")
      return
    }

    const quantity = Number(itemDraft.quantity)
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Quantity must be a whole number greater than zero.")
      return
    }

    if (selectedVariantStock !== null) {
      if (selectedVariantStock <= 0) {
        setError("Selected variant is out of stock.")
        return
      }

      if (quantity > selectedVariantStock) {
        setError(`Quantity cannot exceed available stock (${selectedVariantStock}).`)
        return
      }
    }

    const customizations: Record<string, string> = {}
    if (selectedSizeOption && (shouldShowSizeSelect || selectedSizeOption.label.toLowerCase() !== "default")) {
      customizations.Size = selectedSizeOption.label
    }

    const manualItem: ManualOrderItem = {
      uid: crypto.randomUUID ? crypto.randomUUID() : `manual-${Date.now()}-${Math.random()}`,
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      image: variant.image ?? product.image ?? "/placeholder.svg",
      customizations,
      price,
      quantity,
      preorderDownPayment: calculateVariantDownPaymentSummary(variant, price, quantity),
    }

    setItems((prev) => [...prev, manualItem])
    setItemDraft({
      productId: itemDraft.productId,
      variantId: "",
      sizeKey: "",
      quantity: "1",
    })
  }

  const handleRemoveItem = (uid: string) => {
    setItems((prev) => prev.filter((item) => item.uid !== uid))
  }

  const handleFulfillmentToggle = (method: FulfillmentMethod) => {
    if (method === "pickup") {
      if (!pickupEnabled) {
        setError("Pickup is currently disabled in checkout settings.")
        return
      }
      if (!pickupLocation) {
        setError("Pickup location is not configured. Use delivery or update checkout settings.")
        return
      }
    }
    setFulfillmentMethod(method)
    if (method === "delivery") {
      setPickupSchedule({ date: "", time: "" })
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!customer.firstName.trim() || !customer.lastName.trim() || !customer.email.trim() || !customer.phone.trim()) {
      setError("Complete all customer information fields.")
      return
    }

    const isPickup = fulfillmentMethod === "pickup"

    if (!isPickup) {
      if (
        !delivery.street.trim() ||
        !delivery.city.trim() ||
        !delivery.region.trim() ||
        !delivery.zipCode.trim() ||
        !delivery.country.trim()
      ) {
        setError("Complete all required delivery address fields.")
        return
      }
    } else {
      if (!pickupEnabled || !pickupLocation) {
        setError("Pickup is not available. Use delivery instead.")
        return
      }
      if (!pickupSchedule.date || !pickupSchedule.time) {
        setError("Select a pickup date and time.")
        return
      }
    }

    if (!paymentMethod.trim()) {
      setError("Select a payment method.")
      return
    }

    if (items.length === 0) {
      setError("Add at least one item to the order.")
      return
    }

    setIsSubmitting(true)

    try {
      let proofOfPaymentUrl: string | null = null

      if (proofFile) {
        const uploadData = new FormData()
        uploadData.append("file", proofFile)
        uploadData.append("prefix", `manual-proof-${Date.now()}`)

        const uploadResponse = await fetch("/api/uploads/payments", {
          method: "POST",
          body: uploadData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload proof of payment")
        }

        const uploadPayload = await uploadResponse.json()
        proofOfPaymentUrl = typeof uploadPayload?.url === "string" ? uploadPayload.url : null
      }

      const payload: NewOrderInput = {
        customer: {
          firstName: customer.firstName.trim(),
          lastName: customer.lastName.trim(),
          email: customer.email.trim(),
          phone: customer.phone.trim(),
          instagramHandle: customer.instagramHandle.trim() || null,
        },
        delivery:
          isPickup && pickupLocation
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
              unit: delivery.unit.trim(),
              lot: delivery.lot.trim(),
              street: delivery.street.trim(),
              city: delivery.city.trim(),
              region: delivery.region.trim(),
              zipCode: delivery.zipCode.trim(),
              country: delivery.country.trim(),
            },
        fulfillmentMethod,
        pickup:
          isPickup && pickupLocation
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
              scheduledDate: pickupSchedule.date,
              scheduledTime: pickupSchedule.time,
            }
            : null,
        items: items.map(({ uid, ...item }) => item),
        paymentMethod: paymentMethod.trim(),
        proofOfPayment: proofOfPaymentUrl,
        subtotal,
        vat,
        shippingFee,
        trackingId: null,
        total,
      }

      await onCreate(payload)
      onOpenChange(false)
      setProofFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (submissionError) {
      console.error("Failed to create manual order", submissionError)
      setError("Failed to create manual order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }


  const STEP_DEFS = [
    { key: "customer", label: "Customer" },
    { key: "address", label: "Address" },
    { key: "items", label: "Items" },
    { key: "review", label: "Review" },
  ] as const

  const isLastStep = step === STEP_DEFS.length - 1
  const isFirstStep = step === 0

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Manual Order</DialogTitle>
            <DialogDescription>Fill in the order details step by step.</DialogDescription>
          </DialogHeader>

          {/* Wizard Stepper */}
          <div className="inv-wizard-stepper">
            {STEP_DEFS.map((s, i) => {
              const isActive = i === step
              const isCompleted = i < step
              return (
                <div key={s.key} className="inv-wizard-step" style={{ position: "relative" }}>
                  {i < STEP_DEFS.length - 1 && (
                    <div
                      className={`inv-wizard-connector ${i < step ? "inv-wizard-connector-done" : ""}`}
                      style={{
                        left: "calc(50% + 0.875rem)",
                        right: "calc(-50% + 0.875rem)",
                        width: "calc(100% - 1.75rem)",
                      }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => { if (i <= step) setStep(i) }}
                    className="flex flex-col items-center gap-1.5"
                    style={{ position: "relative", zIndex: 1 }}
                  >
                    <span className={`inv-wizard-dot ${isActive ? "inv-wizard-dot-active" : isCompleted ? "inv-wizard-dot-completed" : ""}`}>
                      {isCompleted ? <Check className="w-3 h-3" /> : i + 1}
                    </span>
                    <span className={`inv-wizard-label ${isActive ? "inv-wizard-label-active" : ""}`}>
                      {s.label}
                    </span>
                  </button>
                </div>
              )
            })}
          </div>

          <div>
            <div className="inv-wizard-content">
              {error && (
                <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* ─── Step 0: Customer & Fulfillment ─── */}
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Customer & Fulfillment</h3>
                    <p className="text-xs text-muted-foreground">Enter the customer's details and choose a fulfillment method.</p>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-background p-4 space-y-3">
                    <span className="text-sm font-semibold text-foreground">Customer</span>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="manual-first-name" className="text-xs font-medium">First Name</Label>
                        <Input id="manual-first-name" value={customer.firstName} onChange={(e) => setCustomer((p) => ({ ...p, firstName: e.target.value }))} placeholder="Juan" className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="manual-last-name" className="text-xs font-medium">Last Name</Label>
                        <Input id="manual-last-name" value={customer.lastName} onChange={(e) => setCustomer((p) => ({ ...p, lastName: e.target.value }))} placeholder="Dela Cruz" className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm" required />
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="manual-email" className="text-xs font-medium">Email</Label>
                        <Input id="manual-email" type="email" value={customer.email} onChange={(e) => setCustomer((p) => ({ ...p, email: e.target.value }))} placeholder="juan@example.com" className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="manual-phone" className="text-xs font-medium">Phone</Label>
                        <Input id="manual-phone" value={customer.phone} onChange={(e) => setCustomer((p) => ({ ...p, phone: e.target.value }))} placeholder="+63 900 000 0000" className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm" required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="manual-instagram" className="text-xs font-medium">Instagram Handle</Label>
                      <Input id="manual-instagram" value={customer.instagramHandle} onChange={(e) => setCustomer((p) => ({ ...p, instagramHandle: e.target.value }))} placeholder="@customerhandle" className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-background p-4 space-y-3">
                    <span className="text-sm font-semibold text-foreground">Fulfillment</span>
                    <div className="flex gap-2">
                      <Button type="button" variant={fulfillmentMethod === "delivery" ? "default" : "outline"} size="sm" className="flex-1 rounded-lg" onClick={() => handleFulfillmentToggle("delivery")} disabled={isSubmitting}>
                        Delivery
                      </Button>
                      <Button type="button" variant={fulfillmentMethod === "pickup" ? "default" : "outline"} size="sm" className="flex-1 rounded-lg" onClick={() => handleFulfillmentToggle("pickup")} disabled={!pickupLocation || !pickupEnabled || isSubmitting}>
                        Pickup
                      </Button>
                    </div>
                    {(!pickupLocation || !pickupEnabled) && (
                      <p className="text-xs text-muted-foreground">
                        {pickupEnabled ? "Configure a pickup location in Checkout Settings to enable pickups." : "Pickup is disabled in Checkout Settings."}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ─── Step 1: Address ─── */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{fulfillmentMethod === "pickup" ? "Pickup Details" : "Delivery Address"}</h3>
                    <p className="text-xs text-muted-foreground">{fulfillmentMethod === "pickup" ? "Confirm the pickup location and schedule." : "Enter the delivery address for this order."}</p>
                  </div>

                  {fulfillmentMethod === "pickup" ? (
                    <div className="rounded-xl border border-border/60 bg-background p-4 space-y-3">
                      {pickupLocation ? (
                        <>
                          <div className="rounded-lg border border-dashed border-border/60 p-3 text-sm">
                            <p className="font-semibold">{pickupLocation.name || "Pickup Counter"}</p>
                            <address className="mt-1 space-y-0.5 text-muted-foreground not-italic text-xs">
                              {pickupLocation.unit && <p>{pickupLocation.unit}</p>}
                              {pickupLocation.lot && <p>{pickupLocation.lot}</p>}
                              <p>{pickupLocation.street}</p>
                              <p>{pickupLocation.city}, {pickupLocation.region} {pickupLocation.zipCode}</p>
                              <p>{pickupLocation.country}</p>
                            </address>
                            {pickupLocation.notes && <p className="mt-2 text-xs text-muted-foreground">{pickupLocation.notes}</p>}
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label htmlFor="manual-pickup-date" className="text-xs font-medium">Pickup Date</Label>
                              <Input id="manual-pickup-date" type="date" min={minPickupDate} value={pickupSchedule.date} onChange={(e) => setPickupSchedule((p) => ({ ...p, date: e.target.value }))} className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm" required />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="manual-pickup-time" className="text-xs font-medium">Pickup Time</Label>
                              <Input id="manual-pickup-time" type="time" step={900} value={pickupSchedule.time} onChange={(e) => setPickupSchedule((p) => ({ ...p, time: e.target.value }))} className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm" required />
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Pickup location is not configured. Update checkout settings or go back and choose delivery.</p>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border/60 bg-background p-4 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="manual-unit" className="text-xs font-medium">Unit / Building</Label>
                          <Input id="manual-unit" value={delivery.unit} onChange={(e) => setDelivery((p) => ({ ...p, unit: e.target.value }))} placeholder="Unit 10B, Sunrise Tower" className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="manual-lot" className="text-xs font-medium">Lot / Block</Label>
                          <Input id="manual-lot" value={delivery.lot} onChange={(e) => setDelivery((p) => ({ ...p, lot: e.target.value }))} placeholder="Block 5, Lot 12" className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="manual-street" className="text-xs font-medium">Street</Label>
                        <Input id="manual-street" value={delivery.street} onChange={(e) => setDelivery((p) => ({ ...p, street: e.target.value }))} placeholder="Sampaguita Street" className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm" required />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="manual-city" className="text-xs font-medium">City</Label>
                          <Input id="manual-city" value={delivery.city} onChange={(e) => setDelivery((p) => ({ ...p, city: e.target.value }))} placeholder="Makati" className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm" required />
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <Label htmlFor="manual-region" className="text-xs font-medium">Region</Label>
                          <Select value={delivery.region || undefined} onValueChange={(v) => setDelivery((p) => ({ ...p, region: v }))}>
                            <SelectTrigger id="manual-region" className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm w-full truncate"><SelectValue placeholder="Select" className="truncate" /></SelectTrigger>
                            <SelectContent className="max-h-64">{PHILIPPINE_REGIONS.map((r: string) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="manual-zip" className="text-xs font-medium">Zip Code</Label>
                          <Input id="manual-zip" value={delivery.zipCode} onChange={(e) => setDelivery((p) => ({ ...p, zipCode: e.target.value }))} placeholder="1200" inputMode="numeric" className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm" required />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="manual-country" className="text-xs font-medium">Country</Label>
                        <Select value={delivery.country || undefined} onValueChange={(v) => setDelivery((p) => ({ ...p, country: v }))}>
                          <SelectTrigger id="manual-country" className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm"><SelectValue placeholder="Select country" /></SelectTrigger>
                          <SelectContent><SelectItem value="Philippines">Philippines</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── Step 2: Items ─── */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Order Items</h3>
                    <p className="text-xs text-muted-foreground">Add products to this order.</p>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-background p-4 space-y-3">
                    <span className="text-sm font-semibold text-foreground">Add Item</span>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Product</Label>
                      <Select value={itemDraft.productId || undefined} onValueChange={(v) => setItemDraft(() => ({ productId: v, variantId: "", sizeKey: "", quantity: "1" }))}>
                        <SelectTrigger className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm w-full truncate"><SelectValue placeholder="Choose a product…" className="truncate" /></SelectTrigger>
                        <SelectContent>
                          {products.length === 0 ? (<SelectItem value="none" disabled>No products available</SelectItem>) : products.map((product) => (<SelectItem key={product.id} value={product.id.toString()}>{product.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Variant</Label>
                      <Select
                        value={itemDraft.variantId || undefined}
                        onValueChange={(value) => {
                          const variant = selectedProduct?.variants.find((entry) => entry.id === Number(value))
                          const nextSizeOptions = getVariantSizeOptions(variant)
                          const defaultSize = nextSizeOptions[0]?.id ?? ""
                          const defaultStock = nextSizeOptions[0]?.stock ?? (variant ? Math.max(0, Number(variant.stock ?? 0)) : null)
                          setItemDraft((prev) => ({ ...prev, variantId: value, sizeKey: defaultSize, quantity: defaultStock === 0 ? "0" : "1" }))
                        }}
                        disabled={!selectedProduct}
                      >
                        <SelectTrigger className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm"><SelectValue placeholder="Choose a variant…" /></SelectTrigger>
                        <SelectContent>
                          {!selectedProduct ? (<SelectItem value="none" disabled>Select a product first</SelectItem>) : selectedProduct.variants.length === 0 ? (<SelectItem value="none" disabled>No variants</SelectItem>) : selectedProduct.variants.map((variant) => (<SelectItem key={variant.id} value={variant.id.toString()}>{getVariantLabel(variant)}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    {shouldShowSizeSelect && selectedSizeOption && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Size</Label>
                        <Select
                          value={itemDraft.sizeKey || undefined}
                          onValueChange={(value) => {
                            const option = sizeOptions.find((entry) => entry.id === value)
                            setItemDraft((prev) => {
                              if (!option) return { ...prev, sizeKey: value }
                              const currentQty = Number(prev.quantity)
                              const normQty = Number.isFinite(currentQty) ? Math.max(1, Math.floor(currentQty)) : 1
                              const clampedQty = option.stock === 0 ? "0" : Math.min(normQty, option.stock).toString()
                              return { ...prev, sizeKey: value, quantity: clampedQty }
                            })
                          }}
                        >
                          <SelectTrigger className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm"><SelectValue placeholder="Select size" /></SelectTrigger>
                          <SelectContent>{sizeOptions.map((opt) => (<SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                    )}
                    {!shouldShowSizeSelect && selectedSizeOption && selectedSizeOption.label.toLowerCase() !== "default" && (
                      <p className="text-xs text-muted-foreground">Size: {selectedSizeOption.label}</p>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Unit Price</Label>
                        <div className="flex h-10 items-center rounded-lg border border-border/60 bg-muted px-3 text-sm font-medium text-muted-foreground">
                          {selectedVariant ? formatCurrency(selectedVariantPrice) : "—"}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="manual-item-quantity" className="text-xs font-medium">Quantity</Label>
                        <Input id="manual-item-quantity" type="number" min={selectedVariantStock === 0 ? 0 : 1} step="1" value={itemDraft.quantity} onChange={(e) => handleQuantityChange(e.target.value)} disabled={!selectedVariant} className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm" />
                        {selectedVariant && (<p className="text-[11px] text-muted-foreground">{selectedVariantStock !== null ? `Stock: ${selectedVariantStock}` : "Stock unavailable"}</p>)}
                        {selectedVariantStock === 0 && <p className="text-[11px] text-destructive">Out of stock.</p>}
                        {quantityExceedsStock && <p className="text-[11px] text-destructive">Exceeds stock.</p>}
                      </div>
                    </div>
                    <Button type="button" size="sm" className="w-full btn-admin-accent rounded-lg" onClick={handleAddItem} disabled={!selectedVariant || (shouldShowSizeSelect && !selectedSizeOption) || quantityValue <= 0 || quantityExceedsStock || selectedVariantPrice <= 0 || selectedVariantStock === 0}>
                      Add Item
                    </Button>
                  </div>

                  {/* Cart */}
                  <div className="rounded-xl border border-border/60 bg-background p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">Cart</span>
                      {items.length > 0 && <span className="text-xs text-muted-foreground tabular-nums">{items.length} item{items.length > 1 ? "s" : ""}</span>}
                    </div>
                    {items.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No items yet. Add at least one item to continue.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                        {items.map((item) => {
                          const product = products.find((p) => p.id === item.productId)
                          const variant = product?.variants.find((v) => v.id === item.variantId)
                          const vLabel = variant ? getVariantLabel(variant) : `Variant ${item.variantId}`
                          return (
                            <div key={item.uid} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-foreground/[0.02] px-3 py-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{item.name}</p>
                                <p className="text-[11px] text-muted-foreground truncate">{vLabel} · {formatCurrency(item.price)} × {item.quantity}{item.customizations && Object.keys(item.customizations).length > 0 && (<> · {Object.entries(item.customizations).map(([k, val]) => `${k}: ${val}`).join(", ")}</>)}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-sm font-semibold tabular-nums">{formatCurrency(item.price * item.quantity)}</span>
                                <button type="button" className="rounded-full p-0.5 text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground" onClick={() => handleRemoveItem(item.uid)} aria-label="Remove item">
                                  <span className="text-[11px] font-medium uppercase tracking-wider">✕</span>
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── Step 3: Review & Pay ─── */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Review & Payment</h3>
                    <p className="text-xs text-muted-foreground">Select a payment method and review the order total.</p>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-background p-4 space-y-3">
                    <span className="text-sm font-semibold text-foreground">Payment</span>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={isLoadingPaymentMethods || paymentOptions.length === 0}>
                        <SelectTrigger className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm"><SelectValue placeholder={isLoadingPaymentMethods ? "Loading…" : "Choose a method…"} /></SelectTrigger>
                        <SelectContent>
                          {paymentOptions.map((opt) => (<SelectItem key={opt.provider} value={opt.provider}>{opt.name}</SelectItem>))}
                          {!isLoadingPaymentMethods && paymentOptions.length === 0 && (<SelectItem value="__none" disabled>No payment methods configured</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Proof of Payment (optional)</Label>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => proofPreview && setIsProofPreviewOpen(true)} disabled={!proofPreview} className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted transition hover:ring-2 hover:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60">
                          {proofPreview ? (<img src={proofPreview} alt="Proof preview" className="h-full w-full object-cover" />) : (<span className="text-[9px] text-muted-foreground text-center">No file</span>)}
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setProofFile(e.target.files?.[0] ?? null)} />
                        <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => fileInputRef.current?.click()}>Attach</Button>
                        {proofFile && (<Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={() => { setProofFile(null); setIsProofPreviewOpen(false); if (fileInputRef.current) fileInputRef.current.value = "" }}>Clear</Button>)}
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="rounded-xl border border-border/60 bg-background p-4 space-y-2">
                    <span className="text-sm font-semibold text-foreground">Order Summary</span>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center justify-between"><span className="text-muted-foreground text-xs">Subtotal</span><span className="tabular-nums">{formatCurrency(subtotal)}</span></div>
                      <div className="flex items-center justify-between"><span className="text-muted-foreground text-xs">{vatLabel}</span><span className="tabular-nums">{formatCurrency(vat)}</span></div>
                      <div className="flex items-center justify-between"><span className="text-muted-foreground text-xs">{fulfillmentMethod === "pickup" ? "Pickup" : "Shipping"}</span><span className="tabular-nums">{shippingFee === 0 ? (fulfillmentMethod === "pickup" ? "Free" : "Free") : formatCurrency(shippingFee)}</span></div>
                      {fulfillmentMethod === "pickup" && pickupSchedule.date && pickupSchedule.time && (
                        <div className="flex items-center justify-between"><span className="text-muted-foreground text-xs">Pickup slot</span><span className="text-xs">{pickupSchedule.date} · {pickupSchedule.time}</span></div>
                      )}
                      <Separator className="my-1.5" />
                      <div className="flex items-center justify-between font-semibold"><span>Total</span><span className="tabular-nums">{formatCurrency(total)}</span></div>
                    </div>
                  </div>

                  {/* Cart review */}
                  {items.length > 0 && (
                    <div className="rounded-xl border border-border/60 bg-background p-4 space-y-2">
                      <span className="text-sm font-semibold text-foreground">Cart ({items.length})</span>
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                        {items.map((item) => {
                          const product = products.find((p) => p.id === item.productId)
                          const variant = product?.variants.find((v) => v.id === item.variantId)
                          const vLabel = variant ? getVariantLabel(variant) : `Variant ${item.variantId}`
                          return (
                            <div key={item.uid} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-foreground/[0.02] px-3 py-1.5">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{item.name}</p>
                                <p className="text-[11px] text-muted-foreground truncate">{vLabel} · {formatCurrency(item.price)} × {item.quantity}</p>
                              </div>
                              <span className="text-sm font-semibold tabular-nums shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground text-center pt-1">
                    The Order ID will be generated automatically.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="inv-wizard-footer">
              <div>
                {!isFirstStep && (
                  <Button type="button" variant="ghost" size="sm" className="btn-admin-ghost rounded-full gap-1" onClick={handleBack} disabled={isSubmitting}>
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" className="btn-admin-outline rounded-full" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                {isLastStep ? (
                  <Button type="button" size="sm" className="btn-admin-accent rounded-full" disabled={isSubmitting || !canAdvanceFromStep(step)} onClick={(e) => { e.preventDefault(); const fakeEvent = { preventDefault: () => { } } as React.FormEvent<HTMLFormElement>; handleSubmit(fakeEvent) }}>
                    {isSubmitting ? "Creating…" : "Create Order"}
                  </Button>
                ) : (
                  <Button type="button" size="sm" className="btn-admin-accent rounded-full gap-1" onClick={handleNext} disabled={!canAdvanceFromStep(step)}>
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isProofPreviewOpen && Boolean(proofPreview)} onOpenChange={setIsProofPreviewOpen}>
        <DialogContent className="w-full max-w-3xl" showCloseButton>
          <DialogHeader>
            <DialogTitle>Proof of Payment Preview</DialogTitle>
          </DialogHeader>
          {proofPreview ? (
            <div className="flex justify-center">
              <img src={proofPreview} alt="Proof of payment preview" className="max-h-[70vh] w-auto rounded-xl border border-border/60 object-contain" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">No preview available.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
