"use client"

import { useState, useCallback, useEffect } from "react"
import { Check, ChevronLeft, ChevronRight, ImagePlus, Plus, Pencil, Trash, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import type { ManagedImageItem } from "./types"
import type { CarouselApi } from "@/components/ui/carousel"

/* ─── Step Definitions ─── */

const STEPS = [
    { key: "info", label: "Variant Info" },
    { key: "photos", label: "Photos" },
    { key: "settings", label: "Settings & Sizes" },
] as const

/* ─── Wizard Stepper (shared pattern) ─── */

function WizardStepper({ current, onStepClick }: { current: number; onStepClick: (index: number) => void }) {
    return (
        <div className="inv-wizard-stepper">
            {STEPS.map((step, i) => {
                const isActive = i === current
                const isCompleted = i < current
                return (
                    <div key={step.key} className="inv-wizard-step" style={{ position: "relative" }}>
                        {i < STEPS.length - 1 && (
                            <div
                                className={`inv-wizard-connector ${i < current ? "inv-wizard-connector-done" : ""}`}
                                style={{
                                    left: "calc(50% + 0.875rem)",
                                    right: "calc(-50% + 0.875rem)",
                                    width: "calc(100% - 1.75rem)",
                                }}
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => onStepClick(i)}
                            className="flex flex-col items-center gap-1.5"
                            style={{ position: "relative", zIndex: 1 }}
                        >
                            <span
                                className={`inv-wizard-dot ${isActive ? "inv-wizard-dot-active" : isCompleted ? "inv-wizard-dot-completed" : ""}`}
                            >
                                {isCompleted ? <Check className="w-3 h-3" /> : i + 1}
                            </span>
                            <span className={`inv-wizard-label ${isActive ? "inv-wizard-label-active" : ""}`}>
                                {step.label}
                            </span>
                        </button>
                    </div>
                )
            })}
        </div>
    )
}

/* ─── Size Row Type ─── */

interface VariantSizeRow {
    key: string
    size: string
    price: string
    stock: string
}

/* ─── Props ─── */

export interface VariantFormDialogProps {
    mode: "add" | "edit"
    open: boolean
    onClose: () => void
    productName: string | undefined
    // Variant Info
    variantName: string
    onVariantNameChange: (v: string) => void
    variantSku: string
    onVariantSkuChange: (v: string) => void
    variantDescription: string
    onVariantDescriptionChange: (v: string) => void
    // Images
    variantImages: ManagedImageItem[]
    onRequestImageAdd: () => void
    onRequestImageEdit: (id: string) => void
    onImageRemove: (id: string) => void
    setCarouselApi: (api: CarouselApi) => void
    addImageInputRef: React.RefObject<HTMLInputElement | null>
    editImageInputRef: React.RefObject<HTMLInputElement | null>
    onImagesAdd: (files: FileList | null) => void
    onImageEdit: (files: FileList | null) => void
    // Toggles
    isPreorder: boolean
    onPreorderChange: (v: boolean) => void
    isActive: boolean
    onActiveChange: (v: boolean) => void
    // Pre-order settings
    preorderDownPaymentType: "none" | "percent" | "amount"
    onPreorderDownPaymentTypeChange: (v: "none" | "percent" | "amount") => void
    preorderDownPaymentValue: string
    onPreorderDownPaymentValueChange: (v: string) => void
    preorderMessage: string
    onPreorderMessageChange: (v: string) => void
    downPaymentPreview: string | null
    // Sizes
    variantSizes: VariantSizeRow[]
    addSizeRow: () => void
    removeSizeRow: (key: string) => void
    updateSizeRow: (key: string, field: "size" | "price" | "stock", value: string) => void
    // Submit
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    isSaving: boolean
    hasProduct: boolean
}

export function VariantFormDialog({
    mode,
    open,
    onClose,
    productName,
    variantName,
    onVariantNameChange,
    variantSku,
    onVariantSkuChange,
    variantDescription,
    onVariantDescriptionChange,
    variantImages,
    onRequestImageAdd,
    onRequestImageEdit,
    onImageRemove,
    setCarouselApi,
    addImageInputRef,
    editImageInputRef,
    onImagesAdd,
    onImageEdit,
    isPreorder,
    onPreorderChange,
    isActive,
    onActiveChange,
    preorderDownPaymentType,
    onPreorderDownPaymentTypeChange,
    preorderDownPaymentValue,
    onPreorderDownPaymentValueChange,
    preorderMessage,
    onPreorderMessageChange,
    downPaymentPreview,
    variantSizes,
    addSizeRow,
    removeSizeRow,
    updateSizeRow,
    onSubmit,
    isSaving,
    hasProduct,
}: VariantFormDialogProps) {
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        if (open) setCurrentStep(0)
    }, [open])

    const isLastStep = currentStep === STEPS.length - 1
    const isFirstStep = currentStep === 0

    const handleNext = useCallback(() => {
        if (currentStep === 0 && !variantName.trim()) return
        if (!isLastStep) setCurrentStep((s) => s + 1)
    }, [currentStep, isLastStep, variantName])

    const handleBack = useCallback(() => {
        if (!isFirstStep) setCurrentStep((s) => s - 1)
    }, [isFirstStep])

    const handleNameKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                e.preventDefault()
                handleNext()
            }
        },
        [handleNext],
    )

    // Explicit submit without <form>
    const handleFinalSubmit = useCallback(() => {
        if (!variantName.trim() || !hasProduct) return
        const tempForm = document.createElement("form")
        document.body.appendChild(tempForm)
        const event = new Event("submit", { bubbles: true, cancelable: true })
        Object.defineProperty(event, "currentTarget", { value: tempForm })
        Object.defineProperty(event, "target", { value: tempForm })
        Object.defineProperty(event, "preventDefault", { value: () => { } })
        onSubmit(event as unknown as React.FormEvent<HTMLFormElement>)
        document.body.removeChild(tempForm)
    }, [variantName, hasProduct, onSubmit])

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
            <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto md:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{mode === "add" ? "Add Product Variant" : "Edit Product Variant"}</DialogTitle>
                    <DialogDescription>
                        {productName
                            ? (mode === "add"
                                ? `Create a new variant for ${productName}.`
                                : `Update the variant details for ${productName}.`)
                            : "Select a product to manage variants."}
                    </DialogDescription>
                </DialogHeader>

                <WizardStepper current={currentStep} onStepClick={setCurrentStep} />

                <div>
                    <div className="inv-wizard-content">
                        {/* ─── Step 1: Variant Info ─── */}
                        {currentStep === 0 && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">Variant Info</h3>
                                    <p className="text-xs text-muted-foreground">Name and describe this variant.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="wiz-variant-name" className="text-sm font-medium">
                                            Variant Name
                                        </Label>
                                        <Input
                                            id="wiz-variant-name"
                                            value={variantName}
                                            onChange={(e) => onVariantNameChange(e.target.value)}
                                            onKeyDown={handleNameKeyDown}
                                            placeholder="e.g. Navy Blue, Large"
                                            className="h-11 text-base rounded-xl border-border/70"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="wiz-variant-sku" className="text-sm font-medium">
                                            SKU <span className="font-normal text-muted-foreground">(optional)</span>
                                        </Label>
                                        <Input
                                            id="wiz-variant-sku"
                                            value={variantSku}
                                            onChange={(e) => onVariantSkuChange(e.target.value)}
                                            placeholder="e.g. TSHIRT-NB-L"
                                            className="h-11 rounded-xl border-border/70"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="wiz-variant-desc" className="text-sm font-medium">
                                            Description <span className="font-normal text-muted-foreground">(optional)</span>
                                        </Label>
                                        <Textarea
                                            id="wiz-variant-desc"
                                            value={variantDescription}
                                            onChange={(e) => onVariantDescriptionChange(e.target.value)}
                                            rows={3}
                                            placeholder="Describe what makes this variant unique."
                                            className="rounded-xl border-border/70 resize-none"
                                            disabled={isSaving}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── Step 2: Photos ─── */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">Variant Photos</h3>
                                    <p className="text-xs text-muted-foreground">Upload photos for this variant.</p>
                                </div>
                                {variantImages.length === 0 && (
                                    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-foreground/[0.02] px-4 py-3">
                                        <ImagePlus className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <p className="text-xs text-muted-foreground">
                                            Variants with photos get <span className="font-semibold text-foreground">3× more clicks</span>. Upload at least one photo.
                                        </p>
                                    </div>
                                )}
                                <div className="flex flex-col items-center gap-4">
                                    <Carousel className="w-full max-w-2xl md:max-w-xl" setApi={setCarouselApi} opts={{ align: "start" }}>
                                        <CarouselContent className="-ml-4">
                                            {variantImages.map((image, index) => (
                                                <CarouselItem key={image.id} className="basis-full pl-4 sm:basis-1/2 lg:basis-1/3">
                                                    <div className="group relative overflow-hidden rounded-2xl border border-border bg-muted">
                                                        <img src={image.previewUrl} alt={`Variant image ${index + 1}`} className="aspect-square w-full object-cover" />
                                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />
                                                        <div className="absolute inset-0 flex flex-col justify-between p-3 opacity-0 transition group-hover:opacity-100">
                                                            <div className="flex justify-end"><span className="rounded-full bg-background/80 px-2 py-1 text-xs font-semibold text-foreground shadow-sm">Image {index + 1}</span></div>
                                                            <div className="flex items-center justify-between gap-2">
                                                                <Button type="button" variant="secondary" size="sm" className="pointer-events-auto rounded-full px-3 text-xs uppercase tracking-[0.2em]" onClick={() => onRequestImageEdit(image.id)} disabled={isSaving}><Pencil className="h-3.5 w-3.5" /></Button>
                                                                <Button type="button" variant="destructive" size="sm" className="pointer-events-auto rounded-full px-3 text-xs uppercase tracking-[0.2em]" onClick={() => onImageRemove(image.id)} disabled={isSaving}><Trash className="h-3.5 w-3.5" /></Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                            <CarouselItem className="basis-full pl-4 sm:basis-1/2 lg:basis-1/3">
                                                <button type="button" onClick={onRequestImageAdd} disabled={isSaving} className="flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-dashed border-border text-muted-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60">
                                                    <div className="flex flex-col items-center gap-2"><Plus className="h-6 w-6" /><span className="text-xs font-semibold uppercase tracking-[0.3em]">Add Image</span></div>
                                                </button>
                                            </CarouselItem>
                                        </CarouselContent>
                                        {variantImages.length > 0 && <><CarouselPrevious className="hidden sm:flex" /><CarouselNext className="hidden sm:flex" /></>}
                                    </Carousel>
                                    <p className="text-center text-xs text-muted-foreground">Hover over an image to replace or remove it.</p>
                                </div>
                                <input ref={addImageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { onImagesAdd(e.target.files); if (e.target) e.target.value = "" }} />
                                <input ref={editImageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { onImageEdit(e.target.files); if (e.target) e.target.value = "" }} />
                            </div>
                        )}

                        {/* ─── Step 3: Settings & Sizes ─── */}
                        {currentStep === 2 && (
                            <div className="space-y-5">
                                {/* Settings row — flat toggles */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Settings</h3>
                                    <div className="flex items-center justify-between py-1">
                                        <div>
                                            <span className="text-sm font-medium text-foreground">Pre-order</span>
                                            <p className="text-[11px] text-muted-foreground leading-tight">Allow ordering when out of stock</p>
                                        </div>
                                        <Switch
                                            id="wiz-variant-preorder"
                                            checked={isPreorder}
                                            onCheckedChange={(v) => {
                                                onPreorderChange(Boolean(v))
                                                if (!v) {
                                                    onPreorderDownPaymentTypeChange("none")
                                                    onPreorderDownPaymentValueChange("")
                                                    onPreorderMessageChange("")
                                                }
                                            }}
                                            disabled={isSaving}
                                        />
                                    </div>

                                    {/* Pre-order details — appears inline */}
                                    {isPreorder && (
                                        <div className="ml-0 pl-3 border-l-2 border-primary/20 space-y-2">
                                            <div className="grid gap-2 sm:grid-cols-2">
                                                <div className="space-y-1">
                                                    <Label htmlFor="wiz-dp-type" className="text-xs text-muted-foreground">Down payment</Label>
                                                    <Select
                                                        value={preorderDownPaymentType}
                                                        onValueChange={(v: "none" | "percent" | "amount") => {
                                                            onPreorderDownPaymentTypeChange(v)
                                                            if (v === "none") onPreorderDownPaymentValueChange("")
                                                        }}
                                                        disabled={isSaving}
                                                    >
                                                        <SelectTrigger id="wiz-dp-type" className="h-8 rounded-lg border-border/50 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">None</SelectItem>
                                                            <SelectItem value="percent">Percentage</SelectItem>
                                                            <SelectItem value="amount">Fixed amount</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                {preorderDownPaymentType !== "none" && (
                                                    <div className="space-y-1">
                                                        <Label htmlFor="wiz-dp-value" className="text-xs text-muted-foreground">{preorderDownPaymentType === "percent" ? "%" : "₱"}</Label>
                                                        <div className="flex items-center gap-2">
                                                            <Input id="wiz-dp-value" type="number" min="0" step="0.01" value={preorderDownPaymentValue} onChange={(e) => onPreorderDownPaymentValueChange(e.target.value)} placeholder={preorderDownPaymentType === "percent" ? "30" : "500"} disabled={isSaving} className="h-8 rounded-lg border-border/50 text-xs" />
                                                            {downPaymentPreview && preorderDownPaymentType === "percent" && (
                                                                <span className="text-[11px] text-muted-foreground whitespace-nowrap">≈ {downPaymentPreview}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="wiz-preorder-msg" className="text-xs text-muted-foreground">Note to customers</Label>
                                                <Textarea id="wiz-preorder-msg" value={preorderMessage} onChange={(e) => onPreorderMessageChange(e.target.value)} placeholder="e.g. Ships in 2-3 weeks" rows={2} disabled={isSaving} className="rounded-lg border-border/50 resize-none text-xs" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="h-px bg-border/40" />

                                    <div className="flex items-center justify-between py-1">
                                        <div>
                                            <span className="text-sm font-medium text-foreground">Visible</span>
                                            <p className="text-[11px] text-muted-foreground leading-tight">Show in storefront catalog</p>
                                        </div>
                                        <Switch
                                            id="wiz-variant-active"
                                            checked={isActive}
                                            onCheckedChange={(v) => onActiveChange(Boolean(v))}
                                            disabled={isSaving}
                                        />
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-border/40" />

                                {/* Sizes — clean table style */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sizes &amp; Pricing</h3>
                                        <button type="button" onClick={addSizeRow} disabled={isSaving} className="text-xs font-medium text-primary hover:text-primary/80 transition disabled:opacity-50">
                                            + Add row
                                        </button>
                                    </div>

                                    {/* Column headers */}
                                    <div className="hidden md:grid gap-2 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_2rem] text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-0.5">
                                        <span>Size</span>
                                        <span>Price</span>
                                        <span>Stock</span>
                                        <span />
                                    </div>

                                    {/* Size rows */}
                                    <div className="space-y-1.5">
                                        {variantSizes.map((row, index) => (
                                            <div key={row.key} className="grid gap-2 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_2rem] items-center">
                                                <Input id={`wvs-${row.key}`} placeholder={variantSizes.length > 1 ? `Size #${index + 1}` : "Optional"} value={row.size} onChange={(e) => updateSizeRow(row.key, "size", e.target.value)} disabled={isSaving} className="h-8 rounded-lg border-border/50 text-sm" />
                                                <Input id={`wvp-${row.key}`} type="number" min="0" step="0.01" placeholder="0.00" value={row.price} onChange={(e) => updateSizeRow(row.key, "price", e.target.value)} required disabled={isSaving} className="h-8 rounded-lg border-border/50 text-sm" />
                                                <Input id={`wvq-${row.key}`} type="number" min="0" step="1" placeholder={isPreorder ? "—" : "0"} value={row.stock} onChange={(e) => updateSizeRow(row.key, "stock", e.target.value)} required={!isPreorder} disabled={isSaving || isPreorder} className="h-8 rounded-lg border-border/50 text-sm" />
                                                <button type="button" onClick={() => removeSizeRow(row.key)} disabled={variantSizes.length <= 1 || isSaving} aria-label="Remove size" className="flex items-center justify-center h-8 w-8 rounded-full text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition disabled:opacity-30 disabled:pointer-events-none">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="inv-wizard-footer">
                        <div>
                            {!isFirstStep && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="btn-admin-ghost rounded-full gap-1"
                                    onClick={handleBack}
                                    disabled={isSaving}
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="btn-admin-outline rounded-full"
                                onClick={onClose}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            {isLastStep ? (
                                <Button
                                    type="button"
                                    size="sm"
                                    className="btn-admin-accent rounded-full"
                                    disabled={isSaving || !hasProduct || !variantName.trim()}
                                    onClick={handleFinalSubmit}
                                >
                                    {isSaving
                                        ? "Saving..."
                                        : mode === "add"
                                            ? "Add Variant"
                                            : "Save Variant"}
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    size="sm"
                                    className="btn-admin-accent rounded-full gap-1"
                                    onClick={handleNext}
                                >
                                    Next <ChevronRight className="w-3.5 h-3.5" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    )
}
