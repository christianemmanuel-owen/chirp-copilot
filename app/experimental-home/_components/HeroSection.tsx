import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react"
import Link from "next/link"
import type { NavCollectionItem, HeroProductHighlight } from "@/lib/storefront-data"
import { getSectionStyles, type SectionBackground } from "@/lib/storefront-theme"

interface HeroSectionProps {
    categories: NavCollectionItem[]
    featuredItems: HeroProductHighlight[]
    title?: string
    subtitle?: string
    titleHighlight?: string
    description?: string
    heroCTALink?: string
    styles?: Record<string, any>
    sectionId?: string
    background?: SectionBackground
}

export default function HeroSection({ categories, featuredItems, title, subtitle, titleHighlight, description, heroCTALink, styles, sectionId, background }: HeroSectionProps) {
    const heroCTAStyle = styles?.heroCTA || {}
    const sectionStyles = getSectionStyles(background)

    return (
        <section
            className="relative pt-40 pb-24 overflow-hidden bg-background"
            data-section-id={sectionId}
            style={sectionStyles}
        >

            {/* Background Ornaments */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-primary/2 blur-[150px] rounded-full -z-10" />
            <div className="absolute top-40 -right-20 w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full -z-10 animate-pulse" />

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

                    <div className="lg:col-span-7 text-left space-y-10">
                        <div className="flex flex-col">
                            <h1
                                className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase text-foreground animate-in fade-in slide-in-from-left-8 duration-700 delay-100"
                                data-element-key="heroTitle"
                                style={styles?.heroTitle}
                            >
                                {title || "Exquisite Pieces."}
                            </h1>
                            <div
                                className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase text-primary animate-in fade-in slide-in-from-left-8 duration-700 delay-200"
                                data-element-key="heroTitleHighlight"
                                style={styles?.heroTitleHighlight}
                            >
                                {titleHighlight || "Designed for life."}
                            </div>
                        </div>



                        <p
                            className="max-w-xl text-xl text-muted-foreground font-medium leading-relaxed animate-in fade-in slide-in-from-left-12 duration-900"
                            data-element-key="heroDescription"
                            style={styles?.heroDescription}
                        >
                            {description || "Elevate your lifestyle with our premium collection of hand-picked goods."}
                        </p>

                        <div className="flex flex-wrap items-center gap-6 animate-in fade-in slide-in-from-left-16 duration-1000">
                            <Button
                                size="lg"
                                className="rounded-full font-bold h-16 px-10 text-lg shadow-2xl transition-all active:scale-95 group hover:brightness-[var(--hover-brightness,1.1)]"
                                data-element-key="heroCTA"
                                data-link-url={heroCTALink || "/catalog"}
                                style={{
                                    ...heroCTAStyle,
                                    boxShadow: heroCTAStyle.backgroundColor && !heroCTAStyle.backgroundColor.includes('rgba') ? `0 25px 50px -12px ${heroCTAStyle.backgroundColor}40` : undefined
                                }}
                                asChild
                            >
                                <Link href={heroCTALink || "/catalog"}>
                                    Shop Collection
                                    <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>

                            {/* Category Quick Links */}
                            <div className="flex flex-wrap gap-2">
                                {categories.slice(0, 3).map((category) => (
                                    <Link
                                        key={category.id}
                                        href={category.href}
                                        className="px-4 py-2 rounded-full border-2 border-border/50 text-sm font-bold hover:border-primary hover:text-primary transition-all hover:-translate-y-1"
                                    >
                                        {category.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 relative group">
                        <div className="absolute inset-0 bg-primary/5 rounded-[4rem] rotate-6 scale-95 blur-2xl group-hover:rotate-3 transition-transform duration-700" />

                        {/* Featured Product Card */}
                        <div className="relative aspect-[4/5] bg-muted rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 group-hover:scale-[1.02] group-hover:-rotate-1">
                            {featuredItems[0] ? (
                                <img
                                    src={featuredItems[0].image}
                                    alt={featuredItems[0].title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground italic bg-muted">
                                    Product Showcase
                                </div>
                            )}

                            {/* Floating Product Badge */}
                            {featuredItems[0] && (
                                <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Trending Now</p>
                                            <h4 className="font-black text-lg text-foreground truncate">{featuredItems[0].title}</h4>
                                        </div>
                                        <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                                            <TrendingUp className="size-5" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
