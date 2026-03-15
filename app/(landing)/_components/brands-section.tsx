"use client";

import { useEffect, useState } from "react";
import { Globe, Instagram, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { Card } from "@/app/(landing)/_ui/card";
import type { Brand } from "@/lib/landing-data";

type BrandsSectionProps = {
  brands: Brand[];
};

export function BrandsSection({ brands }: BrandsSectionProps) {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  useEffect(() => {
    document.body.style.overflow = selectedBrand ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedBrand]);

  return (
    <section
      id="customers"
      className="relative pt-0 pb-24 sm:pb-32 lg:pb-40 text-foreground overflow-hidden bg-transparent"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#5146e8] via-[#4b42d1] to-[#3c35c7] opacity-100" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.16),transparent_32%),radial-gradient(circle_at_50%_70%,rgba(255,255,255,0.14),transparent_30%)] opacity-80" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-5 pb-10 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2
            className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight pt-20 sm:pt-24 lg:pt-32 mb-4 text-balance text-white"
            style={{ fontFamily: 'var(--font-poppins), "Poppins", "Helvetica Neue", Arial, sans-serif', fontWeight: 700 }}
          >
            Real Brands. Real Wins.
          </h2>
          <p className="text-lg text-white/80 max-w-3xl mx-auto text-balance">
            Join the successful entrepreneurs who&apos;ve transformed their
            business with CHIRP.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {brands.map((brand, idx) => (
            <motion.div
              key={brand.name}
              onClick={() => setSelectedBrand(brand)}
              className="cursor-pointer"
              whileHover={{ scale: 1.015 }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: idx * 0.08,
              }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <motion.div
                className="relative aspect-square overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1b1b1f] via-[#2a2a30] to-[#3a3a42] border border-white/10 shadow-[0_18px_45px_-24px_rgba(56,73,233,0.25)]"
              >
                <div
                  className="absolute inset-0 bg-center bg-cover"
                  style={{
                    backgroundImage: `url(${brand.image})`,
                    backgroundSize: "170%",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent" />
                <div className="absolute inset-0 p-3 sm:p-4 flex items-end">
                  <div className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                    <div
                      className="text-[10px] sm:text-xs uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif', fontWeight: 300 }}
                    >
                      {brand.industry}
                    </div>
                    <div
                      className="text-base sm:text-lg font-bold leading-tight"
                      style={{ fontFamily: 'var(--font-poppins), "Poppins", "Helvetica Neue", Arial, sans-serif', fontWeight: 700, color: "#ffffff" }}
                    >
                      {brand.name}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
        <p
          className="mt-4 sm:mt-5 text-center text-sm sm:text-base text-white/80"
          style={{ fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif', fontWeight: 400 }}
        >
          Click to learn more
        </p>
      </div>

      <AnimatePresence>
        {selectedBrand && (
          <>
            <motion.div
              className="fixed inset-0 bg-background/70 backdrop-blur-sm z-40"
              onClick={() => setSelectedBrand(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: { duration: 0.24, ease: "easeInOut" },
              }}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8 overflow-hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 10,
              }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.25 }}
            >
              <Card className="relative max-w-3xl w-full max-h-[92dvh] bg-background text-foreground shadow-2xl overflow-hidden p-0 gap-0 border border-black rounded-2xl sm:rounded-3xl flex flex-col">
                <button
                  onClick={() => setSelectedBrand(null)}
                  className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm border border-border/80 text-foreground rounded-full p-2 hover:bg-background transition-colors z-10"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                <motion.div
                  className="relative h-52 sm:h-72 md:h-96"
                >
                  <div
                    className="absolute inset-0 bg-no-repeat"
                    style={{
                      backgroundImage: `url(${selectedBrand.image})`,
                      backgroundSize: "100%",
                      backgroundPosition: "center 30%",
                    }}
                  />
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 text-black space-y-1">
                    <div
                      className="text-3xl md:text-4xl font-bold drop-shadow-md"
                      style={{ fontFamily: 'var(--font-poppins), "Poppins", "Helvetica Neue", Arial, sans-serif', fontWeight: 700 }}
                    >
                      {selectedBrand.name}
                    </div>
                    <div
                      className="text-xs uppercase tracking-wide text-foreground drop-shadow-md"
                      style={{ fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif', fontWeight: 300 }}
                    >
                      {selectedBrand.industry}
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 flex items-center gap-3 text-white">
                    {selectedBrand.instagramUrl && (
                      <a
                        href={selectedBrand.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                        aria-label={`${selectedBrand.name} on Instagram`}
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {selectedBrand.websiteUrl && (
                      <a
                        href={selectedBrand.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                        aria-label={`${selectedBrand.name} website`}
                      >
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </motion.div>

                <div className="p-6 sm:p-8 space-y-4 bg-gradient-to-b from-[#1b1b1f] via-[#2a2a30] to-[#3a3a42] text-white overflow-y-auto">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-white/80">
                      Background
                    </p>
                    <p className="text-base leading-relaxed text-white/90 text-justify">
                      {selectedBrand.background}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-white/80">
                      Results with Chirp
                    </p>
                    <p className="text-base leading-relaxed text-primary-foreground text-justify">
                      {selectedBrand.impact}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
