"use client"

import Link from "next/link"
import type { CollectionTile } from "@/lib/storefront-data"

type CategoryCardProps = Pick<CollectionTile, "name" | "image" | "href" | "totalSold" | "productCount" | "variantCount" | "kind">

export default function CategoryCard({
  name,
  image,
  href,
  totalSold,
  productCount,
  variantCount,
  kind,
}: CategoryCardProps) {
  const salesLine = totalSold > 0 ? `${totalSold} sold` : "Explore the collection"
  const formatCount = (count: number, label: string) => `${count} ${count === 1 ? label : `${label}s`}`
  const productLabel = formatCount(productCount, "product")
  const variantLabel = formatCount(variantCount, "variant")
  const entityLabel = kind === "category" ? "Category" : "Brand"

  return (
    <Link
      href={href}
      aria-label={`View ${entityLabel.toLowerCase()} ${name}`}
      className="group relative flex h-80 w-full flex-col justify-end overflow-hidden bg-muted text-left transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 md:h-164"
    >
      <img
        src={image}
        alt={name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10 transition-colors group-hover:from-black/80 group-hover:via-black/30 group-hover:to-black/10" />
      <div className="relative z-10 space-y-2 p-6">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
            {productLabel}
          </span>
          <span className="inline-flex items-center bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
            {variantLabel}
          </span>
        </div>
        <h3 className="text-5xl font-semibold text-white">{name}</h3>
      </div>
    </Link>
  )
}
