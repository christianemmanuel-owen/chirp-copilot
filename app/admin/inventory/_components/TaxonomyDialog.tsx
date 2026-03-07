"use client"

import { useState } from "react"
import { X, Check, Undo2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TaxonomyDialogProps } from "./types"

export function TaxonomyDialog({
    open,
    onOpenChange,
    productCategories,
    productBrands,
    onCreateCategory,
    onUpdateCategory,
    onDeleteCategory,
    onCreateBrand,
    onUpdateBrand,
    onDeleteBrand,
}: TaxonomyDialogProps) {
    const [taxonomyTab, setTaxonomyTab] = useState<"categories" | "brands">("categories")
    const [newCategoryName, setNewCategoryName] = useState("")
    const [newBrandName, setNewBrandName] = useState("")
    const [categoryDrafts, setCategoryDrafts] = useState<Record<number, string>>({})
    const [brandDrafts, setBrandDrafts] = useState<Record<number, string>>({})
    const [savingCategoryId, setSavingCategoryId] = useState<number | null>(null)
    const [savingBrandId, setSavingBrandId] = useState<number | null>(null)
    const [creatingCategory, setCreatingCategory] = useState(false)
    const [creatingBrand, setCreatingBrand] = useState(false)

    const norm = (v: string) => v.trim()

    const handleCreateCategory = async () => {
        const n = norm(newCategoryName)
        if (!n) return
        try {
            setCreatingCategory(true)
            await onCreateCategory(n)
            setNewCategoryName("")
        } catch (e) {
            alert(e instanceof Error ? e.message : "Failed to create category.")
        } finally {
            setCreatingCategory(false)
        }
    }

    const handleUpdateCategory = async (id: number) => {
        const cur = productCategories.find((c) => c.id === id)
        const val = norm(categoryDrafts[id] ?? cur?.name ?? "")
        if (!val) return
        if (cur && cur.name === val) {
            setCategoryDrafts((p) => { const n = { ...p }; delete n[id]; return n })
            return
        }
        try {
            setSavingCategoryId(id)
            await onUpdateCategory(id, val)
            setCategoryDrafts((p) => { const n = { ...p }; delete n[id]; return n })
        } catch (e) {
            alert(e instanceof Error ? e.message : "Failed to update category.")
        } finally {
            setSavingCategoryId(null)
        }
    }

    const handleDeleteCategory = async (id: number) => {
        const t = productCategories.find((c) => c.id === id)
        if (!t || !confirm(`Delete "${t.name}"? Products using it will lose the association.`)) return
        try {
            setSavingCategoryId(id)
            await onDeleteCategory(id)
        } catch (e) {
            alert(e instanceof Error ? e.message : "Failed to delete category.")
        } finally {
            setSavingCategoryId(null)
        }
    }

    const handleCreateBrand = async () => {
        const n = norm(newBrandName)
        if (!n) return
        try {
            setCreatingBrand(true)
            await onCreateBrand(n)
            setNewBrandName("")
        } catch (e) {
            alert(e instanceof Error ? e.message : "Failed to create brand.")
        } finally {
            setCreatingBrand(false)
        }
    }

    const handleUpdateBrand = async (id: number) => {
        const cur = productBrands.find((b) => b.id === id)
        const val = norm(brandDrafts[id] ?? cur?.name ?? "")
        if (!val) return
        if (cur && cur.name === val) {
            setBrandDrafts((p) => { const n = { ...p }; delete n[id]; return n })
            return
        }
        try {
            setSavingBrandId(id)
            await onUpdateBrand(id, val)
            setBrandDrafts((p) => { const n = { ...p }; delete n[id]; return n })
        } catch (e) {
            alert(e instanceof Error ? e.message : "Failed to update brand.")
        } finally {
            setSavingBrandId(null)
        }
    }

    const handleDeleteBrand = async (id: number) => {
        const t = productBrands.find((b) => b.id === id)
        if (!t || !confirm(`Delete "${t.name}"? Products using it will be unbranded.`)) return
        try {
            setSavingBrandId(id)
            await onDeleteBrand(id)
        } catch (e) {
            alert(e instanceof Error ? e.message : "Failed to delete brand.")
        } finally {
            setSavingBrandId(null)
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (value) {
                    setTaxonomyTab("categories")
                    setNewCategoryName("")
                    setNewBrandName("")
                    setCategoryDrafts({})
                    setBrandDrafts({})
                }
                onOpenChange(value)
            }}
        >
            <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Categories &amp; Brands</DialogTitle>
                    <DialogDescription>Manage your product organization.</DialogDescription>
                </DialogHeader>

                <Tabs
                    value={taxonomyTab}
                    onValueChange={(v) => setTaxonomyTab(v as "categories" | "brands")}
                    className="flex-1 flex flex-col min-h-0"
                >
                    <TabsList className="grid w-full grid-cols-2 shrink-0">
                        <TabsTrigger value="categories">
                            Categories{productCategories.length > 0 && <span className="ml-1.5 text-[10px] text-muted-foreground">{productCategories.length}</span>}
                        </TabsTrigger>
                        <TabsTrigger value="brands">
                            Brands{productBrands.length > 0 && <span className="ml-1.5 text-[10px] text-muted-foreground">{productBrands.length}</span>}
                        </TabsTrigger>
                    </TabsList>

                    {/* ─── Categories tab ─── */}
                    <TabsContent value="categories" className="flex-1 flex flex-col min-h-0 mt-3 space-y-0">
                        {/* Add new — pinned top */}
                        <div className="flex items-center gap-2 shrink-0 pb-3">
                            <Input
                                id="new-category-name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateCategory() } }}
                                placeholder="New category name…"
                                className="h-8 rounded-lg border-border/50 text-sm flex-1"
                            />
                            <button
                                type="button"
                                onClick={handleCreateCategory}
                                disabled={creatingCategory || !norm(newCategoryName)}
                                className="shrink-0 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition disabled:opacity-40 disabled:pointer-events-none"
                            >
                                {creatingCategory ? "…" : "Add"}
                            </button>
                        </div>

                        {/* Scrollable list */}
                        <div className="flex-1 overflow-y-auto min-h-0 -mx-1 px-1">
                            {productCategories.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-6">No categories yet. Add one above.</p>
                            ) : (
                                <div className="space-y-1">
                                    {productCategories.map((cat) => {
                                        const draft = categoryDrafts[cat.id] ?? cat.name
                                        const dirty = norm(draft) !== cat.name
                                        const saving = savingCategoryId === cat.id
                                        return (
                                            <div key={cat.id} className="group flex items-center gap-1.5">
                                                <Input
                                                    value={draft}
                                                    onChange={(e) => setCategoryDrafts((p) => ({ ...p, [cat.id]: e.target.value }))}
                                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUpdateCategory(cat.id) } }}
                                                    disabled={saving}
                                                    className="h-8 rounded-lg border-border/50 text-sm flex-1"
                                                />
                                                {dirty && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCategoryDrafts((p) => { const n = { ...p }; delete n[cat.id]; return n })}
                                                            disabled={saving}
                                                            className="shrink-0 flex items-center justify-center h-7 w-7 rounded-full text-muted-foreground/50 hover:text-foreground hover:bg-muted transition disabled:opacity-40"
                                                            title="Undo"
                                                        >
                                                            <Undo2 className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateCategory(cat.id)}
                                                            disabled={saving}
                                                            className="shrink-0 flex items-center justify-center h-7 w-7 rounded-full text-primary hover:bg-primary/10 transition disabled:opacity-40"
                                                            title="Save"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteCategory(cat.id)}
                                                    disabled={saving}
                                                    className="shrink-0 flex items-center justify-center h-7 w-7 rounded-full text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition disabled:opacity-40"
                                                    title="Delete"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* ─── Brands tab ─── */}
                    <TabsContent value="brands" className="flex-1 flex flex-col min-h-0 mt-3 space-y-0">
                        {/* Add new — pinned top */}
                        <div className="flex items-center gap-2 shrink-0 pb-3">
                            <Input
                                id="new-brand-name"
                                value={newBrandName}
                                onChange={(e) => setNewBrandName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateBrand() } }}
                                placeholder="New brand name…"
                                className="h-8 rounded-lg border-border/50 text-sm flex-1"
                            />
                            <button
                                type="button"
                                onClick={handleCreateBrand}
                                disabled={creatingBrand || !norm(newBrandName)}
                                className="shrink-0 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition disabled:opacity-40 disabled:pointer-events-none"
                            >
                                {creatingBrand ? "…" : "Add"}
                            </button>
                        </div>

                        {/* Scrollable list */}
                        <div className="flex-1 overflow-y-auto min-h-0 -mx-1 px-1">
                            {productBrands.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-6">No brands yet. Add one above.</p>
                            ) : (
                                <div className="space-y-1">
                                    {productBrands.map((brand) => {
                                        const draft = brandDrafts[brand.id] ?? brand.name
                                        const dirty = norm(draft) !== brand.name
                                        const saving = savingBrandId === brand.id
                                        return (
                                            <div key={brand.id} className="group flex items-center gap-1.5">
                                                <Input
                                                    value={draft}
                                                    onChange={(e) => setBrandDrafts((p) => ({ ...p, [brand.id]: e.target.value }))}
                                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUpdateBrand(brand.id) } }}
                                                    disabled={saving}
                                                    className="h-8 rounded-lg border-border/50 text-sm flex-1"
                                                />
                                                {dirty && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => setBrandDrafts((p) => { const n = { ...p }; delete n[brand.id]; return n })}
                                                            disabled={saving}
                                                            className="shrink-0 flex items-center justify-center h-7 w-7 rounded-full text-muted-foreground/50 hover:text-foreground hover:bg-muted transition disabled:opacity-40"
                                                            title="Undo"
                                                        >
                                                            <Undo2 className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateBrand(brand.id)}
                                                            disabled={saving}
                                                            className="shrink-0 flex items-center justify-center h-7 w-7 rounded-full text-primary hover:bg-primary/10 transition disabled:opacity-40"
                                                            title="Save"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteBrand(brand.id)}
                                                    disabled={saving}
                                                    className="shrink-0 flex items-center justify-center h-7 w-7 rounded-full text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition disabled:opacity-40"
                                                    title="Delete"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
