"use client"

import CategoryCard from "./category-card"
import type { CollectionTile, CollectionTileMode } from "@/lib/storefront-data"

interface CategoryGridProps {
  tiles: CollectionTile[]
  mode?: CollectionTileMode
}

function getGridColumnClasses(count: number): string {
  if (count <= 1) return "grid-cols-1"
  if (count === 2) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"
  if (count === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
  if (count === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  if (count === 5) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
  if (count === 6) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
  return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
}

export default function CategoryGrid({ tiles, mode }: CategoryGridProps) {
  if (!tiles || tiles.length === 0) {
    return null
  }

  const gridColumnsClass = getGridColumnClasses(tiles.length)
  const ariaLabel = mode === "categories" ? "Shop by category" : "Shop by brand"

  return (
    <section className="w-full" aria-label={ariaLabel}>
      <div className="mx-auto">
        <div className={`grid ${gridColumnsClass}`}>
          {tiles.map((tile) => (
            <CategoryCard key={`${tile.kind}-${tile.id}`} {...tile} />
          ))}
        </div>
      </div>
    </section>
  )
}
