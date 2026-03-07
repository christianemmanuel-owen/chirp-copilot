"use client"

import { useEffect, useRef, useState } from "react"
import { ImagePlus, Loader2, RefreshCcw, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

const DEFAULT_FAVICON = "/icon.png"
const MAX_FILE_SIZE_BYTES = 256 * 1024

interface StorefrontSettingsResponse {
  data?: {
    faviconUrl?: string | null
  }
  error?: string
}

export default function AdminBrandingSettings() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null)
  const [savedFaviconUrl, setSavedFaviconUrl] = useState<string | null>(null)

  const hasChanges = faviconUrl !== savedFaviconUrl
  const previewUrl = faviconUrl ?? DEFAULT_FAVICON

  useEffect(() => {
    let isMounted = true

    const loadSettings = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/storefront-settings")
        const payload = (await response.json().catch(() => ({}))) as StorefrontSettingsResponse

        if (!response.ok) {
          const message = payload.error || "Failed to load branding settings"
          throw new Error(message)
        }

        const nextFavicon =
          typeof payload.data?.faviconUrl === "string" && payload.data.faviconUrl.trim().length > 0
            ? payload.data.faviconUrl.trim()
            : null

        if (isMounted) {
          setFaviconUrl(nextFavicon)
          setSavedFaviconUrl(nextFavicon)
        }
      } catch (error) {
        console.error("[admin][branding-settings] Failed to load storefront settings", error)
        if (isMounted) {
          toast({
            title: "Could not load branding settings",
            description: "Using the default favicon for now.",
            variant: "destructive",
          })
          setFaviconUrl(null)
          setSavedFaviconUrl(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadSettings()

    return () => {
      isMounted = false
    }
  }, [toast])

  const handleSelectFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({
        title: "File too large",
        description: "Please upload an image under 256 KB for the favicon.",
        variant: "destructive",
      })
      event.target.value = ""
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("prefix", "favicon")

      const response = await fetch("/api/uploads/branding", {
        method: "POST",
        body: formData,
      })

      const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string }

      if (!response.ok) {
        const message = payload.error || "Failed to upload favicon"
        throw new Error(message)
      }

      if (typeof payload.url !== "string" || payload.url.trim().length === 0) {
        throw new Error("Upload did not return a valid URL")
      }

      const uploadedUrl = payload.url.trim()
      setFaviconUrl(uploadedUrl)
      toast({
        title: "Favicon uploaded",
        description: "Remember to save your changes to apply the new favicon.",
      })
    } catch (error) {
      console.error("[admin][branding-settings] Favicon upload failed", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again with a different file.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      event.target.value = ""
    }
  }

  const handleSave = async () => {
    if (!hasChanges) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/storefront-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faviconUrl: faviconUrl ?? null }),
      })

      const payload = (await response.json().catch(() => ({}))) as StorefrontSettingsResponse

      if (!response.ok) {
        const message = payload.error || "Failed to update favicon"
        throw new Error(message)
      }

      const applied =
        typeof payload.data?.faviconUrl === "string" && payload.data.faviconUrl.trim().length > 0
          ? payload.data.faviconUrl.trim()
          : null

      setFaviconUrl(applied)
      setSavedFaviconUrl(applied)

      toast({
        title: "Favicon updated",
        description: "Your new icon is live across the storefront.",
      })
    } catch (error) {
      console.error("[admin][branding-settings] Failed to save favicon", error)
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setFaviconUrl(null)
  }

  return (
    <div className="sett-field-group">
      <div className="sett-card">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-6">
            <div className="group relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 transition-all hover:bg-muted/30">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <img src={previewUrl} alt="Favicon preview" className="h-16 w-16 rounded-xl object-contain shadow-sm transition-transform group-hover:scale-105" />
              )}
              {!isLoading && (
                <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-md">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">Browser Favicon</h3>
              <p className="sett-hint">
                This icon appears in browser tabs and bookmarks.<br />
                Recommended: **square PNG or SVG** (e.g. 512x512px).
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-md bg-muted/10 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  max 256 KB
                </Badge>
                {faviconUrl === null && (
                  <Badge className="rounded-md bg-primary/10 text-[10px] font-bold uppercase tracking-wider text-primary">
                    Using Default
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml"
              className="hidden"
              onChange={handleFileChange}
            />

            <Button
              type="button"
              variant="default"
              onClick={handleSelectFile}
              disabled={isUploading || isLoading}
              className="h-11 rounded-xl px-6 font-bold shadow-sm transition-all hover:translate-y-[-1px] active:translate-y-[0]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Upload Icon
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              disabled={isLoading || (!hasChanges && faviconUrl === null)}
              className="h-10 rounded-xl font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reset to Default
            </Button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-6">
          <p className="text-xs font-medium text-muted-foreground">
            {hasChanges ? "You have unsaved changes." : "Upload and save to update your storefront icon."}
          </p>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || isSaving || isUploading}
            className="h-11 rounded-xl bg-foreground px-8 font-bold text-background shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
