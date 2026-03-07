"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AdminSettingsSearchProps {
  className?: string
  placeholder?: string
}

export default function AdminSettingsSearch({
  className,
  placeholder = "Search settings",
}: AdminSettingsSearchProps) {
  const [query, setQuery] = useState("")
  const [matches, setMatches] = useState<number | null>(null)

  useEffect(() => {
    const normalized = query.trim().toLowerCase()
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-settings-section]"),
    )
    let visibleCount = 0

    sections.forEach((section) => {
      const title = section.dataset.settingsTitle ?? ""
      const keywords = section.dataset.settingsKeywords ?? ""
      const haystack = `${title} ${keywords}`.toLowerCase()
      const isMatch = normalized.length === 0 || haystack.includes(normalized)
      section.style.display = isMatch ? "" : "none"
      if (isMatch) {
        visibleCount += 1
      }
    })

    const emptyState = document.querySelector<HTMLElement>("[data-settings-empty-state]")
    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? "" : "none"
    }

    setMatches(visibleCount)
  }, [query])

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          placeholder={placeholder}
          className="h-11 pl-9"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search settings panels"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {matches === null || matches > 0
          ? "Filter panels by name or topic."
          : "No settings match your search. Try another keyword."}
      </p>
    </div>
  )
}
