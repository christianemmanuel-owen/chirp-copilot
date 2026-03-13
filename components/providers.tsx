"use client"

import type React from "react"
import { SessionProvider } from "next-auth/react"
import { StoreProvider } from "@/lib/store"
import { CartProvider } from "@/lib/cart"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <StoreProvider>
                <CartProvider>{children}</CartProvider>
            </StoreProvider>
        </SessionProvider>
    )
}
