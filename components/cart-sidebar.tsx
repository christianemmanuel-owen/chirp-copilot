"use client"

import { Minus, Plus, ShoppingCart, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

interface CartItem {
  lineId: string
  variantId: number
  productId: number
  name: string
  image: string
  brandName: string | null
  size: string | null
  price: number
  quantity: number
  maxStock: number
}

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  isHydrated: boolean
  onRemoveItem: (lineId: string) => void
  onUpdateQuantity: (lineId: string, quantity: number) => void
  onProceedToCheckout: () => void
  onStartShopping: () => void
}

export default function CartSidebar({
  isOpen,
  onClose,
  items,
  isHydrated,
  onRemoveItem,
  onUpdateQuantity,
  onProceedToCheckout,
  onStartShopping,
}: CartSidebarProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!hasMounted || !isHydrated) return

    const originalOverflow = document.body.style.overflow
    const originalPadding = document.body.style.paddingRight

    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = "hidden"
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
    } else {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPadding
    }

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPadding
    }
  }, [hasMounted, isHydrated, isOpen])

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )
  const hasItems = items.length > 0
  const shouldShowEmpty = items.length === 0

  if (!hasMounted || !isHydrated) {
    return null
  }

  return (
    <>
      {isOpen && (
        <div className="h-full fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300" onClick={onClose} />
      )}

      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-background text-foreground shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Cart</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {shouldShowEmpty ? (
          <div className="space-y-4 py-12 text-center">
            <p className="text-sm text-muted-foreground">Your cart is empty</p>
            <Button onClick={onStartShopping} variant="outline">
              Start shopping
            </Button>
          </div>
        ) : hasItems ? (
          <div className="space-y-6">
            {items.map((item) => {
              const unitPrice = formatCurrency(item.price)
              const lineTotal = formatCurrency(item.price * item.quantity)
              const brandLabel =
                item.brandName && item.brandName.trim().length > 0 ? item.brandName : "Unbranded"

              return (
                <div key={item.lineId} className="flex gap-4 border-b border-border pb-4 last:border-none">
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-muted">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                          {brandLabel}
                        </p>
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        {item.size && <p className="text-xs text-muted-foreground">Size · {item.size}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.lineId)}
                        className="text-muted-foreground transition hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                        aria-label={`Remove ${item.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.lineId, Math.max(0, item.quantity - 1))}
                          className="flex size-8 items-center justify-center rounded-full border border-border text-sm transition hover:border-primary/60 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={item.quantity <= 0}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.lineId, Math.min(item.maxStock, item.quantity + 1))}
                          className="flex size-8 items-center justify-center rounded-full border border-border text-sm transition hover:border-primary/60 hover:text-primary"
                          disabled={item.quantity >= item.maxStock}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Unit · {unitPrice}
                          {typeof item.maxStock === "number" && Number.isFinite(item.maxStock)
                            ? ` · Max ${item.maxStock}`
                            : null}
                        </p>
                        <p className="text-sm font-semibold text-foreground">{lineTotal}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}
      </div>

        <footer className="border-t border-border bg-background/80 px-6 py-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total</span>
            <span className="text-lg font-semibold text-foreground">{formatCurrency(total)}</span>
          </div>
          <Button className="w-full" onClick={onProceedToCheckout} disabled={items.length === 0}>
            Proceed to checkout
          </Button>
        </footer>
      </aside>
    </>
  )
}
