"use client"

import { Minus, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import type { PreorderDownPaymentSummary } from "@/lib/types"

interface CartItemProps {
  item: {
    lineId: string
    productId: number
    variantId: number
    name: string
    image: string
    customizations: Record<string, string>
    price: number
    quantity: number
    preorderDownPayment?: PreorderDownPaymentSummary | null
  }
  onUpdateQuantity: (lineId: string, quantity: number) => void
  onRemove: (lineId: string) => void
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-4 relative group">
      <Button
        variant="ghost"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(item.lineId)}
      >
        <X className="h-3 w-3" />
      </Button>

      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-foreground truncate">{item.name}</h3>
        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
          {Object.entries(item.customizations).map(([key, value]) => (
            <div key={key}>
              {key}: {value}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2 gap-2">
          <div className="flex items-center border border-border rounded-md">
            <button
              onClick={() => onUpdateQuantity(item.lineId, item.quantity - 1)}
              className="p-1 hover:bg-accent transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-2 text-xs font-medium min-w-[2rem] text-center">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.lineId, item.quantity + 1)}
              className="p-1 hover:bg-accent transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <span className="text-sm font-semibold text-foreground">
            {formatCurrency(item.price * item.quantity)}
          </span>
        </div>
        {item.preorderDownPayment && (
          <div className="mt-2 text-xs text-amber-600">
            Pre-order down payment: {formatCurrency(item.preorderDownPayment.perUnitAmount)} each ·
            {" "}
            {formatCurrency(item.preorderDownPayment.totalAmount)} total
          </div>
        )}
      </div>
    </div>
  )
}
