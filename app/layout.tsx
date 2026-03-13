import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import {
  Inter,
  Playfair_Display,
  Space_Grotesk,
  Roboto,
  Montserrat,
  Lato,
  Merriweather,
  Oswald,
  Raleway,
  Nunito,
  Outfit,
  Syne,
  Plus_Jakarta_Sans,
  Bricolage_Grotesque
} from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { Providers } from "@/components/providers"
import { BUSINESS_NAME } from "@/lib/config"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb } from "@/lib/db"
import { storefrontSettings as storefrontSettingsSchema } from "@/lib/db/schema"
import { getTenantIdFromHeaders } from "@/lib/db/tenant"
import { eq } from "drizzle-orm"
import { buildThemeConfig, DEFAULT_THEME_CONFIG, themeConfigToCssVariables } from "@/lib/storefront-theme"
import { headers } from "next/headers"

export const runtime = "edge"

const DEFAULT_ICON = "/icon.png"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair-display", display: "swap" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" })
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-roboto", display: "swap" })
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" })
const lato = Lato({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-lato", display: "swap" })
const merriweather = Merriweather({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-merriweather", display: "swap" })
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald", display: "swap" })
const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway", display: "swap" })
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" })
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" })
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta-sans", display: "swap" })
const bricolageGrotesque = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage-grotesque", display: "swap" })

export const metadata: Metadata = {
  title: BUSINESS_NAME,
  description: `${BUSINESS_NAME} MVP`,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let faviconUrl = DEFAULT_ICON
  let themeConfig = DEFAULT_THEME_CONFIG

  try {
    const { env } = getRequestContext()
    const d1 = env.DB
    if (d1) {
      const headerList = await headers()
      const tenantId = await getTenantIdFromHeaders(headerList, d1)

      if (tenantId) {
        const db = getDb(d1)
        const settings = await db.query.storefrontSettings.findFirst({
          where: eq(storefrontSettingsSchema.projectId, tenantId)
        })

        if (settings) {
          if (typeof settings.faviconUrl === "string") {
            const trimmed = settings.faviconUrl.trim()
            if (trimmed.length > 0) {
              faviconUrl = trimmed
            }
          }
          themeConfig = buildThemeConfig((settings.themeConfig as any) ?? DEFAULT_THEME_CONFIG)
        }
      }
    }
  } catch (error) {
    console.error("[layout] Unexpected error while resolving storefront settings", error)
  }

  const themeStyles = themeConfigToCssVariables(themeConfig)

  return (
    <html lang="en">
      <head>
        <link rel="icon" href={faviconUrl} />
        <link rel="shortcut icon" href={faviconUrl} />
        <link rel="apple-touch-icon" href={faviconUrl} />
      </head>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${inter.variable} ${playfair.variable} ${spaceGrotesk.variable} ${roboto.variable} ${montserrat.variable} ${lato.variable} ${merriweather.variable} ${oswald.variable} ${raleway.variable} ${nunito.variable} ${outfit.variable} ${syne.variable} ${plusJakartaSans.variable} ${bricolageGrotesque.variable}`}
        style={themeStyles as React.CSSProperties}
      >

        <Providers>
          <Suspense fallback={null}>{children}</Suspense>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
