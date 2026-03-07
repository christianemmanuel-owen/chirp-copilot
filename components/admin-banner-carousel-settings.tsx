"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Check, Loader2, X, Plus, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Switch } from "@/components/ui/switch"
import { useStore } from "@/lib/store"
import type { Product } from "@/lib/types"

const MAX_BANNER_PRODUCTS = 6

interface StorefrontSettingsResponse {
  data?: {
    bannerProductIds?: number[]
    highlightPopular?: boolean
    highlightLatest?: boolean
  }
}

const normalizeProductIds = (value: unknown): number[] => {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map(Number))].filter(n => Number.isInteger(n) && n > 0).slice(0, MAX_BANNER_PRODUCTS)
}

export default function AdminBannerCarouselSettings() {
  const { toast } = useToast()
  const { products, isLoadingProducts } = useStore()
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loadedIds, setLoadedIds] = useState<number[]>([])
  const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false)
  const [highlightPopular, setHighlightPopular] = useState<boolean>(true)
  const [highlightLatest, setHighlightLatest] = useState<boolean>(true)
  const [loadedHighlightPopular, setLoadedHighlightPopular] = useState<boolean>(true)
  const [loadedHighlightLatest, setLoadedHighlightLatest] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setIsLoadingSettings(true)
      try {
        const res = await fetch("/api/storefront-settings")
        const payload = await res.json() as StorefrontSettingsResponse
        if (isMounted) {
          const ids = normalizeProductIds(payload.data?.bannerProductIds)
          setSelectedIds(ids); setLoadedIds(ids)
          setHighlightPopular(payload.data?.highlightPopular ?? true); setLoadedHighlightPopular(payload.data?.highlightPopular ?? true)
          setHighlightLatest(payload.data?.highlightLatest ?? true); setLoadedHighlightLatest(payload.data?.highlightLatest ?? true)
        }
      } finally { if (isMounted) setIsLoadingSettings(false) }
    }
    load()
    return () => { isMounted = false }
  }, [])

  const selectedProducts = useMemo(() =>
    selectedIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => !!p),
    [products, selectedIds])

  const hasChanges = useMemo(() =>
    JSON.stringify(selectedIds) !== JSON.stringify(loadedIds) ||
    highlightPopular !== loadedHighlightPopular ||
    highlightLatest !== loadedHighlightLatest
    , [selectedIds, loadedIds, highlightPopular, loadedHighlightPopular, highlightLatest, loadedHighlightLatest])

  const toggleProduct = useCallback((id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < MAX_BANNER_PRODUCTS ? [...prev, id] : prev)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await fetch("/api/storefront-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bannerProductIds: selectedIds, highlightPopular, highlightLatest }),
      })
      setLoadedIds(selectedIds); setLoadedHighlightPopular(highlightPopular); setLoadedHighlightLatest(highlightLatest)
      toast({ title: "Banner updated", description: "Changes are now live on your storefront." })
    } finally { setIsSaving(false) }
  }

  if (isLoadingSettings) return <div className="h-40 animate-pulse bg-muted/20 rounded-2xl" />

  return (
    <div className="sett-field-group">
      <div className="sett-card">
        <div className="flex flex-col gap-6">

          <div className="flex flex-wrap gap-3">
            {selectedProducts.map(p => (
              <Badge key={p.id} className="h-10 rounded-full bg-white border border-border px-4 py-0 pl-3 flex items-center gap-2 shadow-sm transition-all hover:border-primary/50">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/50 text-[10px] font-bold">
                  {p.brand?.name?.[0] || "?"}
                </div>
                <span className="text-xs font-bold text-foreground truncate max-w-[120px]">{p.name}</span>
                <button onClick={() => toggleProduct(p.id)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            ))}
            {selectedIds.length < MAX_BANNER_PRODUCTS && (
              <button
                onClick={() => setIsSelectorOpen(true)}
                className="flex h-10 items-center gap-2 rounded-full border border-dashed border-primary/40 bg-primary/5 px-5 text-xs font-bold text-primary transition-all hover:bg-primary/10 hover:border-primary"
              >
                <Plus className="h-4 w-4" />
                Select Product
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sett-control-row">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold">Show Best Sellers</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Auto-include top items</p>
                </div>
              </div>
              <Switch checked={highlightPopular} onCheckedChange={setHighlightPopular} />
            </div>
            <div className="sett-control-row">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                  <Plus className="h-4 w-4 shadow-inner" />
                </div>
                <div>
                  <p className="text-sm font-bold">Show Latest Drop</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Auto-include new arrivals</p>
                </div>
              </div>
              <Switch checked={highlightLatest} onCheckedChange={setHighlightLatest} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end border-t border-border/50 pt-6">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="h-11 rounded-xl bg-foreground px-8 font-bold text-background shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      <CommandDialog open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
        <CommandInput placeholder="Search your catalog..." />
        <CommandList>
          <CommandEmpty>No products found.</CommandEmpty>
          <CommandGroup heading="All Products">
            {products.map((p) => (
              <CommandItem key={p.id} onSelect={() => toggleProduct(p.id)} className="flex items-center justify-between">
                <span className="font-bold">{p.name} <span className="text-muted-foreground font-medium opacity-50">· {p.brand?.name}</span></span>
                {selectedIds.includes(p.id) && <Check className="h-4 w-4 text-primary" />}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}
