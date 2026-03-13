"use client"

import { useEffect, useState, useRef } from "react"
import {
    Type,
    Palette,
    PaintBucket,
    Pipette,
    Maximize2,
    Check,
    X,
    Minus,
    Plus,
    Link as LinkIcon,
    Sparkles,
    Ghost,
    Square,
    EyeOff,
    Search,
    Bold,
    Italic,
    Underline
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    STORE_FONT_OPTIONS,
    getFontDefinition,
} from "@/lib/storefront-theme"
import { ChevronsUpDown } from "lucide-react"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

export interface StyleEditorData {
    rect: DOMRect
    tagName: string
    sectionId: string
    elementKey: string
    computedStyles: {
        fontSize: string
        fontFamily: string
        color: string
        backgroundColor: string
        backdropFilter: string
        borderColor: string
        borderWidth: string
        borderRadius: string
        padding: string
        linkUrl?: string
    }
}

interface InlineStyleToolbarProps {
    data: StyleEditorData
    onUpdate: (styles: any) => void
    onClose: () => void
}

export default function InlineStyleToolbar({ data, onUpdate, onClose }: InlineStyleToolbarProps) {
    const [fontSize, setFontSize] = useState(parseInt(data.computedStyles.fontSize))
    const [fontOpen, setFontOpen] = useState(false)
    const [fontSearch, setFontSearch] = useState("")
    const [fontFamily, setFontFamily] = useState(() => {
        const computed = data.computedStyles.fontFamily
        const matched = STORE_FONT_OPTIONS.find(f => {
            const fontName = f.label.toLowerCase()
            return computed.toLowerCase().includes(fontName)
        })
        return matched ? matched.stack : data.computedStyles.fontFamily
    })
    const [color, setColor] = useState(data.computedStyles.color)
    const [rect, setRect] = useState(data.rect)
    const [backgroundColor, setBackgroundColor] = useState(() => {
        const bg = data.computedStyles.backgroundColor
        return bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent' ? '#6355ff' : bg
    })
    const [linkUrl, setLinkUrl] = useState(data.computedStyles.linkUrl || "")
    const [glassEffect, setGlassEffect] = useState(() => {
        return data.computedStyles.backdropFilter.includes('blur')
    })
    const [isTransparent, setIsTransparent] = useState(() => {
        return data.computedStyles.backgroundColor === 'transparent'
    })
    const [borderColor, setBorderColor] = useState(data.computedStyles.borderColor || "transparent")
    const [borderWidth, setBorderWidth] = useState(parseInt(data.computedStyles.borderWidth) || 0)
    const [borderRadius, setBorderRadius] = useState(() => {
        const radius = data.computedStyles.borderRadius
        if (radius === '9999px') return 'circular'
        if (radius && radius !== '0px' && radius !== 'straight') return 'rounded'
        return 'straight'
    })
    const [padding, setPadding] = useState(parseInt(data.computedStyles.padding) || 0)

    // Measurement ref
    const toolbarRef = useRef<HTMLDivElement>(null)
    const [toolbarSize, setToolbarSize] = useState({ width: 340, height: 60 })

    useEffect(() => {
        if (toolbarRef.current) {
            setToolbarSize({
                width: toolbarRef.current.offsetWidth,
                height: toolbarRef.current.offsetHeight
            })
        }
    }, [fontSize, fontFamily, color, data])

    useEffect(() => {
        setRect(data.rect)
    }, [data.rect])

    const updateStyle = (key: string, value: any) => {
        // We don't modify the DOM directly anymore.
        // We just notify the parent about the change.

        if (key === 'backgroundColor' && value) {
            const brightness = getBrightness(value)
            const hoverFactor = brightness > 128 ? 0.9 : 1.1
            onUpdate({
                [key]: value,
                '--hover-brightness': hoverFactor.toString()
            })
        } else if (key === 'backdropFilter') {
            onUpdate({
                backdropFilter: value,
                WebkitBackdropFilter: value
            })
        } else {
            onUpdate({ [key]: value })
        }
    }

    const handleHide = () => {
        onUpdate({ display: 'none' })
        onClose()
    }

    const updateLink = (url: string) => {
        const { sectionId, elementKey } = data

        if (sectionId && elementKey) {
            const linkKey = elementKey === 'heroCTA' ? 'heroCTALink' :
                elementKey === 'newsletterCTA' ? 'newsletterCTALink' :
                    `${elementKey}Link`

            window.parent.postMessage({
                type: 'CONTENT_UPDATE',
                sectionId,
                elementKey: linkKey,
                content: url
            }, '*')
        }
    }

    function getBrightness(hex: string) {
        if (hex === 'transparent') return 255 // Assume light for transparent backgrounds to trigger darker hover

        // Handle RGB(A)
        if (hex.startsWith('rgb')) {
            const match = hex.match(/\d+/g)
            if (!match) return 128
            const [r, g, b] = match.map(Number)
            return (r * 299 + g * 587 + b * 114) / 1000
        }

        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return (r * 299 + g * 587 + b * 114) / 1000
    }

    // Convert RGB to HEX if possible for the picker
    const rgbToHex = (rgb: string) => {
        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
        if (!match) return "#000000"
        return "#" + ((1 << 24) + (parseInt(match[1]) << 16) + (parseInt(match[2]) << 8) + parseInt(match[3])).toString(16).slice(1)
    }

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    const [windowSize, setWindowSize] = useState({ width: typeof window !== 'undefined' ? window.innerWidth : 1200, height: typeof window !== 'undefined' ? window.innerHeight : 800 })

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight })
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const screenPadding = 20
    const gap = 12

    // Calculate initial centered position
    let left = rect.left + (rect.width / 2) - (toolbarSize.width / 2)

    // Clamp horizontally to prevent overflow
    const maxLeft = windowSize.width - toolbarSize.width - screenPadding
    left = Math.max(screenPadding, Math.min(left, maxLeft))

    let top = rect.top - toolbarSize.height - gap
    // Flip to bottom if there's no space on top
    if (top < screenPadding) {
        top = rect.bottom + gap
    }

    // Final safety check for bottom overflow
    if (top + toolbarSize.height > windowSize.height - screenPadding) {
        // Find the best fit if it still overflows (unlikely but possible on small screens)
        top = Math.max(screenPadding, windowSize.height - toolbarSize.height - screenPadding)
    }

    return (
        <div
            ref={toolbarRef}
            data-editing-ui="true"
            contentEditable={false}
            className="fixed z-[9999] p-1.5 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary/20 flex items-center gap-1.5 animate-in zoom-in-95 duration-200"
            style={{
                top,
                left,
                opacity: toolbarSize.width === 0 ? 0 : 1
            }}
        >
            {/* Group 1: Typography */}
            <div className="flex items-center gap-1.5 bg-muted/30 p-1 rounded-xl">
                <Popover open={fontOpen} onOpenChange={setFontOpen}>
                    <PopoverTrigger asChild>
                        <div className="relative group/font">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground transition-colors group-focus-within/font:text-primary" />
                            <Input
                                placeholder={STORE_FONT_OPTIONS.find(f => f.stack === fontFamily)?.label || "Search fonts..."}
                                value={fontSearch}
                                onChange={(e) => {
                                    setFontSearch(e.target.value)
                                    if (!fontOpen) setFontOpen(true)
                                }}
                                onFocus={() => setFontOpen(true)}
                                className="w-[160px] md:w-[200px] h-9 pl-9 pr-3 rounded-xl bg-background border-none shadow-sm focus-visible:ring-1 focus-visible:ring-primary/30 font-bold text-sm placeholder:text-foreground placeholder:opacity-100 transition-all hover:bg-muted"
                                onPointerDown={(e) => {
                                    if (fontOpen) e.stopPropagation()
                                }}
                            />
                        </div>
                    </PopoverTrigger>
                    <PopoverContent
                        side="top"
                        sideOffset={16}
                        align="center"
                        className="w-64 p-0 rounded-2xl border-border/50 shadow-2xl overflow-hidden"
                        data-editing-ui="true"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                        <Command className="rounded-2xl border-none" contentEditable={false}>
                            <CommandList className="max-h-[250px] scrollbar-hide">
                                <CommandEmpty className="text-[10px] py-10 px-4 text-center text-muted-foreground/60">No fonts found.</CommandEmpty>
                                {STORE_FONT_OPTIONS.filter(font => font.label.toLowerCase().includes(fontSearch.toLowerCase())).length > 0 && (
                                    <CommandGroup heading="Font Library" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                                        {STORE_FONT_OPTIONS
                                            .filter(font => font.label.toLowerCase().includes(fontSearch.toLowerCase()))
                                            .map((font) => (
                                                <CommandItem
                                                    key={font.id}
                                                    value={font.label}
                                                    onSelect={() => {
                                                        setFontFamily(font.stack)
                                                        updateStyle('fontFamily', font.stack)
                                                        setFontOpen(false)
                                                        setFontSearch("")
                                                    }}
                                                    className="flex items-center justify-between py-2.5 px-3 cursor-pointer data-[selected=true]:bg-muted data-[selected=true]:text-[#262626] transition-colors"
                                                >
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-bold text-xs" style={{ fontFamily: font.stack }}>
                                                            {font.label}
                                                        </span>
                                                        <span className="text-[9px] text-muted-foreground font-medium italic truncate max-w-[140px]">
                                                            {font.description}
                                                        </span>
                                                    </div>
                                                    {fontFamily === font.stack && (
                                                        <Check className="h-3 w-3 text-primary shrink-0" />
                                                    )}
                                                </CommandItem>
                                            ))}
                                    </CommandGroup>
                                )}
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                <div className="flex items-center gap-1 bg-background shadow-sm rounded-lg px-1 h-9">
                    <Button variant="ghost" size="icon" className="size-7 rounded-md" onClick={() => {
                        const next = fontSize - 1
                        setFontSize(next)
                        updateStyle('fontSize', `${next}px`)
                    }}>
                        <Minus className="size-3" />
                    </Button>
                    <span className="text-[10px] font-black w-6 text-center">{fontSize}</span>
                    <Button variant="ghost" size="icon" className="size-7 rounded-md" onClick={() => {
                        const next = fontSize + 1
                        setFontSize(next)
                        updateStyle('fontSize', `${next}px`)
                    }}>
                        <Plus className="size-3" />
                    </Button>
                </div>
            </div>

            {/* Group 2: Rich Text & Colors */}
            <div className="flex items-center gap-1.5 bg-muted/30 p-1 rounded-xl">
                <div className="flex items-center gap-0.5 bg-background shadow-sm rounded-lg px-0.5 h-9">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-md"
                        onClick={() => document.execCommand('bold', false)}
                        title="Bold"
                    >
                        <Bold className="size-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-md"
                        onClick={() => document.execCommand('italic', false)}
                        title="Italic"
                    >
                        <Italic className="size-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-md"
                        onClick={() => document.execCommand('underline', false)}
                        title="Underline"
                    >
                        <Underline className="size-3" />
                    </Button>
                </div>

                <div className="flex items-center gap-1">
                    {/* Text Color Picker */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-9 rounded-xl relative overflow-hidden ring-1 ring-border shadow-sm" title="Text Color">
                                <div className="absolute inset-0" style={{ backgroundColor: color }} />
                                <Palette className="size-3.5 relative z-10 text-white mix-blend-difference" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            side="top"
                            sideOffset={16}
                            align="center"
                            className="w-56 p-3 rounded-2xl"
                            data-editing-ui="true"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Text Color</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-[10px] font-bold text-primary hover:bg-primary/10 rounded-md"
                                        onClick={() => {
                                            setColor('inherit')
                                            onUpdate({ color: null })
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </div>
                                <input
                                    type="color"
                                    className="w-full h-10 rounded-lg cursor-pointer bg-transparent border-none"
                                    value={color.startsWith('rgb') ? rgbToHex(color) : color}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        setColor(val)
                                        updateStyle('color', val)
                                    }}
                                />
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Background Color Picker */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-9 rounded-xl relative overflow-hidden ring-1 ring-border shadow-sm" title="Background Color">
                                <div className="absolute inset-0" style={{ backgroundColor }} />
                                <PaintBucket className="size-3.5 relative z-10 text-white mix-blend-difference" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            side="top"
                            sideOffset={16}
                            align="center"
                            className="w-64 p-3 rounded-2xl scrollbar-hide"
                            data-editing-ui="true"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Background</p>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-[10px] font-bold text-primary hover:bg-primary/10 rounded-md"
                                            onClick={() => {
                                                setBackgroundColor('transparent')
                                                setIsTransparent(true)
                                                onUpdate({ backgroundColor: null, '--hover-brightness': null })
                                            }}
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                </div>
                                <input
                                    type="color"
                                    className="w-full h-10 rounded-lg cursor-pointer bg-transparent border-none"
                                    value={backgroundColor.startsWith('rgb') ? rgbToHex(backgroundColor) : backgroundColor}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        let finalValue = val
                                        if (glassEffect) {
                                            finalValue = hexToRgba(val, 0.4)
                                        }
                                        setBackgroundColor(finalValue)
                                        updateStyle('backgroundColor', finalValue)
                                    }}
                                />

                                <Separator className="my-2" />

                                <div className="flex items-center justify-between pointer-events-auto">
                                    <div className="flex items-center gap-2">
                                        <Ghost className="size-3 text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Transparent</span>
                                    </div>
                                    <Switch
                                        checked={isTransparent}
                                        onCheckedChange={(checked) => {
                                            setIsTransparent(checked)
                                            if (checked) {
                                                setBackgroundColor('transparent')
                                                updateStyle('backgroundColor', 'transparent')
                                            } else {
                                                const hex = backgroundColor.startsWith('rgb') ? rgbToHex(backgroundColor) : backgroundColor
                                                const finalVal = hex === 'transparent' ? '#6355ff' : hex
                                                setBackgroundColor(finalVal)
                                                updateStyle('backgroundColor', finalVal)
                                            }
                                        }}
                                    />
                                </div>

                                <Separator className="my-2" />

                                <div className="flex items-center justify-between pointer-events-auto">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="size-3 text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Glass Effect</span>
                                    </div>
                                    <Switch
                                        checked={glassEffect}
                                        onCheckedChange={(checked) => {
                                            setGlassEffect(checked)
                                            if (checked) {
                                                const hex = (backgroundColor === 'transparent' || backgroundColor.startsWith('rgb')) ? rgbToHex(backgroundColor) : backgroundColor
                                                const rgba = hex === 'transparent' ? 'rgba(255, 255, 255, 0.1)' : hexToRgba(hex, 0.4)

                                                if (!isTransparent) {
                                                    setBackgroundColor(rgba)
                                                    updateStyle('backgroundColor', rgba)
                                                }
                                                updateStyle('backdropFilter', 'blur(12px)')
                                                updateStyle('border', '1px solid rgba(255, 255, 255, 0.2)')
                                            } else {
                                                if (isTransparent) {
                                                    updateStyle('backgroundColor', 'transparent')
                                                } else {
                                                    const hex = backgroundColor.startsWith('rgb') ? rgbToHex(backgroundColor) : backgroundColor
                                                    setBackgroundColor(hex)
                                                    updateStyle('backgroundColor', hex)
                                                }
                                                updateStyle('backdropFilter', '')
                                                updateStyle('border', '')
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Group 3: Advanced & Meta */}
            <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl">
                {/* Border Customization */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-9 rounded-xl bg-background shadow-sm ring-1 ring-border" title="Border Style">
                            <Square className="size-3.5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        side="top"
                        sideOffset={16}
                        align="center"
                        className="w-64 p-4 rounded-2xl scrollbar-hide"
                        data-editing-ui="true"
                    >
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Border Style</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase">Corner Shape</span>
                                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`h-7 w-8 px-0 rounded-lg ${borderRadius === 'straight' ? 'bg-background shadow-sm' : 'hover:bg-background/50 text-muted-foreground'}`}
                                            onClick={() => {
                                                setBorderRadius('straight')
                                                updateStyle('borderRadius', '0px')
                                            }}
                                            title="Square"
                                        >
                                            <div className="w-3.5 h-3.5 border-2 border-current rounded-none" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`h-7 w-8 px-0 rounded-lg ${borderRadius === 'rounded' ? 'bg-background shadow-sm' : 'hover:bg-background/50 text-muted-foreground'}`}
                                            onClick={() => {
                                                setBorderRadius('rounded')
                                                updateStyle('borderRadius', '12px')
                                            }}
                                            title="Rounded"
                                        >
                                            <div className="w-3.5 h-3.5 border-2 border-current rounded-[4px]" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`h-7 w-8 px-0 rounded-lg ${borderRadius === 'circular' ? 'bg-background shadow-sm' : 'hover:bg-background/50 text-muted-foreground'}`}
                                            onClick={() => {
                                                setBorderRadius('circular')
                                                updateStyle('borderRadius', '9999px')
                                            }}
                                            title="Circular"
                                        >
                                            <div className="w-3.5 h-3.5 border-[1.5px] border-current rounded-full" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase">Width</span>
                                    <span className="text-[10px] font-bold text-primary">{borderWidth}px</span>
                                </div>
                                <Slider
                                    value={[borderWidth]}
                                    max={6}
                                    step={1}
                                    onValueChange={([val]) => {
                                        setBorderWidth(val)
                                        updateStyle('borderWidth', `${val}px`)
                                        if (val > 0 && (borderColor === 'transparent' || !borderColor)) {
                                            setBorderColor('#6355ff')
                                            updateStyle('borderColor', '#6355ff')
                                            updateStyle('borderStyle', 'solid')
                                        }
                                    }}
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase">Padding</span>
                                    <span className="text-[10px] font-bold text-primary">{padding}px</span>
                                </div>
                                <Slider
                                    value={[padding]}
                                    max={40}
                                    step={1}
                                    onValueChange={([val]) => {
                                        setPadding(val)
                                        updateStyle('padding', `${val}px`)
                                    }}
                                />
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase mb-2">Color</p>
                                <input
                                    type="color"
                                    className="w-full h-8 rounded-md cursor-pointer bg-transparent border-none"
                                    value={borderColor.startsWith('rgb') ? rgbToHex(borderColor) : (borderColor === 'transparent' ? '#000000' : borderColor)}
                                    onChange={(e) => {
                                        setBorderColor(e.target.value)
                                        updateStyle('borderColor', e.target.value)
                                        if (borderWidth === 0) {
                                            setBorderWidth(1)
                                            updateStyle('borderWidth', '1px')
                                            updateStyle('borderStyle', 'solid')
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Link URL Input */}
                {(data.tagName === 'BUTTON' || data.tagName === 'A') && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-9 rounded-xl bg-background shadow-sm ring-1 ring-border" title="Redirect URL">
                                <LinkIcon className="size-3.5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            side="top"
                            sideOffset={16}
                            align="center"
                            className="w-64 p-3 rounded-2xl"
                            data-editing-ui="true"
                        >
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Redirect URL</p>
                                <div className="flex gap-2">
                                    <Input
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        placeholder="/catalog"
                                        className="h-8 text-xs rounded-lg"
                                    />
                                    <Button
                                        size="sm"
                                        className="h-8 rounded-lg px-2"
                                        onClick={() => updateLink(linkUrl)}
                                    >
                                        <Check className="size-3" />
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={handleHide}
                    title="Hide Element"
                >
                    <EyeOff className="size-4" />
                </Button>

                <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-muted" onClick={onClose} title="Close">
                    <X className="size-4" />
                </Button>
            </div>
        </div>
    )
}
