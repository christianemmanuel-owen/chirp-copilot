export const dynamic = "force-dynamic"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getCloudflareContext } from "@/lib/cloudflare/context"
import { getDb } from "@/lib/db"
import { getTenantIdFromHeaders } from "@/lib/db/tenant"
import Navigation from "@/components/navigation"
import { getCatalogData } from "@/lib/storefront-data"
import CatalogClient from "./catalog-client"

export default async function CatalogPage() {
  const { env } = await getCloudflareContext()
  const headerList = await headers()
  const projectId = await getTenantIdFromHeaders(headerList, env.DB)

  if (!projectId) {
    redirect("/")
  }

  const db = getDb(env.DB)
  const data = await getCatalogData(db, projectId)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation items={data.navItems} />
      <CatalogClient data={data} />
    </main>
  )
}
