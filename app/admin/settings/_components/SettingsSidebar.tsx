"use client"

import { useTransition, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    CreditCard,
    ShoppingBag,
    Instagram,
    Fingerprint,
    Search,
    FlaskConical
} from "lucide-react"

export interface NavSection {
    id: string
    label: string
    icon: any
    keywords?: string[]
}

export interface NavGroup {
    title: string
    sections: NavSection[]
}

const NAV_GROUPS: NavGroup[] = [
    {
        title: "Storefront",
        sections: [
            { id: "identity", label: "Identity", icon: Fingerprint, keywords: ["logo", "favicon", "brand", "branding"] },
        ]
    },
    {
        title: "Operations",
        sections: [
            { id: "payments", label: "Payments", icon: CreditCard, keywords: ["gcash", "maya", "qr code", "bank", "payment methods", "account name"] },
            { id: "checkout", label: "Checkout", icon: ShoppingBag, keywords: ["shipping", "vat", "pickup", "regions", "fees", "surcharge", "taxes"] },
        ]
    },
    {
        title: "Connections",
        sections: [
            { id: "social", label: "Social", icon: Instagram, keywords: ["instagram", "sync", "posts", "connection", "api"] },
        ]
    },
    {
        title: "Experimental",
        sections: [
            { id: "experimental", label: "Beta Features", icon: FlaskConical, keywords: ["experimental", "beta", "v2", "landing page", "new designs"] },
        ]
    }
]

export default function SettingsSidebar() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [searchQuery, setSearchQuery] = useState("")

    const currentTab = searchParams.get("tab") || "identity"

    const filteredGroups = NAV_GROUPS.map(group => ({
        ...group,
        sections: group.sections.filter(section => {
            const query = searchQuery.toLowerCase()
            const matchesLabel = section.label.toLowerCase().includes(query)
            const matchesKeywords = section.keywords?.some(k => k.toLowerCase().includes(query))
            return matchesLabel || matchesKeywords
        })
    })).filter(group => group.sections.length > 0)

    const handleTabChange = (id: string) => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString())
            params.set("tab", id)
            router.push(`?${params.toString()}`, { scroll: false })
        })
    }

    return (
        <aside className="sett-sidebar">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search settings..."
                    className="w-full rounded-xl border border-border bg-muted/30 py-2 pl-10 pr-4 text-xs font-medium transition-all focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
            </div>

            <nav className="flex flex-col gap-8">
                {filteredGroups.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">No results found</p>
                    </div>
                ) : (
                    filteredGroups.map((group) => (
                        <div key={group.title} className="sett-nav-group">
                            <h3 className="sett-nav-group-title">{group.title}</h3>
                            <div className="flex flex-col gap-1">
                                {group.sections.map((section) => {
                                    const isActive = currentTab === section.id
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => handleTabChange(section.id)}
                                            className={cn(
                                                "sett-nav-item",
                                                isActive && "sett-nav-item-active"
                                            )}
                                            disabled={isPending}
                                        >
                                            <section.icon className={cn(
                                                "h-4 w-4",
                                                isActive ? "text-primary" : "text-muted-foreground"
                                            )} />
                                            {section.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )))}
            </nav>
        </aside>
    )
}
