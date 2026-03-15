"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArrowRight,
  BarChart3,
  Check,
  LineChart,
  Settings,
  Package,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  Rocket,
  Users,
  Zap,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/app/(landing)/_ui/button"
import { Card } from "@/app/(landing)/_ui/card"
import type { RoadmapStep } from "@/lib/landing-data"

const ICON_MAP: Record<string, any> = {
  package: Package,
  "shopping-bag": ShoppingBag,
  "credit-card": CreditCard,
  "message-square": MessageSquare,
  rocket: Rocket,
  users: Users,
  zap: Zap,
  "trending-up": TrendingUp,
}

type FeaturesSectionProps = {
  roadmapSteps: RoadmapStep[]
}

function renderStepVisual(index: number) {
  if (index === 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-border rounded" />
            <div className="h-3 w-1/2 bg-border/50 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-border to-border/50" />
          ))}
        </div>
      </div>
    )
  }

  if (index === 1) {
    const inventoryLevels = [82, 68, 74, 91]

    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-background/50">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-indigo-600/10" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-1/2 bg-border rounded" />
              <div className="h-2 w-1/4 bg-border/50 rounded" />
            </div>
            <div className="text-xs font-mono text-muted-foreground">{inventoryLevels[i % inventoryLevels.length]} units</div>
          </div>
        ))}
      </div>
    )
  }

  if (index === 2) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[70%] p-3 rounded-2xl ${i % 2 === 0
                ? "bg-background/80 rounded-tl-none"
                : "bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-tr-none"
                }`}
            >
              <div className={`h-2 w-24 rounded ${i % 2 === 0 ? "bg-border" : "bg-white/30"}`} />
              <div className={`h-2 w-16 rounded mt-1 ${i % 2 === 0 ? "bg-border/50" : "bg-white/20"}`} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (index === 3) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20">
          <div className="flex justify-between items-center mb-4">
            <div className="h-3 w-20 bg-border rounded" />
            <div className="text-lg font-bold text-purple-500">$149.99</div>
          </div>
          <div className="space-y-2">
            <div className="h-10 rounded-lg bg-background/50" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-10 rounded-lg bg-background/50" />
              <div className="h-10 rounded-lg bg-background/50" />
            </div>
            <div className="h-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
          <LineChart className="w-6 h-6 text-primary mb-2" />
          <div className="text-2xl font-bold text-foreground">+147%</div>
          <div className="text-xs text-muted-foreground">Revenue Growth</div>
        </div>
        <div className="flex-1 p-4 rounded-xl bg-background/50">
          <BarChart3 className="w-6 h-6 text-muted-foreground mb-2" />
          <div className="text-2xl font-bold text-foreground">2,847</div>
          <div className="text-xs text-muted-foreground">Orders</div>
        </div>
      </div>
      <div className="h-32 rounded-xl bg-background/50 p-4">
        <div className="flex items-end justify-between h-full gap-2">
          {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t-sm"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function FeaturesSection({ roadmapSteps }: FeaturesSectionProps) {
  const [activeStep, setActiveStep] = useState(0)
  const roadmapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!roadmapRef.current) return
      const steps = roadmapRef.current.querySelectorAll("[data-step]")
      steps.forEach((step, index) => {
        const rect = step.getBoundingClientRect()
        if (rect.top < window.innerHeight * 0.6 && rect.bottom > 0) {
          setActiveStep(index)
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section id="features" className="pt-16 sm:pt-20 pb-20 sm:pb-28 bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-14 sm:mb-20">
          <h2
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6 text-balance"
            style={{ fontFamily: 'var(--font-poppins), "Poppins", "Helvetica Neue", Arial, sans-serif', fontWeight: 700 }}
          >
            Everything You Need to Go Live
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Go from DMs to checkout with a workspace built for your DM-first business.
          </p>
        </div>

        <div ref={roadmapRef} className="relative">
          {roadmapSteps.map((item, index) => (
            <div
              key={item.step + item.title}
              data-step={index}
              className={`relative mb-16 sm:mb-24 last:mb-0 transition-all duration-700 ${activeStep >= index ? "opacity-100" : "opacity-40"
                }`}
            >
              <div className={`grid lg:grid-cols-2 gap-8 sm:gap-12 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                <div className={`${index % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className="flex items-center gap-4 mb-5 sm:mb-6">
                    <div
                      className={`relative flex shrink-0 aspect-square items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg`}
                    >
                      {(() => {
                        const Icon = ICON_MAP[item.icon as string] || Package
                        return <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                      })()}
                      {activeStep === index && (
                        <div
                          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} animate-ping opacity-30`}
                        />
                      )}
                    </div>
                    <div>
                      <h3
                        className="text-xl sm:text-3xl font-bold text-foreground leading-tight"
                        style={{ fontFamily: 'var(--font-poppins), "Poppins", "Helvetica Neue", Arial, sans-serif', fontWeight: 700 }}
                      >
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <p
                    className="text-base sm:text-lg text-black mb-6 sm:mb-8 leading-relaxed text-justify"
                    style={{ fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif', fontWeight: 300 }}
                  >
                    {item.description}
                  </p>

                  <div className="space-y-3 mb-8">
                    {item.features.map((feature, fIndex) => (
                      <div key={feature + fIndex} className="flex items-center gap-3 group">
                        <div className={`p-1 rounded-full bg-gradient-to-br ${item.color}`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span
                          className="text-foreground group-hover:text-primary transition-colors"
                          style={{ fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif', fontWeight: 300 }}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>


                </div>

                <div className={`${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-10 blur-3xl rounded-3xl`} />

                    <Card className="relative bg-card border border-border rounded-2xl sm:rounded-3xl p-2 shadow-2xl overflow-hidden">
                      <div className="bg-secondary rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/50">
                          <div className="w-3 h-3 rounded-full bg-red-400" />
                          <div className="w-3 h-3 rounded-full bg-yellow-400" />
                          <div className="w-3 h-3 rounded-full bg-green-400" />
                          <div className="flex-1 ml-4">
                            <div className="h-5 w-48 bg-border rounded-full" />
                          </div>
                        </div>

                        <div className="p-4 sm:p-6 min-h-[260px] sm:min-h-[300px]">{renderStepVisual(index)}</div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>

              {index < roadmapSteps.length - 1 && (
                <div className="hidden lg:flex justify-center my-12">
                  <div
                    className={`w-px h-16 transition-all duration-500 ${activeStep > index
                      ? "bg-gradient-to-b from-primary to-primary/50"
                      : "bg-gradient-to-b from-border to-border/50"
                      }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
