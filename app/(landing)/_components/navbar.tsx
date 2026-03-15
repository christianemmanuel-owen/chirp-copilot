"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/app/(landing)/_ui/button"

const links = [
  { href: "/about", label: "About" },
  { href: "/#customers", label: "Brands" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
]


export function Navbar() {
  const [isCompact, setIsCompact] = useState(false)
  const pathname = usePathname()
  const forceCompact = pathname === "/about"

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setIsCompact(y > 40)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const shellClasses = (forceCompact || isCompact)
    ? "w-[calc(100%-1.5rem)] sm:w-auto max-w-4xl mx-auto mt-2 sm:mt-3 px-3 sm:px-4 py-2 rounded-full bg-background/90 backdrop-blur-xl shadow-lg"
    : "w-[calc(100%-1.5rem)] sm:w-auto max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 bg-transparent backdrop-blur-none shadow-none"

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-300">
      <div className={`transition-all duration-300 ${shellClasses} pointer-events-auto`}>
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/CHIRP-Logo.png" alt="Chirp logo" className="h-7 sm:h-8 w-auto" />
          </Link>
          <div className="md:hidden flex items-center gap-3 ml-auto">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs transition-colors ${pathname === "/about" && link.href === "/about"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-8 ml-auto">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${pathname === "/about" && link.href === "/about"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3 sm:gap-4 ml-auto sm:ml-0">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex px-4 py-2 rounded-full text-foreground hover:bg-black/5 dark:hover:bg-white/10">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-[#3849E9] text-white hover:bg-[#3849E9]/90 px-5 py-2 rounded-full border-none shadow-[0_8px_24px_-12px_rgba(56,73,233,0.8)]">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
