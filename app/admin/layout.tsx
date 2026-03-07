"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Percent,
  SettingsIcon,
  ShoppingCart,
  User,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { AdminNotificationsPopover } from "@/components/admin-notifications-popover"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { BUSINESS_NAME } from "@/lib/config"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    document.body.classList.add("admin-theme")
    return () => {
      document.body.classList.remove("admin-theme")
    }
  }, [])

  const handleSignOut = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      if (!response.ok) {
        throw new Error("Failed to sign out")
      }
      router.replace("/")
      router.refresh()
    } catch (error) {
      console.error("[admin] Failed to sign out", error)
      setIsSigningOut(false)
    }
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/messages", label: "Inbox", icon: MessageCircle },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/inventory", label: "Inventory", icon: Package },
    { href: "/admin/discounts", label: "Discounts", icon: Percent },
    { href: "/admin/checkout-links", label: "Checkout Links", icon: Link2 },
  ]

  if (pathname.startsWith("/admin/editor")) {
    return (
      <div className="min-h-screen bg-white text-foreground admin-theme overflow-hidden">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-foreground admin-theme">
      <SpeedInsights />
      <nav className="adm-nav">
        <div className="adm-nav-inner">
          <div className="flex items-end gap-6">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <button type="button" className="adm-nav-icon-btn adm-nav-mobile-trigger">
                  <Menu className="h-4 w-4" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80vw] max-w-xs border-r p-0">
                <SheetHeader className="border-b px-4 py-4">
                  <SheetTitle className="text-lg font-semibold">{BUSINESS_NAME}</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-1 p-3">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive =
                      item.href === "/admin"
                        ? pathname === "/admin" || pathname === "/admin/"
                        : pathname === item.href || pathname.startsWith(`${item.href}/`)
                    return (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={`adm-nav-link ${isActive ? "adm-nav-link-active" : ""}`}
                          style={{ padding: "0.5rem 0.75rem" }}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      </SheetClose>
                    )
                  })}
                  <SheetClose asChild>
                    <Link
                      href="/admin/settings"
                      className={`adm-nav-link ${pathname.startsWith("/admin/settings") ? "adm-nav-link-active" : ""}`}
                      style={{ padding: "0.5rem 0.75rem" }}
                    >
                      <SettingsIcon className="h-4 w-4" />
                      Settings
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <button
                      type="button"
                      className="adm-nav-link mt-2 text-destructive"
                      style={{ padding: "0.5rem 0.75rem" }}
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                    >
                      <LogOut className="h-4 w-4" />
                      {isSigningOut ? "Signing out…" : "Sign out"}
                    </button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>

            {/* Brand */}
            <Link
              href="/"
              className={`adm-nav-brand ${pathname === "/admin" || pathname === "/admin/" ? "adm-nav-brand-active" : ""
                }`}
            >
              {BUSINESS_NAME}
            </Link>

            {/* Desktop nav links */}
            <div className="adm-nav-links">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin" || pathname === "/admin/"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`adm-nav-link ${isActive ? "adm-nav-link-active" : ""}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right actions */}
          <div className="adm-nav-actions">
            <AdminNotificationsPopover />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="adm-nav-account-btn group"
                  disabled={isSigningOut}
                >
                  <User className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                  Account
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-1.5 shadow-2xl backdrop-blur-xl"
                sideOffset={8}
              >
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-900/5 focus:bg-slate-900/5 focus:text-slate-900">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-white group-hover:text-slate-900">
                      <SettingsIcon className="h-4 w-4" />
                    </div>
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1.5 opacity-40" />
                <DropdownMenuItem
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-destructive transition-colors hover:bg-destructive/5 focus:bg-destructive/5 focus:text-destructive"
                  onSelect={(event) => {
                    event.preventDefault()
                    handleSignOut()
                  }}
                >
                  <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive transition-colors group-hover:bg-white">
                    <LogOut className="h-4 w-4" />
                  </div>
                  {isSigningOut ? "Signing out…" : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <main className="adm-page-content w-full px-6 py-6">{children}</main>
    </div>
  )
}
