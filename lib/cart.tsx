"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

export interface CartLineAttributes {
  [attribute: string]: string
}

export interface CartLine {
  lineId: string
  variantId: number
  productId: number
  name: string
  image: string
  brandName: string | null
  attributes: CartLineAttributes
  price: number
  quantity: number
  maxStock: number
}

interface AddItemPayload {
  variantId: number
  productId: number
  name: string
  image: string
  brandName: string | null
  attributes?: CartLineAttributes
  price: number
  quantity: number
  maxStock?: number
}

interface ReplaceCartPayload extends Omit<AddItemPayload, "quantity"> {
  quantity: number
}

interface CartContextValue {
  items: CartLine[]
  isHydrated: boolean
  addItem: (payload: AddItemPayload) => void
  updateQuantity: (lineId: string, quantity: number) => void
  removeItem: (lineId: string) => void
  replaceCart: (items: ReplaceCartPayload[]) => void
  clearCart: () => void
}

const STORAGE_KEY = "chirp-cart-v1"

const CartContext = createContext<CartContextValue | undefined>(undefined)

const normalizeAttributes = (attributes?: CartLineAttributes): CartLineAttributes => {
  if (!attributes) return {}
  const normalized: CartLineAttributes = {}
  for (const [rawKey, rawValue] of Object.entries(attributes)) {
    const key = typeof rawKey === "string" ? rawKey.trim() : ""
    if (!key) continue
    const value = typeof rawValue === "string" ? rawValue.trim() : ""
    if (!value) continue
    normalized[key] = value
  }
  return normalized
}

const buildLineId = (variantId: number, attributes: CartLineAttributes) => {
  const attributeEntries = Object.entries(attributes)
  if (attributeEntries.length === 0) {
    return `${variantId}`
  }
  const sorted = attributeEntries
    .map(([key, value]) => [key.toLowerCase(), value.toLowerCase()] as const)
    .sort(([aKey, aValue], [bKey, bValue]) => {
      if (aKey === bKey) {
        return aValue.localeCompare(bValue)
      }
      return aKey.localeCompare(bKey)
    })
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("|")

  return `${variantId}:${sorted}`
}

const clampQuantity = (quantity: number, maxStock: number) => {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 0
  }

  const effectiveMax = Number.isFinite(maxStock) && maxStock > 0 ? maxStock : Number.POSITIVE_INFINITY
  return Math.max(0, Math.min(quantity, effectiveMax))
}

const parseStoredCart = (value: string | null): CartLine[] => {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map((entry) => {
        const {
          lineId,
          variantId,
          productId,
          name,
          image,
          brandName = null,
          attributes = {},
          price,
          quantity,
          maxStock,
        } = entry ?? {}

        if (
          typeof variantId !== "number" ||
          typeof productId !== "number" ||
          typeof name !== "string" ||
          typeof image !== "string" ||
          typeof price !== "number" ||
          typeof quantity !== "number"
        ) {
          return null
        }

        const normalizedAttributes = normalizeAttributes(attributes)
        const normalizedLineId = typeof lineId === "string" && lineId.length > 0 ? lineId : buildLineId(variantId, normalizedAttributes)
        const normalizedBrand =
          brandName && typeof brandName === "string" && brandName.trim().length > 0 ? brandName.trim() : null

        const normalizedMaxStock =
          typeof maxStock === "number" && Number.isFinite(maxStock) && maxStock > 0
            ? maxStock
            : Number.POSITIVE_INFINITY

        const clampedQuantity = clampQuantity(quantity, normalizedMaxStock)
        if (clampedQuantity <= 0) {
          return null
        }

        return {
          lineId: normalizedLineId,
          variantId,
          productId,
          name: name.trim(),
          image: image.trim(),
          brandName: normalizedBrand,
          attributes: normalizedAttributes,
          price,
          quantity: clampedQuantity,
          maxStock: normalizedMaxStock,
        }
      })
      .filter((entry): entry is CartLine => Boolean(entry))
  } catch (error) {
    console.warn("Failed to parse stored cart payload", error)
    return []
  }
}

const serializeCart = (items: CartLine[]) => JSON.stringify(items)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([])
  const hasHydratedRef = useRef(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const stored = window.localStorage.getItem(STORAGE_KEY)
    const parsed = parseStoredCart(stored)
    setItems(parsed)
    hasHydratedRef.current = true
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!hasHydratedRef.current || typeof window === "undefined") {
      return
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, serializeCart(items))
    } catch (error) {
      console.warn("Failed to persist cart to localStorage", error)
    }
  }, [items])

  const addItem = useCallback((payload: AddItemPayload) => {
    setItems((prev) => {
      const attributes = normalizeAttributes(payload.attributes)
      const lineId = buildLineId(payload.variantId, attributes)
      const incomingQuantity = clampQuantity(payload.quantity, payload.maxStock ?? Number.POSITIVE_INFINITY)
      if (incomingQuantity <= 0) {
        return prev
      }

      const maxStock =
        typeof payload.maxStock === "number" && Number.isFinite(payload.maxStock) && payload.maxStock > 0
          ? payload.maxStock
          : Number.POSITIVE_INFINITY

      const next = [...prev]
      const existingIndex = next.findIndex((item) => item.lineId === lineId)
      if (existingIndex >= 0) {
        const existing = next[existingIndex]
        const nextQuantity = clampQuantity(existing.quantity + incomingQuantity, maxStock)
        next[existingIndex] = {
          ...existing,
          quantity: nextQuantity,
          maxStock,
        }
        return next
      }

      const brandName =
        payload.brandName && payload.brandName.trim().length > 0 ? payload.brandName.trim() : null

      next.push({
        lineId,
        variantId: payload.variantId,
        productId: payload.productId,
        name: payload.name.trim(),
        image: payload.image.trim(),
        brandName,
        attributes,
        price: payload.price,
        quantity: incomingQuantity,
        maxStock,
      })

      return next
    })
  }, [])

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.lineId !== lineId) return item
          const nextQuantity = clampQuantity(quantity, item.maxStock)
          if (nextQuantity <= 0) {
            return null
          }
          return { ...item, quantity: nextQuantity }
        })
        .filter((entry): entry is CartLine => Boolean(entry)),
    )
  }, [])

  const removeItem = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((item) => item.lineId !== lineId))
  }, [])

  const replaceCart = useCallback((incomingItems: ReplaceCartPayload[]) => {
    const normalized: CartLine[] = []
    for (const payload of incomingItems) {
      const attributes = normalizeAttributes(payload.attributes)
      const lineId = buildLineId(payload.variantId, attributes)
      const maxStock =
        typeof payload.maxStock === "number" && Number.isFinite(payload.maxStock) && payload.maxStock > 0
          ? payload.maxStock
          : Number.POSITIVE_INFINITY
      const quantity = clampQuantity(payload.quantity, maxStock)
      if (quantity <= 0) continue

      const brandName =
        payload.brandName && payload.brandName.trim().length > 0 ? payload.brandName.trim() : null

      normalized.push({
        lineId,
        variantId: payload.variantId,
        productId: payload.productId,
        name: payload.name.trim(),
        image: payload.image.trim(),
        brandName,
        attributes,
        price: payload.price,
        quantity,
        maxStock,
      })
    }
    setItems(normalized)
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isHydrated,
      addItem,
      updateQuantity,
      removeItem,
      replaceCart,
      clearCart,
    }),
    [items, isHydrated, addItem, updateQuantity, removeItem, replaceCart, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }

  return context
}

