import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Inbox | Chirp Admin",
}

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
