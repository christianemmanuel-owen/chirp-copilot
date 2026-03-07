"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import {
  Loader2,
  MapPin,
  Truck,
  Percent,
  Plus,
  X,
  Globe2,
  BadgeDollarSign,
  Undo2,
  Check,
  ChevronDown,
  Search
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { PHILIPPINE_REGIONS } from "@/lib/shipping"

interface CheckoutSettings {
  shippingBaseFee: number
  shippingRegionOverrides: Record<string, number>
  vatEnabled: boolean
  pickupEnabled: boolean
  pickupLocation: {
    name: string
    street: string
    city: string
    region: string
    zipCode: string
    notes: string
  }
}

export default function AdminCheckoutSettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<CheckoutSettings | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [newRegionName, setNewRegionName] = useState("")
  const [newRegionFee, setNewRegionFee] = useState("")
  const [isRegionOpen, setIsRegionOpen] = useState(false)

  useEffect(() => {
    fetch("/api/storefront-settings")
      .then(res => res.json())
      .then(payload => {
        if (payload.data) {
          setSettings(payload.data)
        }
      })
      .catch(err => console.error("Failed to fetch settings", err))
  }, [])

  const handleUpdate = async (updates: Partial<CheckoutSettings>) => {
    if (!settings) return
    const next = { ...settings, ...updates }
    setSettings(next)
    setIsSaving(true)
    try {
      const response = await fetch("/api/storefront-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error("Update failed")
      toast({ title: "Settings updated" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update settings.", variant: "destructive" })
    } finally { setIsSaving(false) }
  }

  const addOverride = () => {
    if (!newRegionName || isNaN(Number(newRegionFee))) return
    const currentOverrides = settings?.shippingRegionOverrides || {}
    const next = { ...currentOverrides, [newRegionName]: Number(newRegionFee) }
    handleUpdate({ shippingRegionOverrides: next })
    setNewRegionName(""); setNewRegionFee("")
  }

  const removeOverride = (name: string) => {
    const next = { ...settings?.shippingRegionOverrides }
    delete next[name]
    handleUpdate({ shippingRegionOverrides: next })
  }

  if (!settings) return <div className="h-80 animate-pulse bg-muted/20 rounded-2xl" />

  return (
    <div className="sett-fade-in space-y-6">
      {/* Shipping & VAT */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="sett-card overflow-hidden">
          <div className="flex items-center gap-4 border-b border-border/50 pb-6 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Standard Shipping</h3>
              <p className="text-xs text-muted-foreground font-medium">Base delivery fee for all orders.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Default Shipping Fee</Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground">₱</div>
                <Input
                  type="number"
                  value={settings.shippingBaseFee}
                  onChange={(e) => handleUpdate({ shippingBaseFee: Number(e.target.value) })}
                  className="h-12 pl-10 rounded-xl bg-muted/10 border-border focus:bg-background font-bold text-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="sett-card overflow-hidden">
          <div className="flex items-center gap-4 border-b border-border/50 pb-6 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <Percent className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Taxes</h3>
              <p className="text-xs text-muted-foreground font-medium">Automatic VAT calculation for all sales.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/10 border border-border/50">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-foreground">VAT Enabled</Label>
                <p className="text-[11px] text-muted-foreground leading-tight">Apply standard 12% PH tax during checkout.</p>
              </div>
              <Button
                variant={settings.vatEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => handleUpdate({ vatEnabled: !settings.vatEnabled })}
                className={cn(
                  "rounded-lg h-9 px-4 font-black text-[10px] uppercase tracking-wider transition-all",
                  settings.vatEnabled ? "bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg shadow-emerald-500/20" : ""
                )}
              >
                {settings.vatEnabled ? "Active" : "Disabled"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Overrides */}
      <div className="sett-card">
        <div className="flex items-center gap-4 border-b border-border/50 pb-6 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <Globe2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Regional Overrides</h3>
            <p className="text-xs text-muted-foreground font-medium">Custom delivery rates for specific Philippine regions.</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {Object.entries(settings.shippingRegionOverrides || {}).map(([name, fee]) => (
            <div key={name} className="group relative flex items-center justify-between rounded-2xl border border-border bg-white p-4 transition-all hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/5 text-emerald-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Region</p>
                  <p className="text-xs font-bold truncate max-w-[120px]">{name}</p>
                </div>
              </div>
              <div className="text-right pr-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Fee</p>
                <p className="text-sm font-black text-emerald-600">₱{fee}</p>
              </div>
              <button
                onClick={() => removeOverride(name)}
                className="absolute -right-2 -top-2 h-6 w-6 flex items-center justify-center rounded-full bg-background border border-border text-muted-foreground hover:text-destructive shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-muted/20 p-4 rounded-2xl border border-dashed border-border/60">
          <Popover open={isRegionOpen} onOpenChange={setIsRegionOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isRegionOpen}
                className="h-10 border-none bg-white shadow-sm flex-1 min-w-[220px] rounded-xl text-xs font-bold justify-between"
              >
                {newRegionName || "Select PH Region..."}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 rounded-2xl shadow-2xl border-none">
              <Command className="rounded-2xl">
                <CommandInput placeholder="Search regions..." className="h-11 font-medium" />
                <CommandList>
                  <CommandEmpty>No region found.</CommandEmpty>
                  <CommandGroup>
                    {PHILIPPINE_REGIONS.map((region) => (
                      <CommandItem
                        key={region}
                        value={region}
                        onSelect={(currentValue) => {
                          setNewRegionName(currentValue === newRegionName ? "" : region)
                          setIsRegionOpen(false)
                        }}
                        className="py-3 px-4 text-xs font-bold rounded-xl m-1"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 text-emerald-500",
                            newRegionName === region ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {region}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="relative w-[120px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground opacity-40">₱</div>
            <Input
              type="number"
              placeholder="Fee"
              value={newRegionFee}
              onChange={e => setNewRegionFee(e.target.value)}
              className="h-10 border-none bg-white shadow-sm rounded-xl pl-7 text-xs font-bold"
            />
          </div>
          <Button onClick={addOverride} disabled={!newRegionName || !newRegionFee} variant="default" className="h-10 rounded-xl px-6 font-black text-[10px] uppercase tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-2">
            <Plus className="h-3 w-3" />
            Add Surcharge
          </Button>
        </div>
      </div>

      {/* Pickup Settings */}
      <div className="sett-card">
        <div className="flex items-center gap-4 border-b border-border/50 pb-6 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
            <Truck className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">In-Store Pickup</h3>
                <p className="text-xs text-muted-foreground font-medium">Let customers collect orders at your headquarters.</p>
              </div>
              <Button
                variant={settings.pickupEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => handleUpdate({ pickupEnabled: !settings.pickupEnabled })}
                className={cn(
                  "rounded-lg h-9 px-4 font-black text-[10px] uppercase tracking-wider transition-all",
                  settings.pickupEnabled ? "bg-orange-500 hover:bg-orange-600 text-white border-none shadow-lg shadow-orange-500/20" : ""
                )}
              >
                {settings.pickupEnabled ? "Active" : "Disabled"}
              </Button>
            </div>
          </div>
        </div>

        {settings.pickupEnabled && (
          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location Brand Name</Label>
                  <Input
                    value={settings.pickupLocation.name}
                    onChange={(e) => handleUpdate({ pickupLocation: { ...settings.pickupLocation, name: e.target.value } })}
                    placeholder="Main Boutique"
                    className="h-11 rounded-xl bg-muted/10 border-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Street & Building</Label>
                  <Input
                    value={settings.pickupLocation.street}
                    onChange={(e) => handleUpdate({ pickupLocation: { ...settings.pickupLocation, street: e.target.value } })}
                    placeholder="123 Fashion Ave, Unit 4B"
                    className="h-11 rounded-xl bg-muted/10 border-none font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">City</Label>
                  <Input
                    value={settings.pickupLocation.city}
                    onChange={(e) => handleUpdate({ pickupLocation: { ...settings.pickupLocation, city: e.target.value } })}
                    className="h-11 rounded-xl bg-muted/10 border-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Zip Code</Label>
                  <Input
                    value={settings.pickupLocation.zipCode}
                    onChange={(e) => handleUpdate({ pickupLocation: { ...settings.pickupLocation, zipCode: e.target.value } })}
                    className="h-11 rounded-xl bg-muted/10 border-none font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Region</Label>
                <Input
                  value={settings.pickupLocation.region}
                  onChange={(e) => handleUpdate({ pickupLocation: { ...settings.pickupLocation, region: e.target.value } })}
                  className="h-11 rounded-xl bg-muted/10 border-none font-bold"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pickup Instructions for Customers</Label>
              <Input
                value={settings.pickupLocation.notes}
                onChange={(e) => handleUpdate({ pickupLocation: { ...settings.pickupLocation, notes: e.target.value } })}
                placeholder="Bring a valid ID. Pickups are available 10AM - 6PM."
                className="h-12 rounded-xl bg-muted/10 border-none font-bold px-4"
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 flex gap-4">
        <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
          <Truck className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-blue-800">Operational Note</p>
          <p className="text-[11px] text-blue-700/70 font-medium leading-relaxed">
            All rates are in Philippine Pesos (₱). Surcharges are added to the base delivery fee based on the customer's selected shipping region.
          </p>
        </div>
      </div>

      {isSaving && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 rounded-2xl bg-foreground px-6 py-4 text-background shadow-2xl animate-in fade-in slide-in-from-bottom-10 z-50">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">Saving Preferences...</span>
        </div>
      )}
    </div>
  )
}
