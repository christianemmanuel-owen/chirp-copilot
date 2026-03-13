export const runtime = "edge"
import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"

import AdminPaymentMethodsPanel from "@/components/admin-payment-methods"
import AdminBrandingSettings from "@/components/admin-branding-settings"
import AdminCheckoutSettings from "@/components/admin-checkout-settings"
import InstagramSettingsPanel from "@/components/admin-instagram-settings"
import AdminExperimentalSettings from "@/components/AdminExperimentalSettings"
import SettingsSidebar from "./_components/SettingsSidebar"
// Refreshing import

import { getDb } from "@/lib/db"
import { instagramConnections, instagramOAuthSessions } from "@/lib/db/schema"
import { ensureTenantIdFromHeaders } from "@/lib/db/tenant"
import { and, eq, desc } from "drizzle-orm"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "Settings | Chirp Admin",
}

interface SettingsSearchParams {
  session?: string
  status?: string
  message?: string
  tab?: string
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<SettingsSearchParams>
}) {
  const params = await searchParams
  const d1 = (process.env as any).DB as D1Database
  const head = await headers()
  const tenantId = await ensureTenantIdFromHeaders(head, d1)
  const db = getDb(d1)

  let activeConnection: any = null
  let pendingSession: any = null

  try {
    const connection = await db.query.instagramConnections.findFirst({
      where: eq(instagramConnections.projectId, tenantId),
      orderBy: [desc(instagramConnections.connectedAt)]
    })
    activeConnection = connection ?? null
  } catch (error) {
    console.error("[settings] Failed to load Instagram connections", error)
  }

  if (params.session) {
    try {
      const session = await db.query.instagramOAuthSessions.findFirst({
        where: and(
          eq(instagramOAuthSessions.id, params.session),
          eq(instagramOAuthSessions.projectId, tenantId)
        )
      })

      if (session && !session.consumedAt && (!session.expiresAt || new Date(session.expiresAt) > new Date())) {
        pendingSession = session
      }
    } catch (error) {
      console.error("[settings] Failed to load Instagram OAuth session", error)
    }
  }

  const activeTab = params.tab || "identity"

  const renderContent = () => {
    switch (activeTab) {
      case "identity":
        return (
          <>
            <div className="sett-section-header">
              <h1 className="sett-section-title">Identity</h1>
              <p className="sett-section-desc">Manage your storefront's brand identity, including logo and favicon.</p>
            </div>
            <AdminBrandingSettings />
          </>
        )
      case "payments":
        return (
          <>
            <div className="sett-section-header">
              <h1 className="sett-section-title">Payments</h1>
              <p className="sett-section-desc">Manage the payment methods and QR codes displayed during checkout.</p>
            </div>
            <AdminPaymentMethodsPanel />
          </>
        )
      case "checkout":
        return (
          <>
            <div className="sett-section-header">
              <h1 className="sett-section-title">Checkout</h1>
              <p className="sett-section-desc">Configure shipping fees, regional overrides, and order preferences.</p>
            </div>
            <AdminCheckoutSettings />
          </>
        )
      case "social":
        return (
          <>
            <div className="sett-section-header">
              <h1 className="sett-section-title">Social Integrations</h1>
              <p className="sett-section-desc">Connect your Instagram account to sync posts and showcase them on your store.</p>
            </div>
            <InstagramSettingsPanel
              connection={activeConnection}
              pendingSession={pendingSession}
              status={params.status}
              message={params.message}
            />
          </>
        )
      case "experimental":
        return (
          <>
            <div className="sett-section-header">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                Experimental Features
              </h2>
              <h1 className="sett-section-title">Beta Lab</h1>
              <p className="sett-section-desc">Test-drive new storefront designs and upcoming functionality before they go live.</p>
            </div>
            <AdminExperimentalSettings />
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-[95vw] mx-auto px-6 py-10">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Configure your store experience and operations
        </p>
      </div>

      <div className="sett-layout">
        <Suspense fallback={<div className="sett-sidebar w-[240px] animate-pulse bg-muted/20 rounded-2xl h-[500px]" />}>
          <SettingsSidebar />
        </Suspense>

        <main className="flex-1 min-w-0">
          <div key={activeTab} className="sett-content">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
