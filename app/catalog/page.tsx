export const dynamic = "force-dynamic"

import Navigation from "@/components/navigation"
import { getCatalogData } from "@/lib/storefront-data"
import CatalogClient from "./catalog-client"

export default async function CatalogPage() {
  const data = await getCatalogData()

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation items={data.navItems} />
      <CatalogClient data={data} />
    </main>
  )
}
