import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Inter, Playfair_Display, Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { StoreProvider } from "@/lib/store"
import { CartProvider } from "@/lib/cart"
import { BUSINESS_NAME } from "@/lib/config"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import { buildThemeConfig, DEFAULT_THEME_CONFIG, themeConfigToCssVariables } from "@/lib/storefront-theme"

const DEFAULT_ICON = "/icon.png"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair-display", display: "swap" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" })

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
    const supabase = getSupabaseServiceRoleClient()
    const { data, error } = await supabase
      .from("storefront_settings")
      .select("favicon_url, theme_config")
      .eq("id", 1)
      .maybeSingle()

    if (error) {
      console.error("[layout] Failed to load favicon configuration", error)
    } else if (typeof data?.favicon_url === "string") {
      const trimmed = data.favicon_url.trim()
      if (trimmed.length > 0) {
        faviconUrl = trimmed
      }
    }

    themeConfig = buildThemeConfig(data?.theme_config ?? DEFAULT_THEME_CONFIG)
  } catch (error) {
    console.error("[layout] Unexpected error while resolving favicon", error)
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
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${inter.variable} ${spaceGrotesk.variable} ${playfair.variable}`}
      >

        <StoreProvider>
          <CartProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </CartProvider>
        </StoreProvider>
        <Analytics />
      </body>
    </html>
  )
}
