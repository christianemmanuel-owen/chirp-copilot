"use client"

import type React from "react"
import { useCallback, useRef, useState } from "react"
import {
    Palette,
    Image as ImageIcon,
    Sparkles,
    Plus,
    Trash2,
    Layers,
    ArrowRight,
    ArrowLeft,
    ArrowDown,
    ArrowUp,
    ArrowDownRight,
    ArrowDownLeft,
    ArrowUpRight,
    ArrowUpLeft,
    Upload,
    Loader2,
    X
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { SectionBackground } from "@/lib/storefront-theme"
import { useToast } from "@/hooks/use-toast"

import { Textarea } from "@/components/ui/textarea"

interface SectionSettingsProps {
    sectionType: string
    background?: SectionBackground
    section?: any
    onChange: (background: SectionBackground, sectionUpdates?: any) => void
    onDelete?: () => void
}

const HEX_PATTERN = /^#([0-9a-f]{6})$/i

const DIRECTIONS = [
    { id: "to right", icon: ArrowRight },
    { id: "to left", icon: ArrowLeft },
    { id: "to bottom", icon: ArrowDown },
    { id: "to top", icon: ArrowUp },
    { id: "to bottom right", icon: ArrowDownRight },
    { id: "to bottom left", icon: ArrowDownLeft },
    { id: "to top right", icon: ArrowUpRight },
    { id: "to top left", icon: ArrowUpLeft },
]

export default function SectionSettings({
    sectionType,
    background,
    section,
    onChange,
    onDelete
}: SectionSettingsProps) {
    const { toast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)

    const handleUpdate = (updates: Partial<SectionBackground>) => {
        onChange({
            ...background,
            ...updates
        } as SectionBackground)
    }

    const handleGradientUpdate = (updates: Partial<NonNullable<SectionBackground['gradient']>>) => {
        handleUpdate({
            gradient: {
                direction: "to bottom",
                stops: [
                    { color: "#ffffff", offset: 0, opacity: 0.5 },
                    { color: "#000000", offset: 100, opacity: 0.5 }
                ],
                enabled: true,
                ...background?.gradient,
                ...updates
            }
        })
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("prefix", "section-bg")

            const response = await fetch("/api/uploads/branding", {
                method: "POST",
                body: formData,
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Upload failed")

            handleUpdate({ image: data.url })
            toast({ title: "Success", description: "Image uploaded successfully" })
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="space-y-8 py-2 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20">

            {/* Variant Selector for Footer */}
            {sectionType === "footer" && (
                <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Layers className="size-3" />
                        Footer Variant
                    </Label>
                    <div className="grid grid-cols-3 gap-2 bg-muted/30 p-1 rounded-xl border border-border/50">
                        {['v1', 'v2', 'v3'].map((v) => (
                            <Button
                                key={v}
                                variant={section?.metadata?.variant === v || (!section?.metadata?.variant && v === 'v1') ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => onChange(background as SectionBackground, { metadata: { ...section?.metadata, variant: v } })}
                                className={cn(
                                    "rounded-lg text-[10px] font-black uppercase tracking-tight h-8",
                                    (section?.metadata?.variant === v || (!section?.metadata?.variant && v === 'v1')) ? "shadow-md" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {v === 'v1' ? 'Standard' : v === 'v2' ? 'Minimal' : 'Modern'}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Color Layer */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Palette className="size-3" />
                        Solid Color
                    </Label>
                    {background?.color && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 rounded-full"
                            onClick={() => handleUpdate({ color: undefined })}
                        >
                            <X className="size-3" />
                        </Button>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative size-12 flex-shrink-0">
                        <input
                            type="color"
                            className="absolute inset-0 size-full cursor-pointer opacity-0"
                            value={background?.color || "#ffffff"}
                            onChange={(e) => handleUpdate({ color: e.target.value })}
                        />
                        <div
                            className="flex size-full items-center justify-center rounded-xl border border-border shadow-sm transition-transform hover:scale-105 active:scale-95"
                            style={{ backgroundColor: background?.color || "#ffffff" }}
                        >
                            {!background?.color && <Plus className="size-4 mix-blend-difference text-white" />}
                        </div>
                    </div>
                    <div className="flex-1 space-y-3">
                        <Input
                            value={background?.color || ""}
                            placeholder="#ffffff"
                            onChange={(e) => {
                                let val = e.target.value
                                if (val && !val.startsWith("#")) val = `#${val}`
                                if (HEX_PATTERN.test(val) || val === "") handleUpdate({ color: val || undefined })
                            }}
                            className="h-10 rounded-xl border-border bg-muted/10 font-mono text-xs font-bold uppercase tracking-widest"
                        />
                        {background?.color && (
                            <div className="space-y-1.5 px-1">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Color Opacity</Label>
                                    <span className="text-[9px] font-bold text-muted-foreground">{Math.round((background.colorOpacity ?? 1) * 100)}%</span>
                                </div>
                                <Slider
                                    value={[(background.colorOpacity ?? 1) * 100]}
                                    max={100}
                                    step={1}
                                    onValueChange={([val]) => handleUpdate({ colorOpacity: val / 100 })}
                                    className="py-1"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Separator />

            {/* Image Layer */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <ImageIcon className="size-3" />
                        Background Image
                    </Label>
                    {background?.image && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 rounded-full"
                            onClick={() => handleUpdate({ image: undefined })}
                        >
                            <X className="size-3" />
                        </Button>
                    )}
                </div>

                <div className="space-y-3">
                    <div className="flex gap-2">
                        <Input
                            placeholder="https://image-url.com"
                            value={background?.image || ""}
                            onChange={(e) => handleUpdate({ image: e.target.value || undefined })}
                            className="h-12 rounded-xl border-border bg-muted/10 font-medium text-xs"
                        />
                        <Button
                            variant="outline"
                            className="h-12 w-12 rounded-xl p-0 flex-shrink-0 border-border hover:bg-muted"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                        />
                    </div>

                    {background?.image && (
                        <div className="space-y-6">
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-border group shadow-sm">
                                <img src={background.image} className="w-full h-full object-cover" alt="Background" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button variant="destructive" size="icon" className="size-8 rounded-lg" onClick={() => handleUpdate({ image: undefined })}>
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4 border border-border/50 rounded-2xl p-4 bg-muted/5">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Background Overlay</Label>
                                        <p className="text-[9px] text-muted-foreground font-medium italic">Apply a muting effect for readability</p>
                                    </div>
                                    <Switch
                                        checked={background.overlayEnabled ?? false}
                                        onCheckedChange={(checked) => handleUpdate({ overlayEnabled: checked })}
                                    />
                                </div>

                                {background.overlayEnabled && (
                                    <div className="space-y-4 pt-2 border-t border-border/30 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">Overlay Intensity</Label>
                                                <span className="text-[9px] font-bold text-muted-foreground">{Math.round((background.overlayOpacity ?? 1) * 100)}%</span>
                                            </div>
                                            <Slider
                                                value={[(background.overlayOpacity ?? 1) * 100]}
                                                max={100}
                                                step={1}
                                                onValueChange={([val]) => handleUpdate({ overlayOpacity: val / 100 })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">Overlay Brightness</Label>
                                                <span className="text-[9px] font-bold text-muted-foreground">{Math.round((background.overlayBrightness ?? 1) * 100)}%</span>
                                            </div>
                                            <Slider
                                                value={[(background.overlayBrightness ?? 1) * 100]}
                                                max={200}
                                                step={1}
                                                onValueChange={([val]) => handleUpdate({ overlayBrightness: val / 100 })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Separator />

            {/* Gradient Layer */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Sparkles className="size-3" />
                        Overlay Gradient
                    </Label>
                    <Switch
                        checked={background?.gradient?.enabled || false}
                        onCheckedChange={(checked) => handleGradientUpdate({ enabled: checked })}
                    />
                </div>

                {background?.gradient?.enabled && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex flex-wrap gap-2">
                            {DIRECTIONS.map((dir) => (
                                <Button
                                    key={dir.id}
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleGradientUpdate({ direction: dir.id })}
                                    className={cn(
                                        "size-10 rounded-xl transition-all border-border shadow-sm flex-shrink-0",
                                        background?.gradient?.direction === dir.id ? "bg-primary text-white border-primary shadow-md shadow-primary/20" : "hover:border-primary hover:bg-primary/5"
                                    )}
                                    title={dir.id}
                                >
                                    <dir.icon className="size-4" />
                                </Button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stops</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const stops = [...(background?.gradient?.stops || [])]
                                        stops.push({ color: "#ffffff", offset: 100, opacity: 0.5 })
                                        handleGradientUpdate({ stops })
                                    }}
                                    className="h-6 text-[10px] font-black uppercase text-primary px-2"
                                >
                                    <Plus className="size-3 mr-1" /> Add Stop
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {(background?.gradient?.stops || []).map((stop, idx) => (
                                    <div key={idx} className="bg-muted/50 p-3 rounded-xl border border-border/50 space-y-3 relative group/stop">
                                        <div className="flex items-center gap-3">
                                            <div className="relative size-8 flex-shrink-0">
                                                <input
                                                    type="color"
                                                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                                                    value={stop.color}
                                                    onChange={(e) => {
                                                        const stops = background!.gradient!.stops.map((s, i) =>
                                                            i === idx ? { ...s, color: e.target.value } : s
                                                        )
                                                        handleGradientUpdate({ stops })
                                                    }}
                                                />
                                                <div
                                                    className="flex size-full items-center justify-center rounded-lg border border-border shadow-sm"
                                                    style={{ backgroundColor: stop.color, opacity: stop.opacity }}
                                                />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">{stop.offset}% Offset</span>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">{Math.round(stop.opacity * 100)}% Opacity</span>
                                                </div>
                                                <Slider
                                                    value={[stop.offset]}
                                                    max={100}
                                                    step={1}
                                                    onValueChange={([val]) => {
                                                        const stops = background!.gradient!.stops.map((s, i) =>
                                                            i === idx ? { ...s, offset: val } : s
                                                        )
                                                        handleGradientUpdate({ stops })
                                                    }}
                                                />
                                                <Slider
                                                    value={[stop.opacity * 100]}
                                                    max={100}
                                                    step={1}
                                                    onValueChange={([val]) => {
                                                        const stops = background!.gradient!.stops.map((s, i) =>
                                                            i === idx ? { ...s, opacity: val / 100 } : s
                                                        )
                                                        handleGradientUpdate({ stops })
                                                    }}
                                                />
                                            </div>
                                            {background!.gradient!.stops.length > 2 && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-6 text-muted-foreground hover:text-destructive opacity-0 group-hover/stop:opacity-100 transition-opacity"
                                                    onClick={() => {
                                                        const stops = background!.gradient!.stops.filter((_, i) => i !== idx)
                                                        handleGradientUpdate({ stops })
                                                    }}
                                                >
                                                    <X className="size-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Separator />

            {onDelete && (
                <div className="pt-2">
                    <Button
                        variant="destructive"
                        className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 shadow-lg shadow-destructive/20 active:scale-95 transition-all"
                        onClick={onDelete}
                    >
                        <Trash2 className="size-4" />
                        Delete Section
                    </Button>
                </div>
            )}
        </div>
    )
}
