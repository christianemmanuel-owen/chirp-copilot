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
  const projectId = await getTenantIdFromHeaders(headerList, env.DB)

  // --- Fallback Landing Page ---
  if (!projectId) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50">
        <div className="max-w-2xl bg-white rounded-2xl shadow-xl p-12 border border-gray-100">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Welcome to Chirp
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Ready to build something amazing? Log in to your dashboard to manage your store or create a new project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
            >
              Log in to Dashboard
            </Link>
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all"
            >
              Get Started
            </Link>
          </div>
          <div className="mt-12 text-gray-400 text-sm">
            Visiting from a subdomain? Make sure your store slug is correct.
          </div>
        </div>
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
