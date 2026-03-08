import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Page Editor | Chirp Admin",
}

export default function EditorLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
