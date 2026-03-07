"use client"

import { useMemo, useState } from "react"
import { compressToEncodedURIComponent } from "lz-string"
import { Check, Copy, Filter, GlassWater, Link as LinkIcon, RefreshCw, RotateCcw, Search, ShoppingCart, Trash } from "lucide-react"

import { useStore } from "@/lib/store"
import { createVariantSlug, formatCurrency } from "@/lib/utils"
import ProductCard from "@/components/product-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import type { CatalogVariant } from "@/lib/storefront-data"

interface VariantSizeOption {
  key: string
  label: string
  price: number
  stock: number
}

interface VariantOption {
  id: number
  productId: number
  productName: string
  brandId: number | null
  brandName: string | null
  categoryIds: number[]
  categories: string[]
  colorLabel: string | null
  sku: string | null
  image: string
  isPreorder: boolean
  displayName: string
  sizeOptions: VariantSizeOption[]
  totalStock: number
}

interface BuilderItem {
  key: string
  sizeKey: string
  variantId: number
  productId: number
  name: string
  image: string
  price: number
  quantity: number
  customizations: Record<string, string>
  brandName: string | null
  sizeLabel: string | null
  colorLabel: string | null
}

const DEFAULT_SIZE_KEY = "__default__"

const buildDisplayName = (productName: string, label: string | null, sku?: string | null) => {
  const cleanedLabel = label && label.trim().length > 0 ? label.trim() : null
  if (cleanedLabel) return `${productName} - ${cleanedLabel}`
  const cleanedSku = sku && sku.trim().length > 0 ? sku.trim() : null
  if (cleanedSku) return `${productName} - ${cleanedSku}`
  return `${productName} - Classic`
}

const createSizeOptions = (variant: {
  size?: string | null
  sizes: Array<{ size?: string | null; price: number; stock: number }>
  price: number
  stock: number
}) => {
  const baseEntries =
    variant.sizes && variant.sizes.length > 0
      ? variant.sizes
      : [{ size: variant.size ?? null, price: variant.price, stock: variant.stock }]

  return baseEntries.map((entry, index) => {
    const label = entry.size && entry.size.toString().trim().length > 0 ? entry.size.toString().trim() : "Default"
    return {
      key: `${index}-${label.toLowerCase() || DEFAULT_SIZE_KEY}`,
      label,
      price: Number.isFinite(entry.price) ? Number(entry.price) : 0,
      stock: Number.isFinite(entry.stock) ? Math.max(0, Number(entry.stock)) : 0,
    }
  })
}

function mapProductsToVariantOptions(products: ReturnType<typeof useStore>["products"]): VariantOption[] {
  const variants: VariantOption[] = []

  products.forEach((product) => {
    const categories = (product.categories ?? []).map((category) => category.name).filter(Boolean)
    const categoryIds = (product.categories ?? []).map((category) => category.id)
    const brandId = product.brand?.id ?? null
    const brandName =
      product.brand && typeof product.brand.name === "string" && product.brand.name.trim().length > 0
        ? product.brand.name.trim()
        : null

    product.variants.forEach((variant) => {
      const sizeOptions = createSizeOptions(variant)
      const totalStock = sizeOptions.reduce((sum, entry) => sum + (Number.isFinite(entry.stock) ? entry.stock : 0), 0)

      variants.push({
        id: variant.id,
        productId: product.id,
        productName: product.name,
        brandId,
        brandName,
        categoryIds,
        categories,
        colorLabel: variant.color ?? null,
        sku: variant.sku ?? null,
        image: variant.image ?? product.image,
        isPreorder: Boolean(variant.isPreorder),
        displayName: buildDisplayName(product.name, variant.color ?? null, variant.sku ?? undefined),
        sizeOptions,
        totalStock,
      })
    })
  })

  return variants.sort((a, b) => a.productName.localeCompare(b.productName) || a.displayName.localeCompare(b.displayName))
}

function buildItemKey(variantId: number, sizeKey: string) {
  return `${variantId}-${sizeKey}`
}

function toCatalogVariant(variant: VariantOption): CatalogVariant {
  const sizes = variant.sizeOptions.map((option) => ({
    label: option.label,
    price: option.price,
    stock: option.stock,
  }))

  const priceValues = sizes.map((option) => option.price)
  const minPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0
  const maxPrice = priceValues.length > 0 ? Math.max(...priceValues) : 0
  const variantLabel = variant.colorLabel ?? variant.sku ?? null

  return {
    id: variant.id,
    productId: variant.productId,
    productName: variant.productName,
    variantLabel,
    displayName: variant.displayName,
    image: variant.image,
    description: null,
    brandName: variant.brandName,
    categories: variant.categories,
    sizes,
    minPrice,
    maxPrice,
    totalStock: variant.totalStock,
    detailPath: `/shop/${createVariantSlug(variant.id, variant.productName, variantLabel)}`,
    isPreorder: Boolean(variant.isPreorder),
  }
}

export default function AdminCheckoutLinkBuilder() {
  const { products, productBrands, productCategories, isLoadingProducts, refreshProducts } = useStore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [onlyInStock, setOnlyInStock] = useState(true)
  const [items, setItems] = useState<BuilderItem[]>([])
  const [generatedLink, setGeneratedLink] = useState<string>("")
  const [copySuccess, setCopySuccess] = useState<boolean>(false)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)

  const variantOptions = useMemo(() => mapProductsToVariantOptions(products), [products])
  const variantLookup = useMemo(() => {
    const lookup = new Map<number, VariantOption>()
    variantOptions.forEach((variant) => lookup.set(variant.id, variant))
    return lookup
  }, [variantOptions])

  const filteredVariants = useMemo(() => {
    if (variantOptions.length === 0) return []

    const normalizedSearch = searchTerm.trim().toLowerCase()
    const brandId = brandFilter === "all" ? null : Number(brandFilter)
    const categoryId = categoryFilter === "all" ? null : Number(categoryFilter)

    return variantOptions.filter((variant) => {
      if (brandId !== null && variant.brandId !== brandId) return false
      if (categoryId !== null && !variant.categoryIds.includes(categoryId)) return false
      if (onlyInStock && !variant.isPreorder && variant.totalStock <= 0) return false

      if (!normalizedSearch) return true

      const haystack = [
        variant.displayName,
        variant.productName,
        variant.brandName ?? "",
        variant.colorLabel ?? "",
        variant.sku ?? "",
        ...variant.categories,
      ]
        .join(" ")
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [variantOptions, searchTerm, brandFilter, categoryFilter, onlyInStock])

  const catalogVariants = useMemo(() => filteredVariants.map(toCatalogVariant), [filteredVariants])

  const totalEstimate = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )

  const resetCopySuccess = () => setCopySuccess(false)

  const handleAddVariant = (payload: {
    variantId: number
    productId: number
    name: string
    image: string
    size: string | null
    price: number
    quantity: number
    brandName: string | null
  }) => {
    const variant = variantLookup.get(payload.variantId)
    if (!variant) {
      toast({
        title: "Unable to add variant",
        description: "This variant is no longer available. Refresh the catalog and try again.",
      })
      return
    }

    const normalizedSizeLabel = payload.size && payload.size.trim().length > 0 ? payload.size.trim() : "Default"
    const sizeOption =
      variant.sizeOptions.find((option) => option.label === normalizedSizeLabel) ??
      variant.sizeOptions.find((option) => option.label === "Default") ??
      variant.sizeOptions[0]

    const sizeKey = sizeOption?.key ?? DEFAULT_SIZE_KEY
    const sizeLabel = sizeOption?.label ?? "Default"

    if (!variant.isPreorder && (sizeOption?.stock ?? 0) <= 0) {
      toast({
        title: "Out of stock",
        description: "This variant cannot be added because it is out of stock.",
      })
      return
    }

    const requestedQuantity = payload.quantity > 0 ? payload.quantity : 1
    const maxStock = variant.isPreorder ? Number.POSITIVE_INFINITY : sizeOption?.stock ?? 0
    const effectiveQuantity = variant.isPreorder ? requestedQuantity : Math.min(requestedQuantity, maxStock)
    let hitStockLimit = !variant.isPreorder && requestedQuantity > maxStock

    if (!variant.isPreorder && effectiveQuantity <= 0) {
      toast({
        title: "Adjust quantity",
        description: `Only ${Math.max(maxStock, 0)} unit(s) are available for the selected size.`,
      })
      return
    }

    const customizations: Record<string, string> = {}
    if (variant.colorLabel && variant.colorLabel.trim().length > 0) {
      customizations.Color = variant.colorLabel.trim()
    }
    if (sizeLabel !== "Default") {
      customizations.Size = sizeLabel
    }

    const itemKey = buildItemKey(variant.id, sizeKey)

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.key === itemKey)
      if (existingIndex >= 0) {
        const updated = [...prev]
        const existing = updated[existingIndex]
        const tentativeQuantity = existing.quantity + effectiveQuantity
        const cappedQuantity = variant.isPreorder ? tentativeQuantity : Math.min(tentativeQuantity, maxStock)
        if (!variant.isPreorder && tentativeQuantity > maxStock) {
          hitStockLimit = true
        }
        updated[existingIndex] = {
          ...existing,
          quantity: Math.max(1, cappedQuantity),
          price: payload.price,
        }
        return updated
      }

      return [
        ...prev,
        {
          key: itemKey,
          sizeKey,
          variantId: variant.id,
          productId: variant.productId,
          name: payload.name,
          image: payload.image,
          price: payload.price,
          quantity: Math.max(1, effectiveQuantity),
          customizations,
          brandName: payload.brandName ?? variant.brandName ?? null,
          sizeLabel: sizeLabel === "Default" ? null : sizeLabel,
          colorLabel: variant.colorLabel,
        },
      ]
    })

    if (hitStockLimit) {
      toast({
        title: "Quantity capped at stock level",
        description: `The total quantity for ${variant.displayName} (${sizeLabel}) cannot exceed ${maxStock}.`,
      })
    } else {
      toast({
        title: "Variant added",
        description: `${variant.displayName} (${sizeLabel}) has been added to the checkout link builder.`,
      })
    }
    resetCopySuccess()
  }

  const handleRemoveItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key))
    resetCopySuccess()
  }

  const handleQuantityChange = (key: string, value: string) => {
    const sanitized = value.replace(/[^0-9]/g, "")
    const numeric = Number.parseInt(sanitized, 10)

    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item
        if (!Number.isFinite(numeric) || numeric <= 0) {
          return { ...item, quantity: 1 }
        }

        const variant = variantLookup.get(item.variantId)
        if (!variant || variant.isPreorder) {
          return { ...item, quantity: numeric }
        }

        const sizeOption =
          variant.sizeOptions.find((option) => option.key === item.sizeKey) ??
          variant.sizeOptions.find((option) => option.label === (item.sizeLabel ?? "Default")) ??
          variant.sizeOptions[0]
        const stock = sizeOption?.stock ?? 0
        const capped = Math.max(1, Math.min(numeric, Math.max(stock, 1)))
        return { ...item, quantity: capped }
      }),
    )
    resetCopySuccess()
  }

  const handleClearItems = () => {
    setItems([])
    setGeneratedLink("")
    resetCopySuccess()
  }

  const handleGenerateLink = async () => {
    if (items.length === 0) {
      toast({
        title: "Add items first",
        description: "Add at least one variant before generating a checkout link.",
      })
      return
    }

    try {
      setIsGenerating(true)
      const payload = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        image: item.image,
        customizations: item.customizations,
        price: item.price,
        quantity: item.quantity,
      }))

      const encoded = compressToEncodedURIComponent(JSON.stringify(payload))
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      const link = `${origin}/checkout?cart=${encoded}`
      setGeneratedLink(link)
      setCopySuccess(false)
      toast({
        title: "Checkout link ready",
        description: "Copy or share the link with your customer to load this cart.",
      })
    } catch (error) {
      console.error("[checkout-link-builder] Failed to generate link", error)
      toast({
        title: "Failed to generate link",
        description: "Something went wrong while creating the checkout link. Please try again.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyLink = async () => {
    if (!generatedLink) {
      toast({
        title: "No link to copy",
        description: "Generate a checkout link before copying.",
      })
      return
    }

    try {
      await navigator.clipboard.writeText(generatedLink)
      setCopySuccess(true)
      toast({
        title: "Link copied",
        description: "The checkout link has been copied to your clipboard.",
      })
    } catch (error) {
      console.error("[checkout-link-builder] Failed to copy link", error)
      toast({
        title: "Copy failed",
        description: "We couldn't copy the link automatically. Please copy it manually.",
      })
      setCopySuccess(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Checkout Links</h1>
          <p className="text-sm text-muted-foreground">
            Build a cart for your customer, generate a checkout link, and share it directly with them.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            refreshProducts().catch((error) => {
              console.error("[checkout-link-builder] Failed to refresh products", error)
              toast({
                title: "Failed to refresh",
                description: "We couldn't refresh the product list. Please try again later.",
              })
            })
          }}
          disabled={isLoadingProducts}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh products
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_200px_200px_200px] md:items-end">
          <div className="flex flex-col gap-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <Search className="h-4 w-4" />
              Search
            </Label>
            <Input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                resetCopySuccess()
              }}
              placeholder="Search by product, color, SKU, or category"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="brand-filter"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            >
              <Filter className="h-4 w-4" />
              Brand
            </Label>
            <Select
              value={brandFilter}
              onValueChange={(value) => {
                setBrandFilter(value)
                resetCopySuccess()
              }}
            >
              <SelectTrigger id="brand-filter" className="w-full">
                <SelectValue placeholder="All brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All brands</SelectItem>
                {productBrands.map((brand) => (
                  <SelectItem key={brand.id} value={String(brand.id)}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="category-filter"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            >
              <Filter className="h-4 w-4" />
              Category
            </Label>
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value)
                resetCopySuccess()
              }}
            >
              <SelectTrigger id="category-filter" className="w-full">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {productCategories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="stock-toggle" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Stock
              </Label>
              <span className="text-xs text-muted-foreground">Toggle in-stock filter</span>
            </div>
            <Switch
              id="stock-toggle"
              checked={onlyInStock}
              onCheckedChange={(checked) => {
                setOnlyInStock(checked)
                resetCopySuccess()
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[3fr_1.25fr] xl:grid-cols-[7fr_3fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoadingProducts
                ? "Loading products…"
                : `${catalogVariants.length} variant${catalogVariants.length === 1 ? "" : "s"} found`}
            </p>
            {onlyInStock && catalogVariants.length > 0 && <Badge variant="secondary">In-stock filter applied</Badge>}
          </div>

          {isLoadingProducts && catalogVariants.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
              Loading catalog…
            </div>
          ) : catalogVariants.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center text-sm text-muted-foreground">
              <ShoppingCart className="mb-2 h-6 w-6" />
              <p>No variants match your filters right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-3">
              {catalogVariants.map((variant) => (
                <ProductCard
                  key={variant.id}
                  variant={variant}
                  onAddToCart={handleAddVariant}
                  actionLabel="Add to Link"
                />
              ))}
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Checkout link summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 mt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Selected items</p>
                  <p className="text-xs text-muted-foreground">
                    {items.length === 0
                      ? "No items yet. Add variants from the catalog to get started."
                      : `${items.length} item${items.length === 1 ? "" : "s"} in checkout link`}
                  </p>
                </div>
                {items.length > 0 && (
                  <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={handleClearItems}>
                    <RotateCcw className="h-4 w-4" />
                    Clear all
                  </Button>
                )}
              </div>

              <Separator />

              {items.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed border-border text-center text-sm text-muted-foreground">
                  <ShoppingCart className="mb-2 h-6 w-6" />
                  Build your cart from the catalog on the left.
                </div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-3 pr-3">
                    {items.map((item) => (
                      <div key={item.key} className="rounded-md border border-border/70 bg-background px-3 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{item.name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              {item.colorLabel && <Badge variant="outline">Color: {item.colorLabel}</Badge>}
                              {item.sizeLabel && <Badge variant="outline">Size: {item.sizeLabel}</Badge>}
                              <Badge variant="secondary">{formatCurrency(item.price)}</Badge>
                            </div>
                          </div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(item.key)}>
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Remove item</span>
                          </Button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            Quantity
                            <Input
                              value={String(item.quantity)}
                              onChange={(event) => handleQuantityChange(item.key, event.target.value)}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              min={1}
                              className="w-16"
                            />
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            {formatCurrency(item.quantity * item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Estimated total</span>
                  <span className="font-semibold text-foreground">{formatCurrency(totalEstimate)}</span>
                </div>

                <div className="space-y-2">
                  <Button type="button" className="w-full gap-2" onClick={handleGenerateLink} disabled={isGenerating}>
                    <LinkIcon className="h-4 w-4" />
                    {isGenerating ? "Generating…" : "Generate checkout link"}
                  </Button>
                  <div className="flex items-center gap-2">
                    <Input value={generatedLink} readOnly placeholder="Checkout link will appear here" className="flex-1" />
                    <Button type="button" variant="outline" size="icon" onClick={handleCopyLink} disabled={!generatedLink}>
                      {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span className="sr-only">Copy link</span>
                    </Button>
                  </div>
                </div>

                {generatedLink && (
                  <Button type="button" variant="ghost" className="w-full gap-2" asChild>
                    <a href={generatedLink} target="_blank" rel="noreferrer">
                      <LinkIcon className="h-4 w-4" />
                      Open checkout in new tab
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
