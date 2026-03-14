import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { getCloudflareContext } from "@/lib/cloudflare/context"
import { getDb } from "@/lib/db"
import { getTenantIdFromHeaders } from "@/lib/db/tenant"

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

  const { env } = await getCloudflareContext()
  const headerList = await headers()
  const projectId = await getTenantIdFromHeaders(headerList, env.DB)

  if (!projectId) {
    redirect("/")
  }

  const db = getDb(env.DB)

  const [catalogData, variantDetail] = await Promise.all([
    getCatalogData(db, projectId),
    getVariantDetail(db, projectId, variantId),
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
