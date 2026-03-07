"use client"

import { useState, useCallback, useEffect } from "react"
import { Check, ChevronLeft, ChevronRight, ImagePlus } from "lucide-react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { ImageGalleryEditor } from "./ImageGalleryEditor"
import type { ManagedImageItem } from "./types"
import type { ProductBrandInput, ProductCategoryInput } from "@/lib/types"

/* ─── Step Definitions ─── */

const STEPS = [
    { key: "info", label: "Product Info" },
    { key: "photos", label: "Photos" },
    { key: "organize", label: "Organize" },
] as const

/* ─── Wizard Stepper ─── */

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

/* ─── Main Component ─── */

export interface ProductFormDialogProps {
    mode: "add" | "edit"
    open: boolean
    onOpenChange: (open: boolean) => void
    productName: string
    onProductNameChange: (value: string) => void
    images: ManagedImageItem[]
    onImagesAdd: (files: FileList | null) => void
    onImageReplace: (files: FileList | null) => void
    onImageRemove: (id: string) => void
    onImageClearAll: () => void
    onImageEditTarget: (id: string) => void
    categories: ProductCategoryInput[]
    onCategoriesChange: (cats: ProductCategoryInput[]) => void
    brand: ProductBrandInput | null
    onBrandChange: (brand: ProductBrandInput | null) => void
    productCategories: { id: number; name: string }[]
    productBrands: { id: number; name: string }[]
    categorySelectValue: string
    onCategorySelectValueChange: (value: string) => void
    addCategoryIfMissing: (list: ProductCategoryInput[], cat: ProductCategoryInput) => ProductCategoryInput[]
    removeCategoryFromList: (list: ProductCategoryInput[], cat: ProductCategoryInput) => ProductCategoryInput[]
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
    isSaving?: boolean
}

export function ProductFormDialog({
    mode,
    open,
    onOpenChange,
    productName,
    onProductNameChange,
    images,
    onImagesAdd,
    onImageReplace,
    onImageRemove,
    onImageClearAll,
    onImageEditTarget,
    categories,
    onCategoriesChange,
    brand,
    onBrandChange,
    productCategories,
    productBrands,
    categorySelectValue,
    onCategorySelectValueChange,
    addCategoryIfMissing,
    removeCategoryFromList,
    onSubmit,
    isSaving = false,
}: ProductFormDialogProps) {
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        if (open) setCurrentStep(0)
    }, [open])

    const isLastStep = currentStep === STEPS.length - 1
    const isFirstStep = currentStep === 0

    const handleNext = useCallback(() => {
        if (currentStep === 0 && !productName.trim()) return
        if (!isLastStep) setCurrentStep((s) => s + 1)
    }, [currentStep, isLastStep, productName])

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

    const handleFinalSubmit = useCallback(() => {
        if (!productName.trim()) return
        const tempForm = document.createElement("form")
        const nameInput = document.createElement("input")
        nameInput.type = "hidden"
        nameInput.name = "name"
        nameInput.value = productName
        tempForm.appendChild(nameInput)
        document.body.appendChild(tempForm)
        const event = new Event("submit", { bubbles: true, cancelable: true })
        Object.defineProperty(event, "currentTarget", { value: tempForm })
        Object.defineProperty(event, "target", { value: tempForm })
        Object.defineProperty(event, "preventDefault", { value: () => { } })
        onSubmit(event as unknown as React.FormEvent<HTMLFormElement>)
        document.body.removeChild(tempForm)
    }, [productName, onSubmit])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{mode === "add" ? "Add Product" : "Edit Product"}</DialogTitle>
                    <DialogDescription>
                        {mode === "add"
                            ? "Create a new product in three easy steps."
                            : "Update the product details, photos, and organization."}
                    </DialogDescription>
                </DialogHeader>

                <WizardStepper current={currentStep} onStepClick={setCurrentStep} />

                <div>
                    <div className="inv-wizard-content">
                        {/* ─── Step 1: Product Info ─── */}
                        {currentStep === 0 && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">Product Info</h3>
                                    <p className="text-xs text-muted-foreground">Give your product a name to get started.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="wizard-name" className="text-sm font-medium">
                                        Product Name
                                    </Label>
                                    <Input
                                        id="wizard-name"
                                        value={productName}
                                        onChange={(e) => onProductNameChange(e.target.value)}
                                        onKeyDown={handleNameKeyDown}
                                        placeholder="e.g. Classic T-Shirt"
                                        className="h-11 text-base rounded-xl border-border/70"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}

                        {/* ─── Step 2: Photos ─── */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">Product Photos</h3>
                                    <p className="text-xs text-muted-foreground">Upload photos to showcase your product.</p>
                                </div>
                                <div className="flex justify-center">
                                    <ImageGalleryEditor
                                        images={images}
                                        onAdd={onImagesAdd}
                                        onReplace={onImageReplace}
                                        onRemove={onImageRemove}
                                        onClearAll={onImageClearAll}
                                        onEditTarget={onImageEditTarget}
                                        label=""
                                        description=""
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>
                        )}

                        {/* ─── Step 3: Organize ─── */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">Organize</h3>
                                    <p className="text-xs text-muted-foreground">Help customers find your product with categories and a brand.</p>
                                </div>
                                {/* Categories Card */}
                                <div className="rounded-xl border border-border/60 bg-background p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold text-foreground">Categories</span>
                                        {categories.length > 0 && (
                                            <span className="text-xs text-muted-foreground tabular-nums">
                                                {categories.length} selected
                                            </span>
                                        )}
                                    </div>

                                    <Select
                                        value={categorySelectValue}
                                        onValueChange={(val) => {
                                            onCategorySelectValueChange("")
                                            const id = Number(val)
                                            if (!Number.isFinite(id)) return
                                            const existing = productCategories.find((c) => c.id === id)
                                            if (existing)
                                                onCategoriesChange(
                                                    addCategoryIfMissing(categories, {
                                                        id: existing.id,
                                                        name: existing.name,
                                                    }),
                                                )
                                        }}
                                    >
                                        <SelectTrigger className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm">
                                            <SelectValue placeholder={categories.length > 0 ? "Add another category…" : "Choose a category…"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {productCategories
                                                .filter((c) => !categories.some((e) => e.id === c.id))
                                                .map((c) => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            {productCategories.filter((c) => !categories.some((e) => e.id === c.id)).length === 0 && (
                                                <div className="px-2 py-1.5 text-xs text-muted-foreground text-center">
                                                    {productCategories.length === 0 ? "No categories available" : "All categories selected"}
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>

                                    {/* Selected tags below the dropdown */}
                                    {categories.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {categories.map((cat, i) => (
                                                <Badge
                                                    key={cat.id ? `cat-${cat.id}` : `cat-new-${i}`}
                                                    variant="secondary"
                                                    className="flex items-center gap-1 rounded-full border border-border/60 bg-foreground/5 px-2.5 py-0.5 text-xs font-medium"
                                                >
                                                    {cat.name}
                                                    <button
                                                        type="button"
                                                        className="rounded-full p-0.5 text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
                                                        onClick={() =>
                                                            onCategoriesChange(removeCategoryFromList(categories, cat))
                                                        }
                                                        aria-label={`Remove ${cat.name}`}
                                                    >
                                                        <X className="h-2.5 w-2.5" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Brand Card */}
                                <div className="rounded-xl border border-border/60 bg-background p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold text-foreground">Brand</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <Select
                                                value={brand?.id ? brand.id.toString() : "none"}
                                                onValueChange={(val) => {
                                                    if (val === "none") {
                                                        onBrandChange(null)
                                                        return
                                                    }
                                                    const id = Number(val)
                                                    const b = productBrands.find((b) => b.id === id)
                                                    if (b) onBrandChange({ id: b.id, name: b.name })
                                                }}
                                            >
                                                <SelectTrigger className="h-10 rounded-lg border-border/60 bg-foreground/[0.02] text-sm">
                                                    <SelectValue placeholder="Choose a brand…" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">No brand</SelectItem>
                                                    {productBrands.map((b) => (
                                                        <SelectItem key={b.id} value={b.id.toString()}>
                                                            {b.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {brand && (
                                            <button
                                                type="button"
                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
                                                onClick={() => onBrandChange(null)}
                                                aria-label="Remove brand"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground text-center pt-1">
                                    Categories and brands help customers find your product.
                                </p>
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
                                onClick={() => onOpenChange(false)}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            {isLastStep ? (
                                <Button
                                    type="button"
                                    size="sm"
                                    className="btn-admin-accent rounded-full"
                                    disabled={isSaving || !productName.trim()}
                                    onClick={handleFinalSubmit}
                                >
                                    {isSaving
                                        ? "Saving..."
                                        : mode === "add"
                                            ? "Add Product"
                                            : "Save Changes"}
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
        </Dialog>
    )
}
