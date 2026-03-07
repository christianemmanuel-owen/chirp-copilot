"use client"

import { SectionHeader } from "@/app/experimental-home/_components/SectionHeader"
import FeaturedProductCard from "@/app/experimental-home/_components/FeaturedProductCard"
import { useCart } from "@/lib/cart"
import type { CatalogVariant } from "@/lib/storefront-data"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { getSectionStyles, type SectionBackground } from "@/lib/storefront-theme"

interface FeaturedProductsSectionProps {
    initialProducts: CatalogVariant[]
    title?: string
    subtitle?: string
    featuredCTALink?: string
    styles?: Record<string, any>
    sectionId?: string
    background?: SectionBackground
}

export default function FeaturedProductsSection({ initialProducts, title, subtitle, featuredCTALink, styles, sectionId, background }: FeaturedProductsSectionProps) {
    const { addItem: addCartItem } = useCart()
    const sectionStyles = getSectionStyles(background)

    const handleAddToCart = (payload: any) => {
        addCartItem({
            variantId: payload.variantId,
            productId: payload.productId,
            name: payload.name,
            image: payload.image,
            brandName: payload.brandName ?? null,
            attributes: payload.size ? { Size: payload.size } : undefined,
            price: payload.price,
            quantity: payload.quantity,
            maxStock: payload.maxStock ?? 999,
        })
    }

    return (
        <section
            className="py-32 bg-background text-foreground"
            data-section-id={sectionId}
            style={sectionStyles}
        >

            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div className="max-w-2xl">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6">Curated Selection</h2>
                        <h3
                            className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] uppercase"
                            data-element-key="featuredTitle"
                            style={styles?.featuredTitle}
                        >
                            {title || "Exquisite Pieces."}
                        </h3>
                        <div
                            className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] uppercase text-muted-foreground/30 italic mt-2"
                            data-element-key="featuredSubtitle"
                            style={styles?.featuredSubtitle}
                        >
                            {subtitle || "Designed for life."}
                        </div>

                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-12">
                    {initialProducts?.slice(0, 5).map((variant, index) => {
                        return (
                            <div
                                key={variant.id}
                                className="animate-in fade-in slide-in-from-bottom-8 duration-1000"
                                style={{ animationDelay: `${index * 150}ms` }}
                                data-no-edit="true"
                            >
                                <div className="h-full">
                                    <FeaturedProductCard
                                        variant={variant}
                                        onAddToCart={handleAddToCart}
                                    />
                                </div>
                            </div>
                        )
                    })}

                    <Link
                        href={featuredCTALink || "/catalog"}
                        className="relative flex flex-col items-center justify-center p-10 bg-primary/95 hover:bg-primary transition-all duration-500 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-1 group animate-in fade-in slide-in-from-bottom-8 duration-1000 aspect-[3/4] text-center"
                        style={{ animationDelay: `750ms` }}
                        data-element-key="featuredCTA"
                        data-link-url={featuredCTALink || "/catalog"}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <span className="font-black uppercase tracking-tighter text-4xl lg:text-5xl text-white mb-8 leading-[0.85] z-10" style={styles?.featuredCTA}>
                            View <br /> Complete <br /> Catalog
                        </span>

                        <div className="size-20 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-white group-hover:text-primary transition-all duration-500 z-10 backdrop-blur-sm border border-white/20">
                            <ArrowRight className="size-10" strokeWidth={3} />
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    )
}
