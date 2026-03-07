"use client"

import Link from "next/link"
import type { HeroProductHighlight } from "@/lib/storefront-data"

interface HeroCategoriesProps {
  items: HeroProductHighlight[]
}

export default function HeroCategories({ items }: HeroCategoriesProps) {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {items.map((item, index) => (
          <Link
            key={`${item.id}-${index}`}
            href={item.href}
            className="group relative flex h-96 items-end overflow-hidden bg-muted text-left transition hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 md:h-[52rem]"
            aria-label={`Shop ${item.title}`}
          >
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10 transition-colors group-hover:from-black/80 group-hover:via-black/60 group-hover:to-black/20" />
            <div className="relative z-10 w-full space-y-3 p-8 md:p-12">
              {item.accent && (
                <span className="inline-flex items-center bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/85">
                  {item.accent}
                </span>
              )}
              <h2 className="text-4xl font-semibold text-white md:text-5xl">{item.title}</h2>
              <p className="max-w-md text-sm text-white/85 md:text-base">{item.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
