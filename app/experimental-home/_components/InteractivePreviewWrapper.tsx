"use client"

import React, { useEffect, useState } from "react"
import { themeConfigToCssVariables, buildThemeConfig } from "@/lib/storefront-theme"
import type { CatalogVariant, CollectionTile } from "@/lib/storefront-data"

import HeroSection from "./HeroSection"
import CategoryCarouselSection from "./CategoryCarouselSection"
import AboutUsSection from "./AboutUsSection"
import FeaturedProductsSection from "./FeaturedProductsSection"
import EcommerceFooter from "./EcommerceFooter"
import ExperimentalNavigation from "./ExperimentalNavigation"
import TestimonialsSection from "./TestimonialsSection"
import CatalogGridSection from "./CatalogGridSection"
import CatalogHeroSection from "./CatalogHeroSection"

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
    pageType?: 'home' | 'catalog'
}

export default function InteractivePreviewWrapper({ initialSettings, catalogData, initialLayout, isPreview, pageType = 'home' }: InteractivePreviewWrapperProps) {

    const [settings, setSettings] = useState(initialSettings)
    const [layout, setLayout] = useState(initialLayout)

    // Sync layout when initialLayout changes (for page switching)
    useEffect(() => {
        setLayout(initialLayout)
    }, [initialLayout])


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
                    const isCatalog = pageType === 'catalog'
                    const newLayout = isCatalog
                        ? newConfig.experimental?.catalogLayout
                        : newConfig.experimental?.layout

                    if (newLayout) {
                        setLayout(newLayout)
                    }
                    applyTheme(newConfig)
                }
            }
        }

        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [settings])



    const experimental = settings.experimental || {}
    const themeConfig = settings.theme_config || settings.theme || {}
    const businessName = themeConfig.businessName || settings.businessName || process.env.NEXT_PUBLIC_BUSINESS_NAME || "Storefront"

    return (
        <>
            {isPreview && <PreviewManager />}
            <ExperimentalNavigation
                businessName={businessName}
                faviconUrl={settings?.favicon_url || null}
                useLogo={experimental.navbar?.useLogo || false}
                dropdownMode={experimental.navbar?.dropdownMode || "categories"}
                transparentTheme={experimental.navbar?.transparentTheme || "dark"}
                navbarStyle={experimental.navbar?.navbarStyle || "glass"}
                navCategories={catalogData.navCategories}
                navBrands={catalogData.navBrands}
            />
            {layout.map((section: any, index: number) => {
                if (!section.enabled) return null

                // Identify if this is the first enabled section to add top padding/spacer
                const firstEnabledIndex = layout.findIndex((s: any) => s.enabled)
                const isFirst = index === firstEnabledIndex

                const sectionElement = (() => {
                    switch (section.type) {
                        case "hero": {
                            const heroVariant = catalogData.variants.find((v: CatalogVariant) => v.id === section.metadata?.selectedProductIds?.[0])
                            const heroFeatured = heroVariant ? [{
                                id: heroVariant.id,
                                title: heroVariant.productName,
                                variantLabel: heroVariant.variantLabel,
                                subtitle: heroVariant.description || "",
                                image: heroVariant.image,
                                href: heroVariant.detailPath,
                                productId: heroVariant.productId
                            }] : catalogData.hero.featured
                            return (
                                <HeroSection
                                    key={section.id}
                                    sectionId={section.id}
                                    categories={catalogData.navCategories}
                                    featuredItems={heroFeatured}
                                    title={experimental.content?.heroTitle}
                                    subtitle={experimental.content?.heroSubtitle}
                                    titleHighlight={experimental.content?.heroTitleHighlight}
                                    description={experimental.content?.heroDescription}
                                    heroCTALink={experimental.content?.heroCTALink}
                                    styles={section.styles}
                                    background={section.background}
                                    hiddenFields={section.hiddenFields}
                                    variant={section.metadata?.variant}
                                />
                            )
                        }

                        case "categories": {
                            const selectedTiles = section.metadata?.selectedCategoryIds?.length > 0
                                ? catalogData.categoryTiles.filter((c: CollectionTile) => section.metadata.selectedCategoryIds.includes(c.id))
                                : catalogData.categoryTiles
                            return (
                                <CategoryCarouselSection
                                    key={section.id}
                                    sectionId={section.id}
                                    tiles={selectedTiles}
                                    styles={section.styles}
                                    background={section.background}
                                    hiddenFields={section.hiddenFields}
                                    variant={section.metadata?.variant}
                                />
                            )
                        }
                        case "about":
                            return (
                                <AboutUsSection
                                    key={section.id}
                                    sectionId={section.id}
                                    businessName={businessName}
                                    title={experimental.content?.aboutTitle}
                                    content={experimental.content?.aboutContent}
                                    styles={section.styles}
                                    background={section.background}
                                    hiddenFields={section.hiddenFields}
                                    variant={section.metadata?.variant}
                                />
                            )
                        case "testimonials":
                            return (
                                <TestimonialsSection
                                    key={section.id}
                                    businessName={businessName}
                                />
                            )
                        case "featured": {
                            const selectedVariants = section.metadata?.selectedProductIds?.length > 0
                                ? catalogData.variants.filter((v: CatalogVariant) => section.metadata.selectedProductIds.includes(v.id))
                                : catalogData.variants
                            return (
                                <FeaturedProductsSection
                                    key={section.id}
                                    sectionId={section.id}
                                    initialProducts={selectedVariants}
                                    title={experimental.content?.featuredTitle}
                                    subtitle={experimental.content?.featuredSubtitle}
                                    featuredCTALink={experimental.content?.featuredCTALink}
                                    styles={section.styles}
                                    background={section.background}
                                    hiddenFields={section.hiddenFields}
                                    variant={section.metadata?.variant}
                                />
                            )
                        }
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
                                    variant={section.metadata?.variant}
                                />
                            )

                        case "catalog-grid":
                            return (
                                <CatalogGridSection
                                    key={section.id}
                                    sectionId={section.id}
                                    products={catalogData.variants}
                                    title={experimental.content?.catalogTitle}
                                    subtitle={experimental.content?.catalogSubtitle}
                                    styles={section.styles}
                                    background={section.background}
                                    hiddenFields={section.hiddenFields}
                                    variant={section.metadata?.variant}
                                    filterLayout={section.metadata?.filterLayout}
                                />
                            )

                        case "collection-spotlight": {
                            const isBanner = section.metadata?.variant === "banner-carousel"
                            const selectedProduct = !isBanner ? catalogData.variants.find((v: any) => v.id === section.metadata?.selectedProductIds?.[0]) : null

                            // Resolve manual slides for banner
                            let manualSlides = null
                            if (isBanner && section.metadata?.selectedBannerItemIds?.length > 0) {
                                manualSlides = section.metadata.selectedBannerItemIds.map((id: number) => {
                                    // Try find in products
                                    const prod = catalogData.variants.find((v: any) => v.id === id)
                                    if (prod) return {
                                        id: prod.id,
                                        title: prod.productName,
                                        subtitle: prod.description || "",
                                        image: prod.image,
                                        href: prod.detailPath,
                                        accent: prod.brandName,
                                        productId: prod.productId
                                    }
                                    // Try find in categories
                                    const cat = catalogData.categoryTiles.find((c: any) => c.id === id)
                                    if (cat) return {
                                        id: cat.id,
                                        title: cat.name,
                                        subtitle: `Explore our collection of ${cat.name}`,
                                        image: cat.image,
                                        href: `/catalog?category=${cat.id}`,
                                        accent: "Category"
                                    }
                                    // Try find in campaigns
                                    const camp = catalogData.discountCampaigns?.find((c: any) => c.id === id)
                                    if (camp) return {
                                        id: camp.id,
                                        title: camp.name,
                                        subtitle: camp.description || "Limited time offer",
                                        image: camp.bannerImage || camp.variants?.[0]?.image,
                                        href: `/catalog?campaign=${camp.id}`,
                                        accent: "Campaign"
                                    }
                                    return null
                                }).filter(Boolean)
                            }

                            return (
                                <CatalogHeroSection
                                    key={section.id}
                                    sectionId={section.id}
                                    catalogData={catalogData}
                                    selectedProduct={selectedProduct}
                                    manualSlides={manualSlides}
                                    title={experimental.content?.heroTitle}
                                    subtitle={experimental.content?.heroSubtitle}
                                    styles={section.styles}
                                    background={section.background}
                                    hiddenFields={section.hiddenFields}
                                    variant={section.metadata?.variant}
                                    selectedIds={section.metadata?.selectedBannerItemIds}
                                />
                            )
                        }

                        default:
                            return null
                    }
                })()

                return (
                    <div key={section.id}>
                        {sectionElement && React.cloneElement(sectionElement as React.ReactElement, {
                            isFirst,
                            topPadding: section.styles?.topPadding ?? 96
                        } as any)}
                    </div>
                )
            })}
        </>
    )
}
