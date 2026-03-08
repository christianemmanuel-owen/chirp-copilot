"use client"

import { useEffect, useState } from "react"
import { themeConfigToCssVariables, buildThemeConfig } from "@/lib/storefront-theme"

import HeroSection from "./HeroSection"
import CategoryCarouselSection from "./CategoryCarouselSection"
import AboutUsSection from "./AboutUsSection"
import FeaturedProductsSection from "./FeaturedProductsSection"
import EcommerceFooter from "./EcommerceFooter"

import nextDynamic from "next/dynamic"

const PreviewManager = nextDynamic(() => import("@/components/PreviewManager"), {
    ssr: false,
    loading: () => null
})

interface InteractivePreviewWrapperProps {

    initialSettings: any
    catalogData: any
    initialLayout: any[]
    isPreview?: boolean
}

export default function InteractivePreviewWrapper({ initialSettings, catalogData, initialLayout, isPreview }: InteractivePreviewWrapperProps) {

    const [settings, setSettings] = useState(initialSettings)
    const [layout, setLayout] = useState(initialLayout)


    const applyTheme = (config: any) => {
        const themePart = config.theme || config.theme_config || config
        const theme = buildThemeConfig(themePart)
        const vars = themeConfigToCssVariables(theme)
        const container = document.getElementById('storefront-theme-container')
        if (container) {
            Object.entries(vars).forEach(([key, value]) => {
                container.style.setProperty(key, value)
            })
            container.setAttribute('data-storefront-font', theme.fontFamily)
        }
    }


    useEffect(() => {
        // Apply initial theme
        if (settings) {
            applyTheme(settings)
        }

        const handleMessage = (e: MessageEvent) => {
            if (e.data.type === 'CONFIG_UPDATE') {
                const newConfig = e.data.config
                if (newConfig) {
                    setSettings(newConfig)
                    if (newConfig.experimental?.layout) {
                        setLayout(newConfig.experimental.layout)
                    }
                    applyTheme(newConfig)
                }
            }
        }

        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [settings])



    const experimental = settings.experimental || {}
    const businessName = (settings.theme?.businessName) || (settings.theme_config as any)?.businessName || settings.businessName || "CHIRP"

    return (
        <>
            {isPreview && <PreviewManager />}
            {layout.map((section: any) => {

                if (!section.enabled) return null

                switch (section.type) {
                    case "hero":
                        return (
                            <HeroSection
                                key={section.id}
                                sectionId={section.id}
                                categories={catalogData.navCategories}
                                featuredItems={catalogData.hero.featured}
                                title={experimental.content?.heroTitle}
                                subtitle={experimental.content?.heroSubtitle}
                                titleHighlight={experimental.content?.heroTitleHighlight}
                                description={experimental.content?.heroDescription}
                                heroCTALink={experimental.content?.heroCTALink}
                                styles={section.styles}
                                background={section.background}
                                hiddenFields={section.hiddenFields}
                            />
                        )

                    case "categories":
                        return (
                            <CategoryCarouselSection
                                key={section.id}
                                sectionId={section.id}
                                tiles={catalogData.categoryTiles}
                                styles={section.styles}
                                background={section.background}
                                hiddenFields={section.hiddenFields}
                            />
                        )
                    case "about":
                        return (
                            <AboutUsSection
                                key={section.id}
                                sectionId={section.id}
                                title={experimental.content?.aboutTitle}
                                content={experimental.content?.aboutContent}
                                styles={section.styles}
                                background={section.background}
                                hiddenFields={section.hiddenFields}
                            />
                        )
                    case "featured":
                        return (
                            <FeaturedProductsSection
                                key={section.id}
                                sectionId={section.id}
                                initialProducts={catalogData.variants}
                                title={experimental.content?.featuredTitle}
                                subtitle={experimental.content?.featuredSubtitle}
                                featuredCTALink={experimental.content?.featuredCTALink}
                                styles={section.styles}
                                background={section.background}
                                hiddenFields={section.hiddenFields}
                            />
                        )
                    case "footer":
                        return (
                            <EcommerceFooter
                                key={section.id}
                                sectionId={section.id}
                                businessName={businessName}
                                mission={experimental.content?.footerMission}
                                newsletterBlurb={experimental.content?.footerNewsletterBlurb}
                                styles={section.styles}
                                background={section.background}
                                hiddenFields={section.hiddenFields}
                            />
                        )

                    default:
                        return null
                }
            })}
        </>
    )
}
