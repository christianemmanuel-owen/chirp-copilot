"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import HeroCategories from "@/components/hero-categories"
import CategoryGrid from "@/components/category-grid"
import CartSidebar from "@/components/cart-sidebar"
import type { CollectionTile, CollectionTileMode, HeroProductHighlight } from "@/lib/storefront-data"
import { useCart } from "@/lib/cart"

declare global {
  interface Window {
    __chirpHasCartSidebar?: boolean
  }
}

interface StorefrontHomeContentProps {
  heroItems: HeroProductHighlight[]
  tiles: CollectionTile[]
  tileMode: CollectionTileMode
}

export default function StorefrontHomeContent({ heroItems, tiles, tileMode }: StorefrontHomeContentProps) {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const router = useRouter()
  const {
    items: cartLines,
    isHydrated: isCartHydrated,
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
    if (typeof window === "undefined") return

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

  const handleProceedToCheckout = useCallback(() => {
    if (cartItems.length === 0) return
    setIsCartOpen(false)
    router.push("/checkout")
  }, [cartItems.length, router])

  const handleStartShopping = useCallback(() => {
    setIsCartOpen(false)
    router.push("/catalog")
  }, [router])

  return (
    <>
      <div>
        <HeroCategories items={heroItems} />
        <CategoryGrid tiles={tiles} mode={tileMode} />
      </div>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        isHydrated={isCartHydrated}
        onRemoveItem={removeCartItem}
        onUpdateQuantity={updateCartQuantity}
        onProceedToCheckout={handleProceedToCheckout}
        onStartShopping={handleStartShopping}
      />
    </>
  )
}
