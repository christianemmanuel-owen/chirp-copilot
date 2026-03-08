import { SectionHeader } from "@/app/experimental-home/_components/SectionHeader"
import { getSectionStyles, type SectionBackground } from "@/lib/storefront-theme"
import { Quote } from "lucide-react"
import { AVAILABLE_ICONS, type IconName } from "@/lib/icons"

interface AboutUsSectionProps {
    title?: string
    content?: string
    styles?: Record<string, any>
    sectionId?: string
    background?: SectionBackground
    hiddenFields?: string[]
    variant?: string
}

export default function AboutUsSection({ title, content, styles, sectionId, background, hiddenFields, variant = "v1" }: AboutUsSectionProps) {
    const isHidden = (key: string) => hiddenFields?.includes(key)
    const sectionStyles = getSectionStyles(background)

    const hexToRgba = (hex: string, opacity: number) => {
        if (!hex || !hex.startsWith('#')) return hex
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }

    const overlayEnabled = background?.overlayEnabled ?? false
    const overlayOpacity = background?.overlayOpacity ?? 0.5
    const overlayBrightness = background?.overlayBrightness ?? 0.5
    const colorWithOpacity = background?.color && background.color.startsWith('#')
        ? hexToRgba(background.color, background.colorOpacity ?? 1)
        : background?.color || "var(--background)"

    const sectionStyleContainer = {
        backgroundColor: background?.color ? hexToRgba(background.color, background.colorOpacity ?? 1) : undefined,
        ...sectionStyles,
        backgroundImage: overlayEnabled ? 'none' : sectionStyles.backgroundImage
    }

    // Variation 5: Impact Quote
    if (variant === "v5") {
        const Icon = AVAILABLE_ICONS[styles?.aboutQuoteIcon?.iconName as IconName] || AVAILABLE_ICONS.Quote

        return (
            <section
                className="relative min-h-[50vh] flex items-center justify-center overflow-hidden py-32"
                data-section-id={sectionId}
                style={sectionStyleContainer}
            >
                <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative">
                    <div
                        className="absolute -top-12 left-1/2 -translate-x-1/2 cursor-pointer hover:scale-110 transition-transform active:scale-95"
                        data-selection-type="icon"
                        data-element-key="aboutQuoteIcon"
                    >
                        <Icon className="size-20 text-primary/10 -z-10" />
                    </div>
                    {!isHidden("aboutContent") && (
                        <p
                            className="text-3xl md:text-5xl font-black tracking-tight italic leading-tight text-foreground"
                            data-element-key="aboutContent"
                            style={styles?.aboutContent}
                            dangerouslySetInnerHTML={{ __html: content || "Quality is not an act, it's a habit that we cultivate in everything we create." }}
                        />
                    )}
                    {!isHidden("aboutTitle") && (
                        <div className="flex items-center justify-center gap-4">
                            <div className="h-px w-8 bg-primary/30" />
                            <h2
                                className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground"
                                data-element-key="aboutTitle"
                                style={styles?.aboutTitle}
                                dangerouslySetInnerHTML={{ __html: title || "Our Philosophy" }}
                            />
                            <div className="h-px w-8 bg-primary/30" />
                        </div>
                    )}
                </div>
            </section>
        )
    }

    // Variation 4: Icon Grid
    if (variant === "v4") {
        const features = [
            {
                iconKey: "aboutIcon1",
                defaultIcon: "Shield",
                title: "Premium Built",
                desc: "Using only the finest materials sourced globally."
            },
            {
                iconKey: "aboutIcon2",
                defaultIcon: "Zap",
                title: "Fast Delivery",
                desc: "From our workshop to your door in days."
            },
            {
                iconKey: "aboutIcon3",
                defaultIcon: "Heart",
                title: "Made with Love",
                desc: "Each piece is hand-selected and verified."
            }
        ]

        return (
            <section
                className="relative min-h-[60vh] flex items-center justify-center overflow-hidden py-24"
                data-section-id={sectionId}
                style={sectionStyleContainer}
            >
                <div className="max-w-6xl mx-auto px-6 w-full space-y-20">
                    {!isHidden("aboutTitle") && (
                        <div className="text-center space-y-4">
                            <h2
                                className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] text-foreground"
                                data-element-key="aboutTitle"
                                style={styles?.aboutTitle}
                                dangerouslySetInnerHTML={{ __html: title || "Why Choose Us" }}
                            />
                            <div className="mx-auto w-24 h-1.5 bg-primary rounded-full" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {features.map((f, i) => {
                            const iconName = (styles?.[f.iconKey]?.iconName || f.defaultIcon) as IconName
                            const Icon = AVAILABLE_ICONS[iconName] || AVAILABLE_ICONS.Shield

                            return (
                                <div key={i} className="flex flex-col items-center text-center space-y-6 group">
                                    <div
                                        className="size-20 bg-muted/50 rounded-[2rem] flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:scale-110 shadow-sm cursor-pointer active:scale-95"
                                        data-selection-type="icon"
                                        data-element-key={f.iconKey}
                                    >
                                        <Icon className="size-8" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-black uppercase tracking-tight">{f.title}</h3>
                                        <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-[250px]">
                                            {f.desc}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>
        )
    }

    // Variation 3: Split Minimal
    if (variant === "v3") {
        return (
            <section
                className="relative min-h-[70vh] flex items-center bg-background"
                data-section-id={sectionId}
                style={sectionStyleContainer}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-full min-h-[70vh]">
                    <div className="flex items-center justify-center p-8 lg:p-24 bg-white border-r border-border/50">
                        <div className="max-w-xl w-full space-y-8 text-left">
                            {!isHidden("aboutTitle") && (
                                <h2
                                    className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] text-foreground"
                                    data-element-key="aboutTitle"
                                    style={styles?.aboutTitle}
                                    dangerouslySetInnerHTML={{ __html: title || "Crafted with Intent." }}
                                />
                            )}
                            {!isHidden("aboutContent") && (
                                <p
                                    className="text-lg text-muted-foreground font-medium leading-relaxed"
                                    data-element-key="aboutContent"
                                    style={styles?.aboutContent}
                                    dangerouslySetInnerHTML={{ __html: content || "Our journey began with a simple belief: that quality should never be compromised for convenience." }}
                                />
                            )}
                        </div>
                    </div>
                    <div className="relative h-[40vh] lg:h-auto overflow-hidden bg-muted">
                        {background?.image && (
                            <img
                                src={background.image}
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

    // Variation 2: Centered Minimal
    if (variant === "v2") {
        return (
            <section
                className="relative min-h-[60vh] flex items-center justify-center overflow-hidden py-24"
                data-section-id={sectionId}
                style={sectionStyleContainer}
            >
                <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
                    {!isHidden("aboutTitle") && (
                        <h2
                            className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9] text-foreground"
                            data-element-key="aboutTitle"
                            style={styles?.aboutTitle}
                            dangerouslySetInnerHTML={{ __html: title || "Our Commitment." }}
                        />
                    )}
                    {!isHidden("aboutContent") && (
                        <p
                            className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto"
                            data-element-key="aboutContent"
                            style={styles?.aboutContent}
                            dangerouslySetInnerHTML={{ __html: content || "Dedicated to the art of craftsmanship and the pursuit of timeless elegance." }}
                        />
                    )}
                </div>
            </section>
        )
    }

    // Default v1: Centered Overlay
    return (
        <section
            className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-24"
            data-section-id={sectionId}
            style={sectionStyleContainer}
        >
            {/* Background Image Layer */}
            {overlayEnabled && background?.image && (
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <img
                        src={background.image}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{
                            opacity: overlayOpacity,
                            filter: `brightness(${overlayBrightness}) contrast(1.1) saturate(0.9)`
                        }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `radial-gradient(circle at center, transparent 0%, ${colorWithOpacity} 90%), linear-gradient(to bottom, ${colorWithOpacity} 0%, transparent 40%, transparent 60%, ${colorWithOpacity} 100%)`
                        }}
                    />
                </div>
            )}

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                <div className="space-y-12">
                    <div className="space-y-8">
                        {!isHidden("aboutTitle") && (
                            <h2
                                className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-foreground"
                                data-element-key="aboutTitle"
                                style={{
                                    ...styles?.aboutTitle,
                                    color: (overlayEnabled && background?.image) ? 'white' : styles?.aboutTitle?.color
                                }}
                                dangerouslySetInnerHTML={{ __html: title || "Our Commitment to Quality" }}
                            />
                        )}
                        {!isHidden("aboutContent") && (
                            <p
                                className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-3xl mx-auto"
                                data-element-key="aboutContent"
                                style={{
                                    ...styles?.aboutContent,
                                    color: (overlayEnabled && background?.image) ? 'rgba(255,255,255,0.8)' : styles?.aboutContent?.color
                                }}
                                dangerouslySetInnerHTML={{ __html: content || "We believe that the objects you surround yourself with should be as intentional as the life you lead." }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
