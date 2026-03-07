"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package, Home } from "lucide-react"
import Link from "next/link"

export default function ThankYouPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get("orderId")
    setOrderId(id)

    // Redirect to home if no order ID after 5 seconds
    if (!id) {
      const timeout = setTimeout(() => {
        router.push("/")
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-12 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-500/10 p-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Thank You for Your Order!</h1>
            <p className="text-lg text-muted-foreground">Your order has been successfully placed.</p>
          </div>

          {orderId && (
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="text-xl font-mono font-bold text-foreground">{orderId}</p>
            </div>
          )}

          <div className="space-y-3 pt-4">
            <div className="flex items-start gap-3 text-left">
              <Package className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">What happens next?</p>
                <p className="text-sm text-muted-foreground">
                  We're reviewing your payment and will process your order shortly. You'll receive a confirmation email
                  with tracking details once your order is ready for delivery.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button asChild className="flex-1" size="lg">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-4">
            If you have any questions about your order, please contact our customer support.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
