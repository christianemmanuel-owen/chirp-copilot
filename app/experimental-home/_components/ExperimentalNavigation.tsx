"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ShoppingCart, User, Package, ChevronDown, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import OrderTrackingDialog from "@/components/order-tracking-dialog"
import type { NavCollectionItem } from "@/lib/storefront-data"
import { motion, AnimatePresence } from "framer-motion"

interface ExperimentalNavigationProps {
    businessName: string
    faviconUrl: string | null
    useLogo: boolean
    dropdownMode: "categories" | "brands"
    navCategories: NavCollectionItem[]
    navBrands: NavCollectionItem[]
    transparentTheme?: "light" | "dark" | "glass"
}

export default function ExperimentalNavigation({
    businessName,
    faviconUrl,
    useLogo,
    dropdownMode,
    navCategories,
    navBrands,
    transparentTheme = "dark",
}: ExperimentalNavigationProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [windowWidth, setWindowWidth] = useState(0)

    useEffect(() => {
        setWindowWidth(window.innerWidth)
        const handleResize = () => setWindowWidth(window.innerWidth)
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        window.addEventListener("resize", handleResize, { passive: true })
        handleScroll()

        return () => {
            window.removeEventListener("scroll", handleScroll)
            window.removeEventListener("resize", handleResize)
        }
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
    const closeTimeout = useRef<NodeJS.Timeout | null>(null)
    const handleMouseEnter = () => {
        if (closeTimeout.current) clearTimeout(closeTimeout.current)
        setIsDropdownOpen(true)
    }
    const handleMouseLeave = () => {
        closeTimeout.current = setTimeout(() => {
            setIsDropdownOpen(false)
        }, 250)
    }

    // Dynamic styles based on theme and scroll
    const isDark = transparentTheme === "dark"
    const isLight = transparentTheme === "light"
    const isGlass = transparentTheme === "glass"

    // Shared animation settings for text and icons
    const springTransition = {
        type: "spring",
        stiffness: 260,
        damping: 25,
    } as const

    // Animation Variants
    const fullWidth = windowWidth > 0 ? windowWidth : "100%"
    const pillWidth = windowWidth > 0 ? Math.min(1000, windowWidth * 0.9) : "90%"

    const navVariants = {
        top: {
            width: fullWidth,
            height: "96px",
            borderRadius: "0px",
            y: 0,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(50px) saturate(200%) brightness(0.8) contrast(1.1)",
            borderColor: "rgba(255, 255, 255, 0.4)",
            borderBottomWidth: "1.2px",
            borderTopWidth: "1.2px",
            boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
            paddingLeft: "24px",
            paddingRight: "24px",
        },
        scrolled: {
            width: pillWidth,
            height: "64px",
            borderRadius: "32px",
            y: 16,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(50px) saturate(200%) brightness(0.8) contrast(1.1)",
            borderColor: "rgba(255, 255, 255, 0.5)",
            borderWidth: "1.2px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
            paddingLeft: "24px",
            paddingRight: "24px",
        }
    }

    // Text color variants based on transparentTheme
    const textVariants = {
        top: {
            color: "rgba(255, 255, 255, 0.98)",
            textShadow: "0 2px 10px rgba(0,0,0,0.35)"
        },
        scrolled: {
            color: "rgba(255, 255, 255, 0.98)",
            textShadow: "0 2px 8px rgba(0,0,0,0.3)"
        }
    }

    const headerGradient = ""

    return (
        <header
            data-no-edit="true"
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ease-out flex justify-center",
                headerGradient
            )}
        >
            <motion.nav
                initial="top"
                animate={isScrolled ? "scrolled" : "top"}
                variants={navVariants}
                transition={springTransition}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-8">
                    {/* Branding */}
                    <Link href="/" className="flex items-center">
                        <motion.span
                            variants={textVariants}
                            transition={springTransition}
                            className="text-2xl font-bold tracking-tight"
                        >
                            {businessName}
                        </motion.span>
                    </Link>

                    <div
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        className="hidden lg:block relative"
                    >
                        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen} modal={false}>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-1 group cursor-pointer relative">
                                    <motion.span
                                        variants={textVariants}
                                        transition={springTransition}
                                        className="text-sm font-medium"
                                    >
                                        Shop
                                    </motion.span>
                                    <motion.div
                                        variants={textVariants}
                                        transition={springTransition}
                                    >
                                        <ChevronDown className={cn(
                                            "h-4 w-4 transition-transform duration-300",
                                            isDropdownOpen ? "rotate-180" : "",
                                            isScrolled ? "opacity-50" : "opacity-80"
                                        )} />
                                    </motion.div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className="rounded-[2.5rem] p-6 min-w-[360px] border-none shadow-2xl bg-white/95 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300"
                                data-no-edit="true"
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                sideOffset={-2}
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

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <OrderTrackingDialog>
                        <div className="hidden sm:flex items-center gap-2 cursor-pointer">
                            <motion.div
                                variants={textVariants}
                                transition={springTransition}
                            >
                                <Package className="h-4 w-4" />
                            </motion.div>
                            <motion.span
                                variants={textVariants}
                                transition={springTransition}
                                className="text-xs font-bold uppercase tracking-wider"
                            >
                                TRACK ORDER
                            </motion.span>
                        </div>
                    </OrderTrackingDialog>

                    <div className="w-px h-6 bg-gray-200/50 hidden sm:block" />

                    <div className="flex items-center gap-1 sm:gap-2">

                        <div className="relative">
                            <motion.button
                                onClick={handleCartClick}
                                className="p-2 hover:bg-black/5 rounded-full relative"
                            >
                                <motion.div
                                    variants={textVariants}
                                    transition={springTransition}
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                </motion.div>
                                <motion.span
                                    animate={{
                                        boxShadow: "0 0 0 2px rgba(255, 255, 255, 1)"
                                    }}
                                    transition={springTransition}
                                    className="absolute top-1.5 right-1.5 size-2 bg-primary rounded-full"
                                />
                            </motion.button>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "lg:hidden rounded-full",
                                isScrolled ? "hover:bg-foreground/5" : "hover:bg-white/10"
                            )}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <motion.div
                                variants={textVariants}
                                transition={springTransition}
                            >
                                {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                            </motion.div>
                        </Button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 bg-white z-40 lg:hidden"
                    >
                        <div className="pt-24 px-6 space-y-8">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-6">Explore</h3>
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
                                    <Link href="/track" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                                        <Package className="h-4 w-4" />
                                        Track Order
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
