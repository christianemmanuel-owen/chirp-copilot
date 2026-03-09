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
    hiddenFields?: string[]
    variant?: string
}

export default function HeroSection({ categories, featuredItems, title, subtitle, titleHighlight, description, heroCTALink, styles, sectionId, background, hiddenFields, variant = "v1" }: HeroSectionProps) {
    const heroCTAStyle = styles?.heroCTA || {}
    const sectionStyles = getSectionStyles(background)

    const isHidden = (key: string) => hiddenFields?.includes(key)

    // Variation 3: Centered Overlay
    if (variant === "v3") {
        const bgImage = background?.image || featuredItems[0]?.image
        const overlayEnabled = background?.overlayEnabled ?? false
        const overlayOpacity = background?.overlayOpacity ?? 0.3
        const overlayBrightness = background?.overlayBrightness ?? 0.4

        const hexToRgba = (hex: string, opacity: number) => {
            if (!hex || !hex.startsWith('#')) return hex
            const r = parseInt(hex.slice(1, 3), 16)
            const g = parseInt(hex.slice(3, 5), 16)
            const b = parseInt(hex.slice(5, 7), 16)
            return `rgba(${r}, ${g}, ${b}, ${opacity})`
        }

        const colorWithOpacity = background?.color && background.color.startsWith('#')
            ? hexToRgba(background.color, background.colorOpacity ?? 1)
            : background?.color || "var(--background)"

        return (
            <section
                className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-52 pb-24"
                data-section-id={sectionId}
                style={{
                    backgroundColor: background?.color ? hexToRgba(background.color, background.colorOpacity ?? 1) : undefined,
                    ...sectionStyles,
                    // Handle image independently if overlay is enabled to get the muting effect
                    backgroundImage: overlayEnabled ? 'none' : sectionStyles.backgroundImage
                }}
            >
                {/* Full Bleed Background Image for v3 - Only if overlay is enabled */}
                {overlayEnabled && bgImage && (
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <img
                            src={bgImage}
                            alt=""
                            className="w-full h-full object-cover contrast-125 saturate-[0.8]"
                            style={{
                                opacity: overlayOpacity,
                                filter: `brightness(${overlayBrightness}) contrast(1.25) saturate(0.8)`
                            }}
                        />
                        {/* Custom Vignette / Muting Layer */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: `radial-gradient(circle at center, transparent 0%, ${colorWithOpacity} 80%), linear-gradient(to bottom, ${colorWithOpacity} 0%, transparent 40%, transparent 60%, ${colorWithOpacity} 100%)`
                            }}
                        />
                    </div>
                )}

                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-12">
                    <div className="space-y-6">
                        {!isHidden("heroTitleHighlight") && (
                            <p
                                className="text-primary font-black uppercase tracking-[0.4em] text-sm animate-in fade-in slide-in-from-bottom-4 duration-700"
                                data-element-key="heroTitleHighlight"
                                style={styles?.heroTitleHighlight}
                                dangerouslySetInnerHTML={{ __html: titleHighlight || "New Arrival" }}
                            />
                        )}
                        {!isHidden("heroTitle") && (
                            <h1
                                className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase text-foreground animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100"
                                data-element-key="heroTitle"
                                style={styles?.heroTitle}
                                dangerouslySetInnerHTML={{ __html: title || "Bold Style." }}
                            />
                        )}
                    </div>

                    {!isHidden("heroDescription") && (
                        <p
                            className="max-w-2xl mx-auto text-xl text-muted-foreground font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-900"
                            data-element-key="heroDescription"
                            style={styles?.heroDescription}
                            dangerouslySetInnerHTML={{ __html: description || "Experience the pinnacle of design and functionality with our latest curated release." }}
                        />
                    )}

                    <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-16 duration-1000">
                        {!isHidden("heroCTA") && (
                            <Button
                                size="lg"
                                className="rounded-full font-bold h-16 px-12 text-lg shadow-2xl transition-all active:scale-95 group hover:brightness-[var(--hover-brightness,1.1)]"
                                data-element-key="heroCTA"
                                data-link-url={heroCTALink || "/catalog"}
                                style={{
                                    ...heroCTAStyle,
                                    boxShadow: heroCTAStyle.backgroundColor && !heroCTAStyle.backgroundColor.includes('rgba') ? `0 25px 50px -12px ${heroCTAStyle.backgroundColor}40` : undefined
                                }}
                                asChild
                            >
                                <Link href={heroCTALink || "/catalog"}>
                                    Explore Now
                                    <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </section>
        )
    }

    // Variation 2: Split Screen
    if (variant === "v2") {
        return (
            <section
                className="relative min-h-[90vh] flex items-center bg-background"
                data-section-id={sectionId}
                style={sectionStyles}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-full min-h-[90vh]">
                    <div className="flex items-center justify-center px-8 lg:px-24 pt-40 pb-8 lg:pt-48 lg:pb-24 bg-white order-2 lg:order-1">
                        <div className="max-w-xl w-full space-y-10">
                            <div className="space-y-4">
                                {!isHidden("heroTitleHighlight") && (
                                    <p
                                        className="text-primary font-black uppercase tracking-widest text-xs"
                                        data-element-key="heroTitleHighlight"
                                        style={styles?.heroTitleHighlight}
                                        dangerouslySetInnerHTML={{ __html: titleHighlight || "The Collection" }}
                                    />
                                )}
                                {!isHidden("heroTitle") && (
                                    <h1
                                        className="text-6xl sm:text-7xl font-black tracking-tighter leading-[0.9] uppercase text-foreground"
                                        data-element-key="heroTitle"
                                        style={styles?.heroTitle}
                                        dangerouslySetInnerHTML={{ __html: title || "Modern Art of Living." }}
                                    />
                                )}
                            </div>

                            {!isHidden("heroDescription") && (
                                <p
                                    className="text-lg text-muted-foreground font-medium leading-relaxed"
                                    data-element-key="heroDescription"
                                    style={styles?.heroDescription}
                                    dangerouslySetInnerHTML={{ __html: description || "Curated essentials for the contemporary minimalist." }}
                                />
                            )}

                            {!isHidden("heroCTA") && (
                                <Button
                                    size="lg"
                                    className="rounded-xl font-bold h-14 px-8 text-base shadow-xl transition-all active:scale-95 group hover:brightness-[var(--hover-brightness,1.1)]"
                                    data-element-key="heroCTA"
                                    data-link-url={heroCTALink || "/catalog"}
                                    style={heroCTAStyle}
                                    asChild
                                >
                                    <Link href={heroCTALink || "/catalog"}>
                                        Read More
                                        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="relative h-[50vh] lg:h-auto order-1 lg:order-2 overflow-hidden bg-muted">
                        {featuredItems[0] && (
                            <img
                                src={featuredItems[0].image}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        )}
                        <div className="absolute inset-0 bg-black/5" />
                    </div>
                </div>
            </section>
        )
    }

    // Default Variation (v1): Pill Highlight
    return (
        <section
            className="relative pt-52 pb-24 overflow-hidden bg-background"
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
                            {!isHidden("heroTitle") && (
                                <h1
                                    className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase text-foreground animate-in fade-in slide-in-from-left-8 duration-700 delay-100"
                                    data-element-key="heroTitle"
                                    style={styles?.heroTitle}
                                    dangerouslySetInnerHTML={{ __html: title || "Exquisite Pieces." }}
                                />
                            )}
                            {!isHidden("heroTitleHighlight") && (
                                <div
                                    className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase text-primary animate-in fade-in slide-in-from-left-8 duration-700 delay-200"
                                    data-element-key="heroTitleHighlight"
                                    style={styles?.heroTitleHighlight}
                                    dangerouslySetInnerHTML={{ __html: titleHighlight || "Designed for life." }}
                                />
                            )}
                        </div>



                        {!isHidden("heroDescription") && (
                            <p
                                className="max-w-xl text-xl text-muted-foreground font-medium leading-relaxed animate-in fade-in slide-in-from-left-12 duration-900"
                                data-element-key="heroDescription"
                                style={styles?.heroDescription}
                                dangerouslySetInnerHTML={{ __html: description || "Elevate your lifestyle with our premium collection of hand-picked goods." }}
                            />
                        )}

                        <div className="flex flex-wrap items-center gap-6 animate-in fade-in slide-in-from-left-16 duration-1000">
                            {!isHidden("heroCTA") && (
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
                            )}

                            {!isHidden("heroQuickLinks") && (
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
                            )}
                        </div>
                    </div>

                    {!isHidden("heroFeaturedCard") && (
                        <div className="lg:col-span-5 relative group">
                            <div className="absolute inset-0 bg-primary/5 rounded-[4rem] rotate-6 scale-95 blur-2xl group-hover:rotate-3 transition-transform duration-700" />

                            {/* Featured Product Card */}
                            {featuredItems[0] ? (
                                <Link
                                    href={featuredItems[0].href}
                                    className="relative block aspect-[4/5] bg-muted rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 group-hover:scale-[1.02] group-hover:-rotate-1 cursor-pointer"
                                    data-no-edit="true"
                                    data-selection-type="hero-product"
                                >
                                    <img
                                        src={featuredItems[0].image}
                                        alt={featuredItems[0].title}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    {/* Floating Product Badge */}
                                    <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Trending Now</p>
                                                    {featuredItems[0].variantLabel && featuredItems[0].variantLabel !== "Default" && (
                                                        <span className="bg-primary/10 text-primary text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-primary/20">
                                                            {featuredItems[0].variantLabel}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-black text-lg text-foreground line-clamp-2">{featuredItems[0].title}</h4>
                                            </div>
                                            <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
                                                <TrendingUp className="size-5" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <div className="relative aspect-[4/5] bg-muted rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 group-hover:scale-[1.02] group-hover:-rotate-1 w-full h-full flex items-center justify-center text-muted-foreground italic cursor-pointer pointer-events-auto" data-no-edit="true" data-selection-type="hero-product">
                                    Product Showcase
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
