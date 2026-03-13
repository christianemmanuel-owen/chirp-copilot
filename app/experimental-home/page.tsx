import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb } from "@/lib/db"
import { storefrontSettings } from "@/lib/db/schema"
import { ensureTenantIdFromHeaders } from "@/lib/db/tenant"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { buildThemeConfig, themeConfigToCssVariables } from "@/lib/storefront-theme"

import { getCatalogData } from "@/lib/storefront-data"
import ExperimentalNavigation from "./_components/ExperimentalNavigation"
import HeroSection from "./_components/HeroSection"
import CategoryCarouselSection from "./_components/CategoryCarouselSection"
import AboutUsSection from "./_components/AboutUsSection"
import FeaturedProductsSection from "./_components/FeaturedProductsSection"
import EcommerceFooter from "./_components/EcommerceFooter"


import InteractivePreviewWrapper from "./_components/InteractivePreviewWrapper"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface ExperimentalHomePageProps {
    searchParams: Promise<{ preview?: string }>
}

export default async function ExperimentalHomePage({ searchParams }: ExperimentalHomePageProps) {
    const params = await searchParams
    const isPreview = params.preview === "true"
    const { env } = await getCloudflareContext()
    const db = getDb(env.DB)
    const headersList = await headers()
    const tenantId = await ensureTenantIdFromHeaders(headersList, env.DB)

    const [
        settings,
        catalogData
    ] = await Promise.all([
        db.query.storefrontSettings.findFirst({
            where: eq(storefrontSettings.projectId, tenantId)
        }),
        getCatalogData(db, tenantId)
    ])

    const themeConfig = buildThemeConfig(settings?.themeConfig)
    const experimental = themeConfig.experimental!

    const businessName = (settings?.themeConfig as any)?.businessName || process.env.NEXT_PUBLIC_BUSINESS_NAME || "Storefront"

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
                <ExperimentalNavigation
                    businessName={businessName}
                    faviconUrl={settings?.faviconUrl || null}
                    useLogo={experimental.navbar?.useLogo || false}
                    dropdownMode={experimental.navbar?.dropdownMode || "categories"}
                    navbarStyle={experimental.navbar?.navbarStyle || "glass"}
                    navCategories={catalogData.navCategories}
                    navBrands={catalogData.navBrands}
                />

                <InteractivePreviewWrapper
                    initialSettings={{
                        ...settings,
                        experimental: themeConfig.experimental
                    }}
                    catalogData={catalogData}
                    initialLayout={layout}
                    isPreview={isPreview}
                />
            </div>
        </main>
    )

}
