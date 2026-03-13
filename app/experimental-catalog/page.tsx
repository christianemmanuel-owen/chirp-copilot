import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import { buildThemeConfig, themeConfigToCssVariables } from "@/lib/storefront-theme"
import { getCatalogData } from "@/lib/storefront-data"
import InteractivePreviewWrapper from "@/app/experimental-home/_components/InteractivePreviewWrapper"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface CatalogPreviewPageProps {
    searchParams: Promise<{ preview?: string }>
}

export default async function CatalogPreviewPage({ searchParams }: CatalogPreviewPageProps) {
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
    const businessName = (settings?.theme_config as any)?.businessName || "CHIRP"

    // Use catalogLayout if it exists, otherwise fallback to empty array or default
    const layout = experimental.catalogLayout || [
        { id: "catalog-grid-1", type: "catalog-grid", enabled: true },
        { id: "footer-1", type: "footer", enabled: true }
    ]

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
                    pageType="catalog"
                />
            </div>
        </main>
    )
}
