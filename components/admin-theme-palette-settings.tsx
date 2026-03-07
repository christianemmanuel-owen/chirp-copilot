"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, Sparkles, RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  DEFAULT_THEME_CONFIG,
  STORE_FONT_OPTIONS,
  buildThemeConfig,
  serializeThemeConfig,
  type StorefrontThemeColors,
  type StorefrontThemeConfig,
} from "@/lib/storefront-theme"
import GlobalStylesEditor from "@/components/editor/GlobalStylesEditor"

interface StorefrontSettingsResponse {
  data?: {
    theme?: StorefrontThemeConfig
  }
  error?: string
}

const toThemeSignature = (theme: StorefrontThemeConfig) => JSON.stringify({
  fontFamily: theme.fontFamily,
  colors: theme.colors
})

export default function AdminThemePaletteSettings() {
  const { toast } = useToast()
  const [storedTheme, setStoredTheme] = useState<StorefrontThemeConfig>(DEFAULT_THEME_CONFIG)
  const [draftTheme, setDraftTheme] = useState<StorefrontThemeConfig>(DEFAULT_THEME_CONFIG)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const hasChanges = useMemo(
    () => toThemeSignature(storedTheme) !== toThemeSignature(draftTheme),
    [storedTheme, draftTheme],
  )

  useEffect(() => {
    let isMounted = true

    const loadTheme = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/storefront-settings", {
          headers: { "Content-Type": "application/json" },
        })
        const payload = (await response.json().catch(() => ({}))) as StorefrontSettingsResponse

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load storefront theme")
        }

        const fetchedTheme = buildThemeConfig(payload.data?.theme)
        if (isMounted) {
          const normalized = serializeThemeConfig(fetchedTheme)
          setStoredTheme(normalized)
          setDraftTheme(normalized)
        }
      } catch (error) {
        console.error("[admin][theme-settings] Failed to load theme", error)
        if (isMounted) {
          toast({
            title: "Could not load theme",
            description: "Using default colors for now.",
            variant: "destructive",
          })
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadTheme()

    return () => {
      isMounted = false
    }
  }, [toast])

  const handleThemeChange = useCallback((updates: Partial<StorefrontThemeConfig>) => {
    setDraftTheme((prev) => ({
      ...prev,
      ...updates,
      colors: updates.colors ? { ...prev.colors, ...updates.colors } : prev.colors,
    }))
  }, [])

  const handleReset = useCallback(() => {
    setDraftTheme(serializeThemeConfig(storedTheme))
  }, [storedTheme])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/storefront-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: draftTheme }),
      })

      if (!response.ok) {
        throw new Error("Failed to update theme")
      }

      const payload = await response.json()
      const appliedTheme = buildThemeConfig(payload.data?.theme)
      const normalized = serializeThemeConfig(appliedTheme)
      setStoredTheme(normalized)
      setDraftTheme(normalized)
      toast({
        title: "Theme updated",
        description: "Your storefront has been updated with the new design.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }, [draftTheme, toast])

  const selectedFont = useMemo(() => {
    return STORE_FONT_OPTIONS.find((option) => option.id === draftTheme.fontFamily) ?? STORE_FONT_OPTIONS[0]
  }, [draftTheme.fontFamily])

  const previewStyles = useMemo<React.CSSProperties>(
    () => ({
      fontFamily: selectedFont.stack,
      backgroundColor: draftTheme.colors.background,
      color: draftTheme.colors.foreground,
    }),
    [draftTheme.colors.background, draftTheme.colors.foreground, selectedFont.stack],
  )

  const previewButtonStyles = useMemo<React.CSSProperties>(
    () => ({
      backgroundColor: draftTheme.colors.buttonColor,
      color: draftTheme.colors.buttonText,
    }),
    [draftTheme.colors.buttonColor, draftTheme.colors.buttonText],
  )

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed bg-muted/20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="sett-field-group">
      {/* Visual Preview */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] mb-8">
        <div
          className="relative overflow-hidden rounded-3xl border border-border shadow-2xl transition-all duration-500"
          style={previewStyles}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <div className="p-8 md:p-12">
            <Badge variant="outline" className="mb-4 border-current/20 font-bold uppercase tracking-widest opacity-60">
              Live Preview
            </Badge>
            <h2 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Design for <span className="text-primary italic">Chirp</span> Creators.
            </h2>
            <p className="mt-6 max-w-sm text-lg opacity-80">
              See how your choices impact the typography and color balance of your store.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button
                type="button"
                className="h-14 rounded-full px-10 text-lg font-bold shadow-xl transition-transform hover:scale-105 active:scale-95"
                style={previewButtonStyles}
              >
                Shop Now
              </button>
              <button
                type="button"
                className="h-14 rounded-full border-2 border-current/20 px-8 text-lg font-bold transition-colors hover:bg-current/5"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div
            className="rounded-3xl border border-border p-6 shadow-lg"
            style={{ backgroundColor: draftTheme.colors.card, color: draftTheme.colors.cardForeground }}
          >
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Feature Card</p>
            <h3 className="mt-3 text-xl font-bold">Smart Inventory</h3>
            <p className="mt-2 text-sm opacity-70">
              Your products look great on any background you choose.
            </p>
            <div className="mt-6 h-2 w-full rounded-full bg-current/10 overflow-hidden">
              <div className="h-full w-2/3 bg-current/40" />
            </div>
          </div>

          <div
            className="rounded-3xl border border-border p-6 shadow-lg"
            style={{ backgroundColor: draftTheme.colors.accent, color: draftTheme.colors.accentForeground }}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5" />
              <p className="text-sm font-bold">Accent Highlight</p>
            </div>
          </div>
        </div>
      </div>

      <GlobalStylesEditor
        theme={draftTheme}
        onChange={handleThemeChange}
        isSaving={isSaving}
      />

      {/* Fixed Action Bar for unsaved changes */}
      {hasChanges && (
        <div className="sticky bottom-6 flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4 backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
          <div className="flex items-center gap-3 pl-2">
            <RefreshCw className="h-4 w-4 text-primary animate-spin-slow" />
            <p className="text-sm font-bold text-primary">Unsaved Theme Changes</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleReset} disabled={isSaving} className="font-bold text-primary hover:bg-primary/10">
              Discard
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="rounded-xl bg-primary px-6 font-bold text-white shadow-md hover:bg-primary/90">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Theme"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
