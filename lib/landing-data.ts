export type BillingCycle = "monthly" | "annually"

export type RoadmapStep = {
  step: string
  title: string
  subtitle: string
  description: string
  icon: string
  features: string[]
  color: string
}

export type Stat = {
  value: string
  label: string
  icon: string
}

export type Brand = {
  name: string
  initials: string
  industry: string
  background: string
  impact: string
  image: string
  instagramUrl?: string
  websiteUrl?: string
}

export type PricingPlan = {
  name: string
  price: Record<BillingCycle, number>
  description: string
  features: string[]
  highlighted?: boolean
  badge?: string
}

export const roadmapSteps: RoadmapStep[] = [
  {
    step: "01",
    title: "Manage Your Inventory",
    subtitle: "Stay organized",
    description:
      "Track inventory in real time, get low-stock alerts, and update products in seconds so you never miss a sale.",
    icon: "package",
    features: ["Real-time stock tracking", "Low stock alerts", "Bulk import/export"],
    color: "from-indigo-500 to-indigo-600",
  },
  {
    step: "02",
    title: "Create Your Storefront",
    subtitle: "Launch in minutes",
    description:
      "Simply turn your inventory into your branded storefront with little to no setup required.",
    icon: "shopping-bag",
    features: ["Plug & Play", "Custom domain"],
    color: "from-blue-500 to-blue-600",
  },
  {
    step: "03",
    title: "Receive Payments Easily",
    subtitle: "Get paid easily",
    description:
      "Accept payments your way via personal QR codes or bank details. Simple. Convenient. No Platform Fees.",
    icon: "credit-card",
    features: ["Use your own QR codes or bank details", "Your customers pay you directly", "Zero transaction fees"],
    color: "from-purple-500 to-purple-600",
  },
  {
    step: "04",
    title: "Stay on top of your DMs",
    subtitle: "Build relationships",
    description:
      "Manage all your customer conversations in one Omnichannel inbox. Turn DMs into sales with our AI-powered response suggestions.",
    icon: "message-square",
    features: ["Omnichannel inbox", "Customer profiles and tagging", "Built-in toolbar for quick checkout links, receipts, and more"],
    color: "from-violet-500 to-violet-600",
  },
  {
    step: "05",
    title: "Scale & Grow",
    subtitle: "Unlock your potential",
    description:
      "Use powerful analytics to understand your business. Get AI-powered insights and recommendations to accelerate your growth.",
    icon: "rocket",
    features: ["Advanced analytics", "Performance reports", "Export as CSV/XLSX"],
    color: "from-primary to-blue-600",
  },
]

export const stats: Stat[] = [
  { value: "10K+", label: "Active Sellers", icon: "users" },
  { value: "98%", label: "Uptime", icon: "zap" },
  { value: "3x", label: "Revenue Growth", icon: "trending-up" },
]

export const brands: Brand[] = [
  {
    name: "MiuTheLabel",
    initials: "MTL",
    industry: "Apparel",
    background: "Independent streetwear brand that scaled from drops to a steady weekly cadence.",
    impact: "Chirp automated launch-day flows and kept inventory synced across pop-ups and DTC, cutting oversells by 92%.",
    image: "/miuthelabel-logo.png",
    instagramUrl: "https://instagram.com/miuthelabel",
    websiteUrl: "https://miuthelabel.example.com",
  },
  {
    name: "COCOSIN.PH",
    initials: "CP",
    industry: "Home Goods",
    background: "Coastal-inspired home goods brand with a heavy Instagram audience.",
    impact: "Unified DMs and checkout links converted browsing fans into 28% more paid orders within two weeks.",
    image: "/cocosin-logo.png",
    instagramUrl: "https://instagram.com/cocosin",
    websiteUrl: "https://cocosinph.example.com",
  },
  {
    name: "KryptonKicks",
    initials: "KK",
    industry: "Sneakers",
    background: "Sneaker reseller juggling limited drops and consignment partners.",
    impact: "Low-stock alerts and auto invoicing reduced manual chasing and increased repeat buyer retention by 19%.",
    image: "/kryptonkicks-logo.png",
    instagramUrl: "https://instagram.com/kryptonkicks.ph",
    websiteUrl: "https://kryptonkicks.example.com",
  },
  {
    name: "KazuMatcha",
    initials: "KM",
    industry: "Food & Beverage",
    background: "Matcha and tea boutique expanding from farmers markets to online subscriptions.",
    impact: "Subscriptions plus streamlined payouts funded a new product line and grew MRR 34% quarter over quarter.",
    image: "/kazumatcha-logo.png",
    instagramUrl: "https://instagram.com/kazumatcha.ph",
    websiteUrl: "https://kazumatcha.example.com",
  },
]

export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: { monthly: 13, annually: 11 },
    description: "Perfect for getting started",
    features: ["Plug-and-Play Storefront", "Inventory Management", "Order Tracking", "Checkout Links"],
    highlighted: false,
  },
  {
    name: "Grow",
    price: { monthly: 17, annually: 14 },
    description: "As you scale",
    features: ["Everything in Starter", "Omnichannel Inbox", "Advanced Analytics", "Priority Support"],
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Business",
    price: { monthly: 23, annually: 19 },
    description: "For advanced sellers",
    features: [
      "Everything in Starter and Grow",
      "AI Co-pilot",
      "Accept Card Payments",
      "Connect your Banks for Payouts",
    ],
    highlighted: false,
  },
]
