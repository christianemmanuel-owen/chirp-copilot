import type { Metadata } from "next"

import AdminCheckoutLinkBuilder from "@/components/admin-checkout-link-builder"

export const metadata: Metadata = {
  title: "Admin Checkout Links",
}

export default function AdminCheckoutLinksPage() {
  return (
    <div className="container mx-auto max-w-[95vw] px-6 py-8">
      <AdminCheckoutLinkBuilder />
    </div>
  )
}
