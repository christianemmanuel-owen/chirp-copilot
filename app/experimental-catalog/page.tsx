import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb } from "@/lib/db"
import { storefrontSettings } from "@/lib/db/schema"
import { ensureTenantIdFromHeaders } from "@/lib/db/tenant"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
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
    const { env } = getRequestContext()
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
    const businessName = (settings?.themeConfig as any)?.businessName || "CHIRP"

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
