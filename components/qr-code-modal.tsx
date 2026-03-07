"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface QRCodeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentMethod: string
  qrCodeUrl?: string
  accountName?: string
  instructions?: string
}

export default function QRCodeModal({
  open,
  onOpenChange,
  paymentMethod,
  qrCodeUrl,
  accountName,
  instructions,
}: QRCodeModalProps) {
  const hasQrCode = Boolean(qrCodeUrl)

  const handleDownload = () => {
    if (!qrCodeUrl) return
    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = `${paymentMethod}-qr-code.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Scan QR Code to Pay</DialogTitle>
          <DialogDescription className="text-center">
            Use your {paymentMethod.toUpperCase()} app to scan this QR code and complete your payment
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-white p-4 rounded-lg">
            <img
              src={qrCodeUrl || "/placeholder.svg"}
              alt={`${paymentMethod} QR Code`}
              className="w-64 h-64 object-contain"
            />
          </div>
          {(accountName || instructions) && (
            <div className="w-full rounded-lg border border-border bg-muted/40 p-4 text-sm text-left">
              {accountName ? (
                <p className="mb-2 text-foreground">
                  Account name: <span className="font-semibold">{accountName}</span>
                </p>
              ) : null}
              {instructions ? (
                <p className="whitespace-pre-wrap text-muted-foreground">{instructions}</p>
              ) : (
                <p className="text-muted-foreground">
                  Follow your banking app&apos;s prompts after scanning this code to complete payment.
                </p>
              )}
            </div>
          )}
          <p className="text-sm text-muted-foreground text-center">
            After payment, please upload your proof of payment below
          </p>
          <Button onClick={handleDownload} variant="outline" className="w-full bg-transparent" disabled={!hasQrCode}>
            <Download className="w-4 h-4 mr-2" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
