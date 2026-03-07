"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, LayoutGrid, Check, Info } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import type { CollectionTileMode } from "@/lib/storefront-data"

export default function AdminStorefrontTilesSettings() {
  const { toast } = useToast()
  const [mode, setMode] = useState<CollectionTileMode>("brands")
  const [navCollectionsEnabled, setNavCollectionsEnabled] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/storefront-settings")
        const payload = await res.json()
        if (isMounted) {
          setMode(payload.data?.mode || "brands")
          setNavCollectionsEnabled(payload.data?.navCollectionsEnabled ?? true)
        }
      } finally { if (isMounted) setIsLoading(false) }
    }
    load()
    return () => { isMounted = false }
  }, [])

  const handleUpdate = async (patch: any) => {
    setIsSaving(true)
    try {
      await fetch("/api/storefront-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      if (patch.mode) setMode(patch.mode)
      if (patch.hasOwnProperty("navCollectionsEnabled")) setNavCollectionsEnabled(patch.navCollectionsEnabled)
      toast({ title: "Display preferences updated" })
    } finally { setIsSaving(false) }
  }

  if (isLoading) return <div className="h-40 animate-pulse bg-muted/20 rounded-2xl" />

  return (
    <div className="sett-field-group">
      <div className="sett-card">

        <div className="space-y-8">
          <RadioGroup value={mode} onValueChange={(v) => handleUpdate({ mode: v })} className="grid gap-4 sm:grid-cols-2">
            {[
              { id: "brands", label: "Shop by Brand", desc: "Feature your most popular brand logos and collections." },
              { id: "categories", label: "Shop by Category", desc: "Highlight generic types of products (e.g. Apparel, Tech)." }
            ].map((item) => (
              <Label
                key={item.id}
                htmlFor={`mode-${item.id}`}
                className={cn(
                  "relative flex cursor-pointer flex-col gap-2 rounded-2xl border-2 p-5 transition-all",
                  mode === item.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                    : "border-border bg-background hover:bg-muted/30"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-foreground">{item.label}</span>
                    <span className="max-w-[180px] text-xs font-medium text-muted-foreground leading-relaxed italic">{item.desc}</span>
                  </div>
                  <RadioGroupItem value={item.id} id={`mode-${item.id}`} className="mt-1" />
                </div>
                {mode === item.id && (
                  <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-md">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </Label>
            ))}
          </RadioGroup>

          <div className="sett-control-row">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Info className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold">Header Quick Links</p>
                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed max-w-[400px]">
                  Show brand/category shortcuts directly in the site header for one-click navigation.
                </p>
              </div>
            </div>
            <Switch
              checked={navCollectionsEnabled}
              onCheckedChange={(v) => handleUpdate({ navCollectionsEnabled: v })}
              disabled={isSaving}
            />
          </div>
        </div>

        {isSaving && (
          <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            Updating Live Storefront...
          </div>
        )}
      </div>
    </div>
  )
}
