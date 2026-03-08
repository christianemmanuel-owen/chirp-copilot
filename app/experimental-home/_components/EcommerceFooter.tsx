"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, Mail, ArrowRight } from "lucide-react"
import { getSectionStyles, type SectionBackground } from "@/lib/storefront-theme"

interface EcommerceFooterProps {
    businessName: string
    mission?: string
    newsletterBlurb?: string
    styles?: Record<string, any>
    sectionId?: string
    background?: SectionBackground
    hiddenFields?: string[]
    variant?: string
}

export default function EcommerceFooter({ businessName, mission, newsletterBlurb, styles, sectionId, background, hiddenFields, variant = "v1" }: EcommerceFooterProps) {
    const currentYear = new Date().getFullYear()
    const sectionStyles = getSectionStyles(background)

    const isHidden = (key: string) => hiddenFields?.includes(key)

    const hexToRgba = (hex: string, opacity: number) => {
        if (!hex || !hex.startsWith('#')) return hex
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }

    const sectionStyleContainer = {
        backgroundColor: background?.color ? hexToRgba(background.color, background.colorOpacity ?? 1) : undefined,
        ...sectionStyles,
    }

    // Variation 2: Minimal Centered
    if (variant === "v2") {
        return (
            <footer
                className="bg-accent text-accent-foreground border-t border-white/5 py-12"
                data-section-id={sectionId}
                style={sectionStyleContainer}
            >
                <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-8">
                    {!isHidden("footerBrand") && (
                        <Link href="/" className="text-xl font-black tracking-tighter uppercase">
                            {businessName}
                        </Link>
                    )}
                    {!isHidden("footerSocials") && (
                        <div className="flex gap-6">
                            <Link href={styles?.socialLinkInsta?.linkUrl || "#"} className="text-accent-foreground/50 hover:text-white transition-colors" data-element-key="socialLinkInsta">
                                <Instagram className="size-5" />
                            </Link>
                            <Link href={styles?.socialLinkFb?.linkUrl || "#"} className="text-accent-foreground/50 hover:text-white transition-colors" data-element-key="socialLinkFb">
                                <Facebook className="size-5" />
                            </Link>
                            <Link href={styles?.socialLinkTwitter?.linkUrl || "#"} className="text-accent-foreground/50 hover:text-white transition-colors" data-element-key="socialLinkTwitter">
                                <Twitter className="size-5" />
                            </Link>
                        </div>
                    )}
                    <div className="pt-8 border-t border-white/5 w-full flex justify-center">
                        <p className="text-[10px] font-bold text-accent-foreground/30 uppercase tracking-[0.3em]">
                            &copy; {currentYear} {businessName}. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        )
    }

    return (
        <footer
            className="bg-accent text-accent-foreground border-t border-white/5"
            data-section-id={sectionId}
            style={sectionStyles}
        >

            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8">
                    {/* Brand & Newsletter */}
                    <div className="lg:col-span-1 space-y-8">
                        {!isHidden("footerBrand") && (
                            <Link href="/" className="text-2xl font-black tracking-tighter uppercase">
                                {businessName}
                            </Link>
                        )}
                        {!isHidden("footerMission") && (
                            <p
                                className="text-accent-foreground/70 font-medium text-sm leading-relaxed max-w-xs"
                                data-element-key="footerMission"
                                style={styles?.footerMission}
                                dangerouslySetInnerHTML={{ __html: mission || "Elevating your lifestyle with curated, high-end essentials designed for intentional living." }}
                            />
                        )}
                        {!isHidden("footerSocials") && (
                            <div className="flex gap-4">
                                <Link href={styles?.socialLinkInsta?.linkUrl || "#"} className="p-2 rounded-xl bg-muted/50 hover:bg-primary hover:text-white transition-all duration-300" data-element-key="socialLinkInsta" data-link-url={styles?.socialLinkInsta?.linkUrl || "#"}>
                                    <Instagram className="size-5" />
                                </Link>
                                <Link href={styles?.socialLinkFb?.linkUrl || "#"} className="p-2 rounded-xl bg-muted/50 hover:bg-primary hover:text-white transition-all duration-300" data-element-key="socialLinkFb" data-link-url={styles?.socialLinkFb?.linkUrl || "#"}>
                                    <Facebook className="size-5" />
                                </Link>
                                <Link href={styles?.socialLinkTwitter?.linkUrl || "#"} className="p-2 rounded-xl bg-muted/50 hover:bg-primary hover:text-white transition-all duration-300" data-element-key="socialLinkTwitter" data-link-url={styles?.socialLinkTwitter?.linkUrl || "#"}>
                                    <Twitter className="size-5" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {!isHidden("footerColumns") && (
                        <>
                            {/* Shop Column */}
                            <div data-no-edit="true">
                                <h4 className="font-black uppercase tracking-widest text-[10px] text-accent-foreground/50 mb-8">Shop</h4>
                                <ul className="space-y-4">
                                    <li><Link href="/catalog" className="text-accent-foreground/80 hover:text-white transition-colors font-bold text-sm">Catalog</Link></li>
                                    <li><Link href="/catalog?category=Drinkware" className="text-accent-foreground/80 hover:text-white transition-colors font-bold text-sm">Drinkware</Link></li>
                                    <li><Link href="/catalog?category=Coffee" className="text-accent-foreground/80 hover:text-white transition-colors font-bold text-sm">Coffee Beans</Link></li>
                                    <li><Link href="/catalog?category=Accessories" className="text-accent-foreground/80 hover:text-white transition-colors font-bold text-sm">Accessories</Link></li>
                                </ul>
                            </div>

                            {/* Support Column */}
                            <div data-no-edit="true">
                                <h4 className="font-black uppercase tracking-widest text-[10px] text-accent-foreground/50 mb-8">Support</h4>
                                <ul className="space-y-4">
                                    <li><Link href="/track-order" className="text-accent-foreground/80 hover:text-white transition-colors font-bold text-sm">Track Order</Link></li>
                                    <li><Link href="/faq" className="text-accent-foreground/80 hover:text-white transition-colors font-bold text-sm">FAQ</Link></li>
                                    <li><Link href="/shipping" className="text-accent-foreground/80 hover:text-white transition-colors font-bold text-sm">Shipping Policy</Link></li>
                                    <li><Link href="/contact" className="text-accent-foreground/80 hover:text-white transition-colors font-bold text-sm">Contact Us</Link></li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6" data-no-edit="true">
                    <p className="text-xs font-bold text-accent-foreground/50 uppercase tracking-[0.3em]">
                        &copy; {currentYear} {businessName}. All rights reserved.
                    </p>
                    <div className="flex gap-8">
                        <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-accent-foreground/50 hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-accent-foreground/50 hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
