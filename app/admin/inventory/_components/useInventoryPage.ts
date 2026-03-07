"use client"

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { useStore } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"
import type { Product, ProductBrandInput, ProductCategoryInput } from "@/lib/types"
import type { CarouselApi } from "@/components/ui/carousel"
import type { ManagedImageItem, BulkSizeRow, GroupByMode, SizeViewMode } from "./types"
import { DEFAULT_SIZE_KEY } from "./types"

const generateRandomKey = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const normalizeLabelValue = (value: string) => value.trim()

const normalizeSizeKey = (value?: string | null) => {
    const trimmed = (value ?? "").trim()
    return trimmed.length > 0 ? trimmed : DEFAULT_SIZE_KEY
}

const getSizeLabelFromKey = (key: string) => (key === DEFAULT_SIZE_KEY ? "Default" : key)

function addCategoryIfMissing(list: ProductCategoryInput[], category: ProductCategoryInput): ProductCategoryInput[] {
    const id = category.id
    const name = normalizeLabelValue(category.name ?? "")
    if (!id && name.length === 0) return list
    const exists = list.some((entry) => {
        if (id && entry.id) return entry.id === id
        return normalizeLabelValue(entry.name ?? "").toLowerCase() === name.toLowerCase()
    })
    return exists ? list : [...list, { id: id ?? undefined, name }]
}

function removeCategoryFromList(list: ProductCategoryInput[], category: ProductCategoryInput): ProductCategoryInput[] {
    if (category.id) return list.filter((entry) => entry.id !== category.id)
    const name = normalizeLabelValue(category.name ?? "")
    if (!name) return list
    const targetKey = name.toLowerCase()
    return list.filter((entry) => {
        if (entry.id) return true
        return normalizeLabelValue(entry.name ?? "").toLowerCase() !== targetKey
    })
}

function releasePreviewUrl(url?: string) {
    if (url && url.startsWith("blob:")) URL.revokeObjectURL(url)
}

function disposeImagePreviews(items: ManagedImageItem[]) {
    for (const item of items) releasePreviewUrl(item.previewUrl)
}

function isValidImageFile(file: File | null | undefined) {
    if (!file) return false
    if (file.size <= 0) return false
    if (file.type && !file.type.startsWith("image/")) return false
    return true
}

function createImageItemFromFile(file: File): ManagedImageItem | null {
    if (!isValidImageFile(file)) return null
    return { id: generateRandomKey(), file, previewUrl: URL.createObjectURL(file) }
}

function buildImageItemsFromFiles(files: FileList | null): ManagedImageItem[] {
    if (!files || files.length === 0) return []
    return Array.from(files).map(createImageItemFromFile).filter((e): e is ManagedImageItem => Boolean(e))
}

export function getVariantSizeEntries(variant: Product["variants"][number]) {
    const baseEntries = variant.sizes && variant.sizes.length > 0
        ? variant.sizes
        : [{ size: variant.size ?? "", price: variant.price, stock: variant.stock }]
    return baseEntries.map((entry) => {
        const value = normalizeSizeKey(entry.size)
        const trimmedSize = (entry.size ?? "").trim()
        return {
            value,
            label: getSizeLabelFromKey(value),
            price: Number(entry.price),
            stock: Number(entry.stock),
            size: value === DEFAULT_SIZE_KEY ? null : trimmedSize || null,
        }
    })
}

export function useInventoryPage() {
    const store = useStore()
    const { products, productCategories, productBrands, addProduct, updateProduct, deleteProduct,
        refreshCategories, refreshBrands, createCategory, updateCategory, deleteCategory,
        createBrand, updateBrand, deleteBrand, isLoadingProducts, refreshProducts } = store

    // ─── Dialog & Filter State ───
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilterIds, setCategoryFilterIds] = useState<number[]>([])
    const [brandFilterId, setBrandFilterId] = useState<number | null>(null)
    const [isTaxonomyDialogOpen, setIsTaxonomyDialogOpen] = useState(false)

    // ─── New: Table Controls ───
    const [groupBy, setGroupBy] = useState<GroupByMode>("product")
    const [sizeView, setSizeView] = useState<SizeViewMode>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("inventory-size-view") as SizeViewMode) || "compact"
        }
        return "compact"
    })

    const handleSizeViewChange = (value: SizeViewMode) => {
        setSizeView(value)
        if (typeof window !== "undefined") localStorage.setItem("inventory-size-view", value)
    }

    // ─── Add Product Image State ───
    const [addProductImages, setAddProductImages] = useState<ManagedImageItem[]>([])
    const [addProductName, setAddProductName] = useState("")
    const [addCategories, setAddCategories] = useState<ProductCategoryInput[]>([])
    const [addCategorySelectValue, setAddCategorySelectValue] = useState("")
    const [addBrand, setAddBrand] = useState<ProductBrandInput | null>(null)
    const [addProductImageEditTargetId, setAddProductImageEditTargetId] = useState<string | null>(null)

    // ─── Edit Product Image State ───
    const [editProductImages, setEditProductImages] = useState<ManagedImageItem[]>([])
    const [editProductName, setEditProductName] = useState("")
    const [editCategories, setEditCategories] = useState<ProductCategoryInput[]>([])
    const [editCategorySelectValue, setEditCategorySelectValue] = useState("")
    const [editBrand, setEditBrand] = useState<ProductBrandInput | null>(null)
    const [editProductImageEditTargetId, setEditProductImageEditTargetId] = useState<string | null>(null)
    const [isSavingEdit, setIsSavingEdit] = useState(false)

    // ─── Variant Form State ───
    const [isAddVariantOpen, setIsAddVariantOpen] = useState(false)
    const [variantProduct, setVariantProduct] = useState<Product | null>(null)
    const [variantMode, setVariantMode] = useState<"add" | "edit">("add")
    const [variantId, setVariantId] = useState<number | null>(null)
    const [variantImages, setVariantImages] = useState<ManagedImageItem[]>([])
    const [variantCarouselApi, setVariantCarouselApi] = useState<CarouselApi | null>(null)
    const addVariantImageInputRef = useRef<HTMLInputElement | null>(null)
    const editVariantImageInputRef = useRef<HTMLInputElement | null>(null)
    const pendingVariantImageScrollRef = useRef<number | null>(null)
    const [imageEditTargetId, setImageEditTargetId] = useState<string | null>(null)
    const [variantSku, setVariantSku] = useState("")
    const [variantName, setVariantName] = useState("")
    const [variantDescription, setVariantDescription] = useState("")
    const [variantIsPreorder, setVariantIsPreorder] = useState(false)
    const [variantIsActive, setVariantIsActive] = useState(true)
    const [variantPreorderDownPaymentType, setVariantPreorderDownPaymentType] = useState<"none" | "percent" | "amount">("none")
    const [variantPreorderDownPaymentValue, setVariantPreorderDownPaymentValue] = useState("")
    const [variantPreorderMessage, setVariantPreorderMessage] = useState("")
    const [isSavingVariant, setIsSavingVariant] = useState(false)
    const [variantSizes, setVariantSizes] = useState<Array<{ key: string; size: string; price: string; stock: string }>>([createVariantSizeRow()])
    const [selectedVariantSizes, setSelectedVariantSizes] = useState<Record<number, string>>({})

    // ─── Bulk Edit State ───
    const [isBulkEditMode, setIsBulkEditMode] = useState(false)
    const [bulkSelection, setBulkSelection] = useState<Set<number>>(() => new Set())
    const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false)
    const [bulkSizeRows, setBulkSizeRows] = useState<BulkSizeRow[]>([])
    const [bulkPreorderChoice, setBulkPreorderChoice] = useState<"no-change" | "preorder" | "regular">("no-change")
    const [bulkDownPaymentMode, setBulkDownPaymentMode] = useState<"no-change" | "none" | "percent" | "amount">("no-change")
    const [bulkDownPaymentValue, setBulkDownPaymentValue] = useState("")
    const [bulkPreorderMessageMode, setBulkPreorderMessageMode] = useState<"no-change" | "remove" | "set">("no-change")
    const [bulkPreorderMessageValue, setBulkPreorderMessageValue] = useState("")
    const [bulkGuardAcknowledged, setBulkGuardAcknowledged] = useState(false)
    const [isSavingBulkEdit, setIsSavingBulkEdit] = useState(false)
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
    const [isDeletingVariants, setIsDeletingVariants] = useState(false)

    // ─── Helpers ───
    function createVariantSizeRow(defaults?: { size?: string; price?: string; stock?: string }) {
        return { key: `size-${generateRandomKey()}`, size: defaults?.size ?? "", price: defaults?.price ?? "", stock: defaults?.stock ?? "" }
    }

    const generateImagePrefix = (productName: string): string =>
        productName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "product"

    const uploadImageIfNeeded = async (file: File | null, productName: string) => {
        if (!file) return null
        const uploadData = new FormData()
        uploadData.append("file", file)
        uploadData.append("prefix", generateImagePrefix(productName))
        const uploadResponse = await fetch("/api/uploads/products", { method: "POST", body: uploadData })
        if (!uploadResponse.ok) throw new Error("Upload failed")
        const uploadPayload = await uploadResponse.json()
        return uploadPayload.url as string | undefined
    }

    const resolveManagedImageUploads = async (items: ManagedImageItem[], descriptorBase: string, options?: { errorMessage?: string }) => {
        const uploads: string[] = []
        for (let i = 0; i < items.length; i++) {
            const entry = items[i]
            if (entry.file) {
                const url = await uploadImageIfNeeded(entry.file, `${descriptorBase}-${i + 1}`)
                if (!url) throw new Error(options?.errorMessage ?? "Failed to upload one of the images.")
                uploads.push(url)
            } else if (entry.originalUrl) {
                uploads.push(entry.originalUrl)
            } else if (entry.previewUrl && !entry.previewUrl.startsWith("blob:")) {
                uploads.push(entry.previewUrl)
            }
        }
        return Array.from(new Set(uploads.map(u => u.trim()).filter(u => u.length > 0)))
    }

    // ─── Memos ───
    const filteredProducts = useMemo(() => {
        const ns = searchTerm.trim().toLowerCase()
        return products.filter((p) => {
            const matchesSearch = ns.length === 0 || p.name.toLowerCase().includes(ns) ||
                p.categories.some(c => c.name.toLowerCase().includes(ns)) ||
                (p.brand ? p.brand.name.toLowerCase().includes(ns) : false)
            const matchesBrand = brandFilterId === null ? true : p.brand ? p.brand.id === brandFilterId : false
            const matchesCats = categoryFilterIds.length === 0 || p.categories.some(c => categoryFilterIds.includes(c.id))
            return matchesSearch && matchesBrand && matchesCats
        })
    }, [products, searchTerm, brandFilterId, categoryFilterIds])

    const variantLookup = useMemo(() => {
        const map = new Map<number, { product: Product; variant: Product["variants"][number] }>()
        for (const product of products) {
            for (const variant of product.variants) {
                map.set(variant.id, { product, variant })
            }
        }
        return map
    }, [products])

    const selectedBulkVariants = useMemo(
        () => Array.from(bulkSelection).map(id => variantLookup.get(id) ?? null)
            .filter((e): e is { product: Product; variant: Product["variants"][number] } => Boolean(e?.product && e?.variant)),
        [bulkSelection, variantLookup],
    )

    const hasMixedPreorderSelection = useMemo(() => {
        if (selectedBulkVariants.length <= 1) return false
        const base = selectedBulkVariants[0]?.variant.isPreorder ?? false
        return selectedBulkVariants.some(e => e.variant.isPreorder !== base)
    }, [selectedBulkVariants])

    const variantDownPaymentPreview = useMemo(() => {
        if (variantPreorderDownPaymentType !== "percent") return null
        const pct = Number(variantPreorderDownPaymentValue)
        if (!Number.isFinite(pct) || pct <= 0) return null
        const prices = variantSizes.map(r => Number(r.price)).filter(p => Number.isFinite(p) && p > 0)
        if (prices.length === 0) return null
        const perUnit = Number(((Math.min(...prices) * pct) / 100).toFixed(2))
        return Number.isFinite(perUnit) && perUnit > 0 ? formatCurrency(perUnit) : null
    }, [variantPreorderDownPaymentType, variantPreorderDownPaymentValue, variantSizes])

    // ─── Effects ───
    useEffect(() => {
        if (!isAddDialogOpen) {
            setAddProductImages(prev => { disposeImagePreviews(prev); return [] })
            setAddProductName(""); setAddCategories([]); setAddCategorySelectValue(""); setAddBrand(null); setAddProductImageEditTargetId(null)
        }
    }, [isAddDialogOpen])

    useEffect(() => {
        if (pendingVariantImageScrollRef.current === null || !variantCarouselApi) return
        const idx = Math.min(Math.max(pendingVariantImageScrollRef.current, 0), Math.max(variantImages.length - 1, 0))
        pendingVariantImageScrollRef.current = null
        if (variantCarouselApi && variantImages.length > 0) variantCarouselApi.scrollTo(idx)
    }, [variantCarouselApi, variantImages])

    useEffect(() => {
        if (!editingProduct) {
            setEditCategories([]); setEditCategorySelectValue(""); setEditBrand(null); setEditProductName("")
            setEditProductImages(prev => { disposeImagePreviews(prev); return [] })
            setEditProductImageEditTargetId(null); return
        }
        setEditProductName(editingProduct.name)
        setEditCategories(editingProduct.categories.map(c => ({ id: c.id, name: c.name })))
        setEditCategorySelectValue("")
        setEditBrand(editingProduct.brand ? { id: editingProduct.brand.id, name: editingProduct.brand.name } : null)
        const imgs = Array.isArray(editingProduct.images) && editingProduct.images.length > 0
            ? editingProduct.images : editingProduct.image ? [editingProduct.image] : []
        setEditProductImages(prev => { disposeImagePreviews(prev); return imgs.map(url => ({ id: generateRandomKey(), previewUrl: url, originalUrl: url })) })
    }, [editingProduct])

    // ─── Filter Handlers ───
    const toggleCategoryFilter = (categoryId: number, isChecked: boolean) => {
        setCategoryFilterIds(prev => isChecked ? (prev.includes(categoryId) ? prev : [...prev, categoryId]) : prev.filter(id => id !== categoryId))
    }
    const clearAllFilters = () => { setCategoryFilterIds([]); setBrandFilterId(null) }

    // ─── Image Handlers (Add Product) ───
    const handleAddProductImagesAdd = (files: FileList | null) => {
        const items = buildImageItemsFromFiles(files); if (items.length === 0) return
        setAddProductImages(prev => [...prev, ...items])
    }
    const handleAddProductImageReplace = (files: FileList | null) => {
        const targetId = addProductImageEditTargetId; setAddProductImageEditTargetId(null)
        if (!targetId) return
        const repl = files && files.length > 0 ? createImageItemFromFile(files[0]) : null; if (!repl) return
        setAddProductImages(prev => {
            const idx = prev.findIndex(i => i.id === targetId)
            if (idx === -1) { releasePreviewUrl(repl.previewUrl); return prev }
            const next = [...prev]; releasePreviewUrl(next[idx].previewUrl)
            next[idx] = { id: next[idx].id, file: repl.file, previewUrl: repl.previewUrl }; return next
        })
    }
    const handleAddProductImageRemove = (id: string) => {
        setAddProductImages(prev => {
            const idx = prev.findIndex(i => i.id === id); if (idx === -1) return prev
            const next = [...prev]; const [removed] = next.splice(idx, 1)
            if (removed) releasePreviewUrl(removed.previewUrl); return next
        })
    }

    // ─── Image Handlers (Edit Product) ───
    const handleEditProductImagesAdd = (files: FileList | null) => {
        const items = buildImageItemsFromFiles(files); if (items.length === 0) return
        setEditProductImages(prev => [...prev, ...items])
    }
    const handleEditProductImageReplace = (files: FileList | null) => {
        const targetId = editProductImageEditTargetId; setEditProductImageEditTargetId(null)
        if (!targetId) return
        const repl = files && files.length > 0 ? createImageItemFromFile(files[0]) : null; if (!repl) return
        setEditProductImages(prev => {
            const idx = prev.findIndex(i => i.id === targetId)
            if (idx === -1) { releasePreviewUrl(repl.previewUrl); return prev }
            const next = [...prev]; releasePreviewUrl(next[idx].previewUrl)
            next[idx] = { id: next[idx].id, file: repl.file, previewUrl: repl.previewUrl }; return next
        })
    }
    const handleEditProductImageRemove = (id: string) => {
        setEditProductImages(prev => {
            const idx = prev.findIndex(i => i.id === id); if (idx === -1) return prev
            const next = [...prev]; const [removed] = next.splice(idx, 1)
            if (removed) releasePreviewUrl(removed.previewUrl); return next
        })
    }

    // ─── Product CRUD ───
    const handleAddProduct = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const form = event.currentTarget; const fd = new FormData(form)
        const name = (fd.get("name") as string)?.trim()
        if (!name) { alert("Product name is required."); return }
        try {
            const imgs = await resolveManagedImageUploads(addProductImages, name || "product", { errorMessage: "Failed to upload one of the product photos." })
            await addProduct({ name, images: imgs, variants: [], categories: addCategories, brand: addBrand })
            setAddProductImages(prev => { disposeImagePreviews(prev); return [] })
            setIsAddDialogOpen(false); form.reset()
        } catch (error) {
            console.error("Failed to add product", error)
            alert(error instanceof Error ? error.message : "Failed to add product.")
        }
    }

    const handleEditProduct = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const product = editingProduct; if (!product) return
        const form = event.currentTarget; const fd = new FormData(form)
        const name = (fd.get("name") as string)?.trim()
        if (!name) { alert("Product name is required."); return }
        try {
            setIsSavingEdit(true)
            const imgs = await resolveManagedImageUploads(editProductImages, name || product.name, { errorMessage: "Failed to upload one of the product photos." })
            await updateProduct(product.id, { name, images: imgs, categories: editCategories, brand: editBrand })
            setEditProductImages(prev => { disposeImagePreviews(prev); return [] })
            setEditingProduct(null); form.reset()
        } catch (error) {
            console.error("Failed to update product", error); alert(error instanceof Error ? error.message : "Failed to update product.")
        } finally { setIsSavingEdit(false) }
    }

    const handleDeleteProduct = async (product: Product) => {
        if (!confirm(`Delete "${product.name}" and all its variants?`)) return
        try { await deleteProduct(product.id) } catch (error) {
            console.error("Failed to delete product", error); alert(error instanceof Error ? error.message : "Failed to delete product.")
        }
    }

    // ─── Variant Dialog ───
    const openVariantDialog = (product: Product, variant?: Product["variants"][number]) => {
        if (variantImages.length > 0) for (const img of variantImages) releasePreviewUrl(img.previewUrl)
        setVariantProduct(product); setVariantMode(variant ? "edit" : "add"); setVariantId(variant ? variant.id : null)
        setVariantCarouselApi(null); setImageEditTargetId(null)
        const rawImages = Array.isArray(variant?.images) && variant.images.length > 0 ? variant.images : variant?.image ? [variant.image] : []
        const unique = Array.from(new Set(rawImages.map(e => (typeof e === "string" ? e.trim() : "")).filter(e => e.length > 0)))
        const initial = unique.length > 0 ? unique.map<ManagedImageItem>(url => ({ id: generateRandomKey(), previewUrl: url, originalUrl: url })) : []
        pendingVariantImageScrollRef.current = initial.length > 0 ? 0 : null
        setVariantImages(initial); setVariantSku(variant?.sku ?? ""); setVariantName(variant?.color ?? "")
        setVariantDescription(variant?.description ?? "")
        const isPreorder = Boolean(variant?.isPreorder); setVariantIsPreorder(isPreorder)
        setVariantIsActive(variant ? variant.isActive !== false : true)
        const dp = isPreorder && variant?.preorderDownPayment && variant.preorderDownPayment.value > 0 ? variant.preorderDownPayment : null
        setVariantPreorderDownPaymentType(dp ? dp.type : "none")
        setVariantPreorderDownPaymentValue(dp ? String(dp.value) : "")
        setVariantPreorderMessage(isPreorder ? variant?.preorderMessage ?? "" : "")
        const initSizes = variant && Array.isArray(variant.sizes) && variant.sizes.length > 0
            ? variant.sizes.map(e => createVariantSizeRow({ size: e.size ?? "", price: e.price.toString(), stock: e.stock.toString() }))
            : [createVariantSizeRow({ size: variant?.size ?? "", price: variant ? String(variant.price) : "", stock: variant ? String(variant.stock) : "" })]
        if (initSizes.length === 0) initSizes.push(createVariantSizeRow())
        setVariantSizes(initSizes); setIsSavingVariant(false); setIsAddVariantOpen(true)
    }

    const closeVariantDialog = () => {
        setIsAddVariantOpen(false); setVariantProduct(null)
        if (variantImages.length > 0) disposeImagePreviews(variantImages)
        setVariantImages([]); setVariantCarouselApi(null); pendingVariantImageScrollRef.current = null
        setImageEditTargetId(null); setVariantSku(""); setVariantName(""); setVariantDescription("")
        setVariantSizes([createVariantSizeRow()]); setVariantMode("add"); setVariantId(null)
        setVariantIsPreorder(false); setVariantIsActive(true); setVariantPreorderDownPaymentType("none")
        setVariantPreorderDownPaymentValue(""); setVariantPreorderMessage(""); setIsSavingVariant(false)
    }

    // ─── Variant Image Handlers ───
    const handleVariantImagesAdd = (files: FileList | null) => {
        const items = buildImageItemsFromFiles(files); if (items.length === 0) return
        setVariantImages(prev => { const next = [...prev, ...items]; pendingVariantImageScrollRef.current = next.length - 1; return next })
    }
    const handleVariantImageEdit = (files: FileList | null) => {
        const targetId = imageEditTargetId; setImageEditTargetId(null)
        if (!targetId || !files || files.length === 0) return
        const repl = files[0] ? createImageItemFromFile(files[0]) : null; if (!repl) return
        setVariantImages(prev => {
            const idx = prev.findIndex(i => i.id === targetId); if (idx === -1) return prev
            const next = [...prev]; releasePreviewUrl(next[idx].previewUrl)
            next[idx] = { id: next[idx].id, file: repl.file, previewUrl: repl.previewUrl }
            pendingVariantImageScrollRef.current = idx; return next
        })
    }
    const handleVariantImageRemove = (id: string) => {
        setVariantImages(prev => {
            const idx = prev.findIndex(i => i.id === id); if (idx === -1) return prev
            const next = [...prev]; const [removed] = next.splice(idx, 1)
            if (removed) releasePreviewUrl(removed.previewUrl)
            pendingVariantImageScrollRef.current = next.length === 0 ? null : Math.max(idx - 1, 0); return next
        })
    }
    const requestVariantImageAdd = () => { if (!isSavingVariant) addVariantImageInputRef.current?.click() }
    const requestVariantImageEdit = (id: string) => { if (!isSavingVariant) { setImageEditTargetId(id); editVariantImageInputRef.current?.click() } }

    // ─── Variant Submit ───
    const handleVariantSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault(); if (!variantProduct) return
        const trimmedName = variantName.trim()
        if (!trimmedName) { alert("Variant name is required."); return }
        const trimmedDesc = variantDescription.trim()
        const sanitizedRows = variantSizes.map(r => ({ key: r.key, size: r.size.trim(), price: r.price.trim(), stock: r.stock.trim() }))
        if (sanitizedRows.length === 0) { alert("At least one size entry is required."); return }
        if (sanitizedRows.some(r => r.price.length === 0)) { alert("Price is required for each size entry."); return }
        if (!variantIsPreorder && sanitizedRows.some(r => r.stock.length === 0)) { alert("Stock is required for each size entry."); return }
        const parsed = sanitizedRows.map(r => ({ size: r.size, price: Number(r.price), stock: variantIsPreorder && r.stock.length === 0 ? 0 : Number(r.stock) }))
        if (parsed.find(r => !Number.isFinite(r.price) || r.price < 0)) { alert("Each size entry requires a non-negative price."); return }
        if (parsed.find(r => variantIsPreorder ? r.stock < 0 : !Number.isInteger(r.stock) || r.stock < 0)) { alert("Each size entry requires a non-negative stock quantity."); return }
        if (parsed.length > 1 && parsed.some(r => r.size.length === 0)) { alert("Size is required when adding multiple entries."); return }
        const reqSizes = parsed.map(r => ({ size: r.size.length > 0 ? r.size : null, price: r.price, stock: variantIsPreorder ? 0 : r.stock }))
        let dpPayload: { type: "percent" | "amount"; value: number } | null = null
        if (variantIsPreorder && variantPreorderDownPaymentType !== "none") {
            const raw = Number(variantPreorderDownPaymentValue)
            if (!Number.isFinite(raw) || raw <= 0) { alert("Please enter a valid down payment value greater than zero."); return }
            if (variantPreorderDownPaymentType === "percent" && raw > 100) { alert("Down payment percent cannot be greater than 100%."); return }
            dpPayload = { type: variantPreorderDownPaymentType, value: Number(raw.toFixed(2)) }
        }
        const msgPayload = variantIsPreorder && variantPreorderMessage.trim().length > 0 ? variantPreorderMessage.trim() : null
        try {
            setIsSavingVariant(true)
            const desc = `${variantProduct.name}-${trimmedName || variantSku || "variant"}`
            const imgs = await resolveManagedImageUploads(variantImages, desc, { errorMessage: "Failed to upload one of the variant images." })
            const body: Record<string, any> = {
                sku: variantSku.trim() || null, name: trimmedName, description: trimmedDesc.length > 0 ? trimmedDesc : null,
                sizes: reqSizes, isPreorder: variantIsPreorder, isActive: variantIsActive, images: imgs,
                preorderDownPayment: variantIsPreorder ? dpPayload : null, preorderMessage: variantIsPreorder ? msgPayload : null,
            }
            let response: Response
            if (variantMode === "add") {
                response = await fetch(`/api/products/${variantProduct.id}/variants`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
            } else {
                if (!variantId) throw new Error("Missing variant id for update")
                response = await fetch(`/api/products/${variantProduct.id}/variants/${variantId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
            }
            const payload = await response.json()
            if (!response.ok) throw new Error(payload.error || "Failed to save product variant")
            const updated = (payload.data ?? null) as Product | null
            if (updated) { setVariantProduct(updated); if (editingProduct?.id === updated.id) setEditingProduct(updated) }
            await refreshProducts(); closeVariantDialog()
        } catch (error) {
            console.error("Failed to save product variant", error); alert(error instanceof Error ? error.message : "Failed to save product variant.")
        } finally { setIsSavingVariant(false) }
    }

    // ─── Variant Size Row Handlers ───
    const addVariantSizeRow = () => setVariantSizes(prev => [...prev, createVariantSizeRow()])
    const updateVariantSizeRow = (key: string, field: "size" | "price" | "stock", value: string) =>
        setVariantSizes(prev => prev.map(e => e.key === key ? { ...e, [field]: value } : e))
    const removeVariantSizeRow = (key: string) => setVariantSizes(prev => prev.length <= 1 ? prev : prev.filter(e => e.key !== key))

    // ─── Bulk Edit Handlers ───
    const resetBulkEditingState = () => {
        setBulkSizeRows([]); setIsBulkEditDialogOpen(false); setIsBulkDeleteDialogOpen(false)
        setBulkPreorderChoice("no-change"); setBulkDownPaymentMode("no-change"); setBulkDownPaymentValue("")
        setBulkPreorderMessageMode("no-change"); setBulkPreorderMessageValue(""); setBulkGuardAcknowledged(false)
        setIsSavingBulkEdit(false); setIsDeletingVariants(false)
    }
    const handleBulkModeToggle = (value: boolean | "indeterminate") => {
        const checked = value === true; setIsBulkEditMode(checked)
        if (!checked) { setBulkSelection(new Set()); resetBulkEditingState() }
    }
    const toggleVariantBulkSelection = (variantId: number, isChecked: boolean) => {
        setBulkSelection(prev => { const next = new Set(prev); isChecked ? next.add(variantId) : next.delete(variantId); return next })
    }
    const buildCommonBulkSizeRows = () => {
        if (selectedBulkVariants.length === 0) return []
        const [first, ...rest] = selectedBulkVariants
        const firstEntries = getVariantSizeEntries(first.variant)
        const commonKeys = new Set(firstEntries.map(e => e.value))
        rest.forEach(({ variant }) => {
            const keys = new Set(getVariantSizeEntries(variant).map(e => e.value))
            for (const k of Array.from(commonKeys)) if (!keys.has(k)) commonKeys.delete(k)
        })
        return firstEntries.filter(e => commonKeys.has(e.value)).map(e => {
            // Check if all selected variants share the same price/stock for this size
            let uniformPrice: number | null = e.price
            let uniformStock: number | null = e.stock
            for (const { variant } of rest) {
                const match = getVariantSizeEntries(variant).find(s => s.value === e.value)
                if (match) {
                    if (uniformPrice !== null && match.price !== uniformPrice) uniformPrice = null
                    if (uniformStock !== null && match.stock !== uniformStock) uniformStock = null
                }
            }
            return {
                key: `bulk-existing-${e.value}-${generateRandomKey()}`, type: "existing" as const,
                sizeValue: e.value, label: e.label,
                price: uniformPrice !== null ? String(uniformPrice) : "",
                stock: uniformStock !== null ? String(uniformStock) : "",
                isMarkedForRemoval: false,
                _priceMixed: uniformPrice === null,
                _stockMixed: uniformStock === null,
            }
        })
    }
    const openBulkEditDialog = () => {
        if (bulkSelection.size === 0) { alert("Select at least one variant to bulk edit."); return }
        setBulkSizeRows(buildCommonBulkSizeRows()); setBulkPreorderChoice("no-change"); setBulkGuardAcknowledged(false); setIsBulkEditDialogOpen(true)
    }
    const openBulkDeleteDialog = () => {
        if (bulkSelection.size === 0) { alert("Select at least one variant to delete."); return }
        setIsBulkDeleteDialogOpen(true)
    }
    const addBulkSizeRow = () => setBulkSizeRows(prev => [...prev, { key: `bulk-new-${generateRandomKey()}`, type: "new", sizeValue: "", label: "", price: "", stock: "" }])
    const updateBulkSizeRow = (key: string, field: "sizeValue" | "price" | "stock", value: string) => setBulkSizeRows(prev => prev.map(r => r.key === key ? { ...r, [field]: value } : r))
    const removeBulkSizeRow = (key: string) => setBulkSizeRows(prev => prev.filter(r => r.key !== key))
    const toggleBulkSizeRemoval = (key: string) => setBulkSizeRows(prev => prev.map(r => r.key === key ? { ...r, isMarkedForRemoval: !r.isMarkedForRemoval } : r))

    const handleBulkEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (selectedBulkVariants.length === 0) { alert("Select at least one variant to bulk edit."); return }
        const sanitized = bulkSizeRows.map(r => ({ ...r, sizeValue: r.sizeValue.trim(), price: r.price.trim(), stock: r.stock.trim() }))
        const newRows = sanitized.filter(r => r.type === "new"); const existingRows = sanitized.filter(r => r.type === "existing")
        if (newRows.some(r => r.sizeValue.length === 0 || r.price.length === 0 || r.stock.length === 0)) { alert("Fill out the size name, price, and quantity for each new size."); return }
        if (newRows.some(r => Number(r.price) < 0 || Number.isNaN(Number(r.price)))) { alert("New size prices must be non-negative numbers."); return }
        if (newRows.some(r => !Number.isInteger(Number(r.stock)) || Number(r.stock) < 0)) { alert("New size quantities must be whole numbers >= 0."); return }
        const existingToUpdate = existingRows.filter(r => !r.isMarkedForRemoval)
        if (existingToUpdate.some(r => r.price.length > 0 && (Number(r.price) < 0 || Number.isNaN(Number(r.price))))) { alert("Provide non-negative prices."); return }
        if (existingToUpdate.some(r => r.stock.length > 0 && (!Number.isInteger(Number(r.stock)) || Number(r.stock) < 0))) { alert("Provide whole number quantities."); return }
        if (hasMixedPreorderSelection && bulkPreorderChoice !== "no-change" && !bulkGuardAcknowledged) { alert("Acknowledge the pre-order warning."); return }
        if (bulkDownPaymentMode === "percent" || bulkDownPaymentMode === "amount") {
            const v = Number(bulkDownPaymentValue); if (!Number.isFinite(v) || v <= 0) { alert("Enter a down payment value > 0."); return }
            if (bulkDownPaymentMode === "percent" && v > 100) { alert("Down payment percent cannot be > 100%."); return }
        }
        if (bulkPreorderChoice !== "regular" && bulkPreorderMessageMode === "set" && bulkPreorderMessageValue.trim().length === 0) { alert("Enter a pre-order message."); return }
        try {
            setIsSavingBulkEdit(true)
            for (const entry of selectedBulkVariants) {
                const { product, variant } = entry
                const nextIsPreorder = bulkPreorderChoice === "no-change" ? variant.isPreorder : bulkPreorderChoice === "preorder"
                let dpUpdate: { type: "percent" | "amount"; value: number } | null | undefined = undefined
                let msgUpdate: string | null | undefined = undefined
                if (nextIsPreorder && bulkDownPaymentMode !== "no-change") {
                    dpUpdate = bulkDownPaymentMode === "none" ? null : bulkDownPaymentMode === "percent" || bulkDownPaymentMode === "amount"
                        ? { type: bulkDownPaymentMode, value: Number(Number(bulkDownPaymentValue).toFixed(2)) } : undefined
                } else if (bulkPreorderChoice !== "no-change") { dpUpdate = null }
                if (nextIsPreorder) { if (bulkPreorderMessageMode === "remove") msgUpdate = null; else if (bulkPreorderMessageMode === "set") msgUpdate = bulkPreorderMessageValue.trim() }
                else if (bulkPreorderChoice !== "no-change") { msgUpdate = null }
                const snapshot = getVariantSizeEntries(variant).map(i => ({ value: i.value, size: i.size ?? null, label: i.label, price: i.price, stock: i.stock }))
                const sizeMap = new Map(snapshot.map(i => [i.value, { ...i }]))
                existingRows.forEach(r => { const c = sizeMap.get(r.sizeValue); if (!c) return; if (r.isMarkedForRemoval) { sizeMap.delete(r.sizeValue); return }; if (r.price.length > 0) c.price = Number(r.price); if (r.stock.length > 0 && !nextIsPreorder) c.stock = Number(r.stock) })
                newRows.forEach(r => {
                    const sk = normalizeSizeKey(r.sizeValue); const sl = sk === DEFAULT_SIZE_KEY ? null : r.sizeValue
                    const c = sizeMap.get(sk); if (c) { c.price = Number(r.price); c.stock = nextIsPreorder ? 0 : Number(r.stock) }
                    else { sizeMap.set(sk, { value: sk, size: sl, label: getSizeLabelFromKey(sk), price: Number(r.price), stock: nextIsPreorder ? 0 : Number(r.stock) }) }
                })
                if (sizeMap.size === 0) throw new Error("Each variant needs at least one size.")
                const sizesPayload = Array.from(sizeMap.values()).map(i => ({ size: i.size, price: i.price, stock: nextIsPreorder ? 0 : i.stock }))
                const reqPayload: Record<string, any> = { name: variant.color?.trim() || product.name, sizes: sizesPayload, isPreorder: bulkPreorderChoice === "no-change" ? undefined : nextIsPreorder }
                if (dpUpdate !== undefined) reqPayload.preorderDownPayment = dpUpdate
                if (msgUpdate !== undefined) reqPayload.preorderMessage = msgUpdate
                const resp = await fetch(`/api/products/${product.id}/variants/${variant.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(reqPayload) })
                const payload = await resp.json(); if (!resp.ok) throw new Error(payload.error || "Failed to update the selected variants.")
            }
            await refreshProducts(); resetBulkEditingState(); setBulkSelection(new Set()); setIsBulkEditMode(false); alert("Selected variants were updated.")
        } catch (error) { console.error("Bulk edit failed", error); alert(error instanceof Error ? error.message : "Failed to update selected variants.") }
        finally { setIsSavingBulkEdit(false) }
    }

    const handleBulkDeleteVariants = async () => {
        if (selectedBulkVariants.length === 0) { alert("Select at least one variant."); return }
        try {
            setIsDeletingVariants(true)
            for (const { product, variant } of selectedBulkVariants) {
                const resp = await fetch(`/api/products/${product.id}/variants/${variant.id}`, { method: "DELETE" })
                const payload = await resp.json().catch(() => ({})); if (!resp.ok) throw new Error((payload as { error?: string }).error || "Failed to delete one of the variants.")
            }
            await refreshProducts(); setBulkSelection(new Set()); setIsBulkEditMode(false); resetBulkEditingState(); setIsBulkDeleteDialogOpen(false); alert("Selected variants were deleted.")
        } catch (error) { console.error("Bulk delete failed", error); alert(error instanceof Error ? error.message : "Failed to delete.") }
        finally { setIsDeletingVariants(false) }
    }

    // ─── Inline Edit Handler ───
    const handleInlineEdit = async (productId: number, vid: number, sizeValue: string, field: "price" | "stock", newValue: number) => {
        const lookup = variantLookup.get(vid); if (!lookup) return
        const { variant } = lookup
        const entries = getVariantSizeEntries(variant)
        const updatedSizes = entries.map(e => ({
            size: e.size, price: e.value === sizeValue && field === "price" ? newValue : e.price,
            stock: e.value === sizeValue && field === "stock" ? newValue : e.stock,
        }))
        const resp = await fetch(`/api/products/${productId}/variants/${vid}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: variant.color?.trim() || lookup.product.name, sizes: updatedSizes }),
        })
        if (!resp.ok) { const p = await resp.json().catch(() => ({})); throw new Error((p as any).error || "Failed to save") }
        await refreshProducts()
    }

    return {
        // Store
        products, productCategories, productBrands, isLoadingProducts, refreshProducts,
        createCategory, updateCategory, deleteCategory, createBrand, updateBrand, deleteBrand, refreshCategories, refreshBrands,
        // Table
        groupBy, setGroupBy, sizeView, handleSizeViewChange, filteredProducts,
        // Filter
        searchTerm, setSearchTerm, categoryFilterIds, brandFilterId, setBrandFilterId, toggleCategoryFilter, clearAllFilters,
        // Add Product
        isAddDialogOpen, setIsAddDialogOpen, addProductImages, addProductName, setAddProductName,
        addCategories, setAddCategories, addCategorySelectValue, setAddCategorySelectValue,
        addBrand, setAddBrand, addProductImageEditTargetId, setAddProductImageEditTargetId,
        handleAddProductImagesAdd, handleAddProductImageReplace, handleAddProductImageRemove, handleAddProduct,
        addCategoryIfMissing, removeCategoryFromList,
        // Edit Product
        editingProduct, setEditingProduct, editProductImages, editProductName, setEditProductName,
        editCategories, setEditCategories,
        editCategorySelectValue, setEditCategorySelectValue, editBrand, setEditBrand,
        editProductImageEditTargetId, setEditProductImageEditTargetId, isSavingEdit,
        handleEditProductImagesAdd, handleEditProductImageReplace, handleEditProductImageRemove, handleEditProduct, handleDeleteProduct,
        // Taxonomy
        isTaxonomyDialogOpen, setIsTaxonomyDialogOpen,
        // Variant Dialog
        isAddVariantOpen, variantProduct, variantMode, variantId, variantImages,
        variantCarouselApi, setVariantCarouselApi, addVariantImageInputRef, editVariantImageInputRef,
        variantSku, setVariantSku, variantName, setVariantName, variantDescription, setVariantDescription,
        variantIsPreorder, setVariantIsPreorder, variantIsActive, setVariantIsActive,
        variantPreorderDownPaymentType, setVariantPreorderDownPaymentType,
        variantPreorderDownPaymentValue, setVariantPreorderDownPaymentValue,
        variantPreorderMessage, setVariantPreorderMessage, isSavingVariant,
        variantSizes, variantDownPaymentPreview,
        addVariantSizeRow, updateVariantSizeRow, removeVariantSizeRow,
        handleVariantImagesAdd, handleVariantImageEdit, handleVariantImageRemove,
        requestVariantImageAdd, requestVariantImageEdit, handleVariantSubmit, openVariantDialog, closeVariantDialog,
        // Selected sizes
        selectedVariantSizes, setSelectedVariantSizes: (variantId: number, value: string) => setSelectedVariantSizes(prev => ({ ...prev, [variantId]: value })),
        // Bulk
        isBulkEditMode, bulkSelection, isBulkEditDialogOpen, setIsBulkEditDialogOpen,
        bulkSizeRows, bulkPreorderChoice, setBulkPreorderChoice,
        bulkDownPaymentMode, setBulkDownPaymentMode, bulkDownPaymentValue, setBulkDownPaymentValue,
        bulkPreorderMessageMode, setBulkPreorderMessageMode, bulkPreorderMessageValue, setBulkPreorderMessageValue,
        bulkGuardAcknowledged, setBulkGuardAcknowledged, isSavingBulkEdit,
        isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen, isDeletingVariants,
        selectedBulkVariants, hasMixedPreorderSelection,
        handleBulkModeToggle, toggleVariantBulkSelection,
        openBulkEditDialog, openBulkDeleteDialog,
        addBulkSizeRow, updateBulkSizeRow, removeBulkSizeRow, toggleBulkSizeRemoval,
        handleBulkEditSubmit, handleBulkDeleteVariants,
        // Inline
        handleInlineEdit,
    }
}
