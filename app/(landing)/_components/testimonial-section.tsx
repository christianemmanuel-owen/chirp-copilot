"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "Our online business looks more professional now that we have a website to get our customer's orders.",
    name: "Chelsea",
    role: "Business Owner",
  },
  {
    quote:
      "DMs to checkout in seconds. Our team stopped copying links and started closing sales faster.",
    name: "Andre",
    role: "Operations Lead",
  },
  {
    quote:
      "Inventory actually stays in sync across drops and markets. No more messy spreadsheets.",
    name: "Maya",
    role: "Founder, Home Goods",
  },
  {
    quote:
      "Chirp turned our Instagram audience into predictable revenue with automated follow-ups.",
    name: "Luis",
    role: "Ecommerce Manager",
  },
];

export function TestimonialSection() {
  const [isPaused, setIsPaused] = useState(false);
  const scrollingTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="-mt-0 pt-16 sm:pt-24 pb-10 sm:pb-14 bg-white relative z-20 overflow-x-hidden overflow-y-visible">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6">
        <div
          className="overflow-x-hidden overflow-y-visible py-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
        >
          <div
            className="flex w-max gap-2 sm:gap-6 animate-testimonial-marquee"
            style={{ animationPlayState: isPaused ? "paused" : "running" }}
          >
            {scrollingTestimonials.map((testimonial, idx) => (
              <motion.article
                key={`${testimonial.name}-${idx}`}
                whileHover={{ y: -8, scale: 1.015 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="flex flex-col w-[30vw] min-w-[96px] max-w-[124px] sm:w-[min(44vw,360px)] sm:min-w-0 sm:max-w-none lg:w-[min(29vw,360px)] min-h-[190px] sm:min-h-[310px] rounded-2xl sm:rounded-3xl border border-[#dfe4ff] bg-white p-2 sm:p-6 shadow-[0_14px_35px_-24px_rgba(56,73,233,0.35)]"
              >
                <div className="flex justify-center gap-0.5 sm:gap-1 mb-2 sm:mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-2.5 h-2.5 sm:w-5 sm:h-5 fill-[#F5B301] text-[#F5B301]"
                    />
                  ))}
                </div>
                <div className="flex-1 flex items-center">
                  <blockquote
                    className="text-[0.62rem] sm:text-[1.2rem] leading-[1.3] sm:leading-[1.35] tracking-tight text-[#3f506d]"
                    style={{ fontFamily: 'var(--font-poppins), "Poppins", "Helvetica Neue", Arial, sans-serif', fontWeight: 300 }}
                  >
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                </div>
                <div className="mt-auto pt-2 sm:pt-8">
                  <div
                    className="text-[0.85rem] sm:text-[1.35rem] leading-tight text-[#16233c]"
                    style={{ fontFamily: 'var(--font-poppins), "Poppins", "Helvetica Neue", Arial, sans-serif', fontWeight: 700 }}
                  >
                    {testimonial.name}
                  </div>
                  <div
                    className="mt-0.5 sm:mt-1 text-[0.52rem] sm:text-[1.05rem] leading-tight text-[#3f506d]"
                    style={{ fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif', fontWeight: 300 }}
                  >
                    {testimonial.role}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
