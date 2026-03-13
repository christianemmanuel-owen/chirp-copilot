export const runtime = "edge"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
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
    const supabase = getSupabaseServiceRoleClient()
    const [
        { data: settings },
        catalogData
    ] = await Promise.all([
        supabase
            .from("storefront_settings")
            .select("theme_config, home_collection_mode, favicon_url")
            .eq("id", 1)
            .single(),
        getCatalogData()
    ])

    const themeConfig = buildThemeConfig(settings?.theme_config)
    const experimental = themeConfig.experimental!

    const businessName = (settings?.theme_config as any)?.businessName || process.env.NEXT_PUBLIC_BUSINESS_NAME || "Storefront"

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
                    faviconUrl={settings?.favicon_url || null}
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
