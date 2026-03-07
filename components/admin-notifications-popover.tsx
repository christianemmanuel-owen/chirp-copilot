"use client"

import { useState, useCallback, type KeyboardEvent, type MouseEvent } from "react"
import { Bell, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency } from "@/lib/utils"

export function AdminNotificationsPopover() {
  const { notifications, markNotificationRead, isLoadingOrders } = useStore()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleNotificationClick = useCallback(
    async (orderId: string) => {
      try {
        await markNotificationRead(orderId)
      } catch (error) {
        console.error("Failed to mark notification as read", error)
      }

      setIsOpen(false)
      router.push(`/admin/orders?highlight=${orderId}`)
    },
    [markNotificationRead, router],
  )

  const handleMarkAsRead = useCallback(
    async (orderId: string, event?: MouseEvent<HTMLButtonElement>) => {
      event?.stopPropagation()
      try {
        await markNotificationRead(orderId)
      } catch (error) {
        console.error("Failed to mark notification as read", error)
      }
    },
    [markNotificationRead],
  )

  const hasNotifications = notifications.length > 0

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-xl border border-border/50 bg-muted/30 text-foreground hover:bg-muted/60 data-[state=open]:bg-muted/60 transition-all shadow-sm group"
          aria-label="View notifications"
        >
          <Bell className="h-[18px] w-[18px] text-foreground group-hover:scale-110 transition-transform" />
          {hasNotifications && (
            <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[1.2rem] items-center justify-center rounded-full bg-[#7C3AED] px-1 text-[9px] font-black text-white shadow-sm ring-2 ring-white">
              {notifications.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[420px] rounded-2xl border border-border/50 bg-white shadow-2xl p-0 overflow-hidden ring-1 ring-black/5">
        <div className="border-b border-border/50 bg-muted/20 px-5 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Notifications</h3>
            {hasNotifications && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent uppercase tracking-wider border border-accent/20">
                {notifications.length} New
              </span>
            )}
          </div>
          {hasNotifications && (
            <p className="mt-1 text-[10px] font-medium text-muted-foreground/80 uppercase tracking-widest">
              You have updates for your recent orders
            </p>
          )}
        </div>
        {isLoadingOrders ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent mb-3" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Fetching updates...</p>
          </div>
        ) : !hasNotifications ? (
          <div className="py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <Bell className="h-6 w-6 text-muted-foreground/30" />
            </div>
            <h4 className="text-xs font-bold text-foreground mb-1">All caught up!</h4>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">No new notifications at the moment</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px] overflow-y-auto">
            <div className="p-3 space-y-2">
              {notifications.map((order) => (
                <div
                  key={order.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNotificationClick(order.id)}
                  onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      handleNotificationClick(order.id)
                    }
                  }}
                  className="w-full rounded-xl border border-border/40 bg-white/50 p-4 text-left transition-all hover:bg-muted/10 hover:border-accent/30 hover:shadow-sm group focus:outline-none"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <p className="text-xs font-black uppercase tracking-tight text-foreground group-hover:text-accent transition-colors leading-tight">
                        {order.customer.firstName} {order.customer.lastName} placed an order
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase font-mono">
                          ID: {order.id.split("-")[0]}...
                        </p>
                        <p className="text-[10px] font-black text-emerald-600 uppercase">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider whitespace-nowrap bg-muted/30 px-2 py-0.5 rounded-md">
                      {new Date(order.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-3 pt-3 border-t border-border/20">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-accent hover:bg-accent/5 rounded-lg"
                      onClick={(event) => handleMarkAsRead(order.id, event)}
                    >
                      Mark as read
                    </Button>
                    <div className="h-7 px-3 flex items-center bg-accent text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm group-hover:scale-105 transition-transform">
                      View Order
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}
