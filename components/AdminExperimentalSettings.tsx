"use client"

import { Beaker, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminExperimentalSettings() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative mb-8">
                <div className="absolute -inset-4 bg-primary/5 rounded-full blur-2xl animate-pulse" />
                <div className="relative size-24 rounded-[2.5rem] bg-white border-2 border-primary/20 shadow-2xl shadow-primary/10 flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-500">
                    <Beaker className="size-10 text-primary" />
                    <div className="absolute -top-2 -right-2 size-8 rounded-full bg-primary flex items-center justify-center shadow-lg transform -rotate-12">
                        <Sparkles className="size-4 text-white" />
                    </div>
                </div>
            </div>

            <div className="max-w-md space-y-4">
                <h3 className="text-2xl font-black tracking-tight text-foreground">
                    All Features Graduated
                </h3>
                <p className="text-muted-foreground font-medium leading-relaxed">
                    Our experimental designs and layout controls have officially moved to the main <span className="text-primary font-bold">Page Editor</span>.
                    Customize your storefront with real-time feedback and advanced controls.
                </p>

                <div className="pt-6">
                    <Button
                        size="lg"
                        className="rounded-2xl font-bold px-8 shadow-xl shadow-primary/20 transition-all active:scale-95 group"
                        asChild
                    >
                        <Link href="/admin/editor">
                            Go to Page Editor
                            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-left">
                    <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Status</div>
                    <div className="text-sm font-bold">Laboratory Idle</div>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-left">
                    <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Last Update</div>
                    <div className="text-sm font-bold">March 2026</div>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-left">
                    <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Environment</div>
                    <div className="text-sm font-bold">Production Ready</div>
                </div>
            </div>
        </div>
    )
}
