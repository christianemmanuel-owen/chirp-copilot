import { SectionHeader } from "@/app/experimental-home/_components/SectionHeader"
import { getSectionStyles, type SectionBackground } from "@/lib/storefront-theme"

interface AboutUsSectionProps {
    title?: string
    content?: string
    styles?: Record<string, any>
    sectionId?: string
    background?: SectionBackground
    hiddenFields?: string[]
}

export default function AboutUsSection({ title, content, styles, sectionId, background, hiddenFields }: AboutUsSectionProps) {
    const sectionStyles = getSectionStyles(background)
    const isHidden = (key: string) => hiddenFields?.includes(key)

    return (
        <section
            className="relative min-h-[80vh] flex items-center justify-center overflow-hidden border-y border-border"
            data-section-id={sectionId}
            style={sectionStyles}
        >
            {/* Full Bleed Background Image - Only show if no custom background is provided */}
            {!background && (
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=2070&auto=format&fit=crop"
                        alt="Our Workshop"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
                </div>
            )}

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
                <div className="space-y-12">
                    <div className="space-y-8">
                        {!isHidden("aboutTitle") && (
                            <h2
                                className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-white"
                                data-element-key="aboutTitle"
                                style={styles?.aboutTitle}
                            >
                                {title || "Our Commitment to Quality"}
                            </h2>
                        )}
                        {!isHidden("aboutContent") && (
                            <p
                                className="text-xl md:text-2xl text-white/80 font-medium leading-relaxed max-w-3xl mx-auto"
                                data-element-key="aboutContent"
                                style={styles?.aboutContent}
                            >
                                {content || "We believe that the objects you surround yourself with should be as intentional as the life you lead. Each piece in our collection is selected for its superior craftsmanship, timeless design, and functional excellence."}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
