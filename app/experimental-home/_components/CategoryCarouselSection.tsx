"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import AutoScroll from "embla-carousel-auto-scroll"
import type { CollectionTile } from "@/lib/storefront-data"
import { SectionHeader } from "./SectionHeader"
import { getSectionStyles, type SectionBackground } from "@/lib/storefront-theme"

interface CategoryCarouselSectionProps {
    tiles: CollectionTile[]
    styles?: Record<string, any>
    sectionId?: string
    background?: SectionBackground
    hiddenFields?: string[]
    variant?: string
}

export default function CategoryCarouselSection({ tiles, styles, sectionId, background, hiddenFields, variant = "v1" }: CategoryCarouselSectionProps) {
    const sectionStyles = getSectionStyles(background)
    const [emblaRef] = useEmblaCarousel({ loop: true }, [
        AutoScroll({ playOnInit: true, speed: 1, stopOnInteraction: false }) as any
    ])

    const isHidden = (key: string) => hiddenFields?.includes(key)

    if (!tiles || tiles.length === 0 || isHidden("categoryList")) return null

    // Duplicate tiles for carousel v1
    const displayTiles = tiles.length < 6 && variant === "v1" ? [...tiles, ...tiles, ...tiles] : tiles

    return (
        <section
            className="py-24 bg-background overflow-hidden"
            data-section-id={sectionId}
            style={sectionStyles}
        >

            {(!isHidden("categoryTitle") || !isHidden("categorySubtitle")) && (
                <div className="max-w-7xl mx-auto px-6 mb-16 text-center lg:text-left">
                    <SectionHeader
                        title={!isHidden("categoryTitle") ? "BROWSE BY CATEGORY" : undefined}
                        subtitle={!isHidden("categorySubtitle") ? "Explore our curated collections at a glance." : undefined}
                    />
                </div>
            )}

            {variant === "v2" ? (
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {tiles.map((tile) => (
                            <CategoryCard key={tile.id} tile={tile} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="embla overflow-hidden" ref={emblaRef}>
                    <div className="embla__container flex gap-8 px-6">
                        {displayTiles.map((tile, index) => (
                            <div key={`${tile.id}-${index}`} className="embla__slide flex-[0_0_300px] md:flex-[0_0_400px] min-w-0">
                                <CategoryCard tile={tile} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}

function CategoryCard({ tile }: { tile: CollectionTile }) {
    return (
        <Link
            href={tile.href}
            className="group relative aspect-[4/5] block overflow-hidden rounded-[2.5rem] bg-muted shadow-xl cursor-pointer"
            data-no-edit="true"
            data-selection-type="categories"
        >
            <img
                src={tile.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop"}
                alt={tile.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

            {/* Content fallback for better contrast */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end transform transition-transform duration-500 group-hover:-translate-y-2">
                <div className="flex items-end justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-2">
                            {tile.productCount} Products
                        </p>
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-tight line-clamp-2">
                            {tile.name}
                        </h3>
                    </div>
                    <div className="size-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transform rotate-45 group-hover:rotate-0 transition-transform duration-500 flex-shrink-0">
                        <ArrowUpRight className="size-5 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                    </div>
                </div>
            </div>
        </Link>
    )
}
