"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { NavCollectionItem } from "@/lib/storefront-data"
import { BUSINESS_NAME } from "@/lib/config"
import OrderTrackingDialog from "@/components/order-tracking-dialog"

declare global {
  interface Window {
    __chirpHasCartSidebar?: boolean
  }
}

interface NavigationProps {
  items: NavCollectionItem[]
  hideAdminLink?: boolean
  showCartButton?: boolean
  showLoginIcon?: boolean
}

export default function Navigation({
  items,
  hideAdminLink = false,
  showCartButton = true,
  showLoginIcon = false,
}: NavigationProps) {
  const router = useRouter()

  const handleCartClick = () => {
    if (typeof window === "undefined") {
      router.push("/catalog?cart=open")
      return
    }

    if (window.__chirpHasCartSidebar || window.location.pathname.startsWith("/catalog")) {
      window.dispatchEvent(
        new CustomEvent("chirp:cart-toggle", {
          detail: { mode: "toggle" },
        }),
      )
      return
    }

    router.push("/catalog?cart=open")
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-foreground transition hover:text-primary"
          >
            {BUSINESS_NAME}
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {items.map((entry) => (
              <Link
                key={`${entry.kind}-${entry.id}`}
                href={entry.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {entry.name}
              </Link>
            ))}
            <Link
              href="/catalog"
              className="shine-effect cursor-pointer rounded px-3 py-1 text-sm font-semibold transition hover:opacity-80"
            >
              Shop
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <OrderTrackingDialog />
          {showCartButton && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10"
              onClick={handleCartClick}
              aria-label="Open cart drawer"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          )}

          {showLoginIcon && (
            <Button variant="ghost" size="icon" asChild className="hover:bg-primary/10">
              <Link href="/login" aria-label="Login">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}

          {!hideAdminLink && (
            <Button variant="ghost" size="icon" asChild className="hover:bg-primary/10">
              <Link href="/admin" aria-label="Open admin dashboard">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
