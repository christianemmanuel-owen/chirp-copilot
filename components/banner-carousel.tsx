"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { HeroProductHighlight } from "@/lib/storefront-data"

interface BannerCarouselProps {
  slides?: HeroProductHighlight[]
}

const FALLBACK_SLIDES: HeroProductHighlight[] = [
  {
    id: 1,
    title: "Trending Now",
    subtitle: "Discover the hottest looks curated for you.",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80",
    href: "/catalog?category=Jackets",
  },
  {
    id: 2,
    title: "New Arrivals",
    subtitle: "Fresh drops from the latest collections.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80",
    href: "/catalog?category=Hoodies",
  },
  {
    id: 3,
    title: "Seasonal Essentials",
    subtitle: "Keep your wardrobe ready for any forecast.",
    image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1600&q=80",
    href: "/catalog?category=Accessories",
  },
]

export default function BannerCarousel({ slides }: BannerCarouselProps) {
  const slidesToRender = slides && slides.length > 0 ? slides : FALLBACK_SLIDES
  const slideCount = slidesToRender.length
  const slideSignature = useMemo(
    () => slidesToRender.map((slide) => `${slide.id}:${slide.href}`).join("|"),
    [slidesToRender],
  )
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    setCurrentSlide(0)
  }, [slideSignature])

  useEffect(() => {
    if (slideCount <= 1) {
      return
    }

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount)
    }, 5000)

    return () => clearInterval(interval)
  }, [slideCount])

  const goToSlide = useCallback(
    (index: number) => {
      if (slideCount === 0) return
      const normalized = ((index % slideCount) + slideCount) % slideCount
      setCurrentSlide(normalized)
    },
    [slideCount],
  )

  const nextSlide = useCallback(() => {
    if (slideCount === 0) return
    setCurrentSlide((prev) => (prev + 1) % slideCount)
  }, [slideCount])

  const prevSlide = useCallback(() => {
    if (slideCount === 0) return
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount)
  }, [slideCount])

  if (slideCount === 0) {
    return null
  }

  return (
    <div className="relative w-full h-164 overflow-hidden bg-muted">
      {slidesToRender.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            {slide.accent && (
              <span className="mb-4 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/85">
                {slide.accent}
              </span>
            )}
            <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">{slide.title}</h2>
            <p className="text-lg text-white/85 mb-6 max-w-xl drop-shadow">{slide.subtitle}</p>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous banner"
        disabled={slideCount <= 1}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 text-foreground rounded-full backdrop-blur transition disabled:cursor-not-allowed disabled:opacity-60 hover:bg-white"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next banner"
        disabled={slideCount <= 1}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 text-foreground rounded-full backdrop-blur transition disabled:cursor-not-allowed disabled:opacity-60 hover:bg-white"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slidesToRender.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goToSlide(index)}
            aria-label={`Go to ${slide.title}`}
            className={`h-2 rounded-full transition-all ${index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  )
}
