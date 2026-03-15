"use client"

import { useEffect, useRef, useState } from "react"
import { X, ChevronDown } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { Button } from "@/app/(landing)/_ui/button"

const waitlistBgBlue = "bg-gradient-to-br from-[#5146e8] via-[#4b42d1] to-[#3c35c7]"
const waitlistBgCharcoal = "bg-gradient-to-br from-[#111827] via-[#0f1520] to-[#0b101a]"

export function FinalCtaSection() {
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [waitlistVariant, setWaitlistVariant] = useState<"early" | "waitlist">("waitlist")
  const [modalTheme, setModalTheme] = useState<"blue" | "charcoal">("blue")
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false)
  const [sourceValue, setSourceValue] = useState<string | null>(null)
  const sourceMenuRef = useRef<HTMLDivElement | null>(null)
  const [fullName, setFullName] = useState("")
  const [workEmail, setWorkEmail] = useState("")
  const [instagramHandle, setInstagramHandle] = useState("")
  const [website, setWebsite] = useState("")
  const [sellingDescription, setSellingDescription] = useState("")

  useEffect(() => {
    document.body.style.overflow = showWaitlist ? "hidden" : "unset"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [showWaitlist])

  const earlyAccessCopy = {
    headline: "Get early access to Chirp",
    bullets: [
      "Be among the first to try new drops",
      "Priority onboarding and setup support",
      "Help shape the product with feedback",
    ],
  }

  const waitlistCopy = {
    headline: "Be first in line for Chirp's launch",
    bullets: [
      "Receive launch updates and early previews",
      "Get the launch date the moment it's set",
      "Claim an early-bird discount at launch",
    ],
  }

  const sourceOptions = [
    { value: "instagram", label: "Instagram" },
    { value: "x", label: "X (Twitter)" },
    { value: "friends", label: "Friends" },
    { value: "facebook", label: "Facebook" },
    { value: "family", label: "Family" },
    { value: "others", label: "Others" },
  ]

  const sourceLabel = sourceOptions.find((option) => option.value === sourceValue)?.label ?? "Select"
  const emailValid = /\S+@\S+\.\S+/.test(workEmail.trim())
  const isFormValid =
    fullName.trim().length > 0 &&
    emailValid &&
    instagramHandle.trim().length > 0 &&
    sellingDescription.trim().length > 0 &&
    !!sourceValue

  useEffect(() => {
    if (!sourceMenuOpen) {
      return
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (sourceMenuRef.current && !sourceMenuRef.current.contains(event.target as Node)) {
        setSourceMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSourceMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [sourceMenuOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowWaitlist(false)
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  return (
    <>
      <section className="py-20 sm:py-28 lg:py-32 bg-background relative overflow-hidden z-20">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] sm:w-[520px] sm:h-[520px] lg:w-[600px] lg:h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2
            className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 text-balance"
            style={{ fontFamily: 'var(--font-poppins), "Poppins", "Helvetica Neue", Arial, sans-serif', fontWeight: 700 }}
          >
            The Easiest Way to Run Your DM-First Business
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-xl mx-auto">
            Get early access and be a beta tester, or join the waitlist to stay updated on our official launch.
          </p>
          <div className="flex flex-col lg:flex-row items-center justify-center w-full lg:w-auto gap-3 lg:gap-4">
            <div className="relative w-full lg:w-auto min-w-0 lg:min-w-[200px] transition-transform hover:-translate-y-0.5">
              <Button
                size="lg"
                className={`relative w-full text-base px-8 py-4 rounded-full bg-transparent text-white shadow-[0_16px_40px_-18px_rgba(81,70,232,0.75)] ${
                  showWaitlist ? "opacity-0 pointer-events-none invisible" : "opacity-100"
                }`}
                onClick={() => {
                  setModalTheme("blue")
                  setWaitlistVariant("early")
                  setShowWaitlist(true)
                }}
              >
                {!showWaitlist && (
                  <motion.div
                    layoutId="waitlist-final-blue"
                    className="absolute inset-0 rounded-full bg-[#5146e8]"
                    transition={{ type: "spring", stiffness: 240, damping: 22 }}
                  />
                )}
                <span className="relative flex items-center justify-center w-full">Get Early Access</span>
              </Button>
            </div>

            <div className="relative w-full lg:w-auto min-w-0 lg:min-w-[200px] transition-transform hover:-translate-y-0.5">
              <Button
                size="lg"
                className="relative w-full bg-transparent text-white text-base px-8 py-4 rounded-full shadow-[0_16px_40px_-18px_rgba(17,24,39,0.65)] transition-transform hover:-translate-y-0.5"
                onClick={() => {
                  setModalTheme("charcoal")
                  setWaitlistVariant("waitlist")
                  setShowWaitlist(true)
                }}
              >
                {!showWaitlist && (
                  <motion.div
                    layoutId="waitlist-final-charcoal"
                    className="absolute inset-0 rounded-full bg-[#111827]"
                    transition={{ type: "spring", stiffness: 240, damping: 22 }}
                  />
                )}
                <span className="relative flex items-center justify-center w-full">Join Waitlist</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showWaitlist && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-3 sm:px-8 py-4 sm:py-6 overflow-y-auto overscroll-contain"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="relative flex w-full h-[calc(100dvh-1rem)] sm:h-auto sm:max-h-[94vh] flex-col rounded-2xl sm:rounded-3xl overflow-hidden text-white border border-white/15 shadow-[0_0_35px_rgba(255,255,255,0.18)]">
              <motion.div
                layoutId={
                  modalTheme === "blue" ? "waitlist-final-blue" : "waitlist-final-charcoal"
                }
                className={`absolute inset-0 ${
                  modalTheme === "blue" ? waitlistBgBlue : waitlistBgCharcoal
                }`}
                transition={{ type: "spring", stiffness: 240, damping: 22 }}
              />
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.14),transparent_28%),radial-gradient(circle_at_50%_70%,rgba(255,255,255,0.12),transparent_30%)]" />

              <button
                onClick={() => setShowWaitlist(false)}
                className="absolute right-4 top-4 sm:right-6 sm:top-6 rounded-full p-2 bg-white/15 text-white hover:bg-white/25 transition-colors z-10"
                aria-label="Close waitlist"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative flex-1 min-h-0 w-full overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] px-4 sm:px-12 py-6 sm:py-10">
                <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-start lg:items-center">
                  <div className="space-y-6">
                    {waitlistVariant === "early" ? (
                      <EarlyAccessModalContent copy={earlyAccessCopy} />
                    ) : (
                      <WaitlistModalContent copy={waitlistCopy} />
                    )}
                  </div>

                  <form className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-[0.2em] text-white/70 mb-2">Full name <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          placeholder="Alex Morgan"
                          required
                          value={fullName}
                          onChange={(event) => setFullName(event.target.value)}
                          className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-[0.2em] text-white/70 mb-2">Work email <span className="text-red-400">*</span></label>
                        <input
                          type="email"
                          placeholder="you@brand.com"
                          required
                          value={workEmail}
                          onChange={(event) => setWorkEmail(event.target.value)}
                          className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-[0.2em] text-white/70 mb-2">Instagram handle <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          placeholder="@yourstore"
                          required
                          value={instagramHandle}
                          onChange={(event) => setInstagramHandle(event.target.value)}
                          className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-[0.2em] text-white/70 mb-2">Website (optional)</label>
                        <input
                          type="url"
                          placeholder="https://yourstore.com"
                          value={website}
                          onChange={(event) => setWebsite(event.target.value)}
                          className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-white/70 mb-2">What are you selling? <span className="text-red-400">*</span></label>
                      <textarea
                        rows={3}
                        placeholder="Tell us about your products and channels..."
                        required
                        value={sellingDescription}
                        onChange={(event) => setSellingDescription(event.target.value)}
                        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-white/70 mb-2">Where did you hear about us? <span className="text-red-400">*</span></label>
                      <div ref={sourceMenuRef} className="relative">
                        <button
                          type="button"
                          className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 pr-12 text-left text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                          onClick={() => setSourceMenuOpen((prev) => !prev)}
                          aria-haspopup="listbox"
                          aria-expanded={sourceMenuOpen}
                        >
                          {sourceLabel}
                        </button>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
                        {sourceMenuOpen && (
                          <div
                            className="absolute z-20 mt-2 w-full rounded-xl border border-white/20 bg-[#1b1f4a] p-2 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.6)]"
                            role="listbox"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {sourceOptions.map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  className="rounded-lg px-3 py-2 text-left text-white/90 transition-colors hover:bg-white/10"
                                  onClick={() => {
                                    setSourceValue(option.value)
                                    setSourceMenuOpen(false)
                                  }}
                                  role="option"
                                  aria-selected={sourceValue === option.value}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={!isFormValid}
                        aria-disabled={!isFormValid}
                        className={`rounded-full px-6 sm:px-8 py-3 ${
                          isFormValid
                            ? "bg-white text-[#0d1a66] hover:bg-white/90"
                            : "bg-white/60 text-[#0d1a66]/70 cursor-not-allowed"
                        }`}
                      >
                        {waitlistVariant === "early" ? "Get Early Access" : "Join waitlist"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

type ModalCopy = {
  headline: string
  bullets: string[]
}

function ModalHeadline({ headline }: { headline: string }) {
  return (
    <h3
      className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight"
      style={{
        fontFamily: 'var(--font-poppins), "Poppins", "Helvetica Neue", Arial, sans-serif',
        fontWeight: 700,
      }}
    >
      {headline}
    </h3>
  )
}

function ModalBullets({ bullets }: { bullets: string[] }) {
  return (
    <div className="space-y-3 text-white/85">
      {bullets.map((bullet) => (
        <div key={bullet} className="flex gap-3 items-start">
          <div className="mt-1 h-6 w-6 rounded-lg bg-white/15 flex items-center justify-center text-sm">✓</div>
          <p>{bullet}</p>
        </div>
      ))}
    </div>
  )
}

function EarlyAccessModalContent({ copy }: { copy: ModalCopy }) {
  return (
    <>
      <div className="space-y-2">
        <ModalHeadline headline={copy.headline} />
      </div>
      <ModalBullets bullets={copy.bullets} />
    </>
  )
}

function WaitlistModalContent({ copy }: { copy: ModalCopy }) {
  return (
    <>
      <div className="space-y-2">
        <ModalHeadline headline={copy.headline} />
      </div>
      <ModalBullets bullets={copy.bullets} />
    </>
  )
}
