import { NextResponse } from "next/server"
import { z } from "zod"

import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import { mapDiscountCampaignRow, type DiscountCampaignRowWithVariants } from "@/lib/supabase/transformers"

const DISCOUNT_CAMPAIGN_SELECT = `
  *,
  discount_campaign_variants (
    id,
    campaign_id,
    variant_id,
    discount_percent,
    created_at,
    updated_at,
    variant:product_variants (
      *,
      product:products(*),
      variant_sizes(*)
    )
  )
`

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")

const discountVariantSchema = z.object({
  variantId: z.number().int().positive("Variant is required"),
  discountPercent: z.number().min(0.1, "Discount must be greater than 0").max(100, "Discount cannot exceed 100%"),
})

const imageUrlSchema = z.string().trim().max(2048, "Image URL must be 2048 characters or less").optional()

const createDiscountSchema = z.object({
  name: z.string().trim().min(1, "Campaign name is required"),
  description: z.string().trim().optional(),
  bannerImageUrl: imageUrlSchema,
  startDate: dateStringSchema,
  endDate: dateStringSchema,
  isActive: z.boolean().optional(),
  variants: z.array(discountVariantSchema).min(1, "Select at least one variant"),
})

export async function GET() {
  try {
    const supabase = getSupabaseServiceRoleClient()
    const { data, error } = await supabase
      .from("discount_campaigns")
      .select(DISCOUNT_CAMPAIGN_SELECT)
      .order("start_date", { ascending: false })

    if (error) {
      console.error("[discounts][GET] Supabase error", error)
      return NextResponse.json({ error: "Failed to load discount campaigns" }, { status: 500 })
    }

    const campaigns =
      (data as DiscountCampaignRowWithVariants[] | null)?.map((row) => mapDiscountCampaignRow(row)) ?? []

    return NextResponse.json({ data: campaigns })
  } catch (error) {
    console.error("[discounts][GET] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error retrieving discount campaigns" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null)
    const parsed = createDiscountSchema.safeParse(payload)

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid discount payload"
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const data = parsed.data
    const startDate = new Date(`${data.startDate}T00:00:00Z`)
    const endDate = new Date(`${data.endDate}T00:00:00Z`)

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Invalid campaign dates" }, { status: 400 })
    }

    if (endDate < startDate) {
      return NextResponse.json({ error: "End date must be on or after the start date" }, { status: 400 })
    }

    const uniqueVariantIds = new Set<number>()
    for (const variant of data.variants) {
      if (uniqueVariantIds.has(variant.variantId)) {
        return NextResponse.json({ error: "Each variant can only be discounted once per campaign" }, { status: 400 })
      }
      uniqueVariantIds.add(variant.variantId)
    }

    const supabase = getSupabaseServiceRoleClient()

    const variantIdList = Array.from(uniqueVariantIds)
    const { data: existingVariants, error: variantLookupError } = await supabase
      .from("product_variants")
      .select("id")
      .in("id", variantIdList)

    if (variantLookupError) {
      console.error("[discounts][POST] Variant validation failed", variantLookupError)
      return NextResponse.json({ error: "Failed to validate variants" }, { status: 500 })
    }

    if ((existingVariants ?? []).length !== variantIdList.length) {
      return NextResponse.json({ error: "One or more product variants could not be found" }, { status: 400 })
    }

    const normalizedBannerImageUrl =
      data.bannerImageUrl && data.bannerImageUrl.length > 0 ? data.bannerImageUrl : null

    const { data: createdCampaign, error: campaignError } = await supabase
      .from("discount_campaigns")
      .insert({
        name: data.name,
        description: data.description && data.description.length > 0 ? data.description : null,
        banner_image_url: normalizedBannerImageUrl,
        start_date: data.startDate,
        end_date: data.endDate,
        is_active: data.isActive ?? true,
      })
      .select("*")
      .single()

    if (campaignError || !createdCampaign) {
      console.error("[discounts][POST] Failed to create campaign", campaignError)
      return NextResponse.json({ error: "Failed to create discount campaign" }, { status: 500 })
    }

    const variantPayload = data.variants.map((variant) => ({
      campaign_id: createdCampaign.id,
      variant_id: variant.variantId,
      discount_percent: Number(variant.discountPercent.toFixed(2)),
    }))

    const { error: variantInsertError } = await supabase.from("discount_campaign_variants").insert(variantPayload)

    if (variantInsertError) {
      console.error("[discounts][POST] Failed to attach variants", variantInsertError)
      await supabase.from("discount_campaigns").delete().eq("id", createdCampaign.id)
      return NextResponse.json({ error: "Failed to attach variants to the campaign" }, { status: 500 })
    }

    const { data: refreshedCampaign, error: refreshError } = await supabase
      .from("discount_campaigns")
      .select(DISCOUNT_CAMPAIGN_SELECT)
      .eq("id", createdCampaign.id)
      .single()

    if (refreshError || !refreshedCampaign) {
      console.error("[discounts][POST] Failed to load campaign after creation", refreshError)
      return NextResponse.json(
        { error: "Discount campaign created but failed to load the final record" },
        { status: 500 },
      )
    }

    const campaign = mapDiscountCampaignRow(refreshedCampaign as DiscountCampaignRowWithVariants)
    return NextResponse.json({ data: campaign }, { status: 201 })
  } catch (error) {
    console.error("[discounts][POST] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error creating discount campaign" }, { status: 500 })
  }
}
