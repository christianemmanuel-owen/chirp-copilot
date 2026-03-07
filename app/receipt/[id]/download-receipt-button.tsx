"use client"

import { useState } from "react"
import { toPng } from "html-to-image"
import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface Props {
  receiptId: string
  containerId: string
}

export default function DownloadReceiptButton({ receiptId, containerId }: Props) {
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  const handleDownload = async () => {
    const container = document.getElementById(containerId)
    if (!container) {
      toast({
        title: "Error",
        description: "Unable to find receipt content to download.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsDownloading(true)

      // Use toPng from html-to-image for high-fidelity export
      const dataUrl = await toPng(container, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        style: {
          borderRadius: "0", // Remove border radius for the export
        }
      })

      const link = document.createElement("a")
      link.download = `kazumatcha-e-receipt-${receiptId}.png`
      link.href = dataUrl
      link.click()

      toast({
        title: "Success",
        description: "Your e-receipt has been downloaded.",
      })
    } catch (error) {
      console.error("Failed to download receipt", error)
      toast({
        title: "Download Failed",
        description: "We were not able to prepare your e-receipt for download. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      className="rounded-full border border-slate-900 bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-95"
    >
      <Download className="mr-2 h-4 w-4" />
      {isDownloading ? "Capturing E-Receipt..." : "Download E-Receipt"}
    </Button>
  )
}
