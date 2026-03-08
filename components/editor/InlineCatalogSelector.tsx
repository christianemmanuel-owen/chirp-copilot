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
    const [catalog, setCatalog] = useState<{ products: any[], categories: any[] } | null>(null)
    const [search, setSearch] = useState("")
    const [selected, setSelected] = useState<Set<number>>(new Set(request.selectedIds || []))
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            // If we click inside the selector, ignore
            if (ref.current && ref.current.contains(e.target as Node)) {
                return
            }

            // If we click the iframe itself, the PreviewManager inside will handle the true element
            // We just let the iframe handle its own business, but we should close the popup if they clicked randomly
            const target = e.target as HTMLElement
            if (target.tagName === 'IFRAME') {
                return // Let PreviewManager take care of closing via postMessage
            }

            // Otherwise, it's a click on the editor UI, so close the selector
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
                    categories: data.categoryTiles || []
                })
            })
            .catch(err => console.error(err))
    }, [])

    const isSingle = request.selectionType === "hero-product"
    const items = request.selectionType === "categories" ? catalog?.categories : catalog?.products
    const filtered = items?.filter(item => {
        const itemName = item.displayName || item.name || ""
        return itemName.toLowerCase().includes(search.toLowerCase())
    }) || []

    const toggleSelection = (id: number) => {
        const next = new Set(selected)
        if (isSingle) {
            next.clear()
            next.add(id)
            setSelected(next)
            onSelect(request.sectionId, Array.from(next))
            onClose() // Auto close for single select
            return
        }

        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelected(next)
    }

    const handleSave = () => {
        onSelect(request.sectionId, Array.from(selected))
        onClose()
    }

    return (
        <div
            ref={ref}
            className="fixed z-[100] bg-white rounded-xl shadow-2xl border border-border/50 w-80 flex flex-col animate-in zoom-in-95 duration-200"
            style={{
                top: Math.max(20, request.clientY - 100), // Slightly offset above click
                left: Math.max(20, request.clientX - 160) // Center horizontally over click
            }}
        >
            <div className="flex items-center justify-between p-3 border-b bg-muted/20 rounded-t-xl">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Select {request.selectionType === "categories" ? "Categories" : "Products"}
                </span>
                <Button variant="ghost" size="icon" className="size-6 rounded-md hover:bg-muted" onClick={onClose}>
                    <X className="size-3" />
                </Button>
            </div>

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

            <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin">
                {!catalog ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-xs text-center text-muted-foreground py-4">No results found</div>
                ) : (
                    <div className="space-y-1 w-full overflow-hidden">
                        {filtered.map(item => {
                            const isChecked = selected.has(item.id)
                            return (
                                <div
                                    key={item.id}
                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isChecked ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                                    onClick={() => toggleSelection(item.id)}
                                >
                                    {!isSingle && (
                                        <Checkbox
                                            checked={isChecked}
                                            className="pointer-events-none data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                    )}
                                    <div className="size-8 rounded-md bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center border border-border/50">
                                        {item.image ? (
                                            <img src={item.image} alt={item.displayName || item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="size-4 text-muted-foreground/50" />
                                        )}
                                    </div>
                                    <span className="text-sm font-bold truncate flex-1">{item.displayName || item.name}</span>
                                    {isSingle && isChecked && <Check className="size-4 text-primary" />}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {!isSingle && (
                <div className="p-3 border-t bg-muted/10 rounded-b-xl">
                    <Button className="w-full font-bold shadow-sm" onClick={handleSave}>
                        Apply Selection
                    </Button>
                </div>
            )}
        </div>
    )
}
