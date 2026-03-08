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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
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
    const dropdownLabel = "Shop"

    const handleCartClick = () => {
        window.dispatchEvent(
            new CustomEvent("chirp:cart-toggle", {
                detail: { mode: "toggle" },
            }),
        )
    }

    // Hover delay logic
    let closeTimeout: NodeJS.Timeout
    const handleMouseEnter = () => {
        if (closeTimeout) clearTimeout(closeTimeout)
        setIsDropdownOpen(true)
    }
    const handleMouseLeave = () => {
        closeTimeout = setTimeout(() => {
            setIsDropdownOpen(false)
        }, 150)
    }

    return (
        <header
            data-no-edit="true"
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out flex justify-center ${isScrolled ? "pt-4" : "pt-0"}`}
        >
            <nav className={`transition-all duration-500 ease-out flex items-center justify-between px-6 
                ${isScrolled
                    ? "w-[95%] max-w-5xl h-16 bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-full"
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
                        <div
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            className="relative"
                        >
                            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="rounded-full font-bold gap-1 hover:bg-foreground/5 hover:text-foreground">
                                        {dropdownLabel}
                                        <ChevronDown className={`size-4 opacity-50 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="start"
                                    className="rounded-[2.5rem] p-6 min-w-[360px] border-none shadow-2xl bg-white/95 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300"
                                    data-no-edit="true"
                                >
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        {navItems.map((item) => (
                                            <DropdownMenuItem key={item.id} asChild className="p-0 rounded-3xl overflow-hidden cursor-pointer focus:bg-transparent">
                                                <Link href={item.href} className="relative aspect-square group/item">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 ease-out group-hover/item:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover/item:opacity-80 transition-opacity" />
                                                    <span className="absolute bottom-4 left-4 right-4 text-white text-sm font-black leading-tight uppercase tracking-widest drop-shadow-md">
                                                        {item.name}
                                                    </span>
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </div>
                                    <DropdownMenuItem asChild className="rounded-2xl cursor-pointer p-0 focus:bg-transparent">
                                        <Link
                                            href="/catalog"
                                            className="w-full py-4 font-black flex items-center justify-center bg-accent text-accent-foreground hover:scale-[0.98] active:scale-95 hover:brightness-110 transition-all uppercase tracking-widest text-[10px]"
                                        >
                                            View Catalog
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2 mr-2 border-r pr-4 border-border/50">
                        <OrderTrackingDialog data-no-edit="true">
                            <Button variant="ghost" size="sm" className="rounded-full font-bold gap-2 text-xs uppercase tracking-wider opacity-60 hover:opacity-100 hover:bg-foreground/5 hover:text-foreground">
                                <Package className="size-4" />
                                Track Order
                            </Button>
                        </OrderTrackingDialog>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCartClick}
                        className="relative rounded-full hover:bg-foreground/5 hover:text-foreground transition-colors"
                    >
                        <ShoppingCart className="size-5" />
                        <span className="absolute top-1 right-1 size-2 bg-primary rounded-full ring-2 ring-white" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden rounded-full hover:bg-foreground/5 hover:text-foreground"
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
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-6">Explore {dropdownLabel}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="relative aspect-square rounded-2xl overflow-hidden"
                                    >
                                        <img src={item.image} className="absolute inset-0 object-cover w-full h-full" alt={item.name} />
                                        <div className="absolute inset-0 bg-black/40" />
                                        <span className="absolute bottom-3 left-3 text-white font-black text-xs uppercase tracking-wider">
                                            {item.name}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="pt-8 border-t flex flex-col gap-6">
                            <Link
                                href="/catalog"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full py-4 bg-accent text-accent-foreground text-center font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:brightness-110 transition-all"
                            >
                                View Catalog
                            </Link>
                            <div className="flex items-center gap-4">
                                <OrderTrackingDialog />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
