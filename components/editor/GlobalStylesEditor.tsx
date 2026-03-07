"use client"

import type React from "react"
import { useCallback } from "react"
import { Type, Palette as PaletteIcon, Check, Plus } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
    STORE_FONT_OPTIONS,
    type StorefrontThemeColors,
    type StorefrontThemeConfig,
} from "@/lib/storefront-theme"

interface GlobalStylesEditorProps {
    theme: StorefrontThemeConfig
    onChange: (updates: Partial<StorefrontThemeConfig>) => void
    isSaving?: boolean
}

const COLOR_FIELDS: Array<{
    key: keyof StorefrontThemeColors
    label: string
    helper: string
}> = [
        { key: "background", label: "Page Background", helper: "Overall body background color." },
        { key: "card", label: "Card Background", helper: "Panels, cards, and popovers." },
        { key: "foreground", label: "Primary Text", helper: "Main headlines and body copy." },
        { key: "cardForeground", label: "Secondary Text", helper: "Text on cards and surfaces." },
        { key: "mutedForeground", label: "Subtle Text", helper: "Labels, hints, and secondary links." },
        { key: "accent", label: "Accent Color", helper: "Action highlights and subtle elements." },
        { key: "accentForeground", label: "Accent Text", helper: "Text on top of accent colors." },
        { key: "buttonColor", label: "Primary Button", helper: "Background for call-to-action buttons." },
        { key: "buttonText", label: "Button Text", helper: "Label color on primary buttons." },
        { key: "border", label: "Borders", helper: "Inputs, cards, and divider lines." },
    ]

const HEX_PATTERN = /^#([0-9a-f]{6})$/i

export default function GlobalStylesEditor({ theme, onChange, isSaving }: GlobalStylesEditorProps) {
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
                        <h3 className="text-lg font-bold">Typography</h3>
                        <p className="text-xs text-muted-foreground font-medium">Choose a type family that matches your brand voice.</p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {STORE_FONT_OPTIONS.map((font) => {
                        const isSelected = theme.fontFamily === font.id
                        return (
                            <button
                                key={font.id}
                                type="button"
                                onClick={() => onChange({ fontFamily: font.id })}
                                className={cn(
                                    "flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all",
                                    isSelected
                                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                                )}
                            >
                                <div className="flex w-full items-center justify-between">
                                    <span className="text-sm font-bold" style={{ fontFamily: font.stack }}>Aa</span>
                                    {isSelected && <Check className="h-3 w-3 text-primary" />}
                                </div>
                                <span className="mt-1 text-sm font-bold" style={{ fontFamily: font.stack }}>{font.label}</span>
                                <span className="text-[10px] text-muted-foreground font-medium">{font.description}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Color Palette */}
            <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-4 border-b border-border/50 pb-6 mb-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                        <PaletteIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Color Palette</h3>
                        <p className="text-xs text-muted-foreground font-medium">Define the core colors for your storefront surfaces and text.</p>
                    </div>
                </div>

                <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-2">
                    {COLOR_FIELDS.map((field) => (
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
                                <div className="relative h-11 w-11 flex-shrink-0">
                                    <input
                                        type="color"
                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                        value={theme.colors[field.key]}
                                        onChange={handleColorPickerChange(field.key)}
                                        disabled={isSaving}
                                    />
                                    <div
                                        className="flex h-full w-full items-center justify-center rounded-xl border border-border shadow-sm transition-transform hover:scale-105 active:scale-95"
                                        style={{ backgroundColor: theme.colors[field.key] }}
                                    >
                                        <PlusIcon className="h-3 w-3 mix-blend-difference text-white" />
                                    </div>
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
                </div>
            </div>
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
