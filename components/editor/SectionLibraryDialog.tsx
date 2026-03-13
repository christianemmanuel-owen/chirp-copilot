"use client"

import React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
    Layout,
    Image as ImageIcon,
    Type,
    Grid,
    Play,
    CreditCard,
    Info,
    ShoppingBag,
    Rows3,
    Columns2,
    ArrowDownToLine
} from "lucide-react"

interface SectionVariation {
    id: string
    type: string
    name: string
    description: string
    skeleton: React.ReactNode
}

interface SectionLibraryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAddSection: (type: string, variant: string) => void
    pageType?: 'home' | 'catalog'
}

const VARIATIONS: Record<string, SectionVariation[]> = {
    hero: [
        {
            id: "v1",
            type: "hero",
            name: "Pill Highlight",
            description: "Full-bleed image with a floating product pill.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl relative overflow-hidden border border-border/50">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 h-12 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 flex items-center px-3 gap-2">
                        <div className="flex-1 space-y-1.5">
                            <div className="w-12 h-1.5 bg-primary/20 rounded-full" />
                            <div className="w-24 h-2.5 bg-black/10 rounded-full" />
                        </div>
                        <div className="size-6 bg-primary/20 rounded-md" />
                    </div>
                </div>
            )
        },
        {
            id: "v2",
            type: "hero",
            name: "Split Screen",
            description: "Large typography on one side, bold image on the other.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl flex border border-border/50 overflow-hidden">
                    <div className="flex-1 p-4 flex flex-col justify-center gap-3">
                        <div className="w-full h-4 bg-foreground/10 rounded-full" />
                        <div className="w-2/3 h-4 bg-foreground/10 rounded-full" />
                        <div className="w-1/2 h-8 bg-primary/20 rounded-full mt-2" />
                    </div>
                    <div className="flex-1 bg-black/5 border-l border-border/50" />
                </div>
            )
        },
        {
            id: "v3",
            type: "hero",
            name: "Centered Overlay",
            description: "Centered text content over a full-screen image.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl relative flex flex-col items-center justify-center p-6 gap-3 border border-border/50 overflow-hidden">
                    <div className="absolute inset-0 bg-black/5" />
                    <div className="w-3/4 h-4 bg-foreground/10 rounded-full z-10" />
                    <div className="w-1/2 h-4 bg-foreground/10 rounded-full z-10" />
                    <div className="w-24 h-10 bg-primary/20 rounded-full mt-4 z-10" />
                </div>
            )
        }
    ],
    "collection-spotlight": [
        {
            id: "glass-carousel",
            type: "collection-spotlight",
            name: "Glass Carousel",
            description: "Smooth horizontally scrolling carousel with glassmorphic cards.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl p-4 flex flex-col gap-4 border border-border/50 overflow-hidden relative">
                    <div className="w-1/3 h-2.5 bg-foreground/10 rounded-full" />
                    <div className="flex gap-4">
                        {[1, 2].map(i => (
                            <div key={i} className="flex-[0_0_70%] aspect-[4/5] bg-black/5 rounded-[2rem] relative border border-white/20">
                                <div className="absolute inset-x-4 bottom-4 h-16 backdrop-blur-md bg-white/10 rounded-2xl border border-white/20" />
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: "banner-carousel",
            type: "collection-spotlight",
            name: "Banner Carousel",
            description: "Immersive full-bleed banner carousel with centered typography.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl border border-border/50 overflow-hidden relative flex flex-col items-center justify-center p-8 gap-4">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-white/20" />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-white/20" />
                    <div className="w-24 h-5 rounded-full bg-white/30 z-10" />
                    <div className="w-3/4 h-8 bg-white/20 rounded-xl z-10" />
                    <div className="w-1/2 h-4 bg-white/10 rounded-full z-10" />
                    <div className="absolute bottom-4 flex gap-1.5 z-10">
                        {[1, 2, 3].map(i => <div key={i} className="size-1.5 rounded-full bg-white/30" />)}
                    </div>
                </div>
            )
        },
        {
            id: "split-reveal",
            type: "collection-spotlight",
            name: "Split Reveal",
            description: "High-contrast split layout with staggered image reveals.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl flex border border-border/50 overflow-hidden">
                    <div className="flex-1 p-4 flex flex-col justify-center gap-3">
                        <div className="w-12 h-1 bg-primary rounded-full" />
                        <div className="space-y-1">
                            <div className="w-full h-4 bg-foreground/20 rounded-full" />
                            <div className="w-4/5 h-4 bg-foreground/20 rounded-full" />
                        </div>
                        <div className="w-24 h-8 bg-black/80 rounded-full mt-2" />
                    </div>
                    <div className="w-[40%] bg-black/5 m-4 rounded-[2rem] border border-border/50" />
                </div>
            )
        },
        {
            id: "bento-spotlight",
            type: "collection-spotlight",
            name: "Bento Spotlight",
            description: "Modern grid-based showcase for multiple featured items.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl p-3 grid grid-cols-2 grid-rows-2 gap-2 border border-border/50 overflow-hidden">
                    <div className="row-span-2 bg-black/5 rounded-2xl relative">
                        <div className="absolute bottom-3 left-3 w-1/2 h-2 bg-foreground/10 rounded-full" />
                    </div>
                    <div className="bg-black/5 rounded-2xl" />
                    <div className="bg-black/5 rounded-2xl" />
                </div>
            )
        },
        {
            id: "minimal-banner",
            type: "collection-spotlight",
            name: "Minimal Banner",
            description: "Clean, typography-focused banner with subtle depth.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl flex flex-col items-center justify-center p-6 gap-4 border border-border/50 overflow-hidden relative">
                    <div className="w-24 h-6 rounded-full border border-primary/20 bg-primary/5" />
                    <div className="space-y-2 w-full flex flex-col items-center">
                        <div className="w-3/4 h-5 bg-foreground/20 rounded-full" />
                        <div className="w-1/2 h-3 bg-foreground/10 rounded-full" />
                    </div>
                    <div className="w-32 h-1.5 bg-foreground/10 rounded-full mt-4" />
                </div>
            )
        }
    ],
    categories: [
        {
            id: "v1",
            type: "categories",
            name: "Smooth Carousel",
            description: "Infinite auto-scrolling row of category tiles.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl p-4 space-y-4 border border-border/50 overflow-hidden">
                    <div className="w-1/3 h-3 bg-foreground/10 rounded-full" />
                    <div className="flex gap-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex-[0_0_100px] aspect-[4/5] bg-black/5 rounded-2xl relative">
                                <div className="absolute bottom-2 left-2 right-2 h-4 bg-white/50 rounded-md" />
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: "v2",
            type: "categories",
            name: "Static Grid",
            description: "A clean, responsive grid of your main collections.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl p-4 space-y-4 border border-border/50 overflow-hidden">
                    <div className="w-1/3 h-3 bg-foreground/10 rounded-full" />
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-square bg-black/5 rounded-2xl relative">
                                <div className="absolute inset-0 flex flex-col justify-end p-2">
                                    <div className="w-full h-3 bg-white/50 rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    ],
    about: [
        {
            id: "v1",
            type: "about",
            name: "Centered Overlay",
            description: "A premium full-screen story with immersive imagery.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl flex items-center justify-center border border-border/50 overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center p-8">
                        <div className="space-y-3 w-full max-w-[60%] flex flex-col items-center">
                            <div className="w-1/2 h-4 bg-foreground/20 rounded-full" />
                            <div className="w-full h-2 bg-foreground/10 rounded-full" />
                            <div className="w-full h-2 bg-foreground/10 rounded-full" />
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "v2",
            type: "about",
            name: "Centered Minimal",
            description: "Clean typography focused on your brand's mission.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl p-6 flex flex-col items-center justify-center gap-4 border border-border/50">
                    <div className="w-3/4 h-3 bg-foreground/10 rounded-full" />
                    <div className="w-full h-2 bg-foreground/5 rounded-full" />
                    <div className="w-full h-2 bg-foreground/5 rounded-full" />
                    <div className="w-2/3 h-2 bg-foreground/5 rounded-full" />
                </div>
            )
        },
        {
            id: "v3",
            type: "about",
            name: "Split Minimal",
            description: "A modern dual-pane layout for story and craft.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl flex border border-border/50 overflow-hidden">
                    <div className="flex-1 p-4 flex flex-col justify-center gap-2">
                        <div className="w-2/3 h-3 bg-foreground/20 rounded-full" />
                        <div className="w-full h-2 bg-foreground/10 rounded-full" />
                        <div className="w-4/5 h-2 bg-foreground/10 rounded-full" />
                    </div>
                    <div className="w-1/3 bg-black/5 border-l border-border/50" />
                </div>
            )
        }
    ],
    featured: [
        {
            id: "v1",
            type: "featured",
            name: "Product Grid",
            description: "Your top items in a neat, balanced layout.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl p-4 space-y-4 border border-border/50 overflow-hidden">
                    <div className="flex flex-col items-center gap-1.5">
                        <div className="w-24 h-2 bg-primary/20 rounded-full" />
                        <div className="w-32 h-3 bg-foreground/10 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-[3/4] bg-black/5 rounded-xl flex flex-col p-2 gap-1.5">
                                <div className="flex-1 bg-white/40 rounded-lg" />
                                <div className="w-full h-2 bg-foreground/10 rounded-full" />
                                <div className="w-1/2 h-2 bg-foreground/10 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: "v2",
            type: "featured",
            name: "Row Scroller",
            description: "A horizontal slider for products, perfect for mobile.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl p-4 space-y-4 border border-border/50 overflow-hidden">
                    <div className="w-1/3 h-3 bg-foreground/10 rounded-full" />
                    <div className="flex gap-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex-[0_0_120px] aspect-[3/4] bg-black/5 rounded-xl flex flex-col p-2 gap-1.5">
                                <div className="flex-1 bg-white/40 rounded-lg" />
                                <div className="w-full h-1.5 bg-foreground/10 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: "v3",
            type: "featured",
            name: "Premium Spotlight",
            description: "One large hero product paired with a signature grid.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl p-4 space-y-4 border border-border/50 overflow-hidden">
                    <div className="grid grid-cols-3 gap-3 h-full pb-8">
                        <div className="col-span-2 bg-black/5 rounded-2xl p-3 flex flex-col gap-2">
                            <div className="flex-1 bg-white/40 rounded-lg" />
                            <div className="w-1/2 h-2 bg-foreground/10 rounded-full" />
                        </div>
                        <div className="col-span-1 flex flex-col gap-3">
                            {[1, 2].map(i => (
                                <div key={i} className="flex-1 bg-black/5 rounded-xl p-2 flex flex-col gap-1.5">
                                    <div className="flex-1 bg-white/40 rounded-lg" />
                                    <div className="w-full h-1 bg-foreground/10 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "v4",
            type: "about",
            name: "Icon Grid",
            description: "Highlight key features or values in a clean grid.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl p-4 grid grid-cols-3 gap-3 border border-border/50">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex flex-col items-center justify-center gap-2">
                            <div className="size-8 bg-foreground/10 rounded-lg" />
                            <div className="w-full h-1.5 bg-foreground/5 rounded-full" />
                        </div>
                    ))}
                </div>
            )
        },
        {
            id: "v5",
            type: "about",
            name: "Impact Quote",
            description: "A bold statement piece for brand philosophy.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl p-6 flex flex-col items-center justify-center gap-3 border border-border/50 text-center relative overflow-hidden">
                    <div className="w-8 h-8 bg-foreground/5 rounded-full border-t border-primary/20" />
                    <div className="w-full h-2 bg-foreground/20 rounded-full" />
                    <div className="w-3/4 h-2 bg-foreground/20 rounded-full" />
                    <div className="w-1/3 h-1.5 bg-foreground/10 rounded-full mt-2" />
                </div>
            )
        }
    ],
    footer: [
        {
            id: "v1",
            type: "footer",
            name: "Classic Multi-Column",
            description: "Comprehensive links, socials, and brand story.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl p-4 flex flex-col justify-between border border-border/50">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <div className="w-12 h-2.5 bg-primary/20 rounded-full" />
                            <div className="w-full h-1.5 bg-foreground/5 rounded-full" />
                            <div className="flex gap-1">
                                <div className="size-2.5 bg-foreground/10 rounded-full" />
                                <div className="size-2.5 bg-foreground/10 rounded-full" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="w-8 h-2 bg-foreground/10 rounded-full" />
                            <div className="w-full h-1 bg-foreground/5 rounded-full" />
                            <div className="w-full h-1 bg-foreground/5 rounded-full" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="w-8 h-2 bg-foreground/10 rounded-full" />
                            <div className="w-full h-1 bg-foreground/5 rounded-full" />
                            <div className="w-full h-1 bg-foreground/5 rounded-full" />
                        </div>
                    </div>
                    <div className="w-full h-1 bg-foreground/5 rounded-full mt-4" />
                </div>
            )
        },
        {
            id: "v2",
            type: "footer",
            name: "Minimal Centered",
            description: "A clean, basic footer for simple sites.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl p-4 flex flex-col items-center justify-center gap-4 border border-border/50">
                    <div className="w-16 h-3 bg-foreground/20 rounded-full" />
                    <div className="flex gap-3">
                        {[1, 2, 3].map(i => <div key={i} className="size-4 bg-foreground/10 rounded-full" />)}
                    </div>
                    <div className="w-24 h-1.5 bg-foreground/5 rounded-full" />
                </div>
            )
        },
        {
            id: "v3",
            type: "footer",
            name: "Modern Split",
            description: "High-contrast design with massive brand typography.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl flex border border-border/50 overflow-hidden relative">
                    <div className="w-1/2 p-4 flex flex-col justify-center gap-2">
                        <div className="w-full h-8 bg-foreground/20 rounded-full" />
                        <div className="w-2/3 h-3 bg-foreground/10 rounded-full" />
                    </div>
                    <div className="w-1/2 p-4 grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <div className="w-1/2 h-1.5 bg-foreground/20 rounded-full" />
                            <div className="w-full h-1 bg-foreground/5 rounded-full" />
                        </div>
                        <div className="space-y-1">
                            <div className="w-1/2 h-1.5 bg-foreground/20 rounded-full" />
                            <div className="w-full h-1 bg-foreground/5 rounded-full" />
                        </div>
                    </div>
                </div>
            )
        }
    ],
    "catalog-grid": [
        {
            id: "v1",
            type: "catalog-grid",
            name: "Classic Grid",
            description: "A clean 4-column grid of all your products.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl p-4 grid grid-cols-4 gap-2 border border-border/50 overflow-hidden">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="aspect-[3/4] bg-black/5 rounded-lg" />
                    ))}
                </div>
            )
        },
        {
            id: "list",
            type: "catalog-grid",
            name: "Detailed List",
            description: "A vertical list of products with more focus on details.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl p-4 space-y-2 border border-border/50 overflow-hidden">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-black/5 rounded-lg flex items-center px-3 gap-3">
                            <div className="size-8 bg-black/5 rounded" />
                            <div className="flex-1 h-3 bg-black/5 rounded" />
                        </div>
                    ))}
                </div>
            )
        },
        {
            id: "masonry",
            type: "catalog-grid",
            name: "Masonry Layout",
            description: "A dynamic, asymmetrical grid for varied product photography.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl p-4 columns-3 gap-2 border border-border/50 overflow-hidden">
                    <div className="h-16 bg-black/5 rounded mb-2" />
                    <div className="h-24 bg-black/5 rounded mb-2" />
                    <div className="h-20 bg-black/5 rounded mb-2" />
                    <div className="h-14 bg-black/5 rounded mb-2" />
                    <div className="h-22 bg-black/5 rounded mb-2" />
                </div>
            )
        },
        {
            id: "compact",
            type: "catalog-grid",
            name: "Compact Grid",
            description: "Denser 6-column grid for quickly browsing large collections.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl p-2 grid grid-cols-6 gap-1 border border-border/50 overflow-hidden">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                        <div key={i} className="aspect-square bg-black/5 rounded-sm" />
                    ))}
                </div>
            )
        },
        {
            id: "split",
            type: "catalog-grid",
            name: "Featured Split",
            description: "One large spotlight product followed by a secondary grid.",
            skeleton: (
                <div className="w-full aspect-[16/10] bg-muted rounded-xl p-2 grid grid-cols-3 gap-2 border border-border/50 overflow-hidden">
                    <div className="col-span-1 bg-black/5 rounded-lg" />
                    <div className="col-span-2 grid grid-cols-2 gap-1">
                        {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-black/5 rounded-sm" />)}
                    </div>
                </div>
            )
        }
    ]
}

export function SectionLibraryDialog({ open, onOpenChange, onAddSection, pageType = 'home' }: SectionLibraryDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1200px] w-[95vw] lg:w-[90vw] h-[90vh] flex flex-col p-0 rounded-[2.5rem] overflow-hidden border-2 shadow-2xl">
                <DialogHeader className="p-8 pb-4">
                    <DialogTitle className="text-2xl font-black tracking-tight uppercase">Add New Section</DialogTitle>
                    <DialogDescription className="text-sm font-medium text-muted-foreground">
                        Enhance your landing page with curated section variations.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue={pageType === 'catalog' ? 'catalog-grid' : 'hero'} className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                    <div className="px-8 border-b bg-background z-10">
                        <TabsList className="h-14 w-full justify-start bg-transparent gap-8 p-0">
                            {pageType !== 'catalog' && (
                                <>
                                    <TabsTrigger
                                        value="hero"
                                        className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-black uppercase text-[10px] tracking-widest"
                                    >
                                        <Play className="size-3 mr-2" /> Hero
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="categories"
                                        className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-black uppercase text-[10px] tracking-widest"
                                    >
                                        <Layout className="size-3 mr-2" /> Catalog
                                    </TabsTrigger>
                                </>
                            )}
                            {pageType === 'catalog' && (
                                <>
                                    <TabsTrigger
                                        value="collection-spotlight"
                                        className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-black uppercase text-[10px] tracking-widest"
                                    >
                                        <Play className="size-3 mr-2" /> Spotlight
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="catalog-grid"
                                        className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-black uppercase text-[10px] tracking-widest"
                                    >
                                        <Grid className="size-3 mr-2" /> Catalog Grid
                                    </TabsTrigger>
                                </>
                            )}
                            <TabsTrigger
                                value="featured"
                                className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-black uppercase text-[10px] tracking-widest"
                            >
                                <ShoppingBag className="size-3 mr-2" /> Products
                            </TabsTrigger>
                            <TabsTrigger
                                value="about"
                                className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-black uppercase text-[10px] tracking-widest"
                            >
                                <Info className="size-3 mr-2" /> Content
                            </TabsTrigger>
                            <TabsTrigger
                                value="footer"
                                className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-black uppercase text-[10px] tracking-widest"
                            >
                                <ArrowDownToLine className="size-3 mr-2" /> Footers
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 relative overflow-hidden">
                        {Object.entries(VARIATIONS)
                            .filter(([cat]) => {
                                if (cat === 'footer') return true
                                if (pageType === 'catalog') {
                                    return ['catalog-grid', 'collection-spotlight', 'featured', 'about'].includes(cat)
                                }
                                return ['hero', 'categories', 'featured', 'about'].includes(cat)
                            })
                            .map(([cat, sections]) => (
                                <TabsContent
                                    key={cat}
                                    value={cat}
                                    className="absolute inset-0 m-0 focus-visible:outline-none overflow-y-auto data-[state=active]:block"
                                >
                                    <div className="p-8 pb-32">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {sections.map((section) => (
                                                <div
                                                    key={section.id}
                                                    className="group flex flex-col bg-muted/30 rounded-[2rem] border border-border/50 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden"
                                                    onClick={() => {
                                                        onAddSection(section.type, section.id)
                                                        onOpenChange(false)
                                                    }}
                                                >
                                                    <div className="p-3">
                                                        {section.skeleton}
                                                    </div>
                                                    <div className="p-6 pt-2 flex flex-col gap-1">
                                                        <h4 className="font-black text-lg tracking-tight uppercase">{section.name}</h4>
                                                        <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                                                            {section.description}
                                                        </p>
                                                        <Button size="sm" className="mt-4 rounded-full font-black uppercase tracking-widest text-[10px] w-full self-start opacity-0 group-hover:opacity-100 transition-opacity">
                                                            Add to Page
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>
                            ))}
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
