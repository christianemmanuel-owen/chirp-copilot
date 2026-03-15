"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, ShoppingBag, Heart, Send, Bell, Box, CreditCard, Bot, Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/app/(landing)/_ui/button";

const waitlistBgBlue =
  "bg-gradient-to-br from-[#5146e8] via-[#4b42d1] to-[#3c35c7]";
const waitlistBgCharcoal =
  "bg-gradient-to-br from-[#111827] via-[#0f1520] to-[#0b101a]";

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistVariant, setWaitlistVariant] = useState<"early" | "waitlist">("waitlist");
  const [modalTheme, setModalTheme] = useState<"blue" | "charcoal">("blue");
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false);
  const [sourceValue, setSourceValue] = useState<string | null>(null);
  const sourceMenuRef = useRef<HTMLDivElement | null>(null);
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [website, setWebsite] = useState("");
  const [sellingDescription, setSellingDescription] = useState("");

  const rotatingWords = useMemo(() => ["10 minutes", "5 steps", "a chirp"], []);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => setIsVisible(true), []);

  useEffect(() => {
    document.body.style.overflow = showWaitlist ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showWaitlist]);

  const earlyAccessCopy = {
    headline: "Be one of our beta testers",
    bullets: [
      "Be among the first to use Chirp",
      "Priority onboarding and setup support",
      "Help shape the product with your feedback",
    ],
  };

  const waitlistCopy = {
    headline: "Be first in line for Chirp's launch",
    bullets: [
      "Receive launch updates and early previews",
      "Get the launch date the moment it's set",
      "Claim an early-bird discount at launch",
    ],
  };

  const sourceOptions = [
    { value: "instagram", label: "Instagram" },
    { value: "x", label: "X (Twitter)" },
    { value: "friends", label: "Friends" },
    { value: "facebook", label: "Facebook" },
    { value: "family", label: "Family" },
    { value: "others", label: "Others" },
  ];

  const sourceLabel = sourceOptions.find((option) => option.value === sourceValue)?.label ?? "Select";
  const emailValid = /\S+@\S+\.\S+/.test(workEmail.trim());
  const isFormValid =
    fullName.trim().length > 0 &&
    emailValid &&
    instagramHandle.trim().length > 0 &&
    sellingDescription.trim().length > 0 &&
    !!sourceValue;

  useEffect(() => {
    if (!sourceMenuOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (sourceMenuRef.current && !sourceMenuRef.current.contains(event.target as Node)) {
        setSourceMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSourceMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [sourceMenuOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowWaitlist(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 5000);
    return () => clearInterval(id);
  }, [rotatingWords.length]);

  const floatingIcons = [
    { Icon: ShoppingBag, className: "left-[14%] top-[10%] lg:left-[3%] lg:top-[30%]", color: "#ff8a00" },
    { Icon: Heart, className: "right-[18%] top-[14%] lg:right-[10%] lg:top-[22%]", color: "#ff3b57" },
    { Icon: Send, className: "right-[4%] top-[37%] lg:right-[6%] lg:top-[40%]", color: "#07a6ff" },
    { Icon: Box, className: "right-[3%] top-[63%] lg:right-[14%] lg:bottom-[16%]", color: "#00c26f" },
    { Icon: CreditCard, className: "left-[4%] top-[85%] lg:left-[52%] lg:bottom-[10%]", color: "#6c63ff" },
    { Icon: Bell, className: "left-[5%] top-[49%] lg:left-[8%] lg:top-[88%]", color: "#ffb400" },
  ];

  return (
    <>
      <section className="relative min-h-screen pt-28 sm:pt-32 lg:pt-0 pb-16 lg:pb-0 flex items-center justify-center overflow-hidden bg-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-glow delay-200" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-full blur-3xl animate-gradient" />

          {/* Animated wave stripes */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <div
              className="absolute top-0 left-0 w-[200%] h-full"
              style={{
                background: `
                  linear-gradient(
                    120deg,
                    transparent 0%,
                    transparent 30%,
                    rgba(99, 102, 241, 0.05) 35%,
                    rgba(99, 102, 241, 0.1) 40%,
                    rgba(139, 92, 246, 0.08) 45%,
                    rgba(168, 85, 247, 0.05) 50%,
                    transparent 55%,
                    transparent 100%
                  )
                `,
                transform: "skewY(-12deg)",
              }}
            />
          </motion.div>

          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ x: "100%" }}
            animate={{ x: "-100%" }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <div
              className="absolute top-0 left-0 w-[200%] h-full"
              style={{
                background: `
                  linear-gradient(
                    120deg,
                    transparent 0%,
                    transparent 40%,
                    rgba(79, 70, 229, 0.04) 45%,
                    rgba(99, 102, 241, 0.08) 50%,
                    rgba(79, 70, 229, 0.04) 55%,
                    transparent 60%,
                    transparent 100%
                  )
                `,
                transform: "skewY(-12deg)",
              }}
            />
          </motion.div>

          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ x: "-50%" }}
            animate={{ x: "150%" }}
            transition={{
              duration: 30,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <div
              className="absolute top-0 left-0 w-[200%] h-full"
              style={{
                background: `
                  linear-gradient(
                    120deg,
                    transparent 0%,
                    transparent 20%,
                    rgba(147, 51, 234, 0.03) 25%,
                    rgba(168, 85, 247, 0.06) 30%,
                    rgba(147, 51, 234, 0.03) 35%,
                    transparent 40%,
                    transparent 100%
                  )
                `,
                transform: "skewY(-12deg)",
              }}
            />
          </motion.div>
        </div>

        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <h1
              className={`text-5xl sm:text-5xl lg:text-[4.5rem] xl:text-[5rem] font-bold tracking-tight leading-tight transition-all duration-700 delay-100 mx-auto lg:mx-0 max-w-xl lg:max-w-none ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{
                fontFamily:
                  'var(--font-poppins), "Poppins", "Helvetica Neue", Arial, sans-serif',
              }}
            >
              <span className="block">
                Launch your <span className="hidden sm:inline">online store</span>
              </span>
              <span className="block sm:hidden">online store</span>
              <span className="block">in less than</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="block text-[#3849E9]"
                >
                  {rotatingWords[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </h1>

            <p
              className={`text-base sm:text-2xl text-muted-foreground max-w-3xl mx-auto lg:mx-0 transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{
                fontFamily:
                  'var(--font-ibm-plex-sans), "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif',
                fontWeight: 300,
              }}
            >
              Built for{" "}
              <span
                className="relative inline-flex items-center px-1.5 font-semibold text-white overflow-hidden"
                style={{ backgroundColor: "rgba(214, 41, 118, 0.25)" }}
              >
                <motion.span
                  className="absolute inset-0"
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
                  style={{ backgroundColor: "rgba(214, 41, 118, 0.8)" }}
                />
                <span className="relative">Instagram sellers</span>
              </span>{" "}
              who want a smoother, more organized way to sell.
            </p>

            <div
              className={`mt-6 sm:mt-8 flex flex-col lg:flex-row items-center w-full sm:w-auto gap-3 sm:gap-4 transition-all duration-700 delay-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="relative w-full sm:w-auto min-w-0 sm:min-w-[220px] transition-transform hover:-translate-y-0.5">
                <Button
                  size="lg"
                  className={`relative w-full text-base px-10 py-4 rounded-full bg-transparent text-white shadow-[0_16px_40px_-18px_rgba(81,70,232,0.75)] hover:-translate-y-0.5 ${
                    showWaitlist ? "opacity-0 pointer-events-none invisible" : "opacity-100"
                  }`}
                  onClick={() => {
                    setModalTheme("blue");
                    setWaitlistVariant("early");
                    setShowWaitlist(true);
                  }}
                >
                  {!showWaitlist && (
                    <motion.div
                      layoutId="waitlist-shape-blue"
                      className="absolute inset-0 rounded-full bg-[#5146e8]"
                      transition={{ type: "spring", stiffness: 240, damping: 22 }}
                    />
                  )}
                  <span className="relative flex items-center justify-center w-full">
                    Get Early Access
                  </span>
                </Button>
              </div>

              <div className="relative w-full sm:w-auto min-w-0 sm:min-w-[220px] transition-transform hover:-translate-y-0.5">
                <Button
                  size="lg"
                  className={`relative w-full text-base px-10 py-4 rounded-full bg-transparent text-white shadow-[0_16px_40px_-18px_rgba(17,24,39,0.65)] hover:-translate-y-0.5 ${
                    showWaitlist ? "opacity-0 pointer-events-none invisible" : "opacity-100"
                  }`}
                  onClick={() => {
                    setModalTheme("charcoal");
                    setWaitlistVariant("waitlist");
                    setShowWaitlist(true);
                  }}
                >
                  {!showWaitlist && (
                    <motion.div
                      layoutId="waitlist-shape-charcoal"
                      className="absolute inset-0 rounded-full bg-[#111827]"
                      transition={{ type: "spring", stiffness: 240, damping: 22 }}
                    />
                  )}
                  <span className="relative flex items-center justify-center w-full">
                    Join Waitlist
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <div
            className={`hidden md:block flex-1 w-full transition-all duration-700 delay-400 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="relative w-full max-w-xl mx-auto">
              <div className="absolute inset-0 blur-3xl bg-primary/10" />
              <div className="relative rounded-3xl bg-white shadow-[0_25px_80px_-40px_rgba(56,73,233,0.55)] border border-border/80 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="flex-1 ml-3">
                    <div className="h-3 w-32 bg-border rounded-full" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-primary/12 via-primary/8 to-primary/6 rounded-2xl p-4 mb-4 border border-border/60">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">Starter Plan</p>
                        <p className="text-xs text-muted-foreground">
                          4 features included
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-primary">$11</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-full bg-white/80 text-muted-foreground text-center py-2 shadow-sm">
                      Analytics
                    </div>
                    <div className="rounded-full bg-primary text-white text-center py-2 shadow-[0_8px_24px_-12px_rgba(56,73,233,0.8)]">
                      AI Co-pilot
                    </div>
                    <div className="rounded-full bg-white/80 text-muted-foreground text-center py-2 shadow-sm">
                      Payments
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly total</span>
                  <span className="text-lg font-bold text-primary">$15</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {floatingIcons.map(({ Icon, className, color }, i) => (
          <motion.div
            key={i}
            className={`absolute z-0 pointer-events-none flex w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-white shadow-lg items-center justify-center ${className} transition-transform`}
            style={{ color, boxShadow: "0 10px 25px -20px rgba(0,0,0,0.35)", filter: "none" }}
            whileHover={{
              y: -8,
              scale: 1.1,
              boxShadow:
                "0 18px 40px -18px rgba(56,73,233,0.6), 0 0 18px rgba(56,73,233,0.5)",
              filter: "drop-shadow(0 0 12px rgba(56,73,233,0.6))",
            }}
          >
            <Icon className="w-6 h-6" />
          </motion.div>
        ))}
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
                layoutId={modalTheme === "blue" ? "waitlist-shape-blue" : "waitlist-shape-charcoal"}
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
                        <label className="block text-xs uppercase tracking-[0.2em] text-white/70 mb-2">
                          Full name <span className="text-red-400">*</span>
                        </label>
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
                        <label className="block text-xs uppercase tracking-[0.2em] text-white/70 mb-2">
                          Work email <span className="text-red-400">*</span>
                        </label>
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
                        <label className="block text-xs uppercase tracking-[0.2em] text-white/70 mb-2">
                          Instagram handle <span className="text-red-400">*</span>
                        </label>
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
                        <label className="block text-xs uppercase tracking-[0.2em] text-white/70 mb-2">
                          Website (optional)
                        </label>
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
                      <label className="block text-xs uppercase tracking-[0.2em] text-white/70 mb-2">
                        What are you selling? <span className="text-red-400">*</span>
                      </label>
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
                      <label className="block text-xs uppercase tracking-[0.2em] text-white/70 mb-2">
                        Where did you hear about us? <span className="text-red-400">*</span>
                      </label>
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
                                  setSourceValue(option.value);
                                  setSourceMenuOpen(false);
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
  );
}

type ModalCopy = {
  headline: string;
  bullets: string[];
};

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
  );
}

function ModalBullets({ bullets }: { bullets: string[] }) {
  return (
    <div className="space-y-3 text-white/85">
      {bullets.map((bullet) => (
        <div key={bullet} className="flex gap-3 items-start">
          <div className="mt-1 h-6 w-6 rounded-lg bg-white/15 flex items-center justify-center text-sm">
            ✓
          </div>
          <p>{bullet}</p>
        </div>
      ))}
    </div>
  );
}

function EarlyAccessModalContent({ copy }: { copy: ModalCopy }) {
  return (
    <>
      <div className="space-y-2">
        <ModalHeadline headline={copy.headline} />
      </div>
      <ModalBullets bullets={copy.bullets} />
    </>
  );
}

function WaitlistModalContent({ copy }: { copy: ModalCopy }) {
  return (
    <>
      <div className="space-y-2">
        <ModalHeadline headline={copy.headline} />
      </div>
      <ModalBullets bullets={copy.bullets} />
    </>
  );
}
