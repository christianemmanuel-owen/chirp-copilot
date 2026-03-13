"use client"

import { useMemo, useState } from "react"
import FeaturedProductCard from "./FeaturedProductCard"
import CatalogListRow from "./CatalogListRow"
import { getSectionStyles, type SectionBackground } from "@/lib/storefront-theme"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, X, ChevronDown, SlidersHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

interface CatalogGridSectionProps {
    sectionId: string
    products: any[]
    title?: string
    subtitle?: string
    styles?: Record<string, any>
    background?: SectionBackground
    hiddenFields?: string[]
    variant?: string // "grid", "list", "minimal", "masonry", "compact", "split"
    filterLayout?: 'top' | 'sidebar'
    isFirst?: boolean
    topPadding?: number
}

export default function CatalogGridSection({
    sectionId,
    products,
    title = "Our Catalog",
    subtitle = "Explore our curated collection of premium goods.",
    styles = {},
    background,
    hiddenFields = [],
    variant = "grid",
    filterLayout = "top",
    isFirst,
    topPadding = 96
}: CatalogGridSectionProps) {
    const { addItem: addCartItem } = useCart()
    const sectionStyles = useMemo(() => getSectionStyles(background), [background])

    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null)

    const categories = useMemo(() => {
        const cats = new Set<string>()
        products.forEach(p => p.categories?.forEach((c: string) => cats.add(c)))
        return Array.from(cats)
    }, [products])

    const brands = useMemo(() => {
        const b = new Set<string>()
        products.forEach(p => p.brandName && b.add(p.brandName))
        return Array.from(b)
    }, [products])

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = searchQuery === "" ||
                p.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.brandName?.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = !selectedCategory || p.categories?.includes(selectedCategory)
            const matchesBrand = !selectedBrand || p.brandName === selectedBrand
            return matchesSearch && matchesCategory && matchesBrand
        })
    }, [products, searchQuery, selectedCategory, selectedBrand])

    const SidebarFilterContent = () => (
        <div className="space-y-10">
            <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Categories</h4>
                <div className="flex flex-col gap-1">
                    <button
                        className={cn("text-left px-4 py-2 rounded-xl text-sm font-bold transition-all", !selectedCategory ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-muted")}
                        onClick={() => setSelectedCategory(null)}
                    >
                        All Products
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={cn("text-left px-4 py-2 rounded-xl text-sm font-bold transition-all", selectedCategory === cat ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-muted text-muted-foreground hover:text-foreground")}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Brands</h4>
                <div className="flex flex-wrap gap-2">
                    {brands.map(brand => (
                        <button
                            key={brand}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                                selectedBrand === brand ? "bg-black text-white border-black" : "border-border/40 hover:border-black"
                            )}
                            onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                        >
                            {brand}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )

    return (
        <section
            id={sectionId}
            data-section-id={sectionId}
            style={{
                ...sectionStyles,
                paddingTop: isFirst ? `${topPadding + 96}px` : "96px"
            }}
            className="pb-24 px-6 md:px-12"
        >
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-2">
                                {!hiddenFields.includes('catalogTitle') && (
                                    <h2
                                        data-element-key="catalogTitle"
                                        style={styles.catalogTitle}
                                        className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-[0.8]"
                                    >
                                        {title}
                                    </h2>
                                )}
                                {!hiddenFields.includes('catalogSubtitle') && (
                                    <p
                                        data-element-key="catalogSubtitle"
                                        style={styles.catalogSubtitle}
                                        className="text-lg text-muted-foreground font-medium max-w-2xl opacity-70"
                                    >
                                        {subtitle}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {!hiddenFields.includes('catalogSearch') && (
                                    <div className="relative group flex-1 md:flex-initial" data-element-key="catalogSearch">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            placeholder="Search..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full md:w-[240px] lg:w-[300px] pl-11 h-11 bg-white border-2 border-border/40 rounded-full focus:ring-primary focus:border-primary transition-all shadow-sm text-sm font-medium"
                                        />
                                    </div>
                                )}

                                {filterLayout === 'top' && !hiddenFields.includes('catalogFilters') && (
                                    <div className="flex items-center gap-2" data-element-key="catalogFilters">
                                        {/* Desktop Top Filters */}
                                        <div className="hidden md:flex items-center gap-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="rounded-full h-11 px-6 border-2 font-black uppercase text-[10px] tracking-widest gap-2 hover:border-primary hover:text-primary transition-all">
                                                        Categories {selectedCategory && `(${selectedCategory})`} <ChevronDown className="size-3" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[240px] p-2 rounded-2xl shadow-xl border-border/50" align="end">
                                                    <div className="flex flex-col gap-1">
                                                        <Button
                                                            variant={!selectedCategory ? "secondary" : "ghost"}
                                                            className="justify-start font-bold text-xs rounded-xl h-10"
                                                            onClick={() => setSelectedCategory(null)}
                                                        >
                                                            All Categories
                                                        </Button>
                                                        {categories.map(cat => (
                                                            <Button
                                                                key={cat}
                                                                variant={selectedCategory === cat ? "secondary" : "ghost"}
                                                                className="justify-start font-bold text-xs rounded-xl h-10"
                                                                onClick={() => setSelectedCategory(cat)}
                                                            >
                                                                {cat}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>

                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="rounded-full h-11 px-6 border-2 font-black uppercase text-[10px] tracking-widest gap-2 hover:border-primary hover:text-primary transition-all">
                                                        Brands {selectedBrand && `(${selectedBrand})`} <ChevronDown className="size-3" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[240px] p-2 rounded-2xl shadow-xl border-border/50" align="end">
                                                    <div className="flex flex-col gap-1">
                                                        <Button
                                                            variant={!selectedBrand ? "secondary" : "ghost"}
                                                            className="justify-start font-bold text-xs rounded-xl h-10"
                                                            onClick={() => setSelectedBrand(null)}
                                                        >
                                                            All Brands
                                                        </Button>
                                                        {brands.map(brand => (
                                                            <Button
                                                                key={brand}
                                                                variant={selectedBrand === brand ? "secondary" : "ghost"}
                                                                className="justify-start font-bold text-xs rounded-xl h-10"
                                                                onClick={() => setSelectedBrand(brand)}
                                                            >
                                                                {brand}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        {/* Mobile/Tablet Top Filters (Sheet) */}
                                        <div className="md:hidden">
                                            <Sheet>
                                                <SheetTrigger asChild>
                                                    <Button variant="outline" className="rounded-full h-11 w-11 p-0 border-2 flex items-center justify-center hover:border-primary hover:text-primary transition-all shadow-sm">
                                                        <SlidersHorizontal className="size-4" />
                                                        <span className="sr-only">Filters</span>
                                                    </Button>
                                                </SheetTrigger>
                                                <SheetContent side="left" className="w-[300px]">
                                                    <SheetHeader className="pb-6">
                                                        <SheetTitle className="text-xl font-black uppercase tracking-tight">Filters</SheetTitle>
                                                    </SheetHeader>
                                                    <div className="overflow-y-auto h-full pb-20 px-1">
                                                        <SidebarFilterContent />
                                                    </div>
                                                </SheetContent>
                                            </Sheet>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {(selectedCategory || selectedBrand || searchQuery) && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Filters:</span>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCategory && (
                                        <Badge variant="secondary" className="pl-3 pr-1 py-1 gap-2 rounded-full bg-primary/10 text-primary border-primary/20">
                                            <span className="text-[10px] font-black uppercase tracking-widest">{selectedCategory}</span>
                                            <X className="size-3 cursor-pointer" onClick={() => setSelectedCategory(null)} />
                                        </Badge>
                                    )}
                                    {selectedBrand && (
                                        <Badge variant="secondary" className="pl-3 pr-1 py-1 gap-2 rounded-full bg-black text-white">
                                            <span className="text-[10px] font-black uppercase tracking-widest">{selectedBrand}</span>
                                            <X className="size-3 cursor-pointer" onClick={() => setSelectedBrand(null)} />
                                        </Badge>
                                    )}
                                    {searchQuery && (
                                        <Badge variant="outline" className="pl-3 pr-1 py-1 gap-2 rounded-full">
                                            <span className="text-[10px] font-black uppercase tracking-widest">"{searchQuery}"</span>
                                            <X className="size-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                                        </Badge>
                                    )}
                                    <Button
                                        variant="ghost"
                                        className="h-6 px-2 text-[10px] font-black uppercase tracking-widest hover:text-destructive"
                                        onClick={() => { setSelectedCategory(null); setSelectedBrand(null); setSearchQuery(""); }}
                                    >
                                        Reset All
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={cn(
                    "flex flex-col lg:flex-row gap-12",
                    filterLayout === 'sidebar' ? "items-start" : ""
                )}>
                    {filterLayout === 'sidebar' && !hiddenFields.includes('catalogFilters') && (
                        <>
                            {/* Desktop Sidebar */}
                            <aside className="hidden lg:block w-72 lg:sticky lg:top-32 space-y-10 shrink-0" data-element-key="catalogFilters">
                                <SidebarFilterContent />
                            </aside>

                            {/* Mobile/Tablet Sidebar (Sheet Trigger) */}
                            <div className="lg:hidden flex items-center gap-3 mb-8 w-full" data-element-key="catalogFilters">
                                {!hiddenFields.includes('catalogSearch') && (
                                    <div className="relative group flex-1" data-element-key="catalogSearch">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            placeholder="Search..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-11 h-11 bg-white border-2 border-border/40 rounded-full focus:ring-primary focus:border-primary transition-all shadow-sm text-sm font-medium"
                                        />
                                    </div>
                                )}
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" className="rounded-full h-11 w-11 p-0 border-2 flex items-center justify-center hover:border-primary hover:text-primary transition-all shadow-sm">
                                            <SlidersHorizontal className="size-4" />
                                            <span className="sr-only">Filters</span>
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-[300px]">
                                        <SheetHeader className="pb-6">
                                            <SheetTitle className="text-xl font-black uppercase tracking-tight">Filters</SheetTitle>
                                        </SheetHeader>
                                        <div className="overflow-y-auto h-full pb-20 px-1">
                                            <SidebarFilterContent />
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </>
                    )}

                    <div className="flex-1 w-full">
                        <div className={
                            variant === "list"
                                ? "flex flex-col gap-8"
                                : variant === "compact"
                                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
                                    : variant === "masonry"
                                        ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8"
                                        : variant === "split"
                                            ? "grid grid-cols-1 lg:grid-cols-12 gap-12"
                                            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                        }>
                            {variant === "split" ? (
                                <>
                                    <div className="lg:col-span-5 relative bg-muted rounded-[3rem] overflow-hidden aspect-[4/5] border border-border/50 shadow-2xl group">
                                        {filteredProducts[0] ? (
                                            <FeaturedProductCard
                                                variant={filteredProducts[0]}
                                                onAddToCart={(payload) => {
                                                    addCartItem({
                                                        variantId: payload.variantId,
                                                        productId: payload.productId,
                                                        name: payload.name,
                                                        image: payload.image,
                                                        brandName: payload.brandName ?? null,
                                                        attributes: payload.size ? { Size: payload.size } : undefined,
                                                        price: payload.price,
                                                        quantity: payload.quantity,
                                                    })
                                                }}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-black uppercase tracking-widest text-xs">Featured Slot</div>
                                        )}
                                    </div>
                                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 content-start">
                                        {filteredProducts.slice(1).map((product) => (
                                            <FeaturedProductCard
                                                key={product.id}
                                                variant={product}
                                                onAddToCart={(payload) => {
                                                    addCartItem({
                                                        variantId: payload.variantId,
                                                        productId: payload.productId,
                                                        name: payload.name,
                                                        image: payload.image,
                                                        brandName: payload.brandName ?? null,
                                                        attributes: payload.size ? { Size: payload.size } : undefined,
                                                        price: payload.price,
                                                        quantity: payload.quantity,
                                                    })
                                                }}
                                            />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                filteredProducts.map((product) => (
                                    <div key={product.id} className={variant === "masonry" ? "break-inside-avoid" : ""}>
                                        {variant === "list" ? (
                                            <CatalogListRow
                                                variant={product}
                                                onAddToCart={(payload) => {
                                                    addCartItem({
                                                        variantId: payload.variantId,
                                                        productId: payload.productId,
                                                        name: payload.name,
                                                        image: payload.image,
                                                        brandName: payload.brandName ?? null,
                                                        attributes: payload.size ? { Size: payload.size } : undefined,
                                                        price: payload.price,
                                                        quantity: payload.quantity,
                                                    })
                                                }}
                                            />
                                        ) : (
                                            <FeaturedProductCard
                                                variant={product}
                                                isCompact={variant === "compact"}
                                                onAddToCart={(payload) => {
                                                    addCartItem({
                                                        variantId: payload.variantId,
                                                        productId: payload.productId,
                                                        name: payload.name,
                                                        image: payload.image,
                                                        brandName: payload.brandName ?? null,
                                                        attributes: payload.size ? { Size: payload.size } : undefined,
                                                        price: payload.price,
                                                        quantity: payload.quantity,
                                                    })
                                                }}
                                            />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="py-20 text-center bg-muted/20 rounded-[2rem] border-2 border-dashed">
                                <p className="text-muted-foreground font-bold italic">No products matched your search.</p>
                                <Button
                                    variant="link"
                                    className="mt-2 text-primary font-black uppercase tracking-widest text-xs"
                                    onClick={() => { setSearchQuery(""); setSelectedCategory(null); setSelectedBrand(null); }}
                                >
                                    Reset everything
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
