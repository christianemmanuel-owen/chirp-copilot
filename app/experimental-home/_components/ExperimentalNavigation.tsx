"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart, User, Package, ChevronDown, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import OrderTrackingDialog from "@/components/order-tracking-dialog"
import type { NavCollectionItem } from "@/lib/storefront-data"

interface ExperimentalNavigationProps {
    businessName: string
    faviconUrl: string | null
    useLogo: boolean
    dropdownMode: "categories" | "brands"
    navCategories: NavCollectionItem[]
    navBrands: NavCollectionItem[]
}

export default function ExperimentalNavigation({
    businessName,
    faviconUrl,
    useLogo,
    dropdownMode,
    navCategories,
    navBrands,
}: ExperimentalNavigationProps) {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navItems = dropdownMode === "brands" ? navBrands : navCategories
    const dropdownLabel = dropdownMode === "brands" ? "Brands" : "Categories"

    const handleCartClick = () => {
        window.dispatchEvent(
            new CustomEvent("chirp:cart-toggle", {
                detail: { mode: "toggle" },
            }),
        )
    }

    return (
        <header
            data-no-edit="true"
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out flex justify-center ${isScrolled ? "pt-4" : "pt-0"}`}
        >

            <nav className={`transition-all duration-500 ease-out flex items-center justify-between px-6 
                ${isScrolled
                    ? "w-[95%] max-w-5xl h-16 bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl rounded-full"
                    : "w-full h-24 bg-transparent border-b border-transparent"}`}>

                {/* Branding */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        {useLogo && faviconUrl ? (
                            <img src={faviconUrl} alt={businessName} className="size-8 rounded-lg" />
                        ) : (
                            <span className={`text-2xl font-black tracking-tighter transition-colors ${isScrolled ? "text-foreground" : "text-foreground"}`}>
                                {businessName.toUpperCase()}
                            </span>
                        )}
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="rounded-full font-bold gap-1 hover:bg-primary/5">
                                    {dropdownLabel}
                                    <ChevronDown className="size-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="rounded-2xl p-2 min-w-[200px] border-none shadow-2xl bg-white/90 backdrop-blur-xl" data-no-edit="true">
                                {navItems.map((item) => (
                                    <DropdownMenuItem key={item.id} asChild className="rounded-xl cursor-pointer font-medium focus:bg-primary/5">
                                        <Link href={item.href}>{item.name}</Link>
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuItem asChild className="rounded-xl mt-1 border-t pt-2 cursor-pointer font-bold text-primary focus:bg-primary/5">
                                    <Link href="/catalog">View All</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Link href="/catalog" className="text-sm font-bold px-4 py-2 rounded-full hover:bg-primary/5 transition-colors">
                            Shop
                        </Link>
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2 mr-2 border-r pr-4 border-border/50">
                        <OrderTrackingDialog data-no-edit="true">
                            <Button variant="ghost" size="sm" className="rounded-full font-bold gap-2 text-xs uppercase tracking-wider opacity-60 hover:opacity-100">
                                <Package className="size-4" />
                                Track Order
                            </Button>
                        </OrderTrackingDialog>
                        <Link href="/admin" className="text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity">
                            Admin Login
                        </Link>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCartClick}
                        className="relative rounded-full hover:bg-primary/10 transition-colors"
                    >
                        <ShoppingCart className="size-5" />
                        <span className="absolute top-1 right-1 size-2 bg-primary rounded-full ring-2 ring-white" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden rounded-full"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </Button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-white z-40 md:hidden animate-in fade-in duration-300">
                    <div className="pt-24 px-6 space-y-8">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">{dropdownLabel}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-lg font-bold"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="pt-8 border-t flex flex-col gap-6">
                            <Link href="/catalog" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black tracking-tighter">SHOP ALL</Link>
                            <div className="flex items-center gap-4">
                                <OrderTrackingDialog />
                                <Link href="/admin" className="text-sm font-bold text-muted-foreground">Admin Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
