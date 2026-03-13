"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { CollectionTile } from "@/lib/storefront-data"
import { SectionHeader } from "./SectionHeader"

interface CategoryGridSectionProps {
    tiles: CollectionTile[]
    isFirst?: boolean
    topPadding?: number
}

export default function CategoryGridSection({ tiles, isFirst, topPadding = 96 }: CategoryGridSectionProps) {
    if (!tiles || tiles.length === 0) return null

    return (
        <section
            className="pb-24 bg-white overflow-hidden"
            style={{ paddingTop: isFirst ? `${topPadding + 96}px` : "96px" }}
        >
            <div className="max-w-7xl mx-auto px-6">
                <SectionHeader
                    title="BROWSE BY CATEGORY"
                    subtitle="Find exactly what you're looking for with our curated collections."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
                    {tiles.map((tile, index) => (
                        <CategoryCard key={tile.id} tile={tile} index={index} />
                    ))}
                </div>
            </div>
        </section>
    )
}

function CategoryCard({ tile, index }: { tile: CollectionTile; index: number }) {
    return (
        <Link
            href={tile.href}
            className={`group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-muted animate-in fade-in slide-in-from-bottom-8 duration-700`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <img
                src={tile.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop"}
                alt={tile.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

            {/* Content */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end transform transition-transform duration-500 group-hover:-translate-y-2">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-2">
                            {tile.productCount} Products
                        </p>
                        <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-tight">
                            {tile.name}
                        </h3>
                    </div>
                    <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transform rotate-45 group-hover:rotate-0 transition-transform duration-500">
                        <ArrowUpRight className="size-6 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                    </div>
                </div>
            </div>
        </Link>
    )
}
