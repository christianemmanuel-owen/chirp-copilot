import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Discounts | Chirp Admin",
}

export default function DiscountsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
