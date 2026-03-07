import { notFound } from "next/navigation"

import Navigation from "@/components/navigation"
import VariantDetailClient from "@/components/variant-detail-client"
import { getCatalogData, getVariantDetail } from "@/lib/storefront-data"
import { parseVariantSlug } from "@/lib/utils"

export default async function VariantDetailPage({
  params,
}: {
  params: Promise<{ variantSlug: string }>
}) {
  const { variantSlug } = await params
  const variantId = parseVariantSlug(variantSlug)
  if (!variantId) {
    notFound()
  }

  const [catalogData, variantDetail] = await Promise.all([
    getCatalogData(),
    getVariantDetail(variantId),
  ])

  if (!variantDetail) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation items={catalogData.navItems} />
      <VariantDetailClient detail={variantDetail} />
    </main>
  )
}
