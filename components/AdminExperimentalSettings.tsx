"use client"

import { useState, useEffect } from "react"
import { Beaker, Eye, Save, Sparkles, MessageSquare, ShoppingCart, Info, Mail, Layout, TextQuote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface ExperimentalConfigs {
    aboutUsEnabled: boolean
    featuredProductsEnabled: boolean
    testimonialsEnabled: boolean
    newsletterEnabled: boolean
    navbar: {
        useLogo: boolean
        dropdownMode: "categories" | "brands"
    }
    content: {
        heroTitle: string
        heroSubtitle: string
        featuredTitle: string
        featuredSubtitle: string
        aboutTitle: string
        aboutContent: string
        footerMission: string
        footerNewsletterBlurb: string
    }
}

export default function AdminExperimentalSettings() {
    const [configs, setConfigs] = useState<ExperimentalConfigs>({
        aboutUsEnabled: true,
        featuredProductsEnabled: true,
        testimonialsEnabled: false,
        newsletterEnabled: true,
        navbar: {
            useLogo: false,
            dropdownMode: "categories",
        },
        content: {
            heroTitle: "Everyday Essentials",
            heroSubtitle: "Curated with precision, designed for style.",
            featuredTitle: "Exquisite Pieces.",
            featuredSubtitle: "Designed for life.",
            aboutTitle: "Our Commitment to Quality",
            aboutContent: "We believe that the objects you surround yourself with should be as intentional as the life you lead. Each piece in our collection is selected for its superior craftsmanship, timeless design, and functional excellence.",
            footerMission: "Elevating your lifestyle with curated, high-end essentials designed for intentional living.",
            footerNewsletterBlurb: "Join our inner circle for exclusive drops and design stories."
        }
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        async function fetchConfigs() {
            try {
                const response = await fetch("/api/storefront-settings")
                const payload = await response.json()
                if (payload.data?.experimental) {
                    setConfigs((prev) => ({
                        ...prev,
                        ...payload.data.experimental,
                        navbar: payload.data.experimental.navbar || prev.navbar,
                        content: payload.data.experimental.content || prev.content
                    }))
                }
            } catch (error) {
                console.error("Failed to fetch experimental configs", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchConfigs()
    }, [])

    const handleToggle = (key: keyof Omit<ExperimentalConfigs, 'navbar' | 'content'>) => {
        setConfigs((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    const handleNavbarToggle = (key: keyof ExperimentalConfigs['navbar']) => {
        setConfigs((prev) => ({
            ...prev,
            navbar: {
                ...prev.navbar,
                [key]: key === 'useLogo' ? !prev.navbar.useLogo : prev.navbar.dropdownMode === 'categories' ? 'brands' : 'categories'
            }
        }))
    }

    const handleContentChange = (key: keyof ExperimentalConfigs['content'], value: string) => {
        setConfigs((prev) => ({
            ...prev,
            content: {
                ...prev.content,
                [key]: value
            }
        }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const response = await fetch("/api/storefront-settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ experimental: configs }),
            })

            if (!response.ok) throw new Error("Failed to update configs")

            toast({
                title: "Settings Saved",
                description: "Your experimental landing page has been updated.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save settings.",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted/20 rounded-2xl" />
            ))}
        </div>
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Tabs defaultValue="features" className="w-full">
                <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 w-full justify-start mb-8 border border-border">
                    <TabsTrigger value="features" className="rounded-xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Layout className="size-4 mr-2" />
                        Beta Features
                    </TabsTrigger>
                    <TabsTrigger value="content" className="rounded-xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <TextQuote className="size-4 mr-2" />
                        Landing Page Content
                    </TabsTrigger>
                    <div className="ml-auto pr-2">
                        <Button
                            variant="default"
                            size="sm"
                            className="rounded-xl font-bold px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                            asChild
                        >
                            <Link href="/admin/editor">
                                <Eye className="size-4 mr-2" />
                                Launch Visual Editor
                            </Link>
                        </Button>
                    </div>
                </TabsList>

                <TabsContent value="features" className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FeatureCard
                            title="About Us Section"
                            description="A premium dedicated section describing your brand's mission and story."
                            icon={<Info className="size-5" />}
                            enabled={configs.aboutUsEnabled}
                            onToggle={() => handleToggle("aboutUsEnabled")}
                        />
                        <FeatureCard
                            title="Featured Products"
                            description="Highlight your best-selling or hand-picked products in a dedicated showcase."
                            icon={<Sparkles className="size-5" />}
                            enabled={configs.featuredProductsEnabled}
                            onToggle={() => handleToggle("featuredProductsEnabled")}
                        />
                        <FeatureCard
                            title="Testimonials"
                            description="Showcase real customer feedback and success stories on your landing page."
                            icon={<MessageSquare className="size-5" />}
                            enabled={configs.testimonialsEnabled}
                            onToggle={() => handleToggle("testimonialsEnabled")}
                        />
                        <FeatureCard
                            title="Newsletter Signup"
                            description="Enable a stylish subscription form to grow your marketing email list."
                            icon={<Mail className="size-5" />}
                            enabled={configs.newsletterEnabled}
                            onToggle={() => handleToggle("newsletterEnabled")}
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-2xl font-black tracking-tight flex items-center gap-2 px-2 text-foreground">
                            <Sparkles className="size-6 text-primary" />
                            Navigation & Branding
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FeatureCard
                                title="Use Business Logo"
                                description="Show your business logo (favicon) instead of the business name in the navbar."
                                icon={<Beaker className="size-5" />}
                                enabled={configs.navbar.useLogo}
                                onToggle={() => handleNavbarToggle("useLogo")}
                            />
                            <FeatureCard
                                title="Explore Brands"
                                description={configs.navbar.dropdownMode === "brands" ? "Navigation menu is currently showing Brands." : "Navigation menu is currently showing Categories."}
                                icon={<ShoppingCart className="size-5" />}
                                enabled={configs.navbar.dropdownMode === "brands"}
                                onToggle={() => handleNavbarToggle("dropdownMode")}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-12">
                    {/* Hero Section Content */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black tracking-tight flex items-center gap-2 px-2 text-foreground">
                            <Layout className="size-6 text-primary" />
                            Hero Section
                        </h3>
                        <div className="grid grid-cols-1 gap-6 bg-muted/20 p-8 rounded-[2rem] border border-border/50">
                            <div className="space-y-4">
                                <Label className="text-sm font-black uppercase tracking-widest ml-1">Main Heading</Label>
                                <Input
                                    className="h-14 rounded-2xl border-2 focus-visible:ring-primary shadow-sm font-bold"
                                    value={configs.content.heroTitle}
                                    onChange={(e) => handleContentChange("heroTitle", e.target.value)}
                                />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-sm font-black uppercase tracking-widest ml-1">Sub-heading / Description</Label>
                                <Input
                                    className="h-14 rounded-2xl border-2 focus-visible:ring-primary shadow-sm font-bold"
                                    value={configs.content.heroSubtitle}
                                    onChange={(e) => handleContentChange("heroSubtitle", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Featured Products Content */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black tracking-tight flex items-center gap-2 px-2 text-foreground">
                            <Sparkles className="size-6 text-primary" />
                            Featured Products Showcase
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-8 rounded-[2rem] border border-border/50">
                            <div className="space-y-4">
                                <Label className="text-sm font-black uppercase tracking-widest ml-1">Section Title</Label>
                                <Input
                                    className="h-14 rounded-2xl border-2 focus-visible:ring-primary shadow-sm font-bold"
                                    value={configs.content.featuredTitle}
                                    onChange={(e) => handleContentChange("featuredTitle", e.target.value)}
                                />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-sm font-black uppercase tracking-widest ml-1">Section Subtitle</Label>
                                <Input
                                    className="h-14 rounded-2xl border-2 focus-visible:ring-primary shadow-sm font-bold italic text-muted-foreground"
                                    value={configs.content.featuredSubtitle}
                                    onChange={(e) => handleContentChange("featuredSubtitle", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* About Us Content */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black tracking-tight flex items-center gap-2 px-2 text-foreground">
                            <Info className="size-6 text-primary" />
                            About Our Brand
                        </h3>
                        <div className="grid grid-cols-1 gap-6 bg-muted/20 p-8 rounded-[2rem] border border-border/50">
                            <div className="space-y-4">
                                <Label className="text-sm font-black uppercase tracking-widest ml-1">Story Title</Label>
                                <Input
                                    className="h-14 rounded-2xl border-2 focus-visible:ring-primary shadow-sm font-bold"
                                    value={configs.content.aboutTitle}
                                    onChange={(e) => handleContentChange("aboutTitle", e.target.value)}
                                />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-sm font-black uppercase tracking-widest ml-1">Brand Narrative</Label>
                                <Textarea
                                    className="min-h-[120px] rounded-[1.5rem] border-2 focus-visible:ring-primary shadow-sm font-medium leading-relaxed"
                                    value={configs.content.aboutContent}
                                    onChange={(e) => handleContentChange("aboutContent", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Content */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black tracking-tight flex items-center gap-2 px-2 text-foreground">
                            <ShoppingCart className="size-6 text-primary" />
                            Footer / Brand Identity
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-8 rounded-[2rem] border border-border/50">
                            <div className="space-y-4">
                                <Label className="text-sm font-black uppercase tracking-widest ml-1">Mission Statement</Label>
                                <Textarea
                                    className="min-h-[100px] rounded-[1.5rem] border-2 focus-visible:ring-primary shadow-sm font-medium leading-relaxed"
                                    value={configs.content.footerMission}
                                    onChange={(e) => handleContentChange("footerMission", e.target.value)}
                                />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-sm font-black uppercase tracking-widest ml-1">Newsletter Call-to-Action</Label>
                                <Textarea
                                    className="min-h-[100px] rounded-[1.5rem] border-2 focus-visible:ring-primary shadow-sm font-medium leading-relaxed"
                                    value={configs.content.footerNewsletterBlurb}
                                    onChange={(e) => handleContentChange("footerNewsletterBlurb", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="sticky bottom-8 flex items-center justify-between p-6 bg-white/80 backdrop-blur-xl border border-border rounded-3xl shadow-xl z-10 transition-all hover:shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Eye className="size-6" />
                    </div>
                    <div className="hidden sm:block">
                        <h4 className="font-bold text-foreground">Preview V2 Landing Page</h4>
                        <p className="text-sm text-muted-foreground font-medium truncate max-w-[300px]">Test your active sections and content updates in real-time</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-2xl border-2 font-bold transition-all hover:bg-muted" asChild>
                        <a href="/experimental-home" target="_blank">Open Preview</a>
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="rounded-2xl font-bold px-8 transition-all active:scale-95 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                        <Save className="ml-2 size-4" />
                    </Button>
                </div>
            </div>
        </div >
    )
}

function FeatureCard({ title, description, icon, enabled, onToggle }: {
    title: string
    description: string
    icon: React.ReactNode
    enabled: boolean
    onToggle: () => void
}) {
    return (
        <Card className={`relative overflow-hidden border-2 transition-all duration-300 rounded-[2rem] ${enabled ? "border-primary bg-primary/5 shadow-primary/10" : "border-border/50 bg-white hover:border-border hover:shadow-lg"}`}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                    <div className={`size-10 rounded-2xl flex items-center justify-center transition-colors ${enabled ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                        {icon}
                    </div>
                    <Switch checked={enabled} onCheckedChange={onToggle} />
                </div>
                <CardTitle className="text-xl font-black text-foreground">{title}</CardTitle>
                <CardDescription className="text-sm font-medium leading-relaxed">{description}</CardDescription>
            </CardHeader>
            {enabled && (
                <div className="absolute top-2 right-14">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider animate-pulse">
                        Ready to Preview
                    </span>
                </div>
            )}
        </Card>
    )
}
