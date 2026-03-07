"use client"

import type { PaymentMethodOption } from "@/lib/payment-methods"
import { cn } from "@/lib/utils"

interface PaymentOptionsProps {
  options: PaymentMethodOption[]
  selected?: string
  onSelect: (option: PaymentMethodOption) => void
  disabled?: boolean
  isLoading?: boolean
}

export default function PaymentOptions({ options, selected, onSelect, disabled, isLoading }: PaymentOptionsProps) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading payment methods...</p>
  }

  if (!options || options.length === 0) {
    return <p className="text-sm text-muted-foreground">No payment methods configured yet.</p>
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((option) => (
        <button
          type="button"
          key={option.configId}
          onClick={() => onSelect(option)}
          className={cn(
            "relative rounded-xl p-4 flex flex-col items-center justify-center transition-all border-2",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
            disabled ? "cursor-not-allowed opacity-60" : "hover:scale-105",
            selected === option.configId ? "border-primary ring-2 ring-primary/20" : "border-border",
          )}
          style={{
            backgroundColor: option.brandColor,
          }}
          disabled={disabled}
        >
          <img
            src={option.logo || "/placeholder.svg"}
            alt={option.name}
            className="h-10 w-auto object-contain drop-shadow"
          />
          <span className="sr-only">{option.name}</span>
        </button>
      ))}
    </div>
  )
}
