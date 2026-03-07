"use client"

import type React from "react"
import { useState, useCallback, useMemo } from "react"
import {
  Plus,
  Trash2,
  ChevronRight,
  Check,
  Globe,
  CreditCard,
  Banknote,
  QrCode,
  Loader2,
  Image as ImageIcon
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  NewPaymentMethodInput,
  PaymentMethodConfig,
  UpdatePaymentMethodInput,
} from "@/lib/types"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRef, useEffect } from "react"


export default function AdminPaymentMethodsPanel() {
  const {
    paymentMethods,
    availablePaymentProviders,
    updatePaymentMethod,
    deletePaymentMethod,
    isLoadingPaymentMethods,
  } = useStore()
  const { toast } = useToast()

  const sortedMethods = paymentMethods
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))

  const handleToggleStatus = async (method: PaymentMethodConfig) => {
    try {
      await updatePaymentMethod(method.id, {
        isActive: !method.isActive,
      })
      toast({
        title: method.isActive ? "Payment method hidden" : "Payment method live",
        description: `${method.provider} is now ${method.isActive ? "not " : ""}visible to customers.`,
      })
    } catch (error) {
      toast({
        title: "Error updating status",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) return

    try {
      await deletePaymentMethod(id)
      toast({
        title: "Payment method deleted",
        description: "The payment method has been removed.",
      })
    } catch (error) {
      toast({
        title: "Error deleting payment method",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  if (isLoadingPaymentMethods) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="sett-fade-in space-y-6">

      <div className="space-y-4">
        {sortedMethods.length === 0 ? (
          <Card className="sett-card border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <CreditCard className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">No payment methods configured yet.</p>
            </CardContent>
          </Card>
        ) : (
          sortedMethods.map((method) => {
            const providerInfo = availablePaymentProviders.find(
              (p) => p.id === method.provider
            )
            return (
              <Card key={method.id} className="sett-card group">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 group-hover:bg-muted">
                      {method.provider === "gcash" ? (
                        <div className="text-xl font-bold text-blue-600">G</div>
                      ) : method.provider === "maya" ? (
                        <div className="text-xl font-bold text-emerald-500">M</div>
                      ) : (
                        <CreditCard className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {providerInfo?.name || method.provider}
                        </h3>
                        <Badge
                          variant={method.isActive ? "default" : "secondary"}
                          className={cn(
                            "h-5 px-1.5 text-[10px] font-bold uppercase tracking-wider",
                            method.isActive
                              ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {method.isActive ? "Live" : "Hidden"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {method.accountName || "No account name set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <EditPaymentMethodDialog method={method} />
                    <div className="h-4 w-px bg-border mx-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-9 px-3 text-xs font-medium",
                        method.isActive
                          ? "text-muted-foreground hover:text-foreground"
                          : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50"
                      )}
                      onClick={() => handleToggleStatus(method)}
                    >
                      {method.isActive ? "Hide" : "Show"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(method.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Simplified Help Card */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 flex gap-4">
        <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
          <Info className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-blue-700">Multi-Method Checkout</p>
          <p className="text-[11px] text-blue-600/80 font-medium leading-relaxed">
            You can enable multiple methods simultaneously. We'll show them as options to your customers during the final checkout stage.
          </p>
        </div>
      </div>
    </div>
  )
}

function EditPaymentMethodDialog({ method }: { method: PaymentMethodConfig }) {
  const { updatePaymentMethod } = useStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    accountName: method.accountName || "",
    instructions: method.instructions || "",
    qrCodeUrl: method.qrCodeUrl || "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setFormData({
        accountName: method.accountName || "",
        instructions: method.instructions || "",
        qrCodeUrl: method.qrCodeUrl || "",
      })
    }
  }, [open, method])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updatePaymentMethod(method.id, formData)
      toast({ title: "Payment method updated" })
      setOpen(false)
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const data = new FormData()
      data.append("file", file)
      data.append("prefix", "payment-qrs")

      const res = await fetch("/api/uploads/branding", {
        method: "POST",
        body: data,
      })
      const payload = await res.json()

      if (!res.ok) throw new Error(payload.error || "Upload failed")
      setFormData(prev => ({ ...prev, qrCodeUrl: payload.url }))
      toast({ title: "QR code uploaded" })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Error uploading file",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          title="Edit Details"
        >
          <QrCode className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-black uppercase tracking-tight">Edit {method.provider.toUpperCase()} Details</DialogTitle>
          <DialogDescription>
            Update the payment information shown to customers.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
          {/* QR Code Section - Now at the Top */}
          <div className="flex flex-col items-center gap-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground self-start">QR Code Image</Label>
            <div className="relative flex h-64 w-full max-w-[320px] items-center justify-center rounded-2xl border-2 border-dashed bg-muted/20 overflow-hidden">
              {formData.qrCodeUrl ? (
                <img src={formData.qrCodeUrl} alt="QR Code" className="h-full w-full object-contain p-2" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                  <ImageIcon className="h-12 w-12" />
                  <p className="text-[10px] font-bold uppercase tracking-wider">No Image Uploaded</p>
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>

            <div className="flex w-full justify-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="h-9 px-6 text-[10px] font-black uppercase tracking-widest bg-white shadow-sm hover:bg-muted/50"
              >
                {formData.qrCodeUrl ? "Change Image" : "Upload QR"}
              </Button>
              {formData.qrCodeUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData(p => ({ ...p, qrCodeUrl: "" }))}
                  className="h-9 px-6 text-[10px] text-destructive font-black uppercase tracking-widest hover:bg-destructive/10"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="accountName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Name</Label>
              <Input
                id="accountName"
                value={formData.accountName}
                onChange={e => setFormData(p => ({ ...p, accountName: e.target.value }))}
                placeholder="e.g. Juan Dela Cruz"
                className="h-12 rounded-xl bg-muted/20 border border-border font-bold placeholder:font-medium"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instructions" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={e => setFormData(p => ({ ...p, instructions: e.target.value }))}
                placeholder="e.g. Please send proof of payment to our Instagram."
                className="resize-none h-24 rounded-xl bg-muted/20 border border-border font-bold placeholder:font-medium p-4"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="pt-2">
          <Button onClick={handleSave} disabled={isSaving || isUploading} className="w-full sm:w-auto font-black text-[10px] uppercase tracking-widest px-10 h-12 rounded-xl">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const Info = ({ className, ...props }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
)
