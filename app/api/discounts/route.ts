import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/db"
import {
  discountCampaigns,
  discountCampaignVariants,
  productVariants,
  products,
  variantSizes
} from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, and, inArray, desc } from "drizzle-orm"

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

export async function GET(request: NextRequest) {
  try {
    const d1 = (process.env as any).DB as D1Database
    if (!d1) return NextResponse.json({ error: "DB binding missing" }, { status: 500 })

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const data = await db.query.discountCampaigns.findMany({
      where: eq(discountCampaigns.projectId, tenantId),
      orderBy: [desc(discountCampaigns.startDate)],
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

    const transformed = data.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      bannerImageUrl: campaign.bannerImageUrl,
      startDate: campaign.startDate.toISOString().split('T')[0],
      endDate: campaign.endDate.toISOString().split('T')[0],
      isActive: campaign.isActive,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      discount_campaign_variants: campaign.variants.map(v => ({
        id: v.id,
        campaign_id: v.campaignId,
        variant_id: v.variantId,
        discount_percent: v.discountPercent,
        variant: {
          ...v.variant,
          product: v.variant.product,
          variant_sizes: v.variant.sizes
        }
      }))
    }))

    return NextResponse.json({ data: transformed })
  } catch (error) {
    console.error("[discounts][GET] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const d1 = (process.env as any).DB as D1Database
    if (!d1) return NextResponse.json({ error: "DB binding missing" }, { status: 500 })

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const payload = await request.json().catch(() => null)
    const parsed = createDiscountSchema.safeParse(payload)

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid discount payload"
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { name, description, bannerImageUrl, startDate: sStr, endDate: eStr, isActive, variants } = parsed.data
    const startDate = new Date(`${sStr}T00:00:00Z`)
    const endDate = new Date(`${eStr}T00:00:00Z`)

    if (endDate < startDate) {
      return NextResponse.json({ error: "End date must be on or after the start date" }, { status: 400 })
    }

    const variantIds = variants.map(v => v.variantId)
    const uniqueVariantIds = Array.from(new Set(variantIds))
    if (uniqueVariantIds.length !== variantIds.length) {
      return NextResponse.json({ error: "Duplicates in variants" }, { status: 400 })
    }

    // Verify ownership
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
      return NextResponse.json({ error: "Unauthorized or invalid variants" }, { status: 403 })
    }

    const result = await db.transaction(async (tx) => {
      const [campaign] = await tx.insert(discountCampaigns).values({
        projectId: tenantId,
        name,
        description: description || null,
        bannerImageUrl: bannerImageUrl || null,
        startDate,
        endDate,
        isActive: isActive ?? true
      }).returning()

      const variantValues = variants.map(v => ({
        campaignId: campaign.id,
        variantId: v.variantId,
        discountPercent: Number(v.discountPercent.toFixed(2))
      }))

      await tx.insert(discountCampaignVariants).values(variantValues)

      return tx.query.discountCampaigns.findFirst({
        where: eq(discountCampaigns.id, campaign.id),
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

    if (!result) return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 })

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

    return NextResponse.json({ data: transformed }, { status: 201 })
  } catch (error) {
    console.error("[discounts][POST] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
