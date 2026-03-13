import { NextRequest, NextResponse } from "next/server"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { z } from "zod"
import { getDb } from "@/lib/db"
import {
  discountCampaigns,
  discountCampaignVariants,
  productVariants,
  products
} from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, and, inArray } from "drizzle-orm"


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

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: campaignId } = await context.params
    if (!idSchema.safeParse(campaignId).success) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    const { env } = await getCloudflareContext()
    const d1 = env.DB
    if (!d1) return NextResponse.json({ error: "DB binding missing" }, { status: 500 })

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const payload = await request.json().catch(() => null)
    const parsed = updateDiscountSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 })
    }

    const { name, description, bannerImageUrl, startDate: sStr, endDate: eStr, isActive, variants } = parsed.data
    const startDate = new Date(`${sStr}T00:00:00Z`)
    const endDate = new Date(`${eStr}T00:00:00Z`)

    if (endDate < startDate) {
      return NextResponse.json({ error: "End date must be on or after start date" }, { status: 400 })
    }

    // Verify campaign ownership
    const existing = await db.query.discountCampaigns.findFirst({
      where: and(
        eq(discountCampaigns.id, campaignId),
        eq(discountCampaigns.projectId, tenantId)
      )
    })

    if (!existing) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Verify variant ownership
    const variantIds = variants.map(v => v.variantId)
    const uniqueVariantIds = Array.from(new Set(variantIds))
    const validVariants = await db.query.productVariants.findMany({
      where: and(
        inArray(productVariants.id, uniqueVariantIds),
        inArray(productVariants.productId,
          db.select({ id: products.id })
            .from(products)
            .where(eq(products.projectId, tenantId))
        )
      )
    })

    if (validVariants.length !== uniqueVariantIds.length) {
      return NextResponse.json({ error: "One or more variants are invalid or unauthorized" }, { status: 403 })
    }

    const result = await db.transaction(async (tx) => {
      await tx.update(discountCampaigns)
        .set({
          name,
          description: description || null,
          bannerImageUrl: bannerImageUrl || null,
          startDate,
          endDate,
          isActive: isActive ?? true,
          updatedAt: new Date()
        })
        .where(eq(discountCampaigns.id, campaignId))

      // Atomic replace variants
      await tx.delete(discountCampaignVariants).where(eq(discountCampaignVariants.campaignId, campaignId))

      const variantValues = variants.map(v => ({
        campaignId,
        variantId: v.variantId,
        discountPercent: Number(v.discountPercent.toFixed(2))
      }))

      await tx.insert(discountCampaignVariants).values(variantValues)

      return tx.query.discountCampaigns.findFirst({
        where: eq(discountCampaigns.id, campaignId),
        with: {
          variants: {
            with: {
              variant: {
                with: {
                  product: true,
                  sizes: true
                }
              }
            }
          }
        }
      })
    })

    if (!result) return NextResponse.json({ error: "Update failed" }, { status: 500 })

    const transformed = {
      ...result,
      startDate: result.startDate.toISOString().split('T')[0],
      endDate: result.endDate.toISOString().split('T')[0],
      discount_campaign_variants: result.variants.map(v => ({
        ...v,
        variant: {
          ...v.variant,
          product: v.variant.product,
          variant_sizes: v.variant.sizes
        }
      }))
    }

    return NextResponse.json({ data: transformed })
  } catch (error) {
    console.error("[discounts][PATCH] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: campaignId } = await context.params
    const { env } = await getCloudflareContext()
    const d1 = env.DB
    if (!d1) return NextResponse.json({ error: "DB binding missing" }, { status: 500 })

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const result = await db.delete(discountCampaigns)
      .where(and(
        eq(discountCampaigns.id, campaignId),
        eq(discountCampaigns.projectId, tenantId)
      ))
      .returning()

    if (result.length === 0) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[discounts][DELETE] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
