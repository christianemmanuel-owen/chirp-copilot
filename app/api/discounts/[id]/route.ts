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

const idSchema = z.string().uuid({ message: "Invalid campaign id" })

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")

const discountVariantSchema = z.object({
  variantId: z.number().int().positive("Variant is required"),
  discountPercent: z.number().min(0.1, "Discount must be greater than 0").max(100, "Discount cannot exceed 100%"),
})

const imageUrlSchema = z.string().trim().max(2048, "Image URL must be 2048 characters or less").optional()

const updateDiscountSchema = z.object({
  name: z.string().trim().min(1, "Campaign name is required"),
  description: z.string().trim().optional(),
  bannerImageUrl: imageUrlSchema,
  startDate: dateStringSchema,
  endDate: dateStringSchema,
  isActive: z.boolean().optional(),
  variants: z.array(discountVariantSchema).min(1, "Select at least one variant"),
})

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await context.params
    const idResult = idSchema.safeParse(idParam)
    if (!idResult.success) {
      return NextResponse.json({ error: idResult.error.issues[0]?.message ?? "Invalid campaign id" }, { status: 400 })
    }

    const payload = await request.json().catch(() => null)
    const parsed = updateDiscountSchema.safeParse(payload)

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

    const campaignId = idResult.data
    const { data: existingCampaign, error: lookupError } = await supabase
      .from("discount_campaigns")
      .select("id")
      .eq("id", campaignId)
      .single()

    if (lookupError) {
      if (lookupError.code === "PGRST116") {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
      }
      console.error("[discounts][PATCH] Failed to lookup campaign", lookupError)
      return NextResponse.json({ error: "Failed to load campaign for update" }, { status: 500 })
    }

    if (!existingCampaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const variantIdList = Array.from(uniqueVariantIds)
    const { data: existingVariants, error: variantLookupError } = await supabase
      .from("product_variants")
      .select("id")
      .in("id", variantIdList)

    if (variantLookupError) {
      console.error("[discounts][PATCH] Variant validation failed", variantLookupError)
      return NextResponse.json({ error: "Failed to validate variants" }, { status: 500 })
    }

    if ((existingVariants ?? []).length !== variantIdList.length) {
      return NextResponse.json({ error: "One or more product variants could not be found" }, { status: 400 })
    }

    const now = new Date().toISOString()
    const normalizedBannerImageUrl =
      data.bannerImageUrl && data.bannerImageUrl.length > 0 ? data.bannerImageUrl : null

    const campaignUpdate: Record<string, unknown> = {
      name: data.name,
      description: data.description && data.description.length > 0 ? data.description : null,
      start_date: data.startDate,
      end_date: data.endDate,
      is_active: data.isActive ?? true,
      updated_at: now,
    }

    if (data.bannerImageUrl !== undefined) {
      campaignUpdate.banner_image_url = normalizedBannerImageUrl
    }

    const { error: updateError } = await supabase
      .from("discount_campaigns")
      .update(campaignUpdate)
      .eq("id", campaignId)

    if (updateError) {
      console.error("[discounts][PATCH] Failed to update campaign", updateError)
      return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 })
    }

    const { error: deleteError } = await supabase.from("discount_campaign_variants").delete().eq("campaign_id", campaignId)

    if (deleteError) {
      console.error("[discounts][PATCH] Failed to reset campaign variants", deleteError)
      return NextResponse.json({ error: "Failed to update campaign variants" }, { status: 500 })
    }

    const variantPayload = data.variants.map((variant) => ({
      campaign_id: campaignId,
      variant_id: variant.variantId,
      discount_percent: Number(variant.discountPercent.toFixed(2)),
      created_at: now,
      updated_at: now,
    }))

    const { error: insertError } = await supabase.from("discount_campaign_variants").insert(variantPayload)

    if (insertError) {
      console.error("[discounts][PATCH] Failed to insert campaign variants", insertError)
      return NextResponse.json({ error: "Failed to attach variants to the campaign" }, { status: 500 })
    }

    const { data: refreshedCampaign, error: refreshError } = await supabase
      .from("discount_campaigns")
      .select(DISCOUNT_CAMPAIGN_SELECT)
      .eq("id", campaignId)
      .single()

    if (refreshError || !refreshedCampaign) {
      console.error("[discounts][PATCH] Failed to load campaign after update", refreshError)
      return NextResponse.json(
        { error: "Campaign updated but failed to load the final record" },
        { status: 500 },
      )
    }

    const campaign = mapDiscountCampaignRow(refreshedCampaign as DiscountCampaignRowWithVariants)
    return NextResponse.json({ data: campaign })
  } catch (error) {
    console.error("[discounts][PATCH] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error updating discount campaign" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await context.params
    const idResult = idSchema.safeParse(idParam)
    if (!idResult.success) {
      return NextResponse.json({ error: idResult.error.issues[0]?.message ?? "Invalid campaign id" }, { status: 400 })
    }

    const supabase = getSupabaseServiceRoleClient()
    const campaignId = idResult.data

    const { data: existingCampaign, error: fetchError } = await supabase
      .from("discount_campaigns")
      .select("id")
      .eq("id", campaignId)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
      }
      console.error("[discounts][DELETE] Failed to lookup campaign", fetchError)
      return NextResponse.json({ error: "Failed to delete discount campaign" }, { status: 500 })
    }

    if (!existingCampaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const { error: deleteError } = await supabase.from("discount_campaigns").delete().eq("id", campaignId)

    if (deleteError) {
      console.error("[discounts][DELETE] Failed to delete campaign", deleteError)
      return NextResponse.json({ error: "Failed to delete discount campaign" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[discounts][DELETE] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error deleting discount campaign" }, { status: 500 })
  }
}
