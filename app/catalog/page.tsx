export const dynamic = "force-dynamic"
export const runtime = "edge"

import { headers } from "next/headers"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb } from "@/lib/db"
import { ensureTenantIdFromHeaders } from "@/lib/db/tenant"
import Navigation from "@/components/navigation"
import { getCatalogData } from "@/lib/storefront-data"
import CatalogClient from "./catalog-client"

export default async function CatalogPage() {
  const { env } = getRequestContext()
  const projectId = await ensureTenantIdFromHeaders(await headers(), env.DB)
  const db = getDb(env.DB)

  const data = await getCatalogData(db, projectId)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation items={data.navItems} />
      <CatalogClient data={data} />
    </main>
  )
}
