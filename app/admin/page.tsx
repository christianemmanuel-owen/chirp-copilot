import type { Metadata } from "next"
import DashboardClient from "./_components/DashboardClient"

export const metadata: Metadata = {
    title: "Dashboard | Chirp Admin",
}

export default function AdminDashboardPage() {
    return <DashboardClient />
}
