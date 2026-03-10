export type StorefrontFontId =
  | "geist-sans"
  | "geist-mono"
  | "inter"
  | "playfair-display"
  | "space-grotesk"
  | "roboto"
  | "montserrat"
  | "lato"
  | "merriweather"
  | "oswald"
  | "raleway"
  | "nunito"
  | "outfit"
  | "syne"
  | "plus-jakarta-sans"
  | "bricolage-grotesque"

export interface StorefrontThemeColors {
  background: string
  card: string
  cardForeground: string
  foreground: string
  mutedForeground: string
  accent: string
  accentForeground: string
  border: string
  buttonColor: string
  buttonText: string
  navbarBackground: string
  navbarText: string
}

export interface SectionBackground {
  color?: string
  colorOpacity?: number
  image?: string
  overlayEnabled?: boolean
  overlayOpacity?: number
  overlayBrightness?: number
  gradient?: {
    enabled: boolean
    direction: string
    stops: Array<{ color: string; offset: number; opacity: number }>
  }
}

export interface StorefrontThemeConfig {
  fontFamily: StorefrontFontId
  colors: StorefrontThemeColors
  businessName?: string
  experimental?: {
    aboutUsEnabled: boolean
    featuredProductsEnabled: boolean
    testimonialsEnabled: boolean
    newsletterEnabled: boolean
    navbar?: {
      useLogo: boolean
      dropdownMode: "categories" | "brands"
      transparentTheme?: "light" | "dark" | "glass"
      navbarStyle?: "glass" | "solid"
    }
    content?: {
      heroTitle?: string
      heroTitleHighlight?: string
      heroDescription?: string
      featuredTitle?: string
      featuredSubtitle?: string
      aboutTitle?: string
      aboutContent?: string
      heroCTALink?: string
      featuredCTALink?: string
      footerMission?: string
      footerNewsletterBlurb?: string
    }
    layout?: Array<{
      id: string
      type: 'hero' | 'categories' | 'about' | 'featured' | 'footer'
      enabled: boolean
      background?: SectionBackground
      hiddenFields?: string[]
      content?: Record<string, any>
      styles?: Record<string, {
        fontFamily?: string
        fontSize?: string
        color?: string
        [key: string]: any
      }>
    }>
  }
}

export interface StorefrontFontDefinition {
  id: StorefrontFontId
  label: string
  description: string
  stack: string
}

const SYSTEM_STACK = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

export const STORE_FONT_OPTIONS: StorefrontFontDefinition[] = [
  {
    id: "geist-sans",
    label: "Geist Sans",
    description: "Clean modern sans serif (default).",
    stack: "var(--font-geist-sans), " + SYSTEM_STACK,
  },
  {
    id: "geist-mono",
    label: "Geist Mono",
    description: "Monospaced for a techy storefront.",
    stack: "var(--font-geist-mono), 'Geist Mono', " + SYSTEM_STACK,
  },
  {
    id: "inter",
    label: "Inter",
    description: "Friendly geometric sans for body-heavy layouts.",
    stack: "var(--font-inter), 'Inter', " + SYSTEM_STACK,
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    description: "Wide grotesk with character for premium drops.",
    stack: "var(--font-space-grotesk), 'Space Grotesk', " + SYSTEM_STACK,
  },
  {
    id: "playfair-display",
    label: "Playfair Display",
    description: "High-contrast serif for boutique experiences.",
    stack: "var(--font-playfair-display), 'Playfair Display', 'Georgia', serif",
  },
  {
    id: "roboto",
    label: "Roboto",
    description: "Modern, geometric yet friendly sans-serif.",
    stack: "var(--font-roboto), 'Roboto', " + SYSTEM_STACK,
  },
  {
    id: "montserrat",
    label: "Montserrat",
    description: "Classic geometric sans with a modern feel.",
    stack: "var(--font-montserrat), 'Montserrat', " + SYSTEM_STACK,
  },
  {
    id: "lato",
    label: "Lato",
    description: "Stylish sans-serif with rounded details.",
    stack: "var(--font-lato), 'Lato', " + SYSTEM_STACK,
  },
  {
    id: "merriweather",
    label: "Merriweather",
    description: "Highly readable serif designed for screens.",
    stack: "var(--font-merriweather), 'Merriweather', serif",
  },
  {
    id: "oswald",
    label: "Oswald",
    description: "Condensed bold sans-serif for strong headlines.",
    stack: "var(--font-oswald), 'Oswald', sans-serif",
  },
  {
    id: "raleway",
    label: "Raleway",
    description: "Elegant sans-serif with unique personality.",
    stack: "var(--font-raleway), 'Raleway', sans-serif",
  },
  {
    id: "nunito",
    label: "Nunito",
    description: "Soft, rounded sans-serif for a friendly vibe.",
    stack: "var(--font-nunito), 'Nunito', sans-serif",
  },
  {
    id: "outfit",
    label: "Outfit",
    description: "Modern geometric sans for a premium brand.",
    stack: "var(--font-outfit), 'Outfit', " + SYSTEM_STACK,
  },
  {
    id: "syne",
    label: "Syne",
    description: "Artistic and bold for high-impact design.",
    stack: "var(--font-syne), 'Syne', sans-serif",
  },
  {
    id: "plus-jakarta-sans",
    label: "Plus Jakarta Sans",
    description: "Clean, modern, and highly versatile sans.",
    stack: "var(--font-plus-jakarta-sans), 'Plus Jakarta Sans', sans-serif",
  },
  {
    id: "bricolage-grotesque",
    label: "Bricolage Grotesque",
    description: "Quirky and full of character for a unique brand.",
    stack: "var(--font-bricolage-grotesque), 'Bricolage Grotesque', sans-serif",
  },
]

const FONT_MAP = new Map<StorefrontFontId, StorefrontFontDefinition>(
  STORE_FONT_OPTIONS.map((entry) => [entry.id, entry]),
)

export const DEFAULT_THEME_COLORS: StorefrontThemeColors = {
  background: "#f7f8f5",
  card: "#ffffff",
  cardForeground: "#1d1a2b",
  foreground: "#1d1a2b",
  mutedForeground: "#5f6275",
  accent: "#6355ff",
  accentForeground: "#ffffff",
  border: "#dfe3ec",
  buttonColor: "#6355ff",
  buttonText: "#ffffff",
  navbarBackground: "#ffffff",
  navbarText: "#1d1a2b",
}

export const DEFAULT_THEME_CONFIG: StorefrontThemeConfig = {
  fontFamily: "geist-sans",
  colors: { ...DEFAULT_THEME_COLORS },
}

const HEX_COLOR_REGEX = /^#([0-9a-f]{6})$/i

const sanitizeHexColor = (value: unknown, fallback: string): string => {
  if (typeof value !== "string") {
    return fallback
  }
  const trimmed = value.trim()
  if (HEX_COLOR_REGEX.test(trimmed)) {
    return trimmed.toLowerCase()
  }
  return fallback
}

export const normalizeStorefrontFontId = (value: unknown): StorefrontFontId | null => {
  if (typeof value !== "string") {
    return null
  }
  const normalized = value.trim().toLowerCase() as StorefrontFontId
  return FONT_MAP.has(normalized) ? normalized : null
}

export const getFontDefinition = (value?: StorefrontFontId): StorefrontFontDefinition => {
  if (value && FONT_MAP.has(value)) {
    return FONT_MAP.get(value) as StorefrontFontDefinition
  }
  return FONT_MAP.get("geist-sans") as StorefrontFontDefinition
}

type ThemeInput = Partial<StorefrontThemeConfig> & {
  colors?: Partial<StorefrontThemeColors>
}

export const buildThemeConfig = (value?: unknown): StorefrontThemeConfig => {
  const base: StorefrontThemeConfig = {
    fontFamily: DEFAULT_THEME_CONFIG.fontFamily,
    colors: { ...DEFAULT_THEME_COLORS },
  }

  if (!value || typeof value !== "object") {
    // Ensure experimental is defined even for empty inputs
    base.experimental = {
      aboutUsEnabled: false,
      testimonialsEnabled: false,
      featuredProductsEnabled: false,
      newsletterEnabled: false,
      navbar: {
        useLogo: false,
        dropdownMode: 'categories',
        transparentTheme: 'dark'
      },
      content: {
        heroTitle: "Exquisite Pieces.",
        heroTitleHighlight: "Designed for life.",
        heroDescription: "Elevate your lifestyle with our premium collection of hand-picked goods.",
        featuredTitle: "Featured Collection",
        featuredSubtitle: "Our most coveted pieces, selected for you.",
        aboutTitle: "Our Commitment to Quality",
        aboutContent: "We believe that the objects you surround yourself with should be as intentional as the life you lead. Each piece in our collection is selected for its superior craftsmanship, timeless design, and functional excellence.",
        heroCTALink: "/catalog",
        featuredCTALink: "/catalog",
        footerMission: "Elevating your lifestyle with curated, high-end essentials designed for intentional living.",
        footerNewsletterBlurb: "Join our inner circle for exclusive drops and design stories."
      },
      layout: [
        { id: "hero-1", type: "hero", enabled: true, hiddenFields: [] },
        { id: "categories-1", type: "categories", enabled: true, hiddenFields: [] },
        { id: "about-1", type: "about", enabled: false, hiddenFields: [] },
        { id: "featured-1", type: "featured", enabled: false, hiddenFields: [] },
        { id: "footer-1", type: "footer", enabled: true, hiddenFields: [] },
      ]
    }
    return base
  }

  const payload = value as ThemeInput
  const fontFamily = normalizeStorefrontFontId(payload.fontFamily)
  if (fontFamily) {
    base.fontFamily = fontFamily
  }

  if (payload.businessName) {
    base.businessName = payload.businessName
  }

  if (payload.colors && typeof payload.colors === "object") {
    base.colors = {
      background: sanitizeHexColor(payload.colors.background, base.colors.background),
      card: sanitizeHexColor(payload.colors.card, base.colors.card),
      cardForeground: sanitizeHexColor(payload.colors.cardForeground, base.colors.cardForeground),
      foreground: sanitizeHexColor(payload.colors.foreground, base.colors.foreground),
      mutedForeground: sanitizeHexColor(payload.colors.mutedForeground, base.colors.mutedForeground),
      accent: sanitizeHexColor(payload.colors.accent, base.colors.accent),
      accentForeground: sanitizeHexColor(payload.colors.accentForeground, base.colors.accentForeground),
      border: sanitizeHexColor(payload.colors.border, base.colors.border),
      buttonColor: sanitizeHexColor(payload.colors.buttonColor, base.colors.buttonColor),
      buttonText: sanitizeHexColor(payload.colors.buttonText, base.colors.buttonText),
      navbarBackground: sanitizeHexColor(payload.colors.navbarBackground, base.colors.navbarBackground),
      navbarText: sanitizeHexColor(payload.colors.navbarText, base.colors.navbarText),
    }
  }

  if (payload.experimental && typeof payload.experimental === "object") {
    const exp = payload.experimental as any
    base.experimental = {
      aboutUsEnabled: exp.aboutUsEnabled ?? true,
      testimonialsEnabled: exp.testimonialsEnabled ?? true,
      featuredProductsEnabled: exp.featuredProductsEnabled ?? true,
      newsletterEnabled: exp.newsletterEnabled ?? true,
      navbar: {
        useLogo: exp.navbar?.useLogo ?? false,
        dropdownMode: exp.navbar?.dropdownMode ?? 'categories',
        transparentTheme: exp.navbar?.transparentTheme ?? 'dark',
        navbarStyle: exp.navbar?.navbarStyle ?? 'glass'
      },
      content: {
        heroTitle: "Exquisite Pieces.",
        heroTitleHighlight: "Designed for life.",
        heroDescription: "Elevate your lifestyle with our premium collection of hand-picked goods.",
        featuredTitle: "Featured Collection",
        featuredSubtitle: "Our most coveted pieces, selected for you.",
        aboutTitle: "Our Commitment to Quality",
        aboutContent: "We believe that the objects you surround yourself with should be as intentional as the life you lead. Each piece in our collection is selected for its superior craftsmanship, timeless design, and functional excellence.",
        heroCTALink: "/catalog",
        featuredCTALink: "/catalog",
        footerMission: "Elevating your lifestyle with curated, high-end essentials designed for intentional living.",
        footerNewsletterBlurb: "Join our inner circle for exclusive drops and design stories.",
        ...(exp.content || {}),
      },
      layout: Array.isArray(exp.layout) ? exp.layout : [
        { id: "hero-1", type: "hero", enabled: true, hiddenFields: [] },
        { id: "categories-1", type: "categories", enabled: true, hiddenFields: [] },
        { id: "about-1", type: "about", enabled: exp.aboutUsEnabled ?? true, hiddenFields: [] },
        { id: "featured-1", type: "featured", enabled: exp.featuredProductsEnabled ?? true, hiddenFields: [] },
        { id: "footer-1", type: "footer", enabled: true, hiddenFields: [] },
      ]
    }
  } else {
    // Fallback if experimental is missing but other config is present
    base.experimental = {
      aboutUsEnabled: false,
      testimonialsEnabled: false,
      featuredProductsEnabled: false,
      newsletterEnabled: false,
      navbar: {
        useLogo: false,
        dropdownMode: 'categories',
        transparentTheme: 'dark'
      },
      content: {
        heroTitle: "Exquisite Pieces.",
        heroTitleHighlight: "Designed for life.",
        heroDescription: "Elevate your lifestyle with our premium collection of hand-picked goods.",
        featuredTitle: "Featured Collection",
        featuredSubtitle: "Our most coveted pieces, selected for you.",
        aboutTitle: "Our Commitment to Quality",
        aboutContent: "We believe that the objects you surround yourself with should be as intentional as the life you lead. Each piece in our collection is selected for its superior craftsmanship, timeless design, and functional excellence.",
        heroCTALink: "/catalog",
        featuredCTALink: "/catalog",
        footerMission: "Elevating your lifestyle with curated, high-end essentials designed for intentional living.",
        footerNewsletterBlurb: "Join our inner circle for exclusive drops and design stories."
      },
      layout: [
        { id: "hero-1", type: "hero", enabled: true, hiddenFields: [] },
        { id: "categories-1", type: "categories", enabled: true, hiddenFields: [] },
        { id: "about-1", type: "about", enabled: false, hiddenFields: [] },
        { id: "featured-1", type: "featured", enabled: false, hiddenFields: [] },
        { id: "footer-1", type: "footer", enabled: true, hiddenFields: [] },
      ]
    }
  }

  return base
}

export const themeConfigToCssVariables = (config: StorefrontThemeConfig): Record<string, string> => {
  const font = getFontDefinition(config.fontFamily)
  const colors = config.colors
  return {
    "--background": colors.background,
    "--foreground": colors.foreground,
    "--card": colors.card,
    "--card-foreground": colors.cardForeground,
    "--popover": colors.card,
    "--popover-foreground": colors.cardForeground,
    "--muted": colors.card,
    "--muted-foreground": colors.mutedForeground,
    "--secondary": colors.card,
    "--secondary-foreground": colors.cardForeground,
    "--accent": colors.accent,
    "--accent-foreground": colors.accentForeground,
    "--primary": colors.buttonColor,
    "--primary-foreground": colors.buttonText,
    "--destructive": colors.accent,
    "--destructive-foreground": colors.accentForeground,
    "--border": colors.border,
    "--input": colors.border,
    "--ring": colors.accent,
    "--sidebar": colors.card,
    "--sidebar-foreground": colors.cardForeground,
    "--sidebar-primary": colors.accent,
    "--sidebar-primary-foreground": colors.accentForeground,
    "--sidebar-accent": colors.card,
    "--sidebar-accent-foreground": colors.cardForeground,
    "--sidebar-border": colors.border,
    "--sidebar-ring": colors.accent,
    "--navbar-background": colors.navbarBackground,
    "--navbar-text": colors.navbarText,
    "--font-storefront": font.stack,
  }
}

export const serializeThemeConfig = (config: StorefrontThemeConfig): StorefrontThemeConfig => ({
  fontFamily: config.fontFamily,
  colors: { ...config.colors },
})

export const getSectionStyles = (background?: SectionBackground): React.CSSProperties => {
  if (!background) return {}

  const styles: React.CSSProperties = {}

  if (background.color) {
    let color = background.color
    const opacity = background.colorOpacity ?? 1
    if (opacity < 1 && HEX_COLOR_REGEX.test(color)) {
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5, 7), 16)
      color = `rgba(${r}, ${g}, ${b}, ${opacity})`
    }
    styles.backgroundColor = color
  }

  const layers: string[] = []

  if (background.gradient?.enabled && background.gradient.stops.length > 0) {
    const stops = [...background.gradient.stops]
      .sort((a, b) => a.offset - b.offset)
      .map((s) => {
        let color = s.color
        if (s.opacity < 1) {
          const r = parseInt(color.slice(1, 3), 16)
          const g = parseInt(color.slice(3, 5), 16)
          const b = parseInt(color.slice(5, 7), 16)
          color = `rgba(${r}, ${g}, ${b}, ${s.opacity})`
        }
        return `${color} ${s.offset}%`
      })
      .join(', ')
    layers.push(`linear-gradient(${background.gradient.direction}, ${stops})`)
  }

  if (background.image) {
    layers.push(`url(${background.image})`)
    styles.backgroundSize = 'cover'
    styles.backgroundPosition = 'center'
  }

  if (layers.length > 0) {
    styles.backgroundImage = layers.join(', ')
  }

  return styles
}
