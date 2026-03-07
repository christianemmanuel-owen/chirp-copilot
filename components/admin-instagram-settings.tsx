"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import type { Database } from "@/lib/supabase/types"
import type { InstagramPageCandidate } from "@/lib/meta/instagram"
import { cn } from "@/lib/utils"
import { Instagram, Plug, ShieldAlert, Unplug, Check, ExternalLink, ShieldCheck, Eye, EyeOff } from "lucide-react"

type InstagramConnectionRow = Database["public"]["Tables"]["instagram_connections"]["Row"]
type InstagramOAuthSessionRow = Database["public"]["Tables"]["instagram_oauth_sessions"]["Row"]

interface InstagramSettingsPanelProps {
  connection: InstagramConnectionRow | null
  pendingSession: InstagramOAuthSessionRow | null
  status?: string | null
  message?: string | null
}

function maskId(id: string | null | undefined) {
  if (!id) return "••••••••"
  if (id.length <= 8) return id
  return `${id.slice(0, 4)}••••${id.slice(-4)}`
}

function formatExpiry(expiresAt: string | null) {
  if (!expiresAt) return "Not provided"
  try {
    return format(new Date(expiresAt), "PPP")
  } catch {
    return expiresAt
  }
}

export default function InstagramSettingsPanel({
  connection,
  pendingSession,
  status,
  message,
}: InstagramSettingsPanelProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [selectedPageId, setSelectedPageId] = useState<string | null>(
    () => (pendingSession?.pages?.[0]?.pageId as string | undefined) ?? null,
  )
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [showFullIds, setShowFullIds] = useState(false)

  const showStatusAlert = status || message

  useEffect(() => {
    if (pendingSession && !selectedPageId) {
      const defaultCandidate = Array.isArray(pendingSession.pages) ? pendingSession.pages[0] : null
      if (defaultCandidate?.pageId) {
        setSelectedPageId(defaultCandidate.pageId)
      }
    }
  }, [pendingSession, selectedPageId])

  const pageCandidates = useMemo<InstagramPageCandidate[]>(() => {
    if (!pendingSession || !Array.isArray(pendingSession.pages)) {
      return []
    }
    return pendingSession.pages as InstagramPageCandidate[]
  }, [pendingSession])

  useEffect(() => {
    if (!status) return

    if (status === "error") {
      toast({
        title: "Connection failed",
        description: message ?? "Could not connect Instagram.",
        variant: "destructive",
      })
    } else if (status === "connected") {
      toast({ title: "Account linked successfully" })
    }
  }, [status, message, toast])

  const handleStartConnect = () => {
    window.location.href = "/api/auth/instagram/login"
  }

  const handleFinalize = async () => {
    if (!pendingSession || !selectedPageId) return
    setIsFinalizing(true)
    try {
      const response = await fetch("/api/admin/instagram/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: pendingSession.id, pageId: selectedPageId }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || "Failed to link account")
      }

      toast({ title: "Instagram linked", description: "Your feed will start syncing shortly." })
      router.replace("/admin/settings?tab=social&status=connected")
      router.refresh()
    } catch (error) {
      toast({
        title: "Unable to connect",
        description: error instanceof Error ? error.message : "Failed to link account.",
        variant: "destructive",
      })
    } finally { setIsFinalizing(false) }
  }

  const handleDisconnect = async () => {
    if (!connection) return
    if (!window.confirm("Disconnecting will stop automated messaging and feed syncing. Continue?")) return

    setIsDisconnecting(true)
    try {
      const response = await fetch("/api/admin/instagram/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: connection.id }),
      })

      if (!response.ok) throw new Error("Failed to disconnect")

      toast({ title: "Instagram disconnected" })
      router.replace("/admin/settings?tab=social")
      router.refresh()
    } catch (error) {
      toast({ title: "Error", description: "Failed to disconnect account.", variant: "destructive" })
    } finally { setIsDisconnecting(false) }
  }

  return (
    <div className="sett-fade-in space-y-8">
      {showStatusAlert && (
        <Alert variant={status === "error" ? "destructive" : "default"} className="rounded-2xl border-none bg-muted/20">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle className="capitalize font-bold">{status ?? "Notice"}</AlertTitle>
          <AlertDescription className="text-xs opacity-80">{message ?? "Check the connection details below."}</AlertDescription>
        </Alert>
      )}

      {pendingSession && pageCandidates.length > 0 ? (
        <div className="space-y-6">
          <div className="sett-card p-6 bg-gradient-to-br from-pink-500/5 to-purple-500/5 border-pink-500/20">
            <div className="mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Instagram className="h-6 w-6 text-pink-500" />
                Select Instagram Account
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose the business profile you want to integrate with your storefront.
              </p>
            </div>

            <div className="grid gap-3">
              {pageCandidates.map((candidate) => {
                const isSelected = selectedPageId === candidate.pageId
                return (
                  <button
                    key={candidate.pageId}
                    onClick={() => setSelectedPageId(candidate.pageId)}
                    className={cn(
                      "group relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                      isSelected
                        ? "border-pink-500 bg-white shadow-lg ring-1 ring-pink-500/20"
                        : "border-border bg-white/50 hover:border-pink-500/30 hover:bg-white"
                    )}
                  >
                    <div className="relative">
                      {candidate.instagramProfilePictureUrl ? (
                        <Image
                          src={candidate.instagramProfilePictureUrl}
                          alt={candidate.instagramUsername ?? "Instagram"}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <Instagram className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute -right-1 -bottom-1 h-5 w-5 rounded-full bg-pink-500 border-2 border-white flex items-center justify-center shadow-sm">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 font-bold text-foreground">
                        <span className="truncate">@{candidate.instagramUsername || "Unknown Account"}</span>
                      </div>
                      <p className="text-[10px] uppercase tracking-wider font-black text-muted-foreground opacity-60">
                        {candidate.pageName}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <Button variant="ghost" onClick={() => router.replace("/admin/settings?tab=social")} className="rounded-xl h-10 px-6 font-bold">
                Cancel
              </Button>
              <Button
                onClick={handleFinalize}
                disabled={!selectedPageId || isFinalizing}
                className="rounded-xl h-10 px-8 font-black bg-pink-500 hover:bg-pink-600 text-white border-none shadow-lg shadow-pink-500/20"
              >
                {isFinalizing ? "Linking..." : "Complete Connection"}
              </Button>
            </div>
          </div>
        </div>
      ) : connection ? (
        <div className="space-y-6">
          <div className="sett-card group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className="relative h-20 w-20">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5 animate-pulse">
                    <div className="h-full w-full rounded-full bg-white p-0.5">
                      <div className="h-full w-full rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        <Instagram className="h-8 w-8 text-pink-500" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-foreground">
                      @{connection.instagram_username || "connected_account"}
                    </h3>
                    <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-none px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
                      Live
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">{connection.page_name}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="rounded-xl h-10 px-4 font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/5"
              >
                <Unplug className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </div>

            <Separator className="my-8 opacity-50" />

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Technical Identifiers</p>
                    <button
                      onClick={() => setShowFullIds(!showFullIds)}
                      className="text-[10px] font-black uppercase tracking-widest text-pink-500 hover:underline flex items-center gap-1"
                    >
                      {showFullIds ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      {showFullIds ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="space-y-3 mt-3">
                    <div className="flex justify-between items-center text-sm p-3 rounded-xl bg-muted/20 border border-border/50">
                      <span className="font-bold text-muted-foreground">Instagram ID</span>
                      <code className="text-xs font-mono">{showFullIds ? connection.instagram_business_account_id : maskId(connection.instagram_business_account_id)}</code>
                    </div>
                    <div className="flex justify-between items-center text-sm p-3 rounded-xl bg-muted/20 border border-border/50">
                      <span className="font-bold text-muted-foreground">Page ID</span>
                      <code className="text-xs font-mono">{showFullIds ? connection.page_id : maskId(connection.page_id)}</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Security & Permissions</p>
                  <div className="space-y-3 mt-3">
                    <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-orange-600" />
                        <span className="font-bold text-orange-900/70">Sync Token</span>
                      </div>
                      <span className="text-xs font-black text-orange-900/60">Expires {formatExpiry(connection.user_access_token_expires_at)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {connection.scopes.map((scope) => (
                      <Badge key={scope} variant="secondary" className="bg-muted text-[9px] font-bold py-0 h-5 px-1.5 uppercase letter-spacing-tight">
                        {scope.replace("instagram_", "").replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="sett-card flex flex-col items-center justify-center text-center py-16 px-6">
          <div className="h-20 w-20 rounded-3xl bg-pink-500/5 flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-3xl bg-pink-500/10 animate-ping opacity-20" />
            <Instagram className="h-10 w-10 text-pink-500" />
          </div>
          <h3 className="text-2xl font-black text-foreground">Instagram Direct Messaging</h3>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm font-medium leading-relaxed">
            Sync your Instagram Business Account to automate direct messages and showcase your feed directly on your storefront.
          </p>
          <Button
            onClick={handleStartConnect}
            className="mt-8 rounded-2xl h-12 px-10 font-black bg-foreground text-background hover:bg-foreground/90 shadow-xl"
          >
            <Plug className="mr-2 h-4 w-4" />
            Connect Account
          </Button>
          <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
            Official Meta Business Partner API
          </p>
        </div>
      )}
    </div>
  )
}
