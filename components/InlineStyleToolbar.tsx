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
    Search
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

interface InlineStyleToolbarProps {
    target: HTMLElement
    onUpdate: (styles: any) => void
    onClose: () => void
}

export default function InlineStyleToolbar({ target, onUpdate, onClose }: InlineStyleToolbarProps) {
    const [fontSize, setFontSize] = useState(parseInt(window.getComputedStyle(target).fontSize))
    const [fontOpen, setFontOpen] = useState(false)
    const [fontSearch, setFontSearch] = useState("")
    const [fontFamily, setFontFamily] = useState(() => {
        // Try to get the specific font from the style or data attribute if possible
        const inlineFont = target.style.fontFamily
        if (inlineFont) return inlineFont

        // Fallback to computed style but matched against our options if possible
        const computed = window.getComputedStyle(target).fontFamily
        const matched = STORE_FONT_OPTIONS.find(f => {
            const fontName = f.label.toLowerCase()
            return computed.toLowerCase().includes(fontName)
        })
        return matched ? matched.stack : "inherit"
    })
    const [color, setColor] = useState(window.getComputedStyle(target).color)
    const [rect, setRect] = useState(target.getBoundingClientRect())
    const [backgroundColor, setBackgroundColor] = useState(() => {
        const bg = window.getComputedStyle(target).backgroundColor
        return bg === 'rgba(0, 0, 0, 0)' ? '#6355ff' : bg
    })
    const [linkUrl, setLinkUrl] = useState(() => {
        const isButtonOrLink = target.tagName === 'BUTTON' || target.tagName === 'A'
        if (!isButtonOrLink) return ""

        // Try to find if we're in a section and getting a link content key
        // This is a bit tricky since we don't have the full config here
        // But we can try to get it from the target attributes if we set them
        return target.getAttribute('data-link-url') || ""
    })
    const [glassEffect, setGlassEffect] = useState(() => {
        return target.style.backdropFilter.includes('blur')
    })
    const [isTransparent, setIsTransparent] = useState(() => {
        return target.style.backgroundColor === 'transparent'
    })
    const [borderColor, setBorderColor] = useState(() => {
        return target.style.borderColor || "transparent"
    })
    const [borderWidth, setBorderWidth] = useState(() => {
        return parseInt(target.style.borderWidth) || 0
    })
    const [borderRadius, setBorderRadius] = useState(() => {
        const radius = target.style.borderRadius
        if (radius === '9999px') return 'circular'
        if (radius && radius !== '0px' && radius !== 'straight') return 'rounded'
        return 'straight'
    })
    const [padding, setPadding] = useState(() => {
        return parseInt(target.style.padding) || 0
    })

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
    }, [fontSize, fontFamily, color, target])

    useEffect(() => {
        const handleResize = () => setRect(target.getBoundingClientRect())
        window.addEventListener('scroll', handleResize)
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('scroll', handleResize)
            window.removeEventListener('resize', handleResize)
        }
    }, [target])

    const updateStyle = (key: string, value: any) => {
        target.style[key as any] = value

        // Automatic Hover Logic
        if (key === 'backgroundColor' && value) {
            const brightness = getBrightness(value)
            const hoverFactor = brightness > 128 ? 0.9 : 1.1
            target.style.setProperty('--hover-brightness', hoverFactor.toString())
            onUpdate({
                [key]: value,
                '--hover-brightness': hoverFactor.toString()
            })
        } else if (key === 'backdropFilter') {
            (target.style as any).WebkitBackdropFilter = value
            onUpdate({
                backdropFilter: value,
                WebkitBackdropFilter: value
            })
        } else if (key === 'borderRadius' || key === 'borderWidth' || key === 'borderColor' || key === 'borderStyle' || key === 'padding') {
            onUpdate({ [key]: value })
        } else {
            onUpdate({ [key]: value })
        }
    }

    const handleHide = () => {
        target.style.display = 'none'
        onUpdate({ display: 'none' })
        onClose()
    }

    const updateLink = (url: string) => {
        const section = target.closest('[data-section-id]')
        const sectionId = section?.getAttribute('data-section-id')
        const elementKey = target.getAttribute('data-element-key')

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

    const screenPadding = 10
    const gap = 8

    let left = rect.left + (rect.width / 2) - (toolbarSize.width / 2)
    left = Math.max(screenPadding, Math.min(left, window.innerWidth - toolbarSize.width - screenPadding))

    let top = rect.top - toolbarSize.height - gap
    if (top < screenPadding) {
        top = rect.bottom + gap
    }

    return (
        <div
            ref={toolbarRef}
            data-editing-ui="true"
            contentEditable={false}
            className="fixed z-[9999] p-2 bg-white rounded-2xl shadow-2xl border border-primary/20 flex items-center gap-2 animate-in zoom-in-95 duration-200"

            style={{
                top,
                left,
                opacity: toolbarSize.width === 0 ? 0 : 1 // Avoid initial flicker
            }}
        >
            {/* Font Family Dropdown */}
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
                            className="w-[180px] h-9 pl-9 pr-3 rounded-xl bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30 font-bold text-sm placeholder:text-foreground placeholder:opacity-100 transition-all hover:bg-muted"
                            onPointerDown={(e) => {
                                if (fontOpen) e.stopPropagation()
                            }}
                        />
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[200px] p-0 rounded-2xl border-border/50 shadow-2xl overflow-hidden"
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

            <Separator orientation="vertical" className="h-4" />

            {/* Font Size Controls */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-xl px-1">
                <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={() => {
                    const next = fontSize - 1
                    setFontSize(next)
                    updateStyle('fontSize', `${next}px`)
                }}>
                    <Minus className="size-3" />
                </Button>
                <span className="text-[10px] font-black w-6 text-center">{fontSize}</span>
                <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={() => {
                    const next = fontSize + 1
                    setFontSize(next)
                    updateStyle('fontSize', `${next}px`)
                }}>
                    <Plus className="size-3" />
                </Button>
            </div>

            {/* Text Color Picker */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg relative overflow-hidden ring-1 ring-border" title="Text Color">
                        <div className="absolute inset-0" style={{ backgroundColor: color }} />
                        <Palette className="size-3 relative z-10 text-white mix-blend-difference" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-3 rounded-2xl" data-editing-ui="true">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Text Color</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[10px] font-bold text-primary hover:bg-primary/10 rounded-md"
                                onClick={() => {
                                    target.style.color = ''
                                    const computed = window.getComputedStyle(target).color
                                    setColor(computed)
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

            <Separator orientation="vertical" className="h-4" />

            {/* Background Color Picker */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg relative overflow-hidden ring-1 ring-border" title="Background Color">
                        <div className="absolute inset-0" style={{ backgroundColor }} />
                        <PaintBucket className="size-3 relative z-10 text-white mix-blend-difference" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-3 rounded-2xl" data-editing-ui="true">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Background</p>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-[10px] font-bold text-primary hover:bg-primary/10 rounded-md"
                                    onClick={() => {
                                        target.style.backgroundColor = ''
                                        target.style.removeProperty('--hover-brightness')
                                        const computed = window.getComputedStyle(target).backgroundColor
                                        setBackgroundColor(computed)
                                        setIsTransparent(false)
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
                                        // Default to a sensible default or the current picker color
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

            <Separator orientation="vertical" className="h-4" />

            {/* Border Customization */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg relative overflow-hidden ring-1 ring-border" title="Border Style">
                        <Square className="size-3" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4 rounded-2xl" data-editing-ui="true">
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Border Style</p>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase">Corner Shape</span>
                                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h - 7 w - 8 px - 0 rounded - lg ${borderRadius === 'straight' ? 'bg-background shadow-sm' : 'hover:bg-background/50 text-muted-foreground'} `}
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
                                        className={`h - 7 w - 8 px - 0 rounded - lg ${borderRadius === 'rounded' ? 'bg-background shadow-sm' : 'hover:bg-background/50 text-muted-foreground'} `}
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
                                        className={`h - 7 w - 8 px - 0 rounded - lg ${borderRadius === 'circular' ? 'bg-background shadow-sm' : 'hover:bg-background/50 text-muted-foreground'} `}
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
                                    updateStyle('borderWidth', `${val} px`)
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
                                    updateStyle('padding', `${val} px`)
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

            <Separator orientation="vertical" className="h-4" />

            {/* Link URL Input */}
            {(target.tagName === 'BUTTON' || target.tagName === 'A') && (
                <>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 rounded-lg border border-border" title="Redirect URL">
                                <LinkIcon className="size-3" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3 rounded-2xl" data-editing-ui="true">
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
                    <Separator orientation="vertical" className="h-4" />
                </>
            )}

            <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg text-muted-foreground hover:bg-primary hover:text-white transition-colors"
                onClick={handleHide}
                title="Hide Element"
            >
                <EyeOff className="size-4" />
            </Button>

            <Separator orientation="vertical" className="h-4" />

            <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-muted" onClick={onClose} title="Close">
                <X className="size-4" />
            </Button>
        </div>
    )
}
