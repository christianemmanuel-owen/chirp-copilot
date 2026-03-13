export const runtime = "edge"
import { headers } from "next/headers"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { eq } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { storefrontSettings } from "@/lib/db/schema"
import { ensureTenantIdFromHeaders } from "@/lib/db/tenant"
import { buildThemeConfig, themeConfigToCssVariables } from "@/lib/storefront-theme"

import { getCatalogData } from "@/lib/storefront-data"
import ExperimentalNavigation from "@/app/experimental-home/_components/ExperimentalNavigation"
import InteractivePreviewWrapper from "@/app/experimental-home/_components/InteractivePreviewWrapper"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface StorefrontHomeProps {
  searchParams: Promise<{ preview?: string }>
}

export default async function StorefrontHome({ searchParams }: StorefrontHomeProps) {
  const params = await searchParams
  const isPreview = params.preview === "true"

  const { env } = getRequestContext()
  const projectId = await ensureTenantIdFromHeaders(await headers(), env.DB)
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
