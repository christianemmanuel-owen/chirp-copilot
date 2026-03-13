"use client"

import { useEffect, useState, useRef } from "react"
import { Loader2, X, Check, Search, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

export interface SelectionRequest {
    sectionId: string
    selectionType: string // "hero-product", "featured", "categories"
    clientX: number
    clientY: number
    selectedIds: number[]
}

interface Props {
    request: SelectionRequest
    onClose: () => void
    onSelect: (sectionId: string, selectedIds: number[]) => void
}

export function InlineCatalogSelector({ request, onClose, onSelect }: Props) {
    const [catalog, setCatalog] = useState<{ products: any[], categories: any[], discountCampaigns: any[] } | null>(null)
    const [search, setSearch] = useState("")
    const [selected, setSelected] = useState<string[]>(request.selectedIds?.map(String) || [])
    const [activeTab, setActiveTab] = useState<string>(
        request.selectionType === "categories" ? "categories" : "products"
    )
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && ref.current.contains(e.target as Node)) {
                return
            }
            const target = e.target as HTMLElement
            if (target.tagName === 'IFRAME') {
                return
            }
            onClose()
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            }
        }

        document.addEventListener("mousedown", handleClickOutside, true)
        document.addEventListener("keydown", handleKeyDown, true)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside, true)
            document.removeEventListener("keydown", handleKeyDown, true)
        }
    }, [onClose])

    useEffect(() => {
        fetch("/api/catalog-data")
            .then(res => res.json())
            .then(data => {
                setCatalog({
                    products: data.variants || [],
                    categories: data.categoryTiles || [],
                    discountCampaigns: data.discountCampaigns || []
                })
            })
            .catch(err => console.error(err))
    }, [])

    const isSingle = request.selectionType === "hero-product"
    const isBannerSelection = request.selectionType === "banner-slides"

    const items = activeTab === "categories"
        ? catalog?.categories
        : activeTab === "campaigns"
            ? catalog?.discountCampaigns
            : catalog?.products

    const filtered = items?.filter(item => {
        const itemName = item.displayName || item.name || item.title || ""
        return itemName.toLowerCase().includes(search.toLowerCase())
    }) || []

    const toggleSelection = (id: string) => {
        if (isSingle) {
            setSelected([id])
            onSelect(request.sectionId, [Number(id)])
            onClose()
            return
        }

        if (selected.includes(id)) {
            setSelected(selected.filter(item => item !== id))
        } else {
            if (isBannerSelection && selected.length >= 5) {
                return // Limit to 5 for banner
            }
            setSelected([...selected, id])
        }
    }

    const handleSave = () => {
        onSelect(request.sectionId, selected.map(Number))
        onClose()
    }

    const tabs = [
        { id: "products", label: "Products" },
        { id: "categories", label: "Categories" },
        { id: "campaigns", label: "Campaigns" }
    ]

    return (
        <div
            ref={ref}
            className="fixed z-[100] bg-white rounded-xl shadow-2xl border border-border/50 w-[calc(100vw-40px)] sm:w-96 flex flex-col animate-in zoom-in-95 duration-200"
            style={{
                top: Math.max(10, Math.min(window.innerHeight - 500, request.clientY - 100)),
                left: Math.max(10, Math.min(window.innerWidth - 400, request.clientX - 180))
            }}
        >
            <div className="flex items-center justify-between p-3 border-b bg-muted/20 rounded-t-xl">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    {isBannerSelection ? `Select Banner Slides (${selected.length}/5)` : `Select ${activeTab}`}
                </span>
                <Button variant="ghost" size="icon" className="size-6 rounded-md hover:bg-muted" onClick={onClose}>
                    <X className="size-3" />
                </Button>
            </div>

            {isBannerSelection && (
                <div className="flex p-1 bg-muted/10 border-b gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === tab.id ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:bg-white/50'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            <div className="p-3 border-b border-border/50">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        className="pl-9 h-9 text-sm rounded-lg"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 scrollbar-thin">
                {!catalog ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="size-5 animate-spin text-muted-foreground opacity-50" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-xs text-center text-muted-foreground py-8 font-medium">No results found in {activeTab}</div>
                ) : (
                    <div className="space-y-1 w-full overflow-hidden">
                        {filtered.map(item => {
                            const itemId = String(item.id)
                            const selectionOrder = selected.indexOf(itemId) + 1
                            const isChecked = selectionOrder > 0
                            return (
                                <div
                                    key={itemId}
                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${isChecked ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-muted/50'}`}
                                    onClick={() => toggleSelection(itemId)}
                                >
                                    <div className="flex-shrink-0 w-6 flex items-center justify-center">
                                        {isChecked ? (
                                            <div className="size-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center animate-in zoom-in-50 duration-200">
                                                {isSingle ? <Check className="size-3" /> : selectionOrder}
                                            </div>
                                        ) : (
                                            <div className="size-5 rounded-full border-2 border-muted-foreground/20" />
                                        )}
                                    </div>
                                    <div className="size-10 rounded-lg bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center border border-border/50">
                                        {(item.image || item.bannerImage) ? (
                                            <img src={item.image || item.bannerImage} alt={item.displayName || item.name || item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="size-5 text-muted-foreground/30" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate leading-tight">{item.displayName || item.name || item.title}</p>
                                        <p className="text-[10px] text-muted-foreground truncate opacity-70">
                                            {activeTab === "products" ? item.brandName : activeTab === "campaigns" ? "Discount Campaign" : "Category"}
                                        </p>
                                    </div>
                                    {isSingle && isChecked && <Check className="size-4 text-primary" />}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {!isSingle && (
                <div className="p-3 border-t bg-muted/20 rounded-b-xl">
                    <Button className="w-full font-black text-[10px] uppercase tracking-widest shadow-lg h-10" onClick={handleSave}>
                        Apply Selection
                    </Button>
                </div>
            )}
        </div>
    )
}
