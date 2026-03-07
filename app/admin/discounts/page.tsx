"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { ChangeEvent } from "react"
import { addDays, format, parseISO, endOfDay } from "date-fns"
import type { DateRange } from "react-day-picker"
import { CalendarRange, Eye, ImagePlus, Loader2, Pen, Plus, RefreshCw, Search, Trash2, X } from "lucide-react"

import { useStore } from "@/lib/store"
import type { DiscountCampaign, DiscountCampaignVariant, Product, ProductVariant } from "@/lib/types"
import { cn, formatCurrency } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface VariantOption {
  id: number
  productId: number
  productName: string
  variantLabel: string | null
  sku: string | null
  image: string
  price: number
  stock: number
  brandName: string | null
}

interface SelectedVariant extends VariantOption {
  discountPercent: number
}

interface CampaignDialogState {
  id: string
  name: string
  description: string
  bannerImage: string
  dateRange: DateRange | undefined
  isActive: boolean
  variants: DiscountCampaignVariant[]
}

const DEFAULT_RANGE: DateRange = {
  from: new Date(),
  to: addDays(new Date(), 7),
}

export default function AdminDiscountsPage() {
  const { products, isLoadingProducts } = useStore()
  const { toast } = useToast()

  const [campaignName, setCampaignName] = useState("")
  const [description, setDescription] = useState("")
  const [bannerImage, setBannerImage] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(DEFAULT_RANGE)
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [campaigns, setCampaigns] = useState<DiscountCampaign[]>([])
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [editingCampaign, setEditingCampaign] = useState<CampaignDialogState | null>(null)
  const [isUpdatingCampaign, setIsUpdatingCampaign] = useState(false)
  const [campaignDialogError, setCampaignDialogError] = useState<string | null>(null)
  const [editVariantSearch, setEditVariantSearch] = useState("")
  const [isVariantPickerOpen, setIsVariantPickerOpen] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState<DiscountCampaign | null>(null)
  const [isDeletingCampaign, setIsDeletingCampaign] = useState(false)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const [isUploadingEditBanner, setIsUploadingEditBanner] = useState(false)
  const [variantDiscountInputs, setVariantDiscountInputs] = useState<Record<number, string>>({})
  const [campaignVariantDiscountInputs, setCampaignVariantDiscountInputs] = useState<Record<number, string>>({})

  const bannerUploadInputRef = useRef<HTMLInputElement | null>(null)
  const editBannerUploadInputRef = useRef<HTMLInputElement | null>(null)

  const variantOptions = useMemo(() => mapProductsToVariantOptions(products), [products])
  const selectedIds = useMemo(() => new Set(selectedVariants.map((variant) => variant.id)), [selectedVariants])

  const filteredOptions = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    return variantOptions
      .filter((option) => !selectedIds.has(option.id))
      .filter((option) => {
        if (!normalized) return true
        return (
          option.productName.toLowerCase().includes(normalized) ||
          (option.variantLabel ?? "").toLowerCase().includes(normalized) ||
          (option.sku ?? "").toLowerCase().includes(normalized)
        )
      })
  }, [variantOptions, searchTerm, selectedIds])

  const editSelectedVariantIds = useMemo(
    () => new Set(editingCampaign?.variants.map((variant) => variant.variantId) ?? []),
    [editingCampaign],
  )

  const editFilteredOptions = useMemo(() => {
    if (!editingCampaign) {
      return []
    }
    const normalized = editVariantSearch.trim().toLowerCase()
    return variantOptions
      .filter((option) => !editSelectedVariantIds.has(option.id))
      .filter((option) => {
        if (!normalized) return true
        return (
          option.productName.toLowerCase().includes(normalized) ||
          (option.variantLabel ?? "").toLowerCase().includes(normalized) ||
          (option.sku ?? "").toLowerCase().includes(normalized)
        )
      })
  }, [variantOptions, editVariantSearch, editSelectedVariantIds, editingCampaign])

  const hasInvalidCreateDiscounts = useMemo(() => {
    if (Object.keys(variantDiscountInputs).length > 0) {
      return Object.values(variantDiscountInputs).some((value) => !isDiscountInputValueValid(value))
    }
    return selectedVariants.some((variant) => !isDiscountPercentValid(variant.discountPercent))
  }, [variantDiscountInputs, selectedVariants])

  const hasInvalidCampaignDiscounts = useMemo(() => {
    if (!editingCampaign) {
      return Object.keys(campaignVariantDiscountInputs).length > 0
    }
    if (Object.keys(campaignVariantDiscountInputs).length > 0) {
      return Object.values(campaignVariantDiscountInputs).some((value) => !isDiscountInputValueValid(value))
    }
    return editingCampaign.variants.some((variant) => !isDiscountPercentValid(variant.discountPercent))
  }, [campaignVariantDiscountInputs, editingCampaign])

  const clearPendingCreateDiscountInput = useCallback((variantId: number) => {
    setVariantDiscountInputs((prev) => {
      if (!(variantId in prev)) {
        return prev
      }
      const next = { ...prev }
      delete next[variantId]
      return next
    })
  }, [])

  const clearPendingCampaignDiscountInput = useCallback((variantId: number) => {
    setCampaignVariantDiscountInputs((prev) => {
      if (!(variantId in prev)) {
        return prev
      }
      const next = { ...prev }
      delete next[variantId]
      return next
    })
  }, [])

  const uploadBannerAsset = useCallback(async (file: File) => {
    const payload = new FormData()
    payload.append("file", file)
    payload.append("prefix", `campaign-banner-${Date.now()}`)

    const response = await fetch("/api/uploads/campaigns", {
      method: "POST",
      body: payload,
    })

    const body = await response.json().catch(() => ({}))

    if (!response.ok || typeof body.url !== "string") {
      throw new Error(body.error || "Failed to upload banner image")
    }

    return body.url as string
  }, [])

  const handleBannerFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setIsUploadingBanner(true)
    try {
      const url = await uploadBannerAsset(file)
      setBannerImage(url)
      toast({
        title: "Banner uploaded",
        description: "Use the preview below to confirm it looks right.",
      })
    } catch (error) {
      console.error("[admin][discounts] Failed to upload banner", error)
      toast({
        title: "Could not upload banner",
        description: error instanceof Error ? error.message : "Unexpected error uploading banner image.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingBanner(false)
      event.target.value = ""
    }
  }

  const handleEditBannerFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !editingCampaign) {
      event.target.value = ""
      return
    }

    setIsUploadingEditBanner(true)
    try {
      const url = await uploadBannerAsset(file)
      setEditingCampaign((prev) => (prev ? { ...prev, bannerImage: url } : prev))
      toast({
        title: "Banner updated",
        description: "This campaign will use the refreshed banner after saving.",
      })
    } catch (error) {
      console.error("[admin][discounts] Failed to upload banner", error)
      toast({
        title: "Could not upload banner",
        description: error instanceof Error ? error.message : "Unexpected error uploading banner image.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingEditBanner(false)
      event.target.value = ""
    }
  }

  const handleRemoveBannerImage = () => {
    setBannerImage("")
  }

  const handleRemoveEditingBannerImage = () => {
    setEditingCampaign((prev) => (prev ? { ...prev, bannerImage: "" } : prev))
  }

  const fetchCampaigns = useCallback(async () => {
    setIsLoadingCampaigns(true)
    try {
      const response = await fetch("/api/discounts")
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.error || "Failed to load campaigns")
      }
      setCampaigns(Array.isArray(payload.data) ? payload.data : [])
    } catch (error) {
      console.error("[admin][discounts] Failed to load campaigns", error)
      toast({
        title: "Could not load discount campaigns",
        description: "Please try refreshing.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCampaigns(false)
    }
  }, [toast])

  useEffect(() => {
    void fetchCampaigns()
  }, [fetchCampaigns])

  const handleAddVariant = (option: VariantOption) => {
    if (selectedIds.has(option.id)) {
      return
    }
    if (formError) {
      setFormError(null)
    }
    setSelectedVariants((prev) => [...prev, { ...option, discountPercent: 10 }])
  }

  const handleDiscountChange = (variantId: number, value: string) => {
    if (formError) {
      setFormError(null)
    }
    if (value === "") {
      setVariantDiscountInputs((prev) => ({ ...prev, [variantId]: "" }))
      return
    }
    const numeric = Number(value)
    if (!Number.isFinite(numeric) || !isDiscountPercentValid(numeric)) {
      setVariantDiscountInputs((prev) => ({ ...prev, [variantId]: value }))
      return
    }
    clearPendingCreateDiscountInput(variantId)
    setSelectedVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId ? { ...variant, discountPercent: clampPercent(numeric) } : variant,
      ),
    )
  }

  const handleRemoveVariant = (variantId: number) => {
    clearPendingCreateDiscountInput(variantId)
    setSelectedVariants((prev) => prev.filter((variant) => variant.id !== variantId))
  }

  const handleOpenCampaignDialog = (campaign: DiscountCampaign) => {
    setEditingCampaign({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description ?? "",
      bannerImage: campaign.bannerImage ?? "",
      dateRange: {
        from: parseISO(campaign.startDate),
        to: parseISO(campaign.endDate),
      },
      isActive: campaign.isActive,
      variants: campaign.variants.map((variant) => ({ ...variant })),
    })
    setCampaignDialogError(null)
    setEditVariantSearch("")
    setIsVariantPickerOpen(false)
    setCampaignVariantDiscountInputs({})
  }

  const handleCloseCampaignDialog = () => {
    setEditingCampaign(null)
    setCampaignDialogError(null)
    setEditVariantSearch("")
    setIsVariantPickerOpen(false)
    setCampaignVariantDiscountInputs({})
  }

  const handleCampaignVariantDiscountChange = (variantId: number, value: string) => {
    setCampaignDialogError(null)
    if (value === "") {
      setCampaignVariantDiscountInputs((prev) => ({ ...prev, [variantId]: "" }))
      return
    }
    const numeric = Number(value)
    if (!Number.isFinite(numeric) || !isDiscountPercentValid(numeric)) {
      setCampaignVariantDiscountInputs((prev) => ({ ...prev, [variantId]: value }))
      return
    }
    clearPendingCampaignDiscountInput(variantId)
    setEditingCampaign((prev) =>
      prev
        ? {
          ...prev,
          variants: prev.variants.map((variant) =>
            variant.variantId === variantId ? { ...variant, discountPercent: clampPercent(numeric) } : variant,
          ),
        }
        : prev,
    )
  }

  const handleCampaignVariantRemove = (variantId: number) => {
    setCampaignDialogError(null)
    clearPendingCampaignDiscountInput(variantId)
    setEditingCampaign((prev) =>
      prev
        ? {
          ...prev,
          variants: prev.variants.filter((variant) => variant.variantId !== variantId),
        }
        : prev,
    )
  }

  const handleCampaignVariantAdd = (option: VariantOption) => {
    setCampaignDialogError(null)
    setEditingCampaign((prev) => {
      if (!prev || prev.variants.some((variant) => variant.variantId === option.id)) {
        return prev
      }

      const newVariant: DiscountCampaignVariant = {
        id: -option.id,
        campaignId: prev.id,
        variantId: option.id,
        productId: option.productId,
        productName: option.productName,
        variantLabel: option.variantLabel,
        sku: option.sku,
        color: null,
        image: option.image,
        basePrice: option.price,
        discountPercent: 10,
        createdAt: undefined,
        updatedAt: undefined,
      }

      return {
        ...prev,
        variants: [...prev.variants, newVariant],
      }
    })
    clearPendingCampaignDiscountInput(option.id)
    setEditVariantSearch("")
    setIsVariantPickerOpen(false)
  }

  const handleSaveCampaignChanges = async () => {
    if (!editingCampaign) {
      return
    }
    if (hasInvalidCampaignDiscounts) {
      setCampaignDialogError("Resolve invalid discount percentages before saving.")
      return
    }

    const trimmedName = editingCampaign.name.trim()
    const trimmedDescription = editingCampaign.description.trim()
    const trimmedBannerImage = editingCampaign.bannerImage.trim()
    const from = editingCampaign.dateRange?.from
    const to = editingCampaign.dateRange?.to

    if (!trimmedName) {
      setCampaignDialogError("Give this campaign a name.")
      return
    }

    if (!from || !to) {
      setCampaignDialogError("Select a start and end date.")
      return
    }

    if (to < from) {
      setCampaignDialogError("End date must be after the start date.")
      return
    }

    if (editingCampaign.variants.length === 0) {
      setCampaignDialogError("Add at least one variant to this campaign.")
      return
    }

    setCampaignDialogError(null)
    setIsUpdatingCampaign(true)

    try {
      const payload = {
        name: trimmedName,
        description: trimmedDescription.length > 0 ? trimmedDescription : undefined,
        bannerImageUrl: trimmedBannerImage.length > 0 ? trimmedBannerImage : undefined,
        startDate: format(from, "yyyy-MM-dd"),
        endDate: format(to, "yyyy-MM-dd"),
        isActive: editingCampaign.isActive,
        variants: editingCampaign.variants.map((variant) => ({
          variantId: variant.variantId,
          discountPercent: Number(variant.discountPercent.toFixed(2)),
        })),
      }

      const response = await fetch(`/api/discounts/${editingCampaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const body = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(body.error || "Failed to update discount campaign")
      }

      const updated = body.data as DiscountCampaign | undefined
      if (updated) {
        setCampaigns((prev) => prev.map((campaign) => (campaign.id === updated.id ? updated : campaign)))
      }

      toast({
        title: "Campaign updated",
        description: "Your changes have been saved.",
      })
      handleCloseCampaignDialog()
    } catch (error) {
      console.error("[admin][discounts] Failed to update campaign", error)
      const message = error instanceof Error ? error.message : "Unexpected error updating discount campaign."
      setCampaignDialogError(message)
      toast({
        title: "Could not update campaign",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsUpdatingCampaign(false)
    }
  }

  const handleRequestDeleteCampaign = (campaign: DiscountCampaign) => {
    setCampaignToDelete(campaign)
  }

  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) {
      return
    }
    setIsDeletingCampaign(true)
    try {
      const response = await fetch(`/api/discounts/${campaignToDelete.id}`, {
        method: "DELETE",
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(body.error || "Failed to delete campaign")
      }
      setCampaigns((prev) => prev.filter((campaign) => campaign.id !== campaignToDelete.id))
      toast({
        title: "Campaign deleted",
        description: "The scheduled discount was removed.",
      })
      setCampaignToDelete(null)
    } catch (error) {
      console.error("[admin][discounts] Failed to delete campaign", error)
      toast({
        title: "Could not delete campaign",
        description: error instanceof Error ? error.message : "Unexpected error deleting discount campaign.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingCampaign(false)
    }
  }

  const handleCreateCampaign = async () => {
    const trimmedName = campaignName.trim()
    const trimmedDescription = description.trim()
    const trimmedBannerImage = bannerImage.trim()
    const from = dateRange?.from
    const to = dateRange?.to

    if (!trimmedName) {
      setFormError("Give your campaign a name.")
      return
    }

    if (!from || !to) {
      setFormError("Select a start and end date.")
      return
    }

    if (to < from) {
      setFormError("End date must be after the start date.")
      return
    }

    if (selectedVariants.length === 0) {
      setFormError("Select at least one product variant to discount.")
      return
    }

    if (hasInvalidCreateDiscounts) {
      setFormError("Resolve invalid discount percentages before creating.")
      return
    }

    setFormError(null)
    setIsSubmitting(true)

    try {
      const payload = {
        name: trimmedName,
        description: trimmedDescription.length > 0 ? trimmedDescription : undefined,
        bannerImageUrl: trimmedBannerImage.length > 0 ? trimmedBannerImage : "",
        startDate: format(from, "yyyy-MM-dd"),
        endDate: format(to, "yyyy-MM-dd"),
        variants: selectedVariants.map((variant) => ({
          variantId: variant.id,
          discountPercent: Number(variant.discountPercent.toFixed(2)),
        })),
      }

      const response = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const body = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(body.error || "Failed to create discount campaign")
      }

      const created = body.data as DiscountCampaign | undefined
      if (created) {
        setCampaigns((prev) => [created, ...prev])
      }

      setCampaignName("")
      setDescription("")
      setBannerImage("")
      setDateRange(DEFAULT_RANGE)
      setSelectedVariants([])
      setVariantDiscountInputs({})

      toast({
        title: "Discount campaign created",
        description: "Your variants will reflect the discount during the selected schedule.",
      })
    } catch (error) {
      console.error("[admin][discounts] Failed to create campaign", error)
      toast({
        title: "Could not create campaign",
        description: error instanceof Error ? error.message : "Unexpected error creating discount campaign.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-[95vw]">
      {/* Header */}
      <div className="inv-page-header">
        <div>
          <h1 className="inv-page-title">Discount Campaigns</h1>
          <p className="inv-page-subtitle">Create and manage promotional discounts for your product variants.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            className="inv-page-btn inv-page-btn-outline"
            onClick={() => void fetchCampaigns()}
            disabled={isLoadingCampaigns}
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isLoadingCampaigns && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3 items-stretch">
          <div className="lg:col-span-2">
            <Card className="border-border/80 shadow-sm overflow-hidden h-full">
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Create new campaign</CardTitle>
                <CardDescription>Launch a new promotion by selecting products and setting a schedule.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="campaign-name" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Campaign Name</Label>
                      <Input
                        id="campaign-name"
                        placeholder="e.g. Summer Sale 2024"
                        value={campaignName}
                        onChange={(event) => {
                          setCampaignName(event.target.value)
                          if (formError) setFormError(null)
                        }}
                        className="h-9 focus:ring-1 focus:ring-accent"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="campaign-description" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Description (Optional)</Label>
                      <Textarea
                        id="campaign-description"
                        placeholder="Internal notes or public description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        className="min-h-[100px] resize-none focus:ring-1 focus:ring-accent"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Banner image</Label>
                      <div className="rounded-xl border border-dashed border-border p-4 bg-muted/10">
                        {bannerImage ? (
                          <div className="relative mb-3 aspect-video overflow-hidden rounded-lg border border-border pb-2">
                            <div
                              className="h-full w-full bg-cover bg-center"
                              style={{ backgroundImage: `url(${bannerImage})` }}
                              role="img"
                              aria-label="Banner preview"
                            />
                          </div>
                        ) : (
                          <div className="mb-3 flex flex-col items-center justify-center py-4 text-center">
                            <ImagePlus className="h-8 w-8 text-muted-foreground/40 mb-2" />
                            <p className="text-xs text-muted-foreground">
                              Upload a landscape banner image
                            </p>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="h-8 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted/50 border border-border/50 hover:bg-muted"
                            onClick={() => bannerUploadInputRef.current?.click()}
                            disabled={isSubmitting || isUploadingBanner}
                          >
                            {isUploadingBanner ? (
                              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ImagePlus className="mr-2 h-3.5 w-3.5" />
                            )}
                            {bannerImage ? "Change banner" : "Upload banner"}
                          </Button>
                          {bannerImage && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 rounded-full text-xs font-bold uppercase tracking-wider text-destructive hover:bg-destructive/10"
                              onClick={handleRemoveBannerImage}
                              disabled={isSubmitting}
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Remove
                            </Button>
                          )}
                        </div>
                        <input
                          ref={bannerUploadInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBannerFileChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="opacity-50" />

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="campaign-start-date" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Start date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="campaign-start-date"
                          variant="outline"
                          className={cn(
                            "w-full h-10 justify-start text-left text-xs font-bold bg-muted/10 border-border/60",
                            !dateRange?.from && "text-muted-foreground",
                          )}
                        >
                          <CalendarRange className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                          {dateRange?.from ? format(dateRange.from, "MMM d, yyyy") : <span>Select start date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange?.from}
                          defaultMonth={dateRange?.from ?? dateRange?.to ?? new Date()}
                          onSelect={(selectedDate) => {
                            if (!selectedDate) {
                              return
                            }
                            setDateRange((prev) => {
                              const nextTo = prev?.to && prev.to < selectedDate ? selectedDate : prev?.to
                              return { from: selectedDate, to: nextTo }
                            })
                            if (formError) setFormError(null)
                          }}
                          numberOfMonths={1}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="campaign-end-date">End date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="campaign-end-date"
                          variant="outline"
                          className={cn(
                            "w-full h-10 justify-start text-left text-xs font-bold bg-muted/10 border-border/60",
                            !dateRange?.to && "text-muted-foreground",
                          )}
                        >
                          <CalendarRange className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                          {dateRange?.to ? format(dateRange.to, "MMM d, yyyy") : <span>Select end date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange?.to}
                          defaultMonth={dateRange?.to ?? dateRange?.from ?? new Date()}
                          onSelect={(selectedDate) => {
                            if (!selectedDate) {
                              return
                            }
                            setDateRange((prev) => {
                              const start = prev?.from
                              if (!start || selectedDate < start) {
                                return { from: selectedDate, to: selectedDate }
                              }
                              return { from: start, to: selectedDate }
                            })
                            if (formError) setFormError(null)
                          }}
                          numberOfMonths={1}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Selected variants</Label>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Define discounts for each item</p>
                    </div>
                    {selectedVariants.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          setSelectedVariants([])
                          setVariantDiscountInputs({})
                        }}
                        disabled={isSubmitting}
                      >
                        Clear All
                      </Button>
                    )}
                  </div>

                  {selectedVariants.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/60 p-8 text-center bg-muted/5">
                      <Plus className="mx-auto h-8 w-8 text-muted-foreground/20 mb-2" />
                      <p className="text-xs text-muted-foreground">No variants selected. Use the browser on the right to add products.</p>
                    </div>
                  ) : (
                    <div className="ord-table-wrap">
                      <table className="ord-table-root">
                        <thead className="ord-table-head">
                          <tr>
                            <th className="ord-table-th">Variant</th>
                            <th className="ord-table-th text-right">Base</th>
                            <th className="ord-table-th text-center">Discount %</th>
                            <th className="ord-table-th text-right">New Price</th>
                            <th className="ord-table-th" />
                          </tr>
                        </thead>
                        <tbody>
                          {selectedVariants.map((variant) => {
                            const discountedPrice = Math.max(
                              0,
                              variant.price - (variant.price * variant.discountPercent) / 100,
                            )
                            return (
                              <tr key={variant.id} className="ord-table-row">
                                <td className="py-3">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="h-10 w-10 rounded-lg border border-border/50 bg-cover bg-center shadow-sm"
                                      style={{ backgroundImage: `url(${variant.image})` }}
                                    />
                                    <div className="flex flex-col">
                                      <p className="text-xs font-bold text-foreground">
                                        {getVariantDisplayName(variant)}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground">
                                        Stock: {variant.stock.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-right text-xs font-medium text-muted-foreground">{formatCurrency(variant.price)}</td>
                                <td className="text-center">
                                  <Input
                                    type="number"
                                    inputMode="decimal"
                                    min={0.1}
                                    max={100}
                                    step={0.5}
                                    className="h-8 w-20 text-center mx-auto text-xs font-bold focus:ring-1 focus:ring-accent"
                                    value={variantDiscountInputs[variant.id] ?? String(variant.discountPercent)}
                                    onChange={(event) => handleDiscountChange(variant.id, event.target.value)}
                                  />
                                </td>
                                <td className="text-right text-xs font-black text-emerald-600">
                                  {formatCurrency(discountedPrice)}
                                </td>
                                <td className="text-right">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                    onClick={() => handleRemoveVariant(variant.id)}
                                    disabled={isSubmitting}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {formError && <p className="text-xs font-bold text-destructive flex items-center gap-1.5"><X className="size-3" /> {formError}</p>}

                <div className="pt-2">
                  <Button
                    type="button"
                    disabled={isSubmitting || hasInvalidCreateDiscounts}
                    onClick={handleCreateCampaign}
                    className="w-full inv-page-btn inv-page-btn-accent shadow-lg shadow-accent/20"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Create campaign
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-border/80 shadow-sm overflow-hidden flex flex-col max-h-[800px]">
              <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Browse products</CardTitle>
                <CardDescription>Select variants to add to your campaign.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex flex-col space-y-4 overflow-hidden">
                <div className="ord-search-box group flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-muted/20 focus-within:bg-background focus-within:border-accent/40 h-10 transition-all shadow-sm">
                  <Search className="h-3.5 w-3.5 text-muted-foreground group-focus-within:text-accent" />
                  <input
                    className="ord-search-input bg-transparent border-none outline-none text-xs w-full font-medium"
                    placeholder="Search name or SKU..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>

                {isLoadingProducts ? (
                  <div className="flex flex-1 items-center justify-center py-20 text-center">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-accent mb-3" />
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Loading catalog...</p>
                    </div>
                  </div>
                ) : variantOptions.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center p-8 text-center bg-muted/10 rounded-xl border border-dashed border-border/50">
                    <p className="text-xs text-muted-foreground">No products available. Add some in Inventory first.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px] -mx-1 px-1">
                    <div className="space-y-2 pr-2">
                      {filteredOptions.length === 0 && (
                        <p className="text-xs font-bold text-muted-foreground/60 py-10 text-center uppercase tracking-widest">No matches found</p>
                      )}
                      {filteredOptions.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-white/50 p-2.5 transition-all hover:border-accent/40 hover:shadow-sm"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="h-10 w-10 rounded-lg border border-border/50 bg-cover bg-center shadow-sm flex-shrink-0"
                              style={{ backgroundImage: `url(${option.image})` }}
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">{getVariantDisplayName(option)}</p>
                              <p className="text-[10px] font-medium text-muted-foreground">
                                {formatCurrency(option.price)} <span className="mx-1">•</span> Stock {option.stock}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant={selectedIds.has(option.id) ? "ghost" : "secondary"}
                            className={cn(
                              "h-7 rounded-full px-3 text-[10px] font-bold uppercase tracking-wider transition-all",
                              selectedIds.has(option.id) ? "text-emerald-500 bg-emerald-50/50" : "bg-muted/50 border border-border/40 hover:bg-muted"
                            )}
                            onClick={() => handleAddVariant(option)}
                            disabled={selectedIds.has(option.id)}
                          >
                            {selectedIds.has(option.id) ? (
                              "Added"
                            ) : (
                              <><Plus className="mr-1 h-3 w-3" /> Add</>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <Card className="border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Scheduled campaigns</CardTitle>
                <CardDescription className="text-[10px]">Track active and upcoming promotional events.</CardDescription>
              </div>
              <Badge variant="outline" className="h-5 text-[10px] font-bold uppercase tracking-widest border-border/60 bg-white/50 px-2">
                {campaigns.length} Total
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingCampaigns ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-accent mb-3" />
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Fetching campaigns...</p>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <CalendarRange className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1">No campaigns found</h3>
                  <p className="text-xs text-muted-foreground max-w-[240px]">Create your first discount campaign to start attracting customers.</p>
                </div>
              ) : (
                <div className="ord-table-wrap border-none rounded-none shadow-none">
                  <table className="ord-table-root">
                    <thead className="ord-table-head">
                      <tr>
                        <th className="ord-table-th">Campaign & Schedule</th>
                        <th className="ord-table-th text-center">Variants</th>
                        <th className="ord-table-th text-center">Status</th>
                        <th className="ord-table-th" />
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => {
                        const status = determineCampaignStatus(campaign)
                        const startLabel = format(parseISO(campaign.startDate), "MMM d, yyyy")
                        const endLabel = format(parseISO(campaign.endDate), "MMM d, yyyy")
                        return (
                          <tr key={campaign.id} className="ord-table-row">
                            <td className="py-4">
                              <div className="flex items-center gap-4">
                                {campaign.bannerImage && (
                                  <div
                                    className="h-12 w-20 rounded-lg border border-border/40 bg-cover bg-center flex-shrink-0 shadow-sm"
                                    style={{ backgroundImage: `url(${campaign.bannerImage})` }}
                                  />
                                )}
                                <div className="min-w-0">
                                  <h3 className="text-xs font-black text-foreground uppercase tracking-tight truncate max-w-[200px]">{campaign.name}</h3>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <CalendarRange className="h-3 w-3 text-muted-foreground" />
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                      {startLabel} — {endLabel}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="inline-flex items-center justify-center h-6 px-2 rounded-full border border-border/50 bg-muted/20 text-[10px] font-black">
                                {campaign.variants.length}
                              </div>
                            </td>
                            <td className="text-center">
                              <span className={cn("ord-badge", status.badgeClass)}>
                                <span className="size-1.5 rounded-full bg-current mr-1.5 opacity-60" />
                                {status.label}
                              </span>
                            </td>
                            <td className="text-right">
                              <div className="flex items-center justify-end gap-1 px-2">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-muted-foreground hover:text-accent hover:bg-accent/5 rounded-lg"
                                  onClick={() => handleOpenCampaignDialog(campaign)}
                                  title="Edit campaign"
                                >
                                  <Pen className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg"
                                  onClick={() => handleRequestDeleteCampaign(campaign)}
                                  title="Delete campaign"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={Boolean(editingCampaign)}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseCampaignDialog()
          }
        }}
      >
        <DialogContent className="max-w-4xl p-0 gap-0 border-none shadow-2xl rounded-2xl overflow-hidden">
          {editingCampaign ? (
            <div className="flex flex-col h-[85vh]">
              <DialogHeader className="p-6 bg-muted/20 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-lg font-black uppercase tracking-tight">Edit Campaign</DialogTitle>
                    <DialogDescription className="text-xs font-medium">
                      Manage schedule, banner, and variant-specific discounts.
                    </DialogDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full border border-border/40"
                    onClick={() => handleCloseCampaignDialog()}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1">
                <div className="p-6 space-y-8 pb-32">
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="edit-campaign-name" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Campaign Name</Label>
                        <Input
                          id="edit-campaign-name"
                          value={editingCampaign.name}
                          onChange={(event) => {
                            const value = event.target.value
                            setCampaignDialogError(null)
                            setEditingCampaign((prev) => (prev ? { ...prev, name: value } : prev))
                          }}
                          className="h-9 focus:ring-1 focus:ring-accent font-bold"
                          disabled={isUpdatingCampaign}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-campaign-description" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                        <Textarea
                          id="edit-campaign-description"
                          value={editingCampaign.description}
                          placeholder="Internal notes or public description"
                          onChange={(event) => {
                            const value = event.target.value
                            setCampaignDialogError(null)
                            setEditingCampaign((prev) => (prev ? { ...prev, description: value } : prev))
                          }}
                          className="min-h-[120px] resize-none focus:ring-1 focus:ring-accent text-sm"
                          disabled={isUpdatingCampaign}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Banner image</Label>
                      <div className="rounded-xl border border-dashed border-border p-4 bg-muted/10 h-full flex flex-col justify-center min-h-[180px]">
                        {editingCampaign.bannerImage ? (
                          <div className="relative mb-3 flex-1 overflow-hidden rounded-lg border border-border">
                            <div
                              className="h-full w-full bg-cover bg-center"
                              style={{ backgroundImage: `url(${editingCampaign.bannerImage})` }}
                              role="img"
                              aria-label="Banner preview"
                            />
                          </div>
                        ) : (
                          <div className="mb-3 flex-1 flex flex-col items-center justify-center text-center py-4">
                            <ImagePlus className="h-10 w-10 text-muted-foreground/30 mb-2" />
                            <p className="text-xs text-muted-foreground">No banner uploaded</p>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-full text-[10px] font-bold uppercase tracking-wider border-border/60"
                            onClick={() => editBannerUploadInputRef.current?.click()}
                            disabled={isUpdatingCampaign || isUploadingEditBanner}
                          >
                            {isUploadingEditBanner ? (
                              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ImagePlus className="mr-2 h-3.5 w-3.5" />
                            )}
                            Change
                          </Button>
                          {editingCampaign.bannerImage && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 rounded-full text-[10px] font-bold uppercase tracking-wider text-destructive"
                              onClick={handleRemoveEditingBannerImage}
                              disabled={isUpdatingCampaign}
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Remove
                            </Button>
                          )}
                        </div>
                        <input
                          ref={editBannerUploadInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleEditBannerFileChange}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Start date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-10 justify-start text-left font-bold text-xs"
                            disabled={isUpdatingCampaign}
                          >
                            <CalendarRange className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                            {editingCampaign.dateRange?.from ? format(editingCampaign.dateRange.from, "MMM d, yyyy") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={editingCampaign.dateRange?.from}
                            defaultMonth={editingCampaign.dateRange?.from ?? new Date()}
                            onSelect={(selectedDate) => {
                              if (!selectedDate) return
                              setCampaignDialogError(null)
                              setEditingCampaign((prev) => {
                                if (!prev) return prev
                                const nextTo = prev.dateRange?.to && prev.dateRange.to < selectedDate ? selectedDate : prev.dateRange?.to
                                return {
                                  ...prev,
                                  dateRange: { from: selectedDate, to: nextTo },
                                }
                              })
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">End date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-10 justify-start text-left font-bold text-xs"
                            disabled={isUpdatingCampaign}
                          >
                            <CalendarRange className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                            {editingCampaign.dateRange?.to ? format(editingCampaign.dateRange.to, "MMM d, yyyy") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={editingCampaign.dateRange?.to}
                            defaultMonth={editingCampaign.dateRange?.to ?? new Date()}
                            onSelect={(selectedDate) => {
                              if (!selectedDate) return
                              setCampaignDialogError(null)
                              setEditingCampaign((prev) => {
                                if (!prev) return prev
                                const start = prev.dateRange?.from
                                if (!start || selectedDate < start) {
                                  return { ...prev, dateRange: { from: selectedDate, to: selectedDate } }
                                }
                                return { ...prev, dateRange: { from: start, to: selectedDate } }
                              })
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</Label>
                      <div className="h-10 px-4 rounded-lg border border-border flex items-center justify-between bg-muted/5">
                        <span className="text-xs font-bold uppercase tracking-wider">Campaign Active</span>
                        <Switch
                          checked={editingCampaign.isActive}
                          onCheckedChange={(checked) => {
                            setCampaignDialogError(null)
                            setEditingCampaign((prev) => (prev ? { ...prev, isActive: checked } : prev))
                          }}
                          disabled={isUpdatingCampaign}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Variants in campaign</Label>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{editingCampaign.variants.length} Items Listed</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingCampaign.variants.length > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              setCampaignDialogError(null)
                              setEditingCampaign((prev) => (prev ? { ...prev, variants: [] } : prev))
                              setCampaignVariantDiscountInputs({})
                            }}
                            disabled={isUpdatingCampaign}
                          >
                            Clear All
                          </Button>
                        )}
                        <Popover open={isVariantPickerOpen} onOpenChange={setIsVariantPickerOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              className="h-8 rounded-full text-[10px] font-bold uppercase tracking-wider border-border/60"
                              variant="outline"
                              disabled={isUpdatingCampaign || editSelectedVariantIds.size >= variantOptions.length}
                            >
                              <Plus className="mr-1.5 h-3.5 w-3.5" />
                              Add item
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[320px] p-0 shadow-2xl rounded-xl border-none overflow-hidden" align="end">
                            <div className="bg-muted px-4 py-3 border-b border-border">
                              <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                  placeholder="Search catalog..."
                                  value={editVariantSearch}
                                  onChange={(event) => setEditVariantSearch(event.target.value)}
                                  className="h-8 pl-8 text-xs font-bold border-border/50 bg-white"
                                />
                              </div>
                            </div>
                            <ScrollArea className="h-64">
                              {editFilteredOptions.length === 0 ? (
                                <div className="p-8 text-center">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">No results</p>
                                </div>
                              ) : (
                                <div className="p-2 space-y-1">
                                  {editFilteredOptions.map((option) => (
                                    <button
                                      type="button"
                                      key={option.id}
                                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-colors text-left group"
                                      onClick={() => handleCampaignVariantAdd(option)}
                                    >
                                      <div
                                        className="h-10 w-10 rounded border border-border/50 bg-cover bg-center shadow-sm"
                                        style={{ backgroundImage: `url(${option.image})` }}
                                      />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-foreground truncate group-hover:text-accent transition-colors">{getVariantDisplayName(option)}</p>
                                        <p className="text-[10px] font-medium text-muted-foreground">
                                          {formatCurrency(option.price)} • Stock {option.stock}
                                        </p>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="ord-table-wrap border-border/60">
                      <table className="ord-table-root">
                        <thead className="ord-table-head">
                          <tr>
                            <th className="ord-table-th">Item</th>
                            <th className="ord-table-th text-right">Base</th>
                            <th className="ord-table-th text-center">Discount %</th>
                            <th className="ord-table-th text-right">New Price</th>
                            <th className="ord-table-th" />
                          </tr>
                        </thead>
                        <tbody>
                          {editingCampaign.variants.map((variant) => {
                            const discountedPrice = Math.max(
                              0,
                              variant.basePrice - (variant.basePrice * variant.discountPercent) / 100,
                            )
                            return (
                              <tr key={variant.variantId} className="ord-table-row">
                                <td className="py-3">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="h-9 w-9 rounded-lg border border-border/50 bg-cover bg-center"
                                      style={{ backgroundImage: `url(${variant.image})` }}
                                    />
                                    <div className="flex flex-col">
                                      <p className="text-xs font-bold text-foreground">
                                        {getVariantDisplayName({
                                          productName: variant.productName,
                                          variantLabel: variant.variantLabel,
                                        })}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground uppercase font-mono">{variant.sku || "NO-SKU"}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-right text-xs font-medium text-muted-foreground">{formatCurrency(variant.basePrice)}</td>
                                <td className="text-center">
                                  <Input
                                    type="number"
                                    className="h-8 w-20 mx-auto text-center text-xs font-bold focus:ring-1 focus:ring-accent"
                                    value={campaignVariantDiscountInputs[variant.variantId] ?? String(variant.discountPercent)}
                                    onChange={(e) => handleCampaignVariantDiscountChange(variant.variantId, e.target.value)}
                                    disabled={isUpdatingCampaign}
                                  />
                                </td>
                                <td className="text-right text-xs font-black text-emerald-600">
                                  {formatCurrency(discountedPrice)}
                                </td>
                                <td className="text-right">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                    onClick={() => handleCampaignVariantRemove(variant.variantId)}
                                    disabled={isUpdatingCampaign}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-6 bg-muted/10 border-t border-border/50 backdrop-blur-sm shadow-2xl absolute bottom-0 left-0 right-0 z-10">
                <div className="flex items-center justify-between gap-4">
                  {campaignDialogError && (
                    <p className="text-xs font-black text-destructive flex items-center gap-1.5 uppercase tracking-wider">
                      <X className="h-3.5 w-3.5" /> {campaignDialogError}
                    </p>
                  )}
                  <div className="flex items-center gap-3 ml-auto">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-10 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted"
                      onClick={handleCloseCampaignDialog}
                      disabled={isUpdatingCampaign}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="h-10 px-8 inv-page-btn-accent shadow-lg shadow-accent/20"
                      onClick={handleSaveCampaignChanges}
                      disabled={isUpdatingCampaign || hasInvalidCampaignDiscounts}
                    >
                      {isUpdatingCampaign ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-3.5 w-3.5" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center p-12 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-accent mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Loading details...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(campaignToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeletingCampaign) {
            setCampaignToDelete(null)
          }
        }}
      >
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="p-6 pt-8 text-center flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <Trash2 className="h-8 w-8 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl font-black uppercase tracking-tight mb-2">Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium leading-relaxed max-w-[300px] mx-auto text-muted-foreground">
              {campaignToDelete
                ? `"${campaignToDelete.name}" and all scheduled discounts will be removed permanently.`
                : "This campaign and its discounts will be removed permanently."}
            </AlertDialogDescription>
          </div>
          <div className="p-6 bg-muted/20 border-t border-border/50 flex gap-3">
            <AlertDialogCancel className="flex-1 h-11 text-xs font-bold uppercase tracking-wider border-border/60 rounded-xl" disabled={isDeletingCampaign}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="flex-1 h-11 text-xs font-bold uppercase tracking-wider bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl shadow-lg shadow-destructive/20"
              disabled={isDeletingCampaign}
              onClick={(event) => {
                event.preventDefault()
                void handleDeleteCampaign()
              }}
            >
              {isDeletingCampaign ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Campaign"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function mapProductsToVariantOptions(products: Product[]): VariantOption[] {
  const variants: VariantOption[] = []
  products.forEach((product) => {
    product.variants.forEach((variant) => {
      variants.push({
        id: variant.id,
        productId: product.id,
        productName: product.name,
        variantLabel: deriveVariantLabel(variant),
        sku: variant.sku ?? null,
        image: variant.image ?? product.image,
        price: getVariantBasePrice(variant),
        stock: getVariantTotalStock(variant),
        brandName: product.brand?.name ?? null,
      })
    })
  })
  return variants.sort((a, b) => {
    const productCompare = a.productName.localeCompare(b.productName)
    if (productCompare !== 0) {
      return productCompare
    }
    return (a.variantLabel ?? "").localeCompare(b.variantLabel ?? "")
  })
}

function deriveVariantLabel(variant: ProductVariant): string | null {
  if (variant.color && variant.color.trim().length > 0) {
    return variant.color.trim()
  }
  if (variant.sku && variant.sku.trim().length > 0) {
    return variant.sku.trim()
  }
  return null
}

function getVariantBasePrice(variant: ProductVariant): number {
  const prices = variant.sizes?.map((size) => size.price).filter((price) => Number.isFinite(price)) ?? []
  if (prices.length > 0) {
    return Math.min(...prices)
  }
  return Number.isFinite(variant.price) ? variant.price : 0
}

function getVariantTotalStock(variant: ProductVariant): number {
  const stockFromSizes = variant.sizes?.reduce((sum, size) => sum + size.stock, 0) ?? 0
  return stockFromSizes > 0 ? stockFromSizes : variant.stock
}

function getVariantDisplayName(option: Pick<VariantOption, "productName" | "variantLabel">): string {
  return option.variantLabel ? `${option.productName} - ${option.variantLabel}` : `${option.productName} - Classic`
}

function isDiscountPercentValid(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && value < 100
}

function isDiscountInputValueValid(value: string) {
  if (value.trim() === "") {
    return false
  }
  const numeric = Number(value)
  return Number.isFinite(numeric) && isDiscountPercentValid(numeric)
}

function clampPercent(value: number) {
  if (value < 0.1) return 0.1
  if (value > 100) return 100
  return Number(value.toFixed(2))
}

function determineCampaignStatus(campaign: DiscountCampaign): { label: string; badgeClass: string } {
  if (!campaign.isActive) {
    return { label: "Paused", badgeClass: "ord-badge-cancelled" }
  }
  const now = new Date()
  const start = parseISO(campaign.startDate)
  const end = endOfDay(parseISO(campaign.endDate))

  if (now < start) {
    return { label: "Upcoming", badgeClass: "ord-badge-evaluation" }
  }

  if (now > end) {
    return { label: "Expired", badgeClass: "ord-badge-cancelled" }
  }

  return { label: "Active", badgeClass: "ord-badge-completed" }
}
