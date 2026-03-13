import { useMemo, useEffect, useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { getSectionStyles, type SectionBackground } from "@/lib/storefront-theme"
import { motion, AnimatePresence } from "framer-motion"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface CatalogHeroSectionProps {
    sectionId: string
    catalogData: any
    title?: string
    subtitle?: string
    styles?: Record<string, any>
    background?: SectionBackground
    hiddenFields?: string[]
    variant?: string // "discount-spotlight", "popular-spotlight", "minimal-banner"
    selectedProduct?: any
    manualSlides?: any[]
    selectedIds?: number[]
    isFirst?: boolean
    topPadding?: number
}

export default function CatalogHeroSection({
    sectionId,
    catalogData,
    title,
    subtitle,
    styles = {},
    background,
    hiddenFields = [],
    variant = "discount-spotlight",
    selectedProduct,
    manualSlides,
    selectedIds,
    isFirst,
    topPadding = 96
}: CatalogHeroSectionProps) {
    const sectionStyles = useMemo(() => getSectionStyles(background), [background])
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center', skipSnaps: false })
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [tweenValues, setTweenValues] = useState<number[]>([])

    const onScroll = useCallback(() => {
        if (!emblaApi) return

        const engine = emblaApi.internalEngine()
        const scrollProgress = emblaApi.scrollProgress()

        const values = emblaApi.scrollSnapList().map((scrollSnap, index) => {
            let diffToTarget = scrollSnap - scrollProgress

            if (engine.options.loop) {
                engine.slideLooper.loopPoints.forEach((loopPoint) => {
                    const target = loopPoint.target()
                    if (index === loopPoint.index && target !== 0) {
                        const sign = Math.sign(target)
                        if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress)
                        if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress)
                    }
                })
            }
            const tweenValue = 1 - Math.abs(diffToTarget * 1.5) // Increased intensity for sharper focus
            return Math.max(0, Math.min(1, tweenValue))
        })
        setTweenValues(values)
    }, [emblaApi])

    useEffect(() => {
        if (!emblaApi) return
        const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
        emblaApi.on('select', onSelect)
        emblaApi.on('scroll', onScroll)
        emblaApi.on('reInit', onScroll)
        onSelect()
        onScroll()
        return () => {
            emblaApi.off('select', onSelect)
            emblaApi.off('scroll', onScroll)
            emblaApi.off('reInit', onScroll)
        }
    }, [emblaApi, onScroll])

    const scrollPrev = () => emblaApi?.scrollPrev()
    const scrollNext = () => emblaApi?.scrollNext()

    const carouselItems = useMemo(() => {
        if (variant === "banner-carousel" && manualSlides && manualSlides.length > 0) return manualSlides
        if (selectedProduct) return [selectedProduct]
        // Fallback to hero slides or any available variants
        return (catalogData.hero.slides?.length > 0 ? catalogData.hero.slides : catalogData.variants?.slice(0, 6)) || []
    }, [catalogData, selectedProduct, manualSlides, variant])

    const bentoItems = useMemo(() => {
        return catalogData.hero.slides.slice(0, 3)
    }, [catalogData.hero.slides])

    const displayData = useMemo(() => {
        if (selectedProduct) {
            return {
                title: selectedProduct.productName || selectedProduct.displayName,
                subtitle: selectedProduct.description || "",
                image: selectedProduct.image || "/placeholder.svg",
                accent: selectedProduct.brandName || "Featured",
                href: selectedProduct.detailPath || "/catalog",
                ctaLabel: "Shop Now"
            }
        }

        if (variant === "discount-spotlight") {
            const promo = catalogData.hero.slides.find((s: any) => s.discountCampaignId) || catalogData.hero.slides[0]
            return {
                title: title || promo?.title || "Exclusive Offers",
                subtitle: subtitle || promo?.subtitle || "Check out our latest deals.",
                image: promo?.image || "/placeholder.svg",
                accent: promo?.accent || "Limited Time",
                href: promo?.href || "/catalog",
                ctaLabel: promo?.ctaLabel || "Shop Now"
            }
        }

        if (variant === "popular-spotlight") {
            const popular = catalogData.hero.popular
            return {
                title: title || popular?.title || "Community Favorites",
                subtitle: subtitle || popular?.subtitle || "Our top-selling products this month.",
                image: popular?.image || "/placeholder.svg",
                accent: popular?.accent || "Best Seller",
                href: popular?.href || "/catalog",
                ctaLabel: "View Details"
            }
        }

        return {
            title: title || "New Collection",
            subtitle: subtitle || "Discover our latest arrivals.",
            image: "/placeholder.svg",
            accent: "New",
            href: "/catalog",
            ctaLabel: "Explore"
        }
    }, [variant, catalogData, title, subtitle])

    const isHidden = (key: string) => hiddenFields?.includes(key)

    // --- RENDER VARIANTS ---

    if (variant === "glass-carousel") {
        return (
            <section id={sectionId} style={{ ...sectionStyles, paddingTop: isFirst ? `${topPadding + 96}px` : "96px" }} className="relative pb-24 px-6 overflow-hidden md:px-12" data-section-id={sectionId}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                        <div className="space-y-4">
                            {!isHidden('heroAccent') && (
                                <motion.span
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-widest cursor-pointer"
                                    data-element-key="heroAccent"
                                >
                                    <Sparkles className="size-3 text-white" /> Featured Collections
                                </motion.span>
                            )}
                            {!isHidden('heroTitle') && (
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-tight max-w-2xl"
                                    data-element-key="heroTitle"
                                    style={styles.heroTitle}
                                >
                                    {title || "Exclusive Showcase"}
                                </motion.h2>
                            )}
                        </div>
                        {!isHidden('heroNavigation') && (
                            <div className="flex gap-4" data-element-key="heroNavigation">
                                <button
                                    onClick={(e) => { e.stopPropagation(); scrollPrev(); }}
                                    style={styles.scrollButtons}
                                    data-element-key="scrollButtons"
                                    className="size-12 rounded-full border-2 border-white/30 text-white flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95 shadow-xl backdrop-blur-md relative z-10"
                                >
                                    <ChevronLeft className="size-5" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); scrollNext(); }}
                                    style={styles.scrollButtons}
                                    data-element-key="scrollButtons"
                                    className="size-12 rounded-full border-2 border-white/30 text-white flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95 shadow-xl backdrop-blur-md relative z-10"
                                >
                                    <ChevronRight className="size-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex -ml-8">
                            {carouselItems.map((item: any, idx: number) => (
                                <div key={idx} className="flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-[0_0_35%] min-w-0 pl-8">
                                    <Link
                                        href={item.href || "/catalog"}
                                        className="block group"
                                        data-selection-type="hero-product"
                                        data-element-key="heroFeaturedCard"
                                    >
                                        <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-muted shadow-2xl transition-all duration-700 group-hover:scale-[1.02]">
                                            <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-2xl">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block drop-shadow-sm">{item.accent || "Collection"}</span>
                                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 leading-none" style={{ ...styles.heroTitleSecondary, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{item.title}</h3>
                                                    <p className="text-xs text-white/70 font-medium line-clamp-1 mb-4" style={{ ...styles.heroSubtitleSecondary, textShadow: '0 1px 5px rgba(0,0,0,0.3)' }}>{item.subtitle}</p>
                                                    <div
                                                        className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                                                        style={styles.ctaButton}
                                                        data-element-key="ctaButton"
                                                    >
                                                        View Collection <ArrowRight className="size-3" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    if (variant === "banner-carousel") {
        const cleanSubtitle = (sub: string) => {
            if (!sub) return "";
            return sub.replace(/\s*·\s*\d+\s*sold/gi, "").replace(/\d+\s*sold/gi, "").trim();
        }

        return (
            <section
                id={sectionId}
                style={{ ...sectionStyles, paddingTop: isFirst ? `${topPadding + 96}px` : "96px" }}
                className="relative px-0 overflow-hidden cursor-pointer"
                data-section-id={sectionId}
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    window.parent.postMessage({
                        type: 'CATALOG_SELECTION_REQUEST',
                        sectionId,
                        selectionType: "banner-slides",
                        selectedIds: selectedIds || [],
                        clientX: e.clientX,
                        clientY: e.clientY
                    }, '*')
                }}
            >
                <div className="relative group/carousel">
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex">
                            {carouselItems.map((item: any, idx: number) => {
                                const sanitizedSubtitle = cleanSubtitle(item.subtitle)
                                const sanitizedAccent = item.accent?.toLowerCase().includes("sold") ? "Top Seller" : item.accent

                                return (
                                    <div key={idx} className="flex-[0_0_100%] min-w-0 relative h-[70vh] min-h-[700px] md:min-h-[800px] flex items-center justify-center">
                                        {/* Background Image with Overlay */}
                                        <div className="absolute inset-0 z-0">
                                            <Image
                                                src={item.image}
                                                alt={item.title || "Banner"}
                                                fill
                                                className="object-cover"
                                                priority={idx === 0}
                                            />
                                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                                        </div>

                                        {/* Centered Content */}
                                        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
                                            {!isHidden('heroAccent') && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em]"
                                                    data-element-key="heroAccent"
                                                >
                                                    <Sparkles className="size-3 text-primary" /> {sanitizedAccent || "Top Seller"}
                                                </motion.div>
                                            )}

                                            <div className="space-y-4">
                                                {!isHidden('heroTitle') && (
                                                    <motion.h2
                                                        initial={{ opacity: 0, y: 20 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.1, duration: 0.8 }}
                                                        className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85] drop-shadow-2xl"
                                                        data-element-key="heroTitle"
                                                        style={styles.heroTitle}
                                                    >
                                                        {item.title || item.productName || "Premium Selection"}
                                                    </motion.h2>
                                                )}
                                                {!isHidden('heroSubtitle') && (
                                                    <motion.p
                                                        initial={{ opacity: 0 }}
                                                        whileInView={{ opacity: 1 }}
                                                        transition={{ delay: 0.3, duration: 0.8 }}
                                                        className="text-lg md:text-xl text-white/80 font-medium max-w-2xl mx-auto tracking-tight"
                                                        data-element-key="heroSubtitle"
                                                        style={styles.heroSubtitle}
                                                    >
                                                        {sanitizedSubtitle || item.description || "Discover our curated collection of favorites."}
                                                    </motion.p>
                                                )}
                                            </div>

                                            {!isHidden('ctaButton') && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    whileInView={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.4 }}
                                                >
                                                    <Link
                                                        href={item.detailPath || item.href || "/catalog"}
                                                        className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
                                                        style={styles.ctaButton}
                                                        data-element-key="ctaButton"
                                                    >
                                                        Explore This Collection <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                                    </Link>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    {!isHidden('heroNavigation') && carouselItems.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); scrollPrev(); }}
                                className="absolute left-8 top-1/2 -translate-y-1/2 size-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all opacity-0 group-hover/carousel:opacity-100 z-20"
                                data-element-key="heroNavigation"
                                style={styles.scrollButtons}
                            >
                                <ChevronLeft className="size-8" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); scrollNext(); }}
                                className="absolute right-8 top-1/2 -translate-y-1/2 size-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all opacity-0 group-hover/carousel:opacity-100 z-20"
                                data-element-key="heroNavigation"
                                style={styles.scrollButtons}
                            >
                                <ChevronRight className="size-8" />
                            </button>
                        </>
                    )}

                    {/* Pagination Dots */}
                    {carouselItems.length > 1 && (
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                            {carouselItems.map((_: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => emblaApi?.scrollTo(idx)}
                                    className={cn(
                                        "h-1.5 transition-all rounded-full",
                                        selectedIndex === idx ? "w-12 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        )
    }

    if (variant === "split-reveal") {
        return (
            <section id={sectionId} style={{ ...sectionStyles, paddingTop: isFirst ? `${topPadding + 96}px` : "96px" }} className="relative min-h-[80vh] flex items-center pb-24 px-6 overflow-hidden" data-section-id={sectionId}>
                <div className="max-w-7xl mx-auto w-full relative">
                    <div className="flex flex-col lg:flex-row gap-0 lg:gap-16 items-center">
                        {/* Text Content - Top on mobile */}
                        <div className="relative z-20 w-full lg:w-1/2 lg:pr-12 pointer-events-none mb-[-20%] lg:mb-0">
                            <div className="bg-white/5 backdrop-blur-3xl lg:bg-transparent lg:backdrop-blur-none p-6 md:p-12 lg:p-0 rounded-[2.5rem] lg:rounded-none border border-white/10 lg:border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] lg:shadow-none pointer-events-auto space-y-6 md:space-y-10 relative lg:static mx-4 lg:mx-0">
                                <div className="absolute inset-0 rounded-[2.5rem] border border-white/5 pointer-events-none lg:hidden" /> {/* Inner Glow */}
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: "60px" }}
                                    className="h-1 bg-primary"
                                />
                                {(!isHidden('heroTitle') || !isHidden('heroSubtitle')) && (
                                    <div className="space-y-4 lg:space-y-6">
                                        {!isHidden('heroTitle') && (
                                            <motion.h2
                                                initial={{ opacity: 0, x: -50 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                className="text-3xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-balance"
                                                style={{ ...styles.heroTitle, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                                            >
                                                {displayData.title}
                                            </motion.h2>
                                        )}
                                        {!isHidden('heroSubtitle') && (
                                            <>
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    whileInView={{ opacity: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="text-sm md:text-xl text-muted-foreground font-medium max-w-md leading-relaxed hidden lg:block"
                                                    style={styles.heroSubtitle}
                                                >
                                                    {displayData.subtitle}
                                                </motion.p>
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    whileInView={{ opacity: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="text-[11px] text-white/60 font-medium max-w-[280px] leading-relaxed lg:hidden"
                                                    style={styles.heroSubtitle}
                                                >
                                                    {displayData.subtitle}
                                                </motion.p>
                                            </>
                                        )}
                                    </div>
                                )}
                                {!isHidden('heroCTA') && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <Link
                                            href={displayData.href}
                                            className="inline-flex items-center gap-3 px-8 lg:px-10 py-4 lg:py-5 bg-black text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] lg:text-xs hover:bg-primary transition-colors shadow-2xl"
                                            style={styles.ctaButton}
                                            data-element-key="heroCTA"
                                        >
                                            {displayData.ctaLabel} <ArrowRight className="size-3 lg:size-4" />
                                        </Link>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Image Container - Bottom on mobile */}
                        <div className="relative group z-10 w-full lg:w-1/2">
                            <div
                                className="relative aspect-[4/5] md:aspect-video lg:aspect-[3/4] rounded-[2rem] md:rounded-[3rem] lg:rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]"
                                data-selection-type="hero-product"
                                data-element-key="heroFeaturedCard"
                            >
                                <motion.div
                                    initial={{ scale: 1.2, filter: 'blur(10px)' }}
                                    whileInView={{ scale: 1, filter: 'blur(0px)' }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="w-full h-full"
                                >
                                    <Image src={displayData.image} alt={displayData.title} fill className="object-cover" />
                                </motion.div>
                                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent pointer-events-none" />
                            </div>

                            {/* Integrated Brand Badge */}
                            {!isHidden('heroAccent') && (
                                <div
                                    className="absolute -top-4 lg:bottom-12 right-8 lg:right-12 flex h-10 lg:h-16 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-xl lg:rounded-2xl shadow-2xl items-center px-4 lg:px-6 gap-2 lg:gap-3 z-30 cursor-pointer"
                                    data-element-key="heroAccent"
                                >
                                    <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-white">{displayData.accent}</span>
                                    <Star className="size-2.5 lg:size-3 text-white fill-white" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Decorative background number */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 text-[40vw] font-black text-muted-foreground/5 pointer-events-none select-none">01</div>
            </section>
        )
    }

    if (variant === "bento-spotlight") {
        return (
            <section id={sectionId} style={{ ...sectionStyles, paddingTop: isFirst ? `${topPadding + 96}px` : "96px" }} className="relative pb-24 px-6 md:px-12" data-section-id={sectionId}>
                <div className="max-w-7xl mx-auto">
                    {(!isHidden('heroTitle') || !isHidden('heroSubtitle')) && (
                        <div className="text-center mb-16 space-y-4">
                            {!isHidden('heroTitle') && (
                                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter" style={styles.heroTitle}>{title || "Curated Edits"}</h2>
                            )}
                            {!isHidden('heroSubtitle') && (
                                <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs" style={styles.heroSubtitle}>{subtitle || "Selection of our finest"}</p>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-[800px] md:h-[600px]">
                        {/* Main Large Item */}
                        <Link
                            href={bentoItems[0]?.href || "/catalog"}
                            className="md:col-span-2 md:row-span-2 group relative rounded-[2rem] overflow-hidden bg-primary/5"
                            data-selection-type="hero-product"
                            data-element-key="heroFeaturedCard"
                        >
                            <Image src={bentoItems[0]?.image || "/placeholder.svg"} alt={bentoItems[0]?.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-8 left-8 right-8 text-white pointer-events-none">
                                <span className="bg-primary px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest mb-3 inline-block">Featured</span>
                                <h3 className="text-3xl font-black uppercase mb-2" style={{ ...styles.heroTitleSecondary, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{bentoItems[0]?.title}</h3>
                                <p className="text-xs font-medium text-white/70" style={{ ...styles.heroSubtitleSecondary, textShadow: '0 1px 5px rgba(0,0,0,0.3)' }}>{bentoItems[0]?.subtitle}</p>
                            </div>
                        </Link>

                        {/* Smaller Items */}
                        {bentoItems.slice(1, 3).map((item: any, idx: number) => (
                            <Link
                                key={idx}
                                href={item.href || "/catalog"}
                                className="md:col-span-2 group relative rounded-[2rem] overflow-hidden bg-secondary/5"
                                data-selection-type="hero-product"
                                data-element-key="heroFeaturedCardSecondary"
                            >
                                <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="bg-white text-black p-4 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500">
                                        <ArrowRight className="size-6" />
                                    </div>
                                </div>
                                <div className="absolute top-6 left-6 text-white group-hover:hidden transition-all pointer-events-none">
                                    <h3 className="text-xl font-black uppercase" style={{ ...styles.heroTitleSecondary, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{item.title}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (variant === "minimal-banner") {
        return (
            <section id={sectionId} style={{ ...sectionStyles, paddingTop: isFirst ? `${topPadding + 128}px` : "128px" }} className="relative pb-32 px-6 text-center overflow-hidden" data-section-id={sectionId}>
                <div className="max-w-4xl mx-auto space-y-12 relative z-10">
                    {!isHidden('heroAccent') && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-full border-2 border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.3em] cursor-pointer"
                            data-element-key="heroAccent"
                        >
                            <Star className="size-3 fill-primary" /> Curated Collection
                        </motion.div>
                    )}

                    {(!isHidden('heroTitle') || !isHidden('heroSubtitle')) && (
                        <div className="space-y-6">
                            {!isHidden('heroTitle') && (
                                <h2
                                    className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none italic italic-custom"
                                    style={{ ...styles.heroTitle, textShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    data-element-key="heroTitle"
                                >
                                    {displayData.title}
                                </h2>
                            )}
                            {!isHidden('heroSubtitle') && (
                                <p
                                    className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed"
                                    style={{ ...styles.heroSubtitle, textShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
                                    data-element-key="heroSubtitle"
                                >
                                    {displayData.subtitle}
                                </p>
                            )}
                        </div>
                    )}

                    {!isHidden('heroCTA') && (
                        <Link
                            href={displayData.href}
                            className="group relative inline-flex items-center gap-6 text-xl font-black uppercase tracking-widest text-foreground hover:text-primary transition-colors"
                            style={styles.ctaButton}
                            data-element-key="heroCTA"
                        >
                            {displayData.ctaLabel}
                            <div className="size-14 rounded-full border-2 border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-2" style={styles.ctaIconContainer}>
                                <ArrowRight className="size-6" />
                            </div>
                        </Link>
                    )}
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)]" />
                </div>
            </section>
        )
    }

    // Default: discount-spotlight & popular-spotlight fallback
    return (
        <section
            id={sectionId}
            data-section-id={sectionId}
            style={{
                ...sectionStyles,
                paddingTop: isFirst ? `${topPadding + 80}px` : "80px"
            }}
            className="relative pb-20 px-6 md:px-12 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8 z-10">
                    {displayData.accent && (
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            {displayData.accent}
                        </span>
                    )}
                    <div className="space-y-4">
                        {!hiddenFields.includes('heroTitle') && (
                            <h1
                                data-element-key="heroTitle"
                                style={{ ...styles.heroTitle, textShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                                className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]"
                            >
                                {displayData.title}
                            </h1>
                        )}
                        {!hiddenFields.includes('heroSubtitle') && (
                            <p
                                data-element-key="heroSubtitle"
                                style={{ ...styles.heroSubtitle, textShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
                                className="text-lg md:text-xl text-muted-foreground font-medium max-w-xl leading-relaxed"
                            >
                                {displayData.subtitle}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Link
                            href={displayData.href}
                            className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-xl shadow-primary/20"
                        >
                            {displayData.ctaLabel}
                        </Link>
                    </div>
                </div>

                <div className="relative aspect-square lg:aspect-[4/5] rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                    <Image
                        src={displayData.image}
                        alt={displayData.title}
                        fill
                        className="object-cover"
                    />
                </div>
            </div>

            {/* Background elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </section>
    )
}
