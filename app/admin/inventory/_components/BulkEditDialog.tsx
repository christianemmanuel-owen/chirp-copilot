"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { BulkEditDialogProps, BulkDeleteDialogProps } from "./types"

export function BulkEditDialog({
    open,
    onOpenChange,
    selectedBulkVariants,
    hasMixedPreorderSelection,
    bulkPreorderChoice,
    onBulkPreorderChoiceChange,
    bulkDownPaymentMode,
    onBulkDownPaymentModeChange,
    bulkDownPaymentValue,
    onBulkDownPaymentValueChange,
    bulkPreorderMessageMode,
    onBulkPreorderMessageModeChange,
    bulkPreorderMessageValue,
    onBulkPreorderMessageValueChange,
    bulkGuardAcknowledged,
    onBulkGuardAcknowledgedChange,
    bulkSizeRows,
    onAddBulkSizeRow,
    onUpdateBulkSizeRow,
    onRemoveBulkSizeRow,
    onToggleBulkSizeRemoval,
    onSubmit,
    isSaving,
}: BulkEditDialogProps) {
    const count = selectedBulkVariants.length
    const existingRows = bulkSizeRows.filter((r) => r.type === "existing")
    const newRows = bulkSizeRows.filter((r) => r.type === "new")

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Edit {count} variant{count !== 1 && "s"}
                    </DialogTitle>
                    <DialogDescription>
                        Changes apply to all selected variants. Leave fields blank to keep current values.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-5">
                    {/* ─── Selection summary ─── */}
                    <div className="flex flex-wrap gap-1.5">
                        {selectedBulkVariants.slice(0, 6).map(({ product, variant }) => (
                            <Badge key={variant.id} variant="secondary" className="rounded-full text-[11px] font-normal py-0.5">
                                {product.name}{variant.color ? ` · ${variant.color}` : ""}
                            </Badge>
                        ))}
                        {count > 6 && (
                            <Badge variant="outline" className="rounded-full text-[11px] font-normal py-0.5">
                                +{count - 6} more
                            </Badge>
                        )}
                    </div>

                    {/* ─── Pre-order setting ─── */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0">Order Type</h3>
                            <Select
                                value={bulkPreorderChoice}
                                onValueChange={(v) => onBulkPreorderChoiceChange(v as typeof bulkPreorderChoice)}
                            >
                                <SelectTrigger id="bulk-preorder" className="h-8 w-auto min-w-[140px] rounded-lg border-border/50 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no-change">Don&apos;t change</SelectItem>
                                    <SelectItem value="preorder">Pre-order</SelectItem>
                                    <SelectItem value="regular">In-stock</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Guard rail */}
                        {hasMixedPreorderSelection && bulkPreorderChoice !== "no-change" && (
                            <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                                <Checkbox
                                    checked={bulkGuardAcknowledged}
                                    onCheckedChange={(c) => onBulkGuardAcknowledgedChange(c === true)}
                                    className="border-amber-400 data-[state=checked]:bg-amber-500 data-[state=checked]:text-white"
                                />
                                <p className="text-[11px] text-amber-800">
                                    Mixed pre-order statuses — confirm override
                                </p>
                            </div>
                        )}

                        {/* Pre-order details — compact inline */}
                        {bulkPreorderChoice !== "regular" && (
                            <div className="pl-3 border-l-2 border-primary/20 space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[11px] text-muted-foreground shrink-0">Deposit:</span>
                                    <Select
                                        value={bulkDownPaymentMode}
                                        onValueChange={(v) => {
                                            onBulkDownPaymentModeChange(v as typeof bulkDownPaymentMode)
                                            if (v === "no-change" || v === "none") onBulkDownPaymentValueChange("")
                                        }}
                                        disabled={isSaving}
                                    >
                                        <SelectTrigger className="h-7 w-auto min-w-[100px] rounded-md border-border/50 text-[11px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no-change">Don&apos;t change</SelectItem>
                                            <SelectItem value="none">Remove</SelectItem>
                                            <SelectItem value="percent">Percentage</SelectItem>
                                            <SelectItem value="amount">Fixed ₱</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {(bulkDownPaymentMode === "percent" || bulkDownPaymentMode === "amount") && (
                                        <Input
                                            id="bulk-dp-val" type="number" min="0" step="0.01"
                                            value={bulkDownPaymentValue}
                                            onChange={(e) => onBulkDownPaymentValueChange(e.target.value)}
                                            placeholder={bulkDownPaymentMode === "percent" ? "30" : "500"}
                                            disabled={isSaving}
                                            className="h-7 w-20 rounded-md border-border/50 text-[11px]"
                                        />
                                    )}
                                </div>
                                <div className="flex items-start gap-2 flex-wrap">
                                    <span className="text-[11px] text-muted-foreground shrink-0 pt-1">Note:</span>
                                    <div className="flex-1 min-w-[120px]">
                                        <Select
                                            value={bulkPreorderMessageMode}
                                            onValueChange={(v) => {
                                                onBulkPreorderMessageModeChange(v as typeof bulkPreorderMessageMode)
                                                if (v !== "set") onBulkPreorderMessageValueChange("")
                                            }}
                                            disabled={isSaving}
                                        >
                                            <SelectTrigger className="h-7 w-auto min-w-[100px] rounded-md border-border/50 text-[11px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="no-change">Don&apos;t change</SelectItem>
                                                <SelectItem value="remove">Remove</SelectItem>
                                                <SelectItem value="set">Set new</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {bulkPreorderMessageMode === "set" && (
                                            <Textarea
                                                id="bulk-msg-val"
                                                value={bulkPreorderMessageValue}
                                                onChange={(e) => onBulkPreorderMessageValueChange(e.target.value)}
                                                placeholder="e.g. Ships in 2-3 weeks"
                                                rows={2}
                                                disabled={isSaving}
                                                className="mt-1 rounded-md border-border/50 resize-none text-[11px]"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-border/40" />

                    {/* ─── Sizes table ─── */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sizes &amp; Pricing</h3>
                            <button type="button" onClick={onAddBulkSizeRow} disabled={isSaving} className="text-xs font-medium text-primary hover:text-primary/80 transition disabled:opacity-50">
                                + Add size
                            </button>
                        </div>

                        {/* Column headers */}
                        <div className="hidden md:grid gap-2 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_2rem] text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-0.5">
                            <span>Size</span>
                            <span>Price</span>
                            <span>Stock</span>
                            <span />
                        </div>

                        {/* Existing / shared sizes */}
                        {existingRows.length > 0 && (
                            <div className="space-y-1.5">
                                {existingRows.map((row) => (
                                    <div
                                        key={row.key}
                                        className={`grid gap-2 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_2rem] items-center ${row.isMarkedForRemoval ? "opacity-40" : ""}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-foreground truncate">{row.label}</span>
                                            <Badge variant="outline" className="rounded-full text-[9px] uppercase tracking-[0.15em] shrink-0 py-0">shared</Badge>
                                        </div>
                                        <Input
                                            type="number" min="0" step="0.01"
                                            value={row.price}
                                            onChange={(e) => onUpdateBulkSizeRow(row.key, "price", e.target.value)}
                                            placeholder={row._priceMixed ? "Mixed" : ""}
                                            disabled={isSaving || row.isMarkedForRemoval}
                                            className="h-8 rounded-lg border-border/50 text-sm"
                                        />
                                        <Input
                                            type="number" min="0" step="1"
                                            value={row.stock}
                                            onChange={(e) => onUpdateBulkSizeRow(row.key, "stock", e.target.value)}
                                            placeholder={row._stockMixed ? "Mixed" : ""}
                                            disabled={isSaving || row.isMarkedForRemoval || bulkPreorderChoice === "preorder"}
                                            className="h-8 rounded-lg border-border/50 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => onToggleBulkSizeRemoval(row.key)}
                                            disabled={isSaving}
                                            className={`flex items-center justify-center h-8 w-8 rounded-full transition ${row.isMarkedForRemoval
                                                ? "bg-destructive text-white hover:bg-destructive/80"
                                                : "text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10"
                                                }`}
                                            title={row.isMarkedForRemoval ? "Undo removal" : "Remove size"}
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* New sizes */}
                        {newRows.length > 0 && (
                            <div className="space-y-1.5">
                                {existingRows.length > 0 && <div className="h-px bg-border/30" />}
                                {newRows.map((row) => (
                                    <div key={row.key} className="grid gap-2 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_2rem] items-center">
                                        <Input
                                            value={row.sizeValue}
                                            onChange={(e) => onUpdateBulkSizeRow(row.key, "sizeValue", e.target.value)}
                                            placeholder="Size name"
                                            disabled={isSaving}
                                            className="h-8 rounded-lg border-border/50 text-sm border-dashed"
                                        />
                                        <Input
                                            type="number" min="0" step="0.01"
                                            value={row.price}
                                            onChange={(e) => onUpdateBulkSizeRow(row.key, "price", e.target.value)}
                                            placeholder="0.00"
                                            disabled={isSaving}
                                            className="h-8 rounded-lg border-border/50 text-sm"
                                        />
                                        <Input
                                            type="number" min="0" step="1"
                                            value={row.stock}
                                            onChange={(e) => onUpdateBulkSizeRow(row.key, "stock", e.target.value)}
                                            placeholder="0"
                                            disabled={isSaving || bulkPreorderChoice === "preorder"}
                                            className="h-8 rounded-lg border-border/50 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => onRemoveBulkSizeRow(row.key)}
                                            disabled={isSaving}
                                            aria-label="Remove new size"
                                            className="flex items-center justify-center h-8 w-8 rounded-full text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition disabled:opacity-30"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {bulkSizeRows.length === 0 && (
                            <p className="text-xs text-muted-foreground py-3 text-center">
                                No shared sizes found. Click &quot;+ Add size&quot; to create one for every selected variant.
                            </p>
                        )}
                    </div>

                    {/* ─── Footer ─── */}
                    <div className="flex justify-end gap-2 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="btn-admin-outline rounded-full"
                            onClick={() => onOpenChange(false)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isSaving}
                            className="btn-admin-accent rounded-full"
                        >
                            {isSaving ? "Updating…" : "Apply Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function BulkDeleteDialog({
    open,
    onOpenChange,
    count,
    onConfirm,
    isDeleting,
}: BulkDeleteDialogProps) {
    return (
        <AlertDialog
            open={open}
            onOpenChange={(value) => {
                if (!value && !isDeleting) {
                    onOpenChange(false)
                }
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Delete {count} variant{count === 1 ? "" : "s"}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This permanently removes the selected variants and their inventory data. Orders referencing them will no longer sync.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isDeleting}
                        onClick={(event) => {
                            event.preventDefault()
                            onConfirm()
                        }}
                    >
                        {isDeleting ? "Deleting…" : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
