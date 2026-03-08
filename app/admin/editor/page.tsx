"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
    ChevronLeft,
    Save,
    GripVertical,
    Eye,
    Settings2,
    Layers,
    Type,
    Palette,
    EyeOff,
    Plus,
    Loader2,
    Undo2,
    Redo2,
    RotateCcw,
    RefreshCcw,
    PanelLeftClose,
    PanelLeftOpen,
    MoreHorizontal,
    Trash2,
    ChevronDown,
    ChevronRight,
    EyeOff as EyeOffIcon
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import GlobalStylesEditor from "@/components/editor/GlobalStylesEditor"
import SectionSettings from "@/components/editor/SectionSettings"
import { SectionLibraryDialog } from "@/components/editor/SectionLibraryDialog"
import { DEFAULT_THEME_COLORS, type StorefrontThemeConfig } from "@/lib/storefront-theme"
import { InlineCatalogSelector, type SelectionRequest } from "@/components/editor/InlineCatalogSelector"
import { InlineIconPicker } from "@/components/editor/InlineIconPicker"
import type { IconName } from "@/lib/icons"




const SECTION_ELEMENTS: Record<string, { label: string, key: string }[]> = {
    hero: [
        { label: "Main Title", key: "heroTitle" },
        { label: "Highlight Title", key: "heroTitleHighlight" },
        { label: "Description", key: "heroDescription" },
        { label: "CTA Button", key: "heroCTA" },
        { label: "Category Quick Links", key: "heroQuickLinks" },
        { label: "Featured Product Card", key: "heroFeaturedCard" },
    ],
    categories: [
        { label: "Section Title", key: "categoryTitle" },
        { label: "Section Subtitle", key: "categorySubtitle" },
        { label: "Category Carousel", key: "categoryList" },
    ],
    about: [
        { label: "Story Title", key: "aboutTitle" },
        { label: "Story Content", key: "aboutContent" },
    ],
    featured: [
        { label: "Header Text", key: "featuredHeader" },
        { label: "Section Title", key: "featuredTitle" },
        { label: "Section Subtitle", key: "featuredSubtitle" },
        { label: "Product Grid", key: "featuredGrid" },
        { label: "CTA Button", key: "featuredCTA" },
    ],
    footer: [
        { label: "Brand Logo", key: "footerBrand" },
        { label: "Mission Statement", key: "footerMission" },
        { label: "Social Links", key: "footerSocials" },
        { label: "Shop/Support Links", key: "footerColumns" },
    ]
}

export default function VisualEditorPage() {
    const router = useRouter()

    // History State
    const [history, setHistory] = useState<{
        past: any[],
        present: any,
        future: any[],
        loading: boolean
    }>({
        past: [],
        present: null,
        future: [],
        loading: true
    })

    const config = history.present
    const isLoading = history.loading

    const [isSaving, setIsSaving] = useState(false)
    const [activeTab, setActiveTab] = useState("sections")
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [expandedSections, setExpandedSections] = useState<string[]>([])
    const [catalogSelectionRequest, setCatalogSelectionRequest] = useState<SelectionRequest | null>(null)
    const [isSectionLibraryOpen, setIsSectionLibraryOpen] = useState(false)
    const [iconSelectionRequest, setIconSelectionRequest] = useState<any>(null)

    const toggleSectionExpansion = (id: string) => {
        setExpandedSections(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        )
    }

    const toggleElementVisibility = (sectionId: string, elementKey: string) => {
        const newLayout = config.experimental.layout.map((section: any) => {
            if (section.id === sectionId) {
                const hiddenFields = section.hiddenFields || []
                const newHiddenFields = hiddenFields.includes(elementKey)
                    ? hiddenFields.filter((k: string) => k !== elementKey)
                    : [...hiddenFields, elementKey]
                return { ...section, hiddenFields: newHiddenFields }
            }
            return section
        })
        updateConfig({
            ...config,
            experimental: {
                ...config.experimental,
                layout: newLayout
            }
        })
    }

    // Helper to update config and push to history
    const updateConfig = (newConfigOrUpdater: any) => {
        setHistory(current => {
            const newPresent = typeof newConfigOrUpdater === 'function'
                ? newConfigOrUpdater(current.present)
                : newConfigOrUpdater

            // Don't push to history if nothing changed
            if (JSON.stringify(newPresent) === JSON.stringify(current.present)) {
                return current
            }

            return {
                past: [...current.past, current.present],
                present: newPresent,
                future: [], // Clear future on new action
                loading: false
            }
        })
    }

    const undo = () => {
        setHistory(current => {
            if (current.past.length === 0) return current
            const previous = current.past[current.past.length - 1]
            const newPast = current.past.slice(0, current.past.length - 1)
            return {
                past: newPast,
                present: previous,
                future: [current.present, ...current.future],
                loading: false
            }
        })
    }

    const redo = () => {
        setHistory(current => {
            if (current.future.length === 0) return current
            const next = current.future[0]
            const newFuture = current.future.slice(1)
            return {
                past: [...current.past, current.present],
                present: next,
                future: newFuture,
                loading: false
            }
        })
    }

    const reset = () => {
        if (confirm("Are you sure you want to revert all unsaved changes and reload the layout?")) {
            setHistory(current => ({
                ...current,
                loading: true
            }))
            loadConfig()
        }
    }

    const startFromScratch = () => {
        if (confirm("WARNING: Are you sure you want to completely restart? This will wipe all changes (including saved ones) and return the page to its original default state.")) {
            setHistory(current => ({ ...current, loading: true }))

            const defaultConfig = {
                ...config,
                theme: {
                    fontFamily: 'geist-sans',
                    colors: DEFAULT_THEME_COLORS
                },
                experimental: {
                    ...config?.experimental,
                    content: {
                        heroTitle: "Exquisite Pieces.",
                        heroTitleHighlight: "Designed for life.",
                        heroDescription: "Elevate your lifestyle with our premium collection of hand-picked goods.",
                        featuredTitle: "Featured Collection",
                        featuredSubtitle: "Our most coveted pieces, selected for you.",
                        aboutTitle: "Our Commitment to Quality",
                        aboutContent: "We believe that the objects you surround yourself with should be as intentional as the life you lead. Each piece in our collection is selected for its superior craftsmanship, timeless design, and functional excellence.",
                        footerMission: "Elevating your lifestyle with curated, high-end essentials designed for intentional living.",
                        footerNewsletterBlurb: "Join our inner circle for exclusive drops and design stories.",
                        heroCTALink: "/catalog",
                        featuredCTALink: "/catalog"
                    },
                    layout: [
                        { id: "hero-1", type: "hero", enabled: true, styles: {} },
                        { id: "categories-1", type: "categories", enabled: true, styles: {} },
                        { id: "about-1", type: "about", enabled: true, styles: {} },
                        { id: "featured-1", type: "featured", enabled: true, styles: {} },
                        { id: "footer-1", type: "footer", enabled: true, styles: {} },
                    ]
                }
            }

            setHistory({
                past: [...history.past, history.present],
                present: defaultConfig,
                future: [],
                loading: false
            })
        }
    }

    const loadConfig = async () => {
        try {
            const res = await fetch("/api/storefront-settings")
            const result = await res.json()
            if (result.data) {
                setHistory({
                    past: [],
                    present: result.data,
                    future: [],
                    loading: false
                })
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to load editor settings.",
                variant: "destructive"
            })
            setHistory(prev => ({ ...prev, loading: false }))
        }
    }

    // Preview state
    const previewRef = useRef<HTMLIFrameElement>(null)

    useEffect(() => {
        loadConfig()
    }, [])

    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            const { type, sectionId, elementKey, styles, content } = e.data
            if (!config) return

            if (type === 'STYLE_UPDATE') {
                updateConfig((prev: any) => {
                    if (!prev) return prev
                    const newLayout = prev.experimental.layout.map((s: any) => {
                        if (s.id === sectionId) {
                            return {
                                ...s,
                                styles: {
                                    ...s.styles,
                                    [elementKey]: {
                                        ...(s.styles?.[elementKey] || {}),
                                        ...styles
                                    }
                                }
                            }
                        }
                        return s
                    })
                    return {
                        ...prev,
                        experimental: { ...prev.experimental, layout: newLayout }
                    }
                })
            }

            if (type === 'CONTENT_UPDATE') {
                updateConfig((prev: any) => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        experimental: {
                            ...prev.experimental,
                            content: {
                                ...prev.experimental.content,
                                [elementKey]: content
                            }
                        }
                    }
                })
            }

            if (type === 'CATALOG_SELECTION_REQUEST') {
                const { sectionId, selectionType, clientX, clientY, elementKey } = e.data
                const section = config.experimental.layout.find((s: any) => s.id === sectionId)

                if (selectionType === "icon") {
                    if (previewRef.current) {
                        const rect = previewRef.current.getBoundingClientRect()
                        setIconSelectionRequest({
                            sectionId,
                            iconKey: elementKey,
                            clientX: clientX + rect.left,
                            clientY: clientY + rect.top,
                            currentIcon: section?.styles?.[elementKey]?.iconName
                        })
                    }
                    return
                }

                const selectedIds = selectionType === "categories"
                    ? section?.metadata?.selectedCategoryIds || []
                    : section?.metadata?.selectedProductIds || []

                if (previewRef.current) {
                    const rect = previewRef.current.getBoundingClientRect()
                    setCatalogSelectionRequest({
                        sectionId,
                        selectionType,
                        clientX: clientX + rect.left,
                        clientY: clientY + rect.top,
                        selectedIds
                    })
                }
            }

            if (type === 'CATALOG_SELECTION_POSITION_UPDATE') {
                if (previewRef.current) {
                    const iframeRect = previewRef.current.getBoundingClientRect()
                    setCatalogSelectionRequest((prev: any) => prev ? ({
                        ...prev,
                        clientX: e.data.rect.left + iframeRect.left,
                        clientY: e.data.rect.top + iframeRect.top
                    }) : null)
                }
            }

            if (type === 'CATALOG_SELECTION_CLOSED') {
                setCatalogSelectionRequest(null)
            }
        }

        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [config])

    // Push config to preview iframe
    useEffect(() => {
        if (config && previewRef.current?.contentWindow) {
            previewRef.current.contentWindow.postMessage({
                type: 'CONFIG_UPDATE',
                config
            }, '*')
        }
    }, [config])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await fetch("/api/storefront-settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            })
            if (!res.ok) throw new Error()
            toast({
                title: "Layout Saved",
                description: "Your landing page structure has been updated."
            })
            // Reload preview if needed
            if (previewRef.current) {
                previewRef.current.src = previewRef.current.src
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to persist layout changes.",
                variant: "destructive"
            })
        } finally {
            setIsSaving(false)
        }
    }

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return

        const items = Array.from(config.experimental.layout)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)

        updateConfig({
            ...config,
            experimental: {
                ...config.experimental,
                layout: items
            }
        })
    }

    const handleAddSection = (type: string, variant: string) => {
        const id = `${type}-${Date.now()}`
        const newSection = {
            id,
            type,
            enabled: true,
            styles: {},
            metadata: { variant },
            background: (type === "hero" && variant === "v3")
                ? { overlayEnabled: true }
                : (type === "about" && variant === "v1")
                    ? {
                        image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=2070&auto=format&fit=crop",
                        overlayEnabled: true,
                        overlayOpacity: 0.5,
                        overlayBrightness: 0.5
                    }
                    : (type === "about" && variant === "v3")
                        ? {
                            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
                        }
                        : (type === "about" && variant === "v4")
                            ? { color: "#f8fafc" }
                            : (type === "about" && variant === "v5")
                                ? { color: "#ffffff" }
                                : (type === "footer" && variant === "v2")
                                    ? { color: "#000000" }
                                    : undefined
        }

        updateConfig((prev: any) => ({
            ...prev,
            experimental: {
                ...prev.experimental,
                layout: [...prev.experimental.layout, newSection]
            }
        }))

        setExpandedSections(prev => [...prev, id])

        toast({
            title: "Section Added",
            description: `A new ${type} variation has been added to your layout.`
        })
    }

    const handleRemoveSection = (id: string) => {
        if (!confirm("Are you sure you want to remove this section? This cannot be undone easily (though you can use 'Undo').")) return

        const section = config.experimental.layout.find((s: any) => s.id === id)
        const newLayout = config.experimental.layout.filter((s: any) => s.id !== id)

        updateConfig({
            ...config,
            experimental: {
                ...config.experimental,
                layout: newLayout
            }
        })

        setExpandedSections(prev => prev.filter(s => s !== id))

        toast({
            title: "Section Removed",
            description: `The ${section?.type} section has been removed from your layout.`
        })
    }

    const handleIconSelect = (sectionId: string, iconKey: string, iconName: IconName) => {
        updateConfig((prev: any) => {
            const newLayout = prev.experimental.layout.map((item: any) => {
                if (item.id === sectionId) {
                    return {
                        ...item,
                        styles: {
                            ...item.styles,
                            [iconKey]: {
                                ...(item.styles?.[iconKey] || {}),
                                iconName
                            }
                        }
                    }
                }
                return item
            })
            return {
                ...prev,
                experimental: { ...prev.experimental, layout: newLayout }
            }
        })
    }

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-white relative">
            {catalogSelectionRequest && (
                <InlineCatalogSelector
                    request={catalogSelectionRequest}
                    onClose={() => {
                        setCatalogSelectionRequest(null)
                        if (previewRef.current?.contentWindow) {
                            previewRef.current.contentWindow.postMessage({ type: 'CATALOG_SELECTION_CLOSED' }, '*')
                        }
                    }}
                    onSelect={(sectionId, selectedIds) => {
                        const newLayout = config.experimental.layout.map((item: any) => {
                            if (item.id === sectionId) {
                                const isCat = catalogSelectionRequest.selectionType === "categories"
                                return {
                                    ...item,
                                    metadata: {
                                        ...item.metadata,
                                        [isCat ? "selectedCategoryIds" : "selectedProductIds"]: selectedIds
                                    }
                                }
                            }
                            return item
                        })
                        updateConfig({ ...config, experimental: { ...config.experimental, layout: newLayout } })
                    }}
                />
            )}

            <SectionLibraryDialog
                open={isSectionLibraryOpen}
                onOpenChange={setIsSectionLibraryOpen}
                onAddSection={handleAddSection}
            />

            {/* Sidebar Editor */}
            <div className={`w-[400px] flex-shrink-0 border-r border-border flex flex-col h-full bg-muted/5 shadow-2xl z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-0' : '-ml-[400px]'}`}>
                <div className="p-6 border-b border-border flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild className="rounded-xl">
                            <Link href="/admin/settings?tab=experimental">
                                <ChevronLeft className="size-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-lg font-black tracking-tight">Page Editor</h1>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Experimental</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted ml-auto"
                        onClick={() => setIsSidebarOpen(false)}
                        title="Collapse Sidebar"
                    >
                        <PanelLeftClose className="size-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                        <div className="px-6 py-4 border-b">
                            <TabsList className="w-full bg-muted p-1 rounded-xl">
                                <TabsTrigger value="sections" className="flex-1 rounded-lg font-bold py-2">
                                    <Layers className="size-4 mr-2" />
                                    Sections
                                </TabsTrigger>
                                <TabsTrigger value="styles" className="flex-1 rounded-lg font-bold py-2">
                                    <Palette className="size-4 mr-2" />
                                    Global
                                </TabsTrigger>
                            </TabsList>
                        </div>


                        <TabsContent value="sections" className="m-0 flex-1 overflow-hidden h-full">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key="sections"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="h-full"
                                >
                                    <ScrollArea className="h-full px-6 py-4">
                                        <div className="space-y-4 pb-20">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground/50">Active Layout</h2>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 rounded-lg text-xs font-bold text-primary"
                                                    onClick={() => setIsSectionLibraryOpen(true)}
                                                >
                                                    <Plus className="size-3 mr-1" /> Add Section
                                                </Button>
                                            </div>

                                            <DragDropContext onDragEnd={onDragEnd}>
                                                <Droppable droppableId="sections-list">
                                                    {(provided) => (
                                                        <div
                                                            {...provided.droppableProps}
                                                            ref={provided.innerRef}
                                                            className="space-y-4"
                                                        >
                                                            {(config.experimental?.layout || []).map((section: any, idx: number) => {
                                                                const isExpanded = expandedSections.includes(section.id)
                                                                const elements = SECTION_ELEMENTS[section.type] || []

                                                                return (
                                                                    <Draggable key={section.id} draggableId={section.id} index={idx}>
                                                                        {(provided, snapshot) => (
                                                                            <div
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                className={`${snapshot.isDragging ? "z-50 shadow-2xl scale-105" : ""} transition-transform`}
                                                                            >
                                                                                <Card className={`overflow-hidden border-2 ${snapshot.isDragging ? "border-primary bg-white" : "border-border/50 hover:border-primary/30 bg-white"} transition-all group shadow-none rounded-2xl`}>
                                                                                    <div className="p-4">
                                                                                        <div className="flex items-center gap-4">
                                                                                            <div
                                                                                                {...provided.dragHandleProps}
                                                                                                className="text-muted-foreground group-hover:text-primary transition-colors cursor-grab active:cursor-grabbing"
                                                                                            >
                                                                                                <GripVertical className="size-4" />
                                                                                            </div>
                                                                                            <div
                                                                                                className="flex-1 cursor-pointer flex items-center gap-2"
                                                                                                onClick={() => toggleSectionExpansion(section.id)}
                                                                                            >
                                                                                                {isExpanded ? <ChevronDown className="size-3 text-muted-foreground" /> : <ChevronRight className="size-3 text-muted-foreground" />}
                                                                                                <div className="flex flex-col">
                                                                                                    <span className="text-xs font-black uppercase tracking-tight text-foreground">{section.type}</span>
                                                                                                    {!section.enabled && <span className="text-[10px] font-bold text-muted-foreground/50">Hidden from page</span>}
                                                                                                </div>
                                                                                            </div>

                                                                                            <div className="flex items-center gap-1">
                                                                                                <Popover>
                                                                                                    <PopoverTrigger asChild>
                                                                                                        <Button
                                                                                                            variant="ghost"
                                                                                                            size="icon"
                                                                                                            className="size-8 rounded-lg"
                                                                                                            title="Section Styles & Content"
                                                                                                        >
                                                                                                            <MoreHorizontal className="size-4 opacity-40 hover:opacity-100" />
                                                                                                        </Button>
                                                                                                    </PopoverTrigger>
                                                                                                    <PopoverContent className="w-80 rounded-[2rem] p-6 shadow-2xl border-2" side="right" align="start">
                                                                                                        <div className="space-y-4">
                                                                                                            <div>
                                                                                                                <h4 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                                                                                                    <Settings2 className="size-4 text-primary" />
                                                                                                                    Section Settings
                                                                                                                </h4>
                                                                                                                <p className="text-[10px] font-bold text-muted-foreground mt-1">Customize the appearance of this {section.type} section.</p>
                                                                                                            </div>
                                                                                                            <Separator />
                                                                                                            <SectionSettings
                                                                                                                sectionType={section.type}
                                                                                                                background={section.background}
                                                                                                                section={section}
                                                                                                                onChange={(background, sectionUpdates) => {
                                                                                                                    const newLayout = config.experimental.layout.map((item: any) => {
                                                                                                                        if (item.id === section.id) {
                                                                                                                            return { ...item, background, ...sectionUpdates }
                                                                                                                        }
                                                                                                                        return item
                                                                                                                    })
                                                                                                                    updateConfig({
                                                                                                                        ...config,
                                                                                                                        experimental: {
                                                                                                                            ...config.experimental,
                                                                                                                            layout: newLayout
                                                                                                                        }
                                                                                                                    })
                                                                                                                }}
                                                                                                            />
                                                                                                        </div>
                                                                                                    </PopoverContent>
                                                                                                </Popover>

                                                                                                <Button
                                                                                                    variant="ghost"
                                                                                                    size="icon"
                                                                                                    className="size-8 rounded-lg"
                                                                                                    title={section.enabled ? "Hide Section" : "Show Section"}
                                                                                                    onClick={() => {
                                                                                                        const newLayout = config.experimental.layout.map((item: any, i: number) => {
                                                                                                            if (i === idx) {
                                                                                                                return { ...item, enabled: !item.enabled }
                                                                                                            }
                                                                                                            return item
                                                                                                        })
                                                                                                        updateConfig({
                                                                                                            ...config,
                                                                                                            experimental: {
                                                                                                                ...config.experimental,
                                                                                                                layout: newLayout
                                                                                                            }
                                                                                                        })
                                                                                                    }}
                                                                                                >
                                                                                                    {section.enabled ? <Eye className="size-4 opacity-40 hover:opacity-100" /> : <EyeOffIcon className="size-4 text-primary" />}
                                                                                                </Button>

                                                                                                <Button
                                                                                                    variant="ghost"
                                                                                                    size="icon"
                                                                                                    className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                                                    title="Delete Section"
                                                                                                    onClick={() => handleRemoveSection(section.id)}
                                                                                                >
                                                                                                    <Trash2 className="size-4 opacity-40 group-hover:opacity-100" />
                                                                                                </Button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>

                                                                                    {isExpanded && elements.length > 0 && (
                                                                                        <div className="bg-muted/30 border-t border-border/50 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                                <Layers className="size-3 text-muted-foreground/50" />
                                                                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Element Breakdown</span>
                                                                                            </div>
                                                                                            <div className="space-y-1">
                                                                                                {elements.map((el) => {
                                                                                                    const isHidden = section.hiddenFields?.includes(el.key)
                                                                                                    return (
                                                                                                        <div key={el.key} className="flex items-center justify-between group/el py-1">
                                                                                                            <span className={`text-[11px] font-bold ${isHidden ? 'text-muted-foreground/40 line-through' : 'text-muted-foreground'}`}>
                                                                                                                {el.label}
                                                                                                            </span>
                                                                                                            <Button
                                                                                                                variant="ghost"
                                                                                                                size="icon"
                                                                                                                className="size-6 rounded-md hover:bg-white"
                                                                                                                onClick={() => toggleElementVisibility(section.id, el.key)}
                                                                                                                title={isHidden ? "Show Element" : "Hide Element"}
                                                                                                            >
                                                                                                                {isHidden ? <EyeOffIcon className="size-3 text-primary" /> : <Eye className="size-3 opacity-30 group-hover/el:opacity-100" />}
                                                                                                            </Button>
                                                                                                        </div>
                                                                                                    )
                                                                                                })}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </Card>
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                )
                                                            })}
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            </DragDropContext>
                                        </div>
                                    </ScrollArea>
                                </motion.div>
                            </AnimatePresence>
                        </TabsContent>

                        <TabsContent value="styles" className="m-0 flex-1 overflow-hidden h-full">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key="styles"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="h-full"
                                >
                                    <ScrollArea className="h-full px-6 py-4">
                                        <div className="pb-20">
                                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-6">
                                                <p className="text-xs font-medium text-primary/70 leading-relaxed">
                                                    Global styles apply to all components. Use inline editing to override specific elements.
                                                </p>
                                            </div>
                                            <GlobalStylesEditor
                                                theme={config.theme || {
                                                    fontFamily: 'geist-sans',
                                                    colors: DEFAULT_THEME_COLORS
                                                }}
                                                onChange={(updates) => {
                                                    updateConfig((prev: any) => ({
                                                        ...prev,
                                                        theme: {
                                                            ...prev.theme,
                                                            ...updates,
                                                            colors: updates.colors ? { ...prev.theme.colors, ...updates.colors } : prev.theme.colors
                                                        }
                                                    }))
                                                }}
                                            />
                                        </div>
                                    </ScrollArea>
                                </motion.div>
                            </AnimatePresence>
                        </TabsContent>

                    </Tabs>
                </div>

                <div className="p-6 border-t bg-muted/30">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex bg-white shadow-sm border rounded-xl p-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-9 rounded-lg hover:bg-muted"
                                onClick={undo}
                                disabled={history.past.length === 0}
                                title="Undo"
                            >
                                <Undo2 className="size-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-9 rounded-lg hover:bg-muted"
                                onClick={redo}
                                disabled={history.future.length === 0}
                                title="Redo"
                            >
                                <Redo2 className="size-4" />
                            </Button>
                            <Separator orientation="vertical" className="h-6 mx-1 my-auto" />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={reset}
                                title="Reset to Last Save"
                            >
                                <RotateCcw className="size-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-9 rounded-lg text-destructive hover:text-white hover:bg-destructive"
                                onClick={startFromScratch}
                                title="Start From Scratch"
                            >
                                <RefreshCcw className="size-4" />
                            </Button>
                        </div>
                        <Button
                            size="lg"
                            className="rounded-xl font-bold px-8 shadow-md hover:shadow-lg transition-all"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
                            Save
                        </Button>
                    </div>
                </div>
            </div>

            {/* Live Preview */}
            <div className="flex-1 bg-slate-100 relative group overflow-hidden">
                {!isSidebarOpen && (
                    <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-6 left-4 z-50 rounded-xl shadow-md border border-border/50 bg-white/50 backdrop-blur-md hover:bg-white transition-opacity"
                        onClick={() => setIsSidebarOpen(true)}
                        title="Expand Sidebar"
                    >
                        <PanelLeftOpen className="size-4" />
                    </Button>
                )}

                <div className={`absolute top-6 right-12 bottom-6 bg-white shadow-2xl rounded-3xl overflow-hidden border-8 border-slate-200/50 transition-all duration-700 group-hover:scale-[1.005] ${isSidebarOpen ? 'left-16' : 'left-16'}`}>
                    <iframe
                        ref={previewRef}
                        src="/?preview=true"
                        className="w-full h-full border-none"
                        title="Storefront Preview"
                    />
                </div>
            </div>
            {iconSelectionRequest && (
                <InlineIconPicker
                    request={iconSelectionRequest}
                    onClose={() => setIconSelectionRequest(null)}
                    onSelect={handleIconSelect}
                />
            )}
        </div>
    )
}
