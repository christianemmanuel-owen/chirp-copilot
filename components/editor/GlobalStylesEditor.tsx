"use client"

import { useCallback, useState } from "react"
import { Type, Palette as PaletteIcon, Check, Plus, ChevronsUpDown, Search } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
    STORE_FONT_OPTIONS,
    type StorefrontThemeColors,
    type StorefrontThemeConfig,
    getFontDefinition,
} from "@/lib/storefront-theme"

interface GlobalStylesEditorProps {
    theme: StorefrontThemeConfig
    onChange: (updates: Partial<StorefrontThemeConfig>) => void
    isSaving?: boolean
}

const COLOR_GROUPS: Array<{
    title: string
    description: string
    fields: Array<{
        key: keyof StorefrontThemeColors
        label: string
        helper: string
    }>
    custom?: Array<{
        key: string
        label: string
        helper: string
    }>
}> = [
        {
            title: "Brand & Actions",
            description: "Define your primary brand colors for buttons and highlights.",
            fields: [
                { key: "buttonColor", label: "Primary Action", helper: "Main call-to-action buttons." },
                { key: "buttonText", label: "Action Text", helper: "Label color on primary buttons." },
                { key: "accent", label: "Secondary Accent", helper: "Dropdowns, footers, and visual highlights." },
                { key: "accentForeground", label: "Accent Text", helper: "Text on secondary accent surfaces." },
            ]
        },
        {
            title: "Text Colors",
            description: "Set the character for your headlines and body copy.",
            fields: [
                { key: "foreground", label: "Headings", helper: "Primary titles and hero text." },
                { key: "cardForeground", label: "Body Text", helper: "Product descriptions and main content." },
                { key: "mutedForeground", label: "Subtle Text", helper: "Context tags, hints, and secondary links." },
            ]
        },
        {
            title: "Surfaces",
            description: "Control the backdrop and depth of your storefront.",
            fields: [
                { key: "background", label: "Page Background", helper: "The main canvas behind all sections." },
                { key: "card", label: "Surface Background", helper: "Cards, floating panels, and floating badges." },
                { key: "border", label: "Dividers & Borders", helper: "Soft lines for structural separation." },
            ]
        },
        {
            title: "Navigation",
            description: "Control the appearance of the top navigation bar.",
            fields: [
                { key: "navbarBackground", label: "Background", helper: "Solid color for the navbar background (when Solid style is chosen)." },
                { key: "navbarText", label: "Text & Icons", helper: "Color for links, icons, and text in the navbar." },
            ],
            custom: [
                { key: "navbarStyle", label: "Navbar Style", helper: "Choose between a frosted glass effect or a solid color background." }
            ]
        }
    ]

const HEX_PATTERN = /^#([0-9a-f]{6})$/i

export default function GlobalStylesEditor({ theme, onChange, isSaving }: GlobalStylesEditorProps) {
    const [open, setOpen] = useState(false)
    const [fontSearch, setFontSearch] = useState("")
    const activeFont = getFontDefinition(theme.fontFamily)

    const handleColorPickerChange = useCallback(
        (key: keyof StorefrontThemeColors) => (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value.toLowerCase()
            onChange({
                colors: { ...theme.colors, [key]: value },
            })
        },
        [theme, onChange],
    )

    const handleColorTextChange = useCallback(
        (key: keyof StorefrontThemeColors) => (event: React.ChangeEvent<HTMLInputElement>) => {
            let value = event.target.value
            if (!value.startsWith("#")) {
                value = `#${value.replace(/#/g, "")}`
            }
            value = value.slice(0, 7)

            if (HEX_PATTERN.test(value)) {
                onChange({
                    colors: { ...theme.colors, [key]: value.toLowerCase() },
                })
            }
        },
        [theme, onChange],
    )

    return (
        <div className="space-y-8">
            {/* Font Selection */}
            <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-4 border-b border-border/50 pb-6 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Type className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Brand Typography</h3>
                        <p className="text-xs text-muted-foreground font-medium">Choose a type family that matches your brand voice.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Font Family</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <div className="relative group/font">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within/font:text-primary" />
                                <Input
                                    placeholder={activeFont.label || "Search fonts..."}
                                    value={fontSearch}
                                    onChange={(e) => {
                                        setFontSearch(e.target.value)
                                        if (!open) setOpen(true)
                                    }}
                                    onFocus={() => setOpen(true)}
                                    className="w-full h-14 pl-11 pr-4 rounded-xl border-border/50 bg-white font-bold text-base placeholder:text-foreground placeholder:opacity-100 transition-all focus:bg-white focus:ring-1 focus:ring-primary/20 hover:bg-muted/30"
                                    disabled={isSaving}
                                    onPointerDown={(e) => {
                                        // Prevent PopoverTrigger from toggling when clicking to focus
                                        if (open) e.stopPropagation()
                                    }}
                                />
                            </div>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-[--radix-popover-trigger-width] p-0 rounded-2xl border-border/50 shadow-2xl overflow-hidden"
                            onOpenAutoFocus={(e) => e.preventDefault()}
                        >
                            <Command className="rounded-2xl border-none" contentEditable={false}>
                                <CommandList className="max-h-[300px] scrollbar-hide">
                                    <CommandEmpty className="py-12 px-6 text-center text-sm text-muted-foreground/60">No fonts found.</CommandEmpty>
                                    {STORE_FONT_OPTIONS.filter(font => font.label.toLowerCase().includes(fontSearch.toLowerCase())).length > 0 && (
                                        <CommandGroup heading="Available Fonts" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                                            {STORE_FONT_OPTIONS
                                                .filter(font => font.label.toLowerCase().includes(fontSearch.toLowerCase()))
                                                .map((font) => (
                                                    <CommandItem
                                                        key={font.id}
                                                        value={font.label}
                                                        onSelect={() => {
                                                            onChange({ fontFamily: font.id })
                                                            setOpen(false)
                                                            setFontSearch("")
                                                        }}
                                                        className="flex items-center justify-between py-3 px-4 cursor-pointer data-[selected=true]:bg-muted data-[selected=true]:text-[#262626] transition-colors"
                                                    >
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-bold text-sm" style={{ fontFamily: font.stack }}>
                                                                {font.label}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground font-medium italic">
                                                                {font.description}
                                                            </span>
                                                        </div>
                                                        {theme.fontFamily === font.id && (
                                                            <Check className="h-4 w-4 text-primary" />
                                                        )}
                                                    </CommandItem>
                                                ))}
                                        </CommandGroup>
                                    )}
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    {/* Preview Area */}
                    <div className="mt-6 p-6 rounded-2xl bg-muted/20 border border-dashed border-border/50">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mb-4">Live Preview</p>
                        <h4 className="text-3xl font-black mb-2 uppercase tracking-tighter" style={{ fontFamily: activeFont.stack }}>
                            {activeFont.label}
                        </h4>
                        <p className="text-sm font-medium leading-relaxed opacity-60" style={{ fontFamily: activeFont.stack }}>
                            The quick brown fox jumps over the lazy dog. A curated selection of typography to elevate your brand presence.
                        </p>
                    </div>
                </div>
            </div>

            {/* Color Palette Categories */}
            {COLOR_GROUPS.map((group) => (
                <div key={group.title} className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                    <div className="flex items-center gap-4 border-b border-border/50 pb-6 mb-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                            <PaletteIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">{group.title}</h3>
                            <p className="text-xs text-muted-foreground font-medium">{group.description}</p>
                        </div>
                    </div>

                    <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-2">
                        {group.fields.map((field) => (
                            <div key={field.key} className="group flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                                        {field.label}
                                    </Label>
                                    <div
                                        className="h-5 w-5 rounded-full border border-border/50 shadow-inner"
                                        style={{ backgroundColor: theme.colors[field.key] }}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative h-11 w-11 flex-shrink-0 group">
                                        <div
                                            className="flex h-full w-full items-center justify-center rounded-xl border border-border shadow-sm transition-transform group-hover:scale-105 group-active:scale-95 pointer-events-none"
                                            style={{ backgroundColor: theme.colors[field.key] }}
                                        >
                                            <PlusIcon className="h-3 w-3 mix-blend-difference text-white" />
                                        </div>
                                        <input
                                            type="color"
                                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 z-10"
                                            value={theme.colors[field.key]}
                                            onChange={handleColorPickerChange(field.key)}
                                            disabled={isSaving}
                                        />
                                    </div>
                                    <Input
                                        value={theme.colors[field.key]}
                                        onChange={handleColorTextChange(field.key)}
                                        maxLength={7}
                                        disabled={isSaving}
                                        className="h-11 rounded-xl border-border bg-muted/10 font-mono text-xs font-bold uppercase tracking-widest transition-all focus:bg-background focus:ring-1 focus:ring-primary/20"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">{field.helper}</p>
                            </div>
                        ))}
                        {group.custom?.map((customField) => (
                            <div key={customField.key} className="group flex flex-col gap-3 col-span-full sm:col-span-1">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                                    {customField.label}
                                </Label>
                                {customField.key === 'navbarStyle' && (
                                    <div className="flex bg-muted/30 p-1 rounded-xl border border-border/50">
                                        <Button
                                            type="button"
                                            variant={theme.experimental?.navbar?.navbarStyle === 'glass' ? 'default' : 'ghost'}
                                            className={cn(
                                                "flex-1 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                theme.experimental?.navbar?.navbarStyle === 'glass'
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "hover:bg-white text-muted-foreground"
                                            )}
                                            onClick={() => onChange({ experimental: { ...theme.experimental!, navbar: { ...theme.experimental?.navbar!, navbarStyle: 'glass' } } })}
                                            disabled={isSaving}
                                        >
                                            Glass
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={theme.experimental?.navbar?.navbarStyle === 'solid' ? 'default' : 'ghost'}
                                            className={cn(
                                                "flex-1 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                theme.experimental?.navbar?.navbarStyle === 'solid'
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "hover:bg-white text-muted-foreground"
                                            )}
                                            onClick={() => onChange({ experimental: { ...theme.experimental!, navbar: { ...theme.experimental?.navbar!, navbarStyle: 'solid' } } })}
                                            disabled={isSaving}
                                        >
                                            Solid
                                        </Button>
                                    </div>
                                )}
                                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">{customField.helper}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

const PlusIcon = ({ className, ...props }: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
    </svg>
)
