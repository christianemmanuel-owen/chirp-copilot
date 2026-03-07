"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { compressToEncodedURIComponent } from "lz-string"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useStore } from "@/lib/store"
import type { Order, OrderStatus, Product } from "@/lib/types"
import { cn, formatCurrency } from "@/lib/utils"

const PLACEHOLDER_IMAGE = "/placeholder.svg?height=400&width=400"
import {
  ArrowUpDown,
  Expand,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Filter,
  Image as ImageIcon,
  Instagram,
  Link2,
  Loader2,
  MessageCircle,
  MessageSquare,
  Minimize2,
  Paperclip,
  Receipt,
  RefreshCw,
  Search,
  Send,
  ShoppingCart,
  X,
  ExternalLink,
} from "lucide-react"
import { useInstagramConversations } from "@/hooks/use-instagram-conversations"

/* ─── Utilities ─── */

const MANILA_TIME_ZONE = "Asia/Manila"

const messageTimeFormatter = new Intl.DateTimeFormat("en-PH", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: MANILA_TIME_ZONE,
})

function formatRelativeTime(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMinutes = Math.round((now - then) / 60_000)
  if (diffMinutes < 1) return "now"
  if (diffMinutes < 60) return `${diffMinutes}m`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d`
}

function getMessageDateLabel(timestamp: string): string {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
}

/* ─── Sidebar Types ─── */

type SidebarVariantSize = {
  key: string
  label: string
  price: number
  stock: number
}

type SidebarVariantOption = {
  id: number
  productId: number
  productName: string
  displayName: string
  brandName: string | null
  categories: string[]
  image: string
  colorLabel: string | null
  sku: string | null
  isPreorder: boolean
  sizeOptions: SidebarVariantSize[]
  totalStock: number
}

type SidebarCheckoutItem = {
  key: string
  variantId: number
  productId: number
  name: string
  image: string
  price: number
  quantity: number
  sizeKey: string
  sizeLabel: string | null
  colorLabel: string | null
  customizations: Record<string, string>
}

const DEFAULT_SIZE_KEY = "__default__"

const orderDateFormatter = new Intl.DateTimeFormat("en-PH", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

const orderStatusClasses: Record<OrderStatus, string> = {
  "For Evaluation": "bg-amber-100 text-amber-800",
  "Confirmed": "bg-blue-100 text-blue-800",
  "For Delivery": "bg-indigo-100 text-indigo-800",
  "Out for Delivery": "bg-sky-100 text-sky-800",
  "For Refund": "bg-orange-100 text-orange-800",
  "Refunded": "bg-pink-100 text-pink-800",
  "Completed": "bg-emerald-100 text-emerald-800",
  "Cancelled": "bg-red-100 text-red-800",
}

const orderSortLabels: Record<string, string> = {
  "date-desc": "Date newest",
  "date-asc": "Date oldest",
  "total-desc": "Total high → low",
  "total-asc": "Total low → high",
}

const checkoutSortLabels: Record<"alpha" | "price-asc" | "price-desc", string> = {
  alpha: "Name A → Z",
  "price-asc": "Price low → high",
  "price-desc": "Price high → low",
}

const MAX_FILTER_BADGES = 3

const normalizeHandle = (value?: string | null) => {
  if (!value) {
    return ""
  }
  return value.replace(/^@+/, "").trim().toLowerCase()
}

const buildReceiptLink = (origin: string, orderId: string) => {
  const fallbackOrigin = typeof window !== "undefined" ? window.location.origin : ""
  const base = origin || fallbackOrigin || ""
  return base ? `${base}/receipt/${orderId}` : `/receipt/${orderId}`
}

const buildVariantDisplayName = (productName: string, label?: string | null, sku?: string | null) => {
  const cleanedLabel = label && label.trim().length > 0 ? label.trim() : null
  if (cleanedLabel) {
    return `${productName} - ${cleanedLabel}`
  }
  const cleanedSku = sku && sku.trim().length > 0 ? sku.trim() : null
  if (cleanedSku) {
    return `${productName} - ${cleanedSku}`
  }
  return `${productName} - Classic`
}

const createSidebarSizeOptions = (variant: Product["variants"][number]): SidebarVariantSize[] => {
  const baseEntries =
    variant.sizes && variant.sizes.length > 0
      ? variant.sizes
      : [{ size: variant.size ?? null, price: variant.price, stock: variant.stock }]

  return baseEntries.map((entry, index) => {
    const label = entry.size && entry.size.toString().trim().length > 0 ? entry.size.toString().trim() : "Default"
    return {
      key: `${variant.id}-${index}-${label.toLowerCase() || DEFAULT_SIZE_KEY}`,
      label,
      price: Number(entry.price) || 0,
      stock: Number.isFinite(entry.stock) ? Math.max(0, Number(entry.stock)) : 0,
    }
  })
}

const mapProductsToSidebarVariants = (products: Product[]): SidebarVariantOption[] => {
  const variants: SidebarVariantOption[] = []
  products.forEach((product) => {
    const categories = (product.categories ?? []).map((category) => category.name).filter(Boolean)
    product.variants
      .filter((variant) => variant.isActive)
      .forEach((variant) => {
        const sizeOptions = createSidebarSizeOptions(variant)
        const totalStock = sizeOptions.reduce((sum, option) => sum + option.stock, 0)
        variants.push({
          id: variant.id,
          productId: product.id,
          productName: product.name,
          displayName: buildVariantDisplayName(product.name, variant.color ?? null, variant.sku ?? undefined),
          brandName: product.brand?.name ?? null,
          categories,
          image: variant.image ?? product.image ?? PLACEHOLDER_IMAGE,
          colorLabel: variant.color ?? null,
          sku: variant.sku ?? null,
          isPreorder: Boolean(variant.isPreorder),
          sizeOptions,
          totalStock,
        })
      })
  })
  return variants.sort((a, b) => a.displayName.localeCompare(b.displayName))
}

const buildItemKey = (variantId: number, sizeKey: string) => `${variantId}-${sizeKey}`

const buildItemCustomizations = (variant: SidebarVariantOption, sizeLabel: string | null) => {
  const customizations: Record<string, string> = {}
  if (variant.colorLabel && variant.colorLabel.trim().length > 0) {
    customizations.Color = variant.colorLabel.trim()
  }
  if (sizeLabel && sizeLabel.trim().length > 0) {
    customizations.Size = sizeLabel.trim()
  }
  return customizations
}

const getVariantMinPrice = (variant: SidebarVariantOption) => {
  const prices = variant.sizeOptions.map((option) => option.price)
  if (!prices.length) {
    return 0
  }
  return Math.min(...prices)
}

const getPickupDetailsForDisplay = (order: Order): NonNullable<Order["pickup"]> => {
  if (order.pickup) {
    return order.pickup
  }
  return {
    locationName: order.delivery.street,
    unit: order.delivery.unit ?? "",
    lot: order.delivery.lot ?? "",
    street: order.delivery.street,
    city: order.delivery.city,
    region: order.delivery.region,
    zipCode: order.delivery.zipCode,
    country: order.delivery.country,
    notes: "",
    scheduledDate: null,
    scheduledTime: null,
  }
}

type CheckoutLinkSidebarContentProps = {
  origin: string
}

const CheckoutLinkSidebarContent = ({ origin }: CheckoutLinkSidebarContentProps) => {
  const { products, isLoadingProducts } = useStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [brandFilters, setBrandFilters] = useState<string[]>([])
  const [categoryFilters, setCategoryFilters] = useState<string[]>([])
  const [sortOption, setSortOption] = useState<"alpha" | "price-asc" | "price-desc">("alpha")
  const [onlyInStock, setOnlyInStock] = useState(true)
  const [items, setItems] = useState<SidebarCheckoutItem[]>([])
  const [generatedLink, setGeneratedLink] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [isCatalogCollapsed, setIsCatalogCollapsed] = useState(false)

  const variantOptions = useMemo(() => mapProductsToSidebarVariants(products), [products])
  const variantLookup = useMemo(() => {
    const lookup = new Map<number, SidebarVariantOption>()
    variantOptions.forEach((variant) => lookup.set(variant.id, variant))
    return lookup
  }, [variantOptions])

  const brandOptions = useMemo(() => {
    const set = new Set<string>()
    variantOptions.forEach((v) => v.brandName && set.add(v.brandName))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [variantOptions])

  const categoryOptions = useMemo(() => {
    const set = new Set<string>()
    variantOptions.forEach((v) => v.categories.forEach((c) => c && set.add(c)))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [variantOptions])

  const filteredVariants = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    let matches = variantOptions.filter((variant) => {
      if (brandFilters.length > 0 && (!variant.brandName || !brandFilters.includes(variant.brandName))) return false
      if (categoryFilters.length > 0 && !categoryFilters.some((cat) => variant.categories.includes(cat))) return false
      if (onlyInStock && !variant.isPreorder && variant.totalStock <= 0) return false
      if (!normalizedSearch) return true
      return [variant.displayName, variant.productName, variant.brandName ?? "", variant.sku ?? "", ...variant.categories]
        .join(" ").toLowerCase().includes(normalizedSearch)
    })
    matches = matches.sort((a, b) => {
      switch (sortOption) {
        case "price-asc": return getVariantMinPrice(a) - getVariantMinPrice(b)
        case "price-desc": return getVariantMinPrice(b) - getVariantMinPrice(a)
        default: return a.displayName.localeCompare(b.displayName)
      }
    })
    return matches.slice(0, 50) // Increased limit as we now fix scrolling
  }, [variantOptions, brandFilters, categoryFilters, onlyInStock, searchTerm, sortOption])

  const totalEstimate = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])
  const resolvedOrigin = origin || (typeof window !== "undefined" ? window.location.origin : "")

  const resetLinkState = () => { setGeneratedLink(""); setCopySuccess(false); }

  const handleAddVariant = (variantId: number) => {
    const variant = variantLookup.get(variantId)
    if (!variant || !variant.sizeOptions[0]) return
    const sizeOption = variant.sizeOptions[0]
    const itemKey = buildItemKey(variant.id, sizeOption.key || DEFAULT_SIZE_KEY)

    setItems((prev) => {
      const existing = prev.find((i) => i.key === itemKey)
      if (existing) {
        return prev.map((i) => i.key === itemKey ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, {
        key: itemKey,
        variantId: variant.id,
        productId: variant.productId,
        name: variant.displayName,
        image: variant.image,
        price: sizeOption.price,
        quantity: 1,
        sizeKey: sizeOption.key || DEFAULT_SIZE_KEY,
        sizeLabel: sizeOption.label === "Default" ? null : sizeOption.label,
        colorLabel: variant.colorLabel,
        customizations: buildItemCustomizations(variant, sizeOption.label === "Default" ? null : sizeOption.label)
      }]
    })
    resetLinkState()
  }

  const handleRemoveItem = (key: string) => { setItems((prev) => prev.filter((i) => i.key !== key)); resetLinkState(); }
  const handleQuantityChange = (key: string, val: string) => {
    const quantity = parseInt(val) || 0
    if (quantity <= 0) { handleRemoveItem(key); return; }
    setItems((prev) => prev.map((i) => i.key === key ? { ...i, quantity } : i))
    resetLinkState()
  }

  const handleGenerateLink = async () => {
    if (items.length === 0) return
    setIsGenerating(true)
    try {
      const payload = items.map((i) => ({
        productId: i.productId, variantId: i.variantId, name: i.name,
        image: i.image, customizations: i.customizations, price: i.price, quantity: i.quantity
      }))
      const encoded = compressToEncodedURIComponent(JSON.stringify(payload))
      setGeneratedLink(`${resolvedOrigin}/checkout?cart=${encoded}`)
      toast({ title: "Link generated", description: "Ready to share with customer." })
    } catch (e) {
      toast({ title: "Error", description: "Failed to generate link.", variant: "destructive" })
    } finally { setIsGenerating(false) }
  }

  const handleCopyLink = async () => {
    if (!generatedLink) return
    try {
      await navigator.clipboard.writeText(generatedLink)
      setCopySuccess(true)
      toast({ title: "Link copied", description: "Paste it into the chat." })
    } catch (e) { toast({ title: "Error", description: "Copy failed." }) }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden h-full min-h-0 w-full">
      {/* Catalog Section */}
      <div className={cn("flex flex-col transition-all duration-300 overflow-hidden min-h-0", isCatalogCollapsed ? "h-12 flex-none" : "flex-1")}>
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200 shrink-0">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Catalog</h3>
          <button onClick={() => setIsCatalogCollapsed(!isCatalogCollapsed)} className="inbox-rp-icon-btn !w-6 !h-6">
            {isCatalogCollapsed ? <Expand className="size-3" /> : <Minimize2 className="size-3" />}
          </button>
        </div>

        {!isCatalogCollapsed && (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="inbox-rp-toolbar shrink-0">
              <div className="inbox-rp-search">
                <Search className="size-3.5" />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={cn("inbox-rp-icon-btn shrink-0", (brandFilters.length > 0 || categoryFilters.length > 0 || !onlyInStock) && "bg-slate-900 text-white")}>
                    <Filter className="size-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-[10px] uppercase">Filters</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">In-stock only</span>
                      <Switch checked={onlyInStock} onCheckedChange={setOnlyInStock} />
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Select value={sortOption} onValueChange={(v: any) => setSortOption(v)}>
                <SelectTrigger className="h-8 w-[90px] rounded-full text-[10px] uppercase shrink-0">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alpha" className="text-xs">A-Z</SelectItem>
                  <SelectItem value="price-asc" className="text-xs">Price ↑</SelectItem>
                  <SelectItem value="price-desc" className="text-xs">Price ↓</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 w-full p-2 space-y-2 pb-4">
              {filteredVariants.map((v) => (
                <div key={v.id} className="inbox-rp-card !p-2 flex items-center gap-3 w-full min-w-0">
                  <img
                    src={v.image}
                    alt=""
                    className="w-10 h-10 rounded-md object-cover border shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold truncate" title={v.displayName}>{v.displayName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{v.brandName} · {formatCurrency(getVariantMinPrice(v))}</p>
                  </div>
                  <button onClick={() => handleAddVariant(v.id)} className="inbox-rp-icon-btn !w-8 !h-8 bg-slate-900 text-white hover:bg-slate-800 shrink-0">
                    <ShoppingCart className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cart Section */}
      <div className="flex flex-col flex-none h-[35%] min-h-[160px] border-t border-slate-200 bg-white overflow-hidden">
        <div className="inbox-rp-cart-header shrink-0">
          <span>Customer Cart</span>
          {items.length > 0 && (
            <button onClick={() => setItems([])} className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Clear</button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 w-full scrollbar-thin">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-400 p-8 text-center min-h-[100px]">
              <ShoppingCart className="size-8 mb-2 opacity-20" />
              <p className="text-[11px]">Cart is empty.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 w-full overflow-hidden">
              {items.map((item) => (
                <div key={item.key} className="inbox-rp-cart-item w-full min-w-0">
                  <img
                    src={item.image}
                    alt=""
                    className="shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-[12px] font-bold truncate leading-tight grow" title={item.name}>{item.name}</p>
                      <button onClick={() => handleRemoveItem(item.key)} className="text-slate-400 hover:text-red-500 shrink-0 ml-2">
                        <X className="size-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                        <span className="text-[10px] text-slate-500 uppercase shrink-0">{item.sizeLabel || "OS"}</span>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.key, e.target.value)}
                          className="inbox-rp-qty-input shrink-0"
                        />
                      </div>
                      <span className="inbox-rp-price text-[12px] ml-2 shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="inbox-rp-actions-footer space-y-3 shrink-0">
        <div className="flex justify-between items-center px-1 shrink-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Est. Total</span>
          <span className="text-lg font-black">{formatCurrency(totalEstimate)}</span>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button
            className="flex-1 rounded-full h-10 font-bold text-xs uppercase tracking-wider"
            onClick={handleGenerateLink}
            disabled={items.length === 0 || isGenerating}
          >
            {isGenerating ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
            Generate Link
          </Button>
          {generatedLink && (
            <Button
              variant="outline"
              className="rounded-full h-10 w-10 p-0 shrink-0 border-2"
              onClick={handleCopyLink}
            >
              {copySuccess ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
            </Button>
          )}
        </div>

        {generatedLink && (
          <div className="relative group shrink-0">
            <input
              readOnly
              value={generatedLink}
              className="w-full text-[10px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-mono text-slate-500 pr-8 truncate"
            />
            <button
              onClick={handleCopyLink}
              className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600"
            >
              <Copy className="size-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

type OrderHistorySidebarContentProps = {
  origin: string
  participantHandle: string | null
}

const OrderHistorySidebarContent = ({ origin, participantHandle }: OrderHistorySidebarContentProps) => {
  const { orders, isLoadingOrders } = useStore()
  const { toast } = useToast()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderSearch, setOrderSearch] = useState("")
  const [statusFilters, setStatusFilters] = useState<OrderStatus[]>([])
  const [sortOption, setSortOption] = useState<"date-desc" | "date-asc" | "total-desc" | "total-asc">("date-desc")
  const [copyFeedback, setCopyFeedback] = useState<{ orderId: string; type: "link" | "message" } | null>(null)
  const copyFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const normalizedHandle = useMemo(() => normalizeHandle(participantHandle), [participantHandle])
  const resolvedOrigin = origin || (typeof window !== "undefined" ? window.location.origin : "")

  const matchingOrders = useMemo(() => {
    if (!normalizedHandle) return []
    const filteredByHandle = orders.filter(
      (order) => normalizeHandle(order.customer.instagramHandle) === normalizedHandle,
    )
    const filteredByStatus =
      statusFilters.length === 0
        ? filteredByHandle
        : filteredByHandle.filter((order) => statusFilters.includes(order.status))
    const filteredBySearch = filteredByStatus.filter((order) => {
      const term = orderSearch.trim().toLowerCase()
      if (!term) return true
      const customerName = `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase()
      return (
        order.id.toLowerCase().includes(term) ||
        order.status.toLowerCase().includes(term) ||
        customerName.includes(term)
      )
    })
    const sorted = [...filteredBySearch]
    sorted.sort((a, b) => {
      switch (sortOption) {
        case "date-asc": return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "total-desc": return b.total - a.total
        case "total-asc": return a.total - b.total
        case "date-desc":
        default: return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
    })
    return sorted
  }, [orders, normalizedHandle, orderSearch, sortOption, statusFilters])

  useEffect(() => {
    return () => {
      if (copyFeedbackTimeoutRef.current !== null) {
        clearTimeout(copyFeedbackTimeoutRef.current)
      }
    }
  }, [])

  const showCopyFeedback = (orderId: string, type: "link" | "message") => {
    if (copyFeedbackTimeoutRef.current !== null) {
      clearTimeout(copyFeedbackTimeoutRef.current)
    }
    setCopyFeedback({ orderId, type })
    copyFeedbackTimeoutRef.current = setTimeout(() => {
      setCopyFeedback((current) => (current?.orderId === orderId && current?.type === type ? null : current))
      copyFeedbackTimeoutRef.current = null
    }, 2000)
  }

  const handleCopyReceiptLink = async (order: Order) => {
    const link = buildReceiptLink(resolvedOrigin, order.id)
    try {
      await navigator.clipboard.writeText(link)
      toast({ title: "Receipt link copied", description: order.id })
      showCopyFeedback(order.id, "link")
    } catch (error) {
      toast({ title: "Copy failed", description: "Try copying the link manually." })
    }
  }

  const handleCopyTemplatedMessage = async (order: Order) => {
    const link = buildReceiptLink(resolvedOrigin, order.id)
    const firstName = order.customer.firstName || order.customer.lastName || "there"
    const message = `Hi ${firstName}! Here is your receipt for order ${order.id}: ${link} Total: ${formatCurrency(order.total)}. Let me know if you need anything else.`
    try {
      await navigator.clipboard.writeText(message)
      toast({ title: "Message copied", description: "Send it directly in your reply." })
      showCopyFeedback(order.id, "message")
    } catch (error) {
      toast({ title: "Copy failed", description: "Copy the message manually if needed." })
    }
  }

  const handleStatusSelect = (status: OrderStatus) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const statusOptions = useMemo(() => Object.keys(orderStatusClasses) as OrderStatus[], [])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-1 pb-3 pt-1">
        {/* Compact Toolbar */}
        <div className="inbox-rp-toolbar">
          <div className="inbox-rp-search">
            <Search className="size-3.5" />
            <input
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Search orders..."
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "inbox-rp-icon-btn",
                  statusFilters.length > 0 && "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                )}
                title="Filter by status"
              >
                <Filter className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider">Filter Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {statusOptions.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilters.includes(status)}
                  onCheckedChange={() => handleStatusSelect(status)}
                  className="text-xs"
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
              {statusFilters.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setStatusFilters([])}
                    className="text-center text-xs text-red-500 focus:text-red-500"
                  >
                    Clear Filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Select value={sortOption} onValueChange={(v: any) => setSortOption(v)}>
            <SelectTrigger className="h-8 w-[110px] rounded-full border-slate-200 text-[10px] uppercase tracking-wider">
              <ArrowUpDown className="mr-1 size-3" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(orderSortLabels).map(([key, label]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!participantHandle ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-xs text-[var(--muted-foreground)]">
            Choose a conversation to view history.
          </div>
        ) : matchingOrders.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <Receipt className="mb-2 size-6 text-[var(--muted-foreground)] opacity-20" />
            <p className="text-xs font-medium text-[var(--muted-foreground)]">No orders found</p>
          </div>
        ) : (
          <ScrollArea className="h-full px-2">
            <div className="space-y-2 pb-4">
              {matchingOrders.map((order) => {
                const linkCopied = copyFeedback?.orderId === order.id && copyFeedback?.type === "link"
                const messageCopied = copyFeedback?.orderId === order.id && copyFeedback?.type === "message"
                const statusClass = orderStatusClasses[order.status] ?? "bg-slate-100 text-slate-600"

                return (
                  <div key={order.id} className="inbox-rp-card group">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("inbox-rp-badge", statusClass)}>
                            {order.status}
                          </span>
                          <span className="text-[11px] font-bold text-[var(--foreground)] truncate">
                            {order.id}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--muted-foreground)]">
                          {orderDateFormatter.format(new Date(order.date))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[13px] font-bold text-[var(--foreground)]">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>

                    <div className="inbox-rp-card-actions">
                      <button
                        type="button"
                        className="inbox-rp-action-link"
                        onClick={() => handleCopyReceiptLink(order)}
                      >
                        {linkCopied ? <Check className="size-3" /> : <Link2 className="size-3" />}
                        {linkCopied ? "Copied" : "Receipt"}
                      </button>
                      <button
                        type="button"
                        className="inbox-rp-action-link"
                        onClick={() => handleCopyTemplatedMessage(order)}
                      >
                        {messageCopied ? <Check className="size-3" /> : <MessageSquare className="size-3" />}
                        {messageCopied ? "Copied" : "Message"}
                      </button>
                      <button
                        type="button"
                        className="inbox-rp-action-link ml-auto !text-[var(--muted-foreground)]"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Details
                        <ChevronRight className="size-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </div>

      <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-3xl">
          {selectedOrder &&
            (() => {
              const isPickupOrder = selectedOrder.fulfillmentMethod === "pickup"
              const pickupDetails = getPickupDetailsForDisplay(selectedOrder)
              const deliveryLines = [
                selectedOrder.delivery.unit,
                selectedOrder.delivery.lot,
                selectedOrder.delivery.street,
                `${selectedOrder.delivery.city}, ${selectedOrder.delivery.region} ${selectedOrder.delivery.zipCode}`,
                selectedOrder.delivery.country,
              ].filter((line) => typeof line === "string" && line.trim().length > 0)
              const pickupLines = [
                pickupDetails.locationName,
                pickupDetails.unit,
                pickupDetails.lot,
                pickupDetails.street,
                `${pickupDetails.city}, ${pickupDetails.region} ${pickupDetails.zipCode}`,
                pickupDetails.country,
              ].filter((line) => typeof line === "string" && line.trim().length > 0)
              const pickupSlot =
                pickupDetails.scheduledDate && pickupDetails.scheduledTime
                  ? `${pickupDetails.scheduledDate} · ${pickupDetails.scheduledTime}`
                  : pickupDetails.scheduledDate
              const shippingLabel = isPickupOrder ? "Handling" : "Shipping"

              return (
                <>
                  <DialogHeader>
                    <DialogTitle>Order {selectedOrder.id}</DialogTitle>
                    <DialogDescription>
                      Placed {orderDateFormatter.format(new Date(selectedOrder.date))} ·{" "}
                      {isPickupOrder ? "Pickup" : "Delivery"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1 text-sm text-[var(--foreground)]">
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                      {/* Section 1: Status, Payment, Tracking */}
                      <div className="p-4 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</p>
                            <p className="text-sm font-semibold text-slate-900">{selectedOrder.status}</p>
                          </div>
                          <span
                            className={cn(
                              "inbox-rp-badge",
                              orderStatusClasses[selectedOrder.status] ?? "bg-slate-100 text-slate-600",
                            )}
                          >
                            {isPickupOrder ? "Pickup" : "Delivery"}
                          </span>
                        </div>
                        <div className="grid gap-3 text-xs sm:grid-cols-2">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payment method</p>
                            <p className="text-sm font-semibold">{selectedOrder.paymentMethod}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tracking ID</p>
                            <p className="text-sm font-semibold">
                              {selectedOrder.trackingId ?? "Not set"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-100" />

                      {/* Section 2: Customer */}
                      <div className="p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Customer</p>
                        <div className="space-y-1 text-sm">
                          <p className="font-semibold text-slate-900">
                            {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                          </p>
                          <p className="text-slate-600">{selectedOrder.customer.email}</p>
                          <p className="text-slate-600">{selectedOrder.customer.phone}</p>
                          {selectedOrder.customer.instagramHandle && (
                            <p className="text-[10px] uppercase tracking-wider text-slate-400">
                              @{selectedOrder.customer.instagramHandle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-slate-100" />

                      {/* Section 3: Pickup/Delivery details */}
                      <div className="p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                          {isPickupOrder ? "Pickup details" : "Delivery address"}
                        </p>
                        <div className="space-y-1 text-sm text-slate-600">
                          {(isPickupOrder ? pickupLines : deliveryLines).map((line, index) => (
                            <p key={`${line}-${index}`}>{line}</p>
                          ))}
                          {isPickupOrder && pickupSlot && (
                            <p className="text-xs text-slate-400">Pickup slot: {pickupSlot}</p>
                          )}
                          {isPickupOrder && pickupDetails.notes && (
                            <p className="text-xs text-slate-400 italic">Notes: {pickupDetails.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-slate-100" />

                      {/* Section 4: Items */}
                      <div className="p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Items</p>
                        <div className="space-y-4">
                          {selectedOrder.items.map((item) => {
                            const customizations = Object.entries(item.customizations ?? {})
                            return (
                              <div
                                key={`${selectedOrder.id}-${item.variantId}`}
                                className="flex items-start justify-between gap-3 text-sm"
                              >
                                <div>
                                  <p className="font-semibold text-slate-900">{item.name}</p>
                                  <p className="text-xs text-slate-500">Qty {item.quantity}</p>
                                  {customizations.length > 0 && (
                                    <p className="text-[11px] text-slate-400">
                                      {customizations.map(([key, value]) => `${key}: ${value}`).join(" • ")}
                                    </p>
                                  )}
                                </div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {formatCurrency(item.price * item.quantity)}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="border-t border-slate-100" />

                      {/* Section 5: Summary */}
                      <div className="p-4 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Subtotal</span>
                          <span className="font-medium text-slate-900">{formatCurrency(selectedOrder.subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>VAT</span>
                          <span className="font-medium text-slate-900">{formatCurrency(selectedOrder.vat)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{shippingLabel}</span>
                          <span className="font-medium text-slate-900">{formatCurrency(selectedOrder.shippingFee)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                          <span>Total</span>
                          <span>{formatCurrency(selectedOrder.total)}</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100" />

                      {/* Section 6: Proof of Payment */}
                      <div className="p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Proof of Payment</p>
                        {selectedOrder.proofOfPayment ? (
                          <div className="relative aspect-auto min-h-[400px] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                            <img src={selectedOrder.proofOfPayment} alt="Proof of Payment" className="h-full w-full object-contain" />
                          </div>
                        ) : (
                          <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
                            <p className="text-xs">No proof of payment uploaded</p>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-100" />

                      {/* Section 7: E-Receipt */}
                      <div className="p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">E-Receipt</p>
                        <div className="flex gap-2">
                          <Button
                            asChild
                            className="flex-1 rounded-full bg-slate-900 text-white hover:bg-slate-800 h-9 text-xs font-bold uppercase tracking-wider"
                          >
                            <a href={`/receipt/${selectedOrder.id}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 size-3.5" />
                              Go to Receipt
                            </a>
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="size-9 shrink-0 rounded-full border-slate-200 hover:bg-slate-50 font-bold"
                            onClick={() => handleCopyReceiptLink(selectedOrder)}
                            title="Copy receipt link"
                          >
                            {copyFeedback?.orderId === selectedOrder.id && copyFeedback?.type === "link" ? (
                              <Check className="size-4 text-emerald-600" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )
            })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminOmnichannelPage() {
  const { toast } = useToast()
  const {
    isConnected,
    isLoading,
    error,
    conversations,
    selectedConversationId,
    messages,
    isLoadingMessages,
    selectConversation,
    syncConversations,
    isSyncing,
    refreshConversations,
    refreshMessages,
  } = useInstagramConversations()

  const [threadSearch, setThreadSearch] = useState("")
  const [messageDraft, setMessageDraft] = useState("")
  const [pendingAttachment, setPendingAttachment] = useState<{ id: string; previewUrl: string; name: string } | null>(null)
  const attachmentInputRef = useRef<HTMLInputElement | null>(null)
  const [activeRightPanel, setActiveRightPanel] = useState<"orders" | "checkout">("orders")
  const [clientOrigin, setClientOrigin] = useState("")
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setClientOrigin(window.location.origin)
    }
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const container = messagesEndRef.current?.parentElement
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages])

  // Filter conversations by search
  const filteredConversations = useMemo(() => {
    const query = threadSearch.trim().toLowerCase()
    if (!query) return conversations
    return conversations.filter((conv) => {
      const name = (conv.participantName ?? "").toLowerCase()
      const username = (conv.participantUsername ?? "").toLowerCase()
      return name.includes(query) || username.includes(query)
    })
  }, [conversations, threadSearch])

  // Selected conversation data
  const selectedConversation = useMemo(() => {
    return conversations.find((c) => c.conversationId === selectedConversationId) ?? null
  }, [conversations, selectedConversationId])

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!selectedConversationId && filteredConversations.length > 0) {
      selectConversation(filteredConversations[0].conversationId)
    }
  }, [selectedConversationId, filteredConversations, selectConversation])

  // Group messages with date labels
  const messagesWithLabels = useMemo(() => {
    let lastLabel: string | null = null
    return messages.map((msg) => {
      const label = getMessageDateLabel(msg.sentAt)
      const showLabel = label !== lastLabel
      lastLabel = label
      return { msg, label, showLabel }
    })
  }, [messages])

  const handleSyncInstagram = async () => {
    try {
      await syncConversations()
      toast({ title: "Sync complete", description: "Instagram conversations have been updated." })
    } catch (err) {
      toast({
        title: "Sync failed",
        description: err instanceof Error ? err.message : "Failed to sync Instagram conversations.",
        variant: "destructive",
      })
    }
  }

  const handleAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setPendingAttachment({ id: `attachment-${Date.now()}`, previewUrl: reader.result, name: file.name })
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ""
  }

  const [isSending, setIsSending] = useState(false)

  const handleMessageSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = messageDraft.trim()
    if (!trimmed || !selectedConversationId) return
    setIsSending(true)
    try {
      const response = await fetch(
        `/api/admin/instagram/conversations/${encodeURIComponent(selectedConversationId)}/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageText: trimmed }),
        },
      )
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? "Failed to send message")
      }
      setMessageDraft("")
      setPendingAttachment(null)
      // Refresh messages to show the sent message
      await refreshMessages()
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : "Could not send message."

      // Handle Instagram 24-hour window error
      if (errorMessage.includes("2534022") || errorMessage.toLowerCase().includes("outside of allowed window")) {
        errorMessage = "Messaging window expired (24h). Please wait for the customer to message you again."
      }

      toast({
        title: "Failed to send",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      // Trigger the form submit manually
      const form = e.currentTarget.form
      if (form) {
        form.requestSubmit()
      }
    }
  }

  const participantHandle = selectedConversation?.participantUsername
    ? `@${selectedConversation.participantUsername}`
    : null

  // Loading state
  if (isLoading) {
    return (
      <div className="inbox-shell items-center justify-center">
        <div className="inbox-empty">
          <Loader2 className="inbox-empty-icon animate-spin" />
          <p className="inbox-empty-title">Loading inbox</p>
          <p className="inbox-empty-desc">Connecting to Instagram…</p>
        </div>
      </div>
    )
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="inbox-shell items-center justify-center">
        <div className="inbox-empty">
          <Instagram className="inbox-empty-icon" />
          <p className="inbox-empty-title">Instagram not connected</p>
          <p className="inbox-empty-desc">Connect your Instagram account in Settings to view messages.</p>
          <Button asChild variant="outline" className="mt-2 rounded-full">
            <a href="/admin/settings">Go to Settings</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="inbox-shell">
      {/* ── Thread List ── */}
      <div className="inbox-thread-list">
        <div className="inbox-thread-header">
          <div className="flex items-center justify-between">
            <div>
              <p className="inbox-thread-header-title">Inbox</p>
              <p className="inbox-thread-header-subtitle">Instagram</p>
            </div>
            <div className="flex items-center gap-2">
              {isSyncing ? (
                <div className="inbox-sync-dot" title="Syncing…" />
              ) : (
                <div className="inbox-sync-dot" title="Auto-syncing every 10s" />
              )}
              <button
                type="button"
                className="inbox-icon-btn"
                onClick={handleSyncInstagram}
                disabled={isSyncing}
                title="Hard refresh from Instagram"
              >
                {isSyncing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              </button>
            </div>
          </div>
          <div className="inbox-search-box mt-3">
            <Search className="size-3.5 shrink-0 text-[var(--muted-foreground)]" />
            <input
              value={threadSearch}
              onChange={(e) => setThreadSearch(e.target.value)}
              placeholder="Search name or handle"
              className="inbox-search-input"
            />
          </div>
          <p className="mt-2 text-[0.6875rem] text-[var(--muted-foreground)]">
            {filteredConversations.length} conversation{filteredConversations.length !== 1 ? "s" : ""}
          </p>
        </div>

        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="inbox-empty" style={{ minHeight: 200 }}>
              <MessageCircle className="inbox-empty-icon" />
              <p className="inbox-empty-title">No conversations</p>
              <p className="inbox-empty-desc">
                {conversations.length === 0
                  ? "Click the refresh button to sync your Instagram DMs."
                  : "No conversations match your search."}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.conversationId === selectedConversationId
              const displayName = conv.participantUsername
                ? `@${conv.participantUsername}`
                : conv.participantName || "Unknown"
              return (
                <button
                  key={conv.conversationId}
                  type="button"
                  className={cn("inbox-thread-item", isSelected && "inbox-thread-item-active")}
                  onClick={() => selectConversation(conv.conversationId)}
                >
                  <Avatar className="size-10 shrink-0 border border-[var(--border)]">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(conv.participantName ?? displayName)}`}
                      alt={displayName}
                    />
                    <AvatarFallback>{(conv.participantName ?? "?").slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="inbox-thread-name truncate">{conv.participantName || displayName}</p>
                      <span className="inbox-thread-time">{formatRelativeTime(conv.lastMessageAt)}</span>
                    </div>
                    {conv.participantUsername && conv.participantName && (
                      <p className="inbox-thread-handle">@{conv.participantUsername}</p>
                    )}
                    <p className="inbox-thread-snippet">{conv.lastMessage || "No messages"}</p>
                  </div>
                  {conv.unreadCount > 0 && <span className="inbox-thread-unread">{conv.unreadCount}</span>}
                </button>
              )
            })
          )}
        </ScrollArea>
      </div>

      {/* ── Chat Panel ── */}
      <div className="inbox-chat-panel">
        {!selectedConversation ? (
          <div className="inbox-empty">
            <MessageCircle className="inbox-empty-icon" />
            <p className="inbox-empty-title">Select a thread</p>
            <p className="inbox-empty-desc">Choose a conversation to review messages and send a reply.</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="inbox-chat-header">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border border-[var(--border)]">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedConversation.participantName ?? "?")}`}
                    alt={selectedConversation.participantName ?? ""}
                  />
                  <AvatarFallback>{(selectedConversation.participantName ?? "?").slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="inbox-chat-header-name">
                    {selectedConversation.participantName || `@${selectedConversation.participantUsername}`}
                  </p>
                  {selectedConversation.participantUsername && selectedConversation.participantName && (
                    <p className="inbox-chat-header-handle">@{selectedConversation.participantUsername}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="inbox-chat-messages">
              {isLoadingMessages ? (
                <div className="inbox-empty">
                  <Loader2 className="inbox-empty-icon animate-spin" />
                  <p className="inbox-empty-desc">Loading messages…</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="inbox-empty">
                  <MessageCircle className="inbox-empty-icon" />
                  <p className="inbox-empty-title">No messages</p>
                  <p className="inbox-empty-desc">This conversation has no messages yet.</p>
                </div>
              ) : (
                <>
                  {messagesWithLabels.map(({ msg, label, showLabel }) => (
                    <div key={msg.id} className={cn("flex flex-col", msg.isFromPage ? "items-end" : "items-start")}>
                      {showLabel && <div className="inbox-chat-date-label w-full">{label}</div>}
                      <div
                        className={cn(
                          "inbox-chat-bubble",
                          msg.isFromPage ? "inbox-chat-bubble-agent" : "inbox-chat-bubble-customer",
                        )}
                      >
                        {msg.messageText && <p>{msg.messageText}</p>}
                        {!msg.messageText && msg.attachments.length > 0 && (
                          <p className="italic opacity-70">[Media attachment]</p>
                        )}
                        {msg.attachments.length > 0 && (
                          <div className="mt-2 grid gap-2">
                            {msg.attachments.map((att) =>
                              att.url ? (
                                <img
                                  key={att.id}
                                  src={att.url}
                                  alt="Attachment"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE
                                  }}
                                  className="w-full max-w-[240px] rounded-lg border border-[var(--border)] object-cover"
                                />
                              ) : null,
                            )}
                          </div>
                        )}
                        <p className="inbox-chat-timestamp">
                          {messageTimeFormatter.format(new Date(msg.sentAt))}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Compose */}
            <form onSubmit={handleMessageSend} className="inbox-compose">
              <div className="inbox-compose-box">
                <textarea
                  value={messageDraft}
                  onChange={(e) => setMessageDraft(e.target.value)}
                  placeholder={`Reply to ${selectedConversation.participantName || selectedConversation.participantUsername || "customer"}…`}
                  rows={3}
                  className="inbox-compose-textarea"
                  disabled={isSending}
                  onKeyDown={handleKeyDown}
                />
              </div>
              {pendingAttachment && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-[var(--border)] p-3">
                  <img src={pendingAttachment.previewUrl} alt={pendingAttachment.name} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--foreground)] truncate">{pendingAttachment.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Ready to send</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingAttachment(null)}
                    className="inbox-icon-btn"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}
              <div className="inbox-compose-actions">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inbox-icon-btn"
                    onClick={() => attachmentInputRef.current?.click()}
                  >
                    <ImageIcon className="size-3.5" />
                  </button>
                  <button type="button" className="inbox-icon-btn" disabled>
                    <Paperclip className="size-3.5" />
                  </button>
                  <input ref={attachmentInputRef} type="file" accept="image/*" className="hidden" onChange={handleAttachmentChange} />
                </div>
                <button
                  type="submit"
                  className="inbox-compose-btn"
                  disabled={isSending || (!messageDraft.trim() && !pendingAttachment)}
                >
                  {isSending ? (
                    <>
                      Sending...
                      <Loader2 className="size-3.5 animate-spin" />
                    </>
                  ) : (
                    <>
                      Send
                      <Send className="size-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* ── Right Panel ── */}
      <div className="inbox-right-panel flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
          <button
            onClick={() => setActiveRightPanel("orders")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-wider transition-all",
              activeRightPanel === "orders"
                ? "bg-white text-slate-900 border-b-2 border-slate-900"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            )}
          >
            <Receipt className="size-3.5" />
            Orders
          </button>
          <button
            onClick={() => setActiveRightPanel("checkout")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-wider transition-all",
              activeRightPanel === "checkout"
                ? "bg-white text-slate-900 border-b-2 border-slate-900"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            )}
          >
            <Link2 className="size-3.5" />
            Checkout
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden relative">
          {activeRightPanel === "orders" ? (
            <div key="orders-tab" className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
              <OrderHistorySidebarContent origin={clientOrigin} participantHandle={participantHandle} />
            </div>
          ) : (
            <div key="checkout-tab" className="h-full flex flex-col animate-in fade-in slide-in-from-left-4 duration-300">
              <CheckoutLinkSidebarContent origin={clientOrigin} />
            </div>
          )}
        </div>
      </div>
    </div >
  )
}
