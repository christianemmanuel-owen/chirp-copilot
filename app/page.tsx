import { headers } from "next/headers"
import { getCloudflareContext } from "@/lib/cloudflare/context"
import { eq } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { storefrontSettings } from "@/lib/db/schema"
import { getTenantIdFromHeaders } from "@/lib/db/tenant"
import { buildThemeConfig, themeConfigToCssVariables } from "@/lib/storefront-theme"

import { getCatalogData } from "@/lib/storefront-data"
import ExperimentalNavigation from "@/app/experimental-home/_components/ExperimentalNavigation"
import InteractivePreviewWrapper from "@/app/experimental-home/_components/InteractivePreviewWrapper"
import Link from "next/link"

// Landing Page Imports
import "@/app/(landing)/landing.css"
import {
  BrandsSection,
  FeaturesSection,
  FinalCtaSection,
  HeroSection,
  Navbar,
  PricingSection,
  SiteFooter,
  TestimonialSection,
} from "@/app/(landing)/_components"
import { brands, pricingPlans, roadmapSteps } from "@/lib/landing-data"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface StorefrontHomeProps {
  searchParams: Promise<{ preview?: string }>
}

export default async function StorefrontHome({ searchParams }: StorefrontHomeProps) {
  const params = await searchParams
  const isPreview = params.preview === "true"

  const { env } = await getCloudflareContext()
  const headerList = await headers()
  const projectId = env.DB ? await getTenantIdFromHeaders(headerList, env.DB) : null

  // --- Fallback Landing Page ---
  if (!projectId) {
    return (
      <main className="min-h-screen bg-background text-foreground overflow-hidden">
        <Navbar />
        <HeroSection />
        <BrandsSection brands={brands} />
        <TestimonialSection />
        <FeaturesSection roadmapSteps={roadmapSteps} />
        <PricingSection pricingPlans={pricingPlans} />
        <FinalCtaSection />
        <SiteFooter />
      </main>
    )
  }

  const db = getDb(env.DB)

  const [
    settings,
    catalogData
  ] = await Promise.all([
    db.query.storefrontSettings.findFirst({
      where: eq(storefrontSettings.projectId, projectId)
    }),
    getCatalogData(db, projectId)
  ])

  const themeConfig = buildThemeConfig(settings?.themeConfig)
  const experimental = themeConfig.experimental!

  const businessName = (settings?.themeConfig as any)?.businessName || "CHIRP"

  const layout = experimental.layout!

  const themeStyles = themeConfigToCssVariables(themeConfig)

  return (
    <main className={`min-h-screen bg-background text-foreground ${isPreview ? 'preview-mode' : ''}`}>
      <div
        id="storefront-theme-container"
        className="min-h-screen"
        data-storefront-font={themeConfig.fontFamily}
        style={{
          ...(themeStyles as React.CSSProperties),
          fontFamily: "var(--font-storefront, var(--font-geist-sans))",
        }}
      >
        <InteractivePreviewWrapper
          initialSettings={{
            ...settings,
            experimental: themeConfig.experimental
          }}
          catalogData={catalogData}
          initialLayout={layout}
          isPreview={isPreview}
          pageType="home"
        />
      </div>
    </main>
  )

}
