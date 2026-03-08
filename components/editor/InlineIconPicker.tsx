"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AVAILABLE_ICONS, type IconName } from "@/lib/icons"

interface Props {
    request: {
        sectionId: string
        clientX: number
        clientY: number
        iconKey: string
        currentIcon?: string
    }
    onClose: () => void
    onSelect: (sectionId: string, iconKey: string, iconName: IconName) => void
}

export function InlineIconPicker({ request, onClose, onSelect }: Props) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                const target = e.target as HTMLElement
                if (target.tagName !== 'IFRAME') {
                    onClose()
                }
            }
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }

        document.addEventListener("mousedown", handleClickOutside, true)
        document.addEventListener("keydown", handleKeyDown, true)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside, true)
            document.removeEventListener("keydown", handleKeyDown, true)
        }
    }, [onClose])

    return (
        <div
            ref={ref}
            className="fixed z-[100] bg-white rounded-xl shadow-2xl border border-border/50 w-64 flex flex-col animate-in zoom-in-95 duration-200"
            style={{
                top: Math.max(20, request.clientY - 120),
                left: Math.max(20, request.clientX - 128)
            }}
        >
            <div className="flex items-center justify-between p-3 border-b bg-muted/20 rounded-t-xl">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Select Icon
                </span>
                <Button variant="ghost" size="icon" className="size-6 rounded-md hover:bg-muted" onClick={onClose}>
                    <X className="size-3" />
                </Button>
            </div>

            <div className="p-3">
                <div className="grid grid-cols-4 gap-2">
                    {Object.entries(AVAILABLE_ICONS).map(([name, Icon]) => {
                        const isSelected = request.currentIcon === name
                        return (
                            <button
                                key={name}
                                className={`size-12 flex items-center justify-center rounded-lg transition-all hover:bg-primary/10 hover:text-primary ${isSelected ? 'bg-primary text-white hover:bg-primary/90' : 'bg-muted/30 text-muted-foreground'}`}
                                onClick={() => {
                                    onSelect(request.sectionId, request.iconKey, name as IconName)
                                    onClose()
                                }}
                                title={name}
                            >
                                <Icon className="size-6" />
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="p-3 border-t bg-muted/10 rounded-b-xl text-[10px] text-center font-bold text-muted-foreground tracking-tight uppercase">
                Choose a visual for your highlight
            </div>
        </div>
    )
}
