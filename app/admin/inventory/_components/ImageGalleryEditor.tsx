"use client"

import { useRef } from "react"
import { Pencil, Plus, Trash, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { ImageGalleryEditorProps } from "./types"

export function ImageGalleryEditor({
    images,
    onAdd,
    onReplace,
    onRemove,
    onClearAll,
    onEditTarget,
    disabled = false,
    label = "Photos",
    description = "Upload multiple photos to showcase from every angle.",
}: ImageGalleryEditorProps) {
    const addInputRef = useRef<HTMLInputElement | null>(null)
    const replaceInputRef = useRef<HTMLInputElement | null>(null)

    return (
        <div className="space-y-3">
            {label && (
                <div className="flex items-center justify-between">
                    <div>
                        <Label>{label}</Label>
                        {description && <p className="text-xs text-muted-foreground">{description}</p>}
                    </div>
                    {images.length > 0 ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="px-2 text-xs uppercase tracking-[0.2em]"
                            onClick={onClearAll}
                            disabled={disabled}
                        >
                            Clear All
                        </Button>
                    ) : null}
                </div>
            )}
            <div className="max-h-80 overflow-y-auto pr-1 sm:pr-2">
                <div className={images.length === 0 ? "flex justify-center" : "grid grid-cols-2 gap-3 sm:grid-cols-3"}>
                    {images.map((image, index) => (
                        <div
                            key={image.id}
                            className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted"
                        >
                            <img
                                src={image.previewUrl}
                                alt={`Photo ${index + 1}`}
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-transparent via-transparent to-black/70 p-3 text-white opacity-0 transition group-hover:opacity-100">
                                <div className="flex justify-end">
                                    <span className="rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold">
                                        Photo {index + 1}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className="pointer-events-auto rounded-full px-3 text-xs uppercase tracking-[0.2em]"
                                        onClick={() => {
                                            onEditTarget(image.id)
                                            replaceInputRef.current?.click()
                                        }}
                                        disabled={disabled}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="pointer-events-auto rounded-full px-3 text-xs uppercase tracking-[0.2em]"
                                        onClick={() => onRemove(image.id)}
                                        disabled={disabled}
                                    >
                                        <Trash className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => addInputRef.current?.click()}
                        disabled={disabled}
                        className={`flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-border text-muted-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${images.length === 0 ? "w-48" : ""}`}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Plus className="h-6 w-6" />
                            <span className="text-xs font-semibold uppercase tracking-[0.3em]">Upload</span>
                        </div>
                    </button>
                </div>
            </div>
            <p className="text-xs text-muted-foreground">
                Hover over a photo to replace or remove it. The empty tile lets you add another image.
            </p>
            <input
                ref={addInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                    onAdd(event.target.files)
                    if (event.target) {
                        event.target.value = ""
                    }
                }}
            />
            <input
                ref={replaceInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                    onReplace(event.target.files)
                    if (event.target) {
                        event.target.value = ""
                    }
                }}
            />
        </div>
    )
}
