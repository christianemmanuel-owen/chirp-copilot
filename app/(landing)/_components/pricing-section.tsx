"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, CreditCard, Mail, Truck } from "lucide-react";

import { Card } from "@/app/(landing)/_ui/card";
import type { BillingCycle, PricingPlan } from "@/lib/landing-data";

type PricingSectionProps = {
  pricingPlans: PricingPlan[];
};

export function PricingSection({ pricingPlans }: PricingSectionProps) {
  const [billingCycle] = useState<BillingCycle>("monthly");
  const [annualBilling, setAnnualBilling] = useState(false);
  const basePlan = pricingPlans[0];

  const addOns = useMemo(
    () => [
      {
        id: "omni-inbox",
        name: "Omnichannel",
        description: "Unified messaging across all channels",
        price: 2,
        icon: Mail,
        color: "from-blue-500 to-blue-400",
      },
      {
        id: "advanced-analytics",
        name: "Shipping",
        description: "Integrated courier booking for shoppers",
        price: 2,
        icon: Truck,
        color: "from-purple-500 to-purple-400",
      },
      {
        id: "card-payments",
        name: "Card Payments",
        description: "Accept credit & debit cards",
        price: 3,
        icon: CreditCard,
        color: "from-pink-500 to-pink-400",
      },
    ],
    [],
  );

  const isComingSoonAddOn = (id: string) => id === "card-payments" || id === "advanced-analytics";

  const displayedAddOns = useMemo(() => {
    const available = addOns.filter((addon) => !isComingSoonAddOn(addon.id));
    const comingSoon = addOns.filter((addon) => isComingSoonAddOn(addon.id));
    return [...available, ...comingSoon];
  }, [addOns]);

  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const toggleAddOn = (id: string) => {
    if (id === "card-payments") {
      return;
    }
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const addOnTotal = selectedAddOns.reduce((sum, id) => {
    const found = addOns.find((a) => a.id === id);
    return found ? sum + found.price : sum;
  }, 0);

  const basePrice = basePlan ? basePlan.price[billingCycle] : 0;
  const total = basePrice + addOnTotal;
  const adjustedTotal = annualBilling ? total * 0.85 : total;
  const totalLabel = annualBilling ? "Annual Total" : "Monthly Total";

  return (
    <section
      id="pricing"
      className="relative pt-44 sm:pt-56 lg:pt-72 pb-48 sm:pb-64 lg:pb-80 bg-[#3849E9] text-background overflow-hidden"
    >
      <div className="custom-shape-divider-top-pricing pointer-events-none absolute top-0 left-0 w-full overflow-hidden leading-[0]">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V7.23C0,65.52,268.63,112.77,600,112.77S1200,65.52,1200,7.23V0Z"
            className="shape-fill"
          />
        </svg>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-8 sm:space-y-10">
        <div className="text-center space-y-4 text-white">
          <h2
            className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
            style={{
              fontFamily:
                'var(--font-poppins), "Poppins", "Helvetica Neue", Arial, sans-serif',
              fontWeight: 700,
            }}
          >
            Build your perfect plan
          </h2>
          <p className="text-base sm:text-lg text-white/80">
            Pay only for what you need.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <div className="order-1 flex flex-col gap-6 h-full min-h-0">
            {/* Base plan */}
            <div className="flex items-center gap-3 text-white">
              <div>
                <h3
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold"
                  style={{
                    fontFamily:
                      'var(--font-poppins), "Poppins", "Helvetica Neue", Arial, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  {basePlan?.name ?? "Starter"}
                </h3>
              </div>
            </div>
            <Card className="relative flex-1 bg-white text-foreground border border-border shadow-[0_30px_90px_-45px_rgba(0,0,0,0.35)] rounded-2xl p-5 sm:p-7 space-y-5 transition-transform duration-300 hover:-translate-y-1">
              <div>
                <span className="text-4xl sm:text-5xl font-bold">
                  ${basePrice.toFixed(0)}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  What&apos;s included
                </p>
                {(basePlan?.features ?? ["Plug-and-Play Storefront", "Inventory Management", "Order Tracking", "Checkout Links"]).map(
                  (feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ),
                )}
              </div>
            </Card>
          </div>

          <div className="order-3 lg:order-2 flex flex-col gap-6 h-full min-h-0">
            <div aria-hidden="true" className="flex items-center gap-3 text-white opacity-0 select-none pointer-events-none">
              <div>
                <h3
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold"
                  style={{
                    fontFamily:
                      'var(--font-poppins), "Poppins", "Helvetica Neue", Arial, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  {basePlan?.name ?? "Starter"}
                </h3>
              </div>
            </div>
            <Card className="flex-1 min-h-0 rounded-2xl border border-border bg-white text-foreground shadow-[0_30px_90px_-45px_rgba(0,0,0,0.35)] overflow-hidden">
              <div className="flex h-full min-h-0 flex-col p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 flex-none rounded-xl bg-gradient-to-br from-[#5a4cff] to-[#3b2dd6] text-white flex items-center justify-center shadow-[0_12px_30px_-14px_rgba(56,73,233,0.6)]">
                    <CartIcon />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-3xl sm:text-4xl font-base text-foreground leading-none"
                      style={{
                        fontFamily:
                          'var(--font-poppins), "Poppins", "Helvetica Neue", Arial, sans-serif',
                        fontWeight: 700,
                      }}
                    >
                      Your Plan
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex-1 min-h-0 overflow-y-auto border-t border-border pt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{basePlan?.name ?? "Starter Plan"}</span>
                    <span className="font-medium">${basePrice.toFixed(2)}</span>
                  </div>
                  {addOns
                    .filter((a) => selectedAddOns.includes(a.id))
                    .map((a) => (
                      <div key={a.id} className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleAddOn(a.id)}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs hover:bg-muted/70 transition-colors"
                            aria-label={`Remove ${a.name}`}
                          >
                            ×
                          </button>
                          {a.name}
                        </span>
                        <span className="font-medium">${a.price.toFixed(2)}</span>
                      </div>
                    ))}
                </div>

                <div className="pt-4">
                  <div className="flex items-center justify-between text-lg font-bold text-foreground">
                    <span>{totalLabel}</span>
                    <motion.span
                      key={adjustedTotal.toFixed(2)} // forces remount on change
                      initial={{ scale: 0.85, y: 6 }}
                      animate={{ scale: 1.1, y: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 14,
                        mass: 0.3,
                      }}
                      className="text-2xl"
                      style={{
                        color: "#3849e9",
                        fontFamily:
                          'var(--font-poppins), "Poppins", "Helvetica Neue", Arial, sans-serif',
                        fontWeight: 700,
                      }}
                    >
                      {adjustedTotal.toFixed(2)}
                    </motion.span>
                  </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setAnnualBilling((prev) => !prev)}
                    className={`inline-flex items-center gap-3 rounded-full px-3 sm:px-4 py-2 border text-xs sm:text-sm font-semibold transition-all ${
                      annualBilling
                        ? "bg-white text-[#3849e9] border-[#3849e9] shadow-[0_14px_32px_-20px_rgba(56,73,233,0.65)]"
                        : "bg-[#f3f4ff] text-foreground border-border shadow-[0_10px_30px_-20px_rgba(0,0,0,0.25)]"
                    }`}
                    aria-pressed={annualBilling}
                  >
                    <span className="font-semibold">
                      {annualBilling ? "Annual billing (15% off)" : "Monthly billing"}
                    </span>
                    <span
                      className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors ${
                        annualBilling ? "bg-[#3849e9]/20 border-[#3849e9]" : "bg-white border-border"
                      }`}
                    >
                      <span
                        className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          annualBilling ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </span>
                  </button>
                </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="order-2 lg:order-3 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4 text-white">
              <div>
                <h3
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold"
                  style={{
                    fontFamily:
                      'var(--font-poppins), "Poppins", "Helvetica Neue", Arial, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  Add-ons
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              {displayedAddOns.map((addon) => {
                const selected = selectedAddOns.includes(addon.id);
                const Icon = addon.icon;
                const isComingSoon = isComingSoonAddOn(addon.id);
                const selectedClasses = selected
                  ? "border-[#6053ff] bg-[#e7e9ff] shadow-[0_25px_60px_-35px_rgba(56,73,233,0.6)] ring-2 ring-[#6053ff]/50"
                  : "border-border bg-white hover:-translate-y-1 hover:shadow-[0_20px_45px_-24px_rgba(56,73,233,0.35)]";

                return (
                  <button
                    key={addon.id}
                    onClick={() => toggleAddOn(addon.id)}
                    disabled={isComingSoon}
                    aria-disabled={isComingSoon}
                    className={`relative flex flex-col h-full min-h-[96px] sm:min-h-0 text-left p-2 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 shadow-[0_20px_55px_-30px_rgba(0,0,0,0.35)] hover:-translate-y-1 ${
                      isComingSoon ? "cursor-not-allowed hover:-translate-y-0" : ""
                    } ${selectedClasses}`}
                  >
                    {isComingSoon && (
                      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-white/25 ring-1 ring-border/40" />
                    )}
                    <div className="flex items-center gap-1.5 sm:gap-3 mb-2 sm:mb-3 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
                        <div
                          className={`w-7 h-7 sm:w-10 sm:h-10 shrink-0 flex-none rounded-lg sm:rounded-xl bg-gradient-to-br ${addon.color} flex items-center justify-center text-white shadow-[0_10px_25px_-12px_rgba(0,0,0,0.35)]`}
                        >
                          <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                        </div>
                        <p className="font-semibold text-[11px] sm:text-base text-foreground leading-tight [overflow-wrap:anywhere]">
                          {addon.id === "omni-inbox" ? (
                            <>
                              <span className="sm:hidden">
                                Omni-
                                <br />
                                channel
                              </span>
                              <span className="hidden sm:inline">{addon.name}</span>
                            </>
                          ) : (
                            addon.name
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="hidden lg:block text-sm leading-snug text-muted-foreground">
                        {addon.description}
                      </p>
                    </div>
                    {isComingSoon ? (
                      <div className="mt-2 sm:mt-4 w-full">
                        <p
                          className="w-full text-center text-sm sm:text-xl leading-none text-muted-foreground"
                          style={{
                            fontFamily: 'var(--font-poppins), "Poppins", "Helvetica Neue", Arial, sans-serif',
                            fontWeight: 700,
                          }}
                        >
                          Coming soon
                        </p>
                      </div>
                    ) : (
                      <div className="mt-2 sm:mt-4 flex items-end justify-between gap-2">
                        <div
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center text-sm sm:text-base ${
                            selected ? "bg-primary text-white border-primary" : "border-border text-muted-foreground"
                          }`}
                        >
                          {selected ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : "+"}
                        </div>
                        <p
                          className={`shrink-0 text-sm sm:text-xl leading-none ${
                            selected ? "text-[#4f46e5]" : "text-[#3849e9]"
                          }`}
                          style={{
                            fontFamily: 'var(--font-poppins), "Poppins", "Helvetica Neue", Arial, sans-serif',
                            fontWeight: 700,
                          }}
                        >
                          {`$${addon.price}/mo`}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="custom-shape-divider-bottom-pricing pointer-events-none absolute bottom-[-120px] left-0 w-full overflow-hidden leading-[0]">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V7.23C0,65.52,268.63,112.77,600,112.77S1200,65.52,1200,7.23V0Z"
            className="shape-fill"
          />
        </svg>
      </div>
    </section>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
      <path
        d="M5 5h2l1 12h8l1-8H7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1" />
      <circle cx="17" cy="20" r="1" />
    </svg>
  );
}
