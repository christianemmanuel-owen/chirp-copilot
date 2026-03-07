export const dynamic = "force-dynamic"

import Navigation from "@/components/navigation"
import StorefrontHomeContent from "@/components/storefront-home-content"
import { getCatalogData, type HeroProductHighlight } from "@/lib/storefront-data"

export default async function StorefrontHome() {
  const data = await getCatalogData()
  const heroItems: HeroProductHighlight[] = []
  if (data.hero.popular) heroItems.push(data.hero.popular)
  if (data.hero.latest) heroItems.push(data.hero.latest)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation items={data.navItems} />
      <StorefrontHomeContent heroItems={heroItems} tiles={data.tiles} tileMode={data.tileMode} />
    </main>
  )
}
