import { NextResponse } from "next/server"
import { getCloudflareContext } from "@/lib/cloudflare/context"
import { getDb } from "@/lib/db"
import { brands as brandsSchema } from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, asc, and } from "drizzle-orm"


function normalizeName(value: unknown): string {
  if (typeof value !== "string") return ""
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : ""
}

export async function GET(request: Request) {
  try {
    const { env } = await getCloudflareContext()
    const d1 = env.DB
    if (!d1) {
      return NextResponse.json({ error: "Database binding not found" }, { status: 500 })
    }

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const data = await db.select({
      id: brandsSchema.id,
      name: brandsSchema.name,
    })
      .from(brandsSchema)
      .where(eq(brandsSchema.projectId, tenantId))
      .orderBy(asc(brandsSchema.name))

    return NextResponse.json({ data: data ?? [] })
  } catch (error) {
    console.error("[brands][GET] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error retrieving brands" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { name?: string | null } | null
    const name = normalizeName(payload?.name)

    if (!name) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 })
    }

    const { env } = await getCloudflareContext()
    const d1 = env.DB
    if (!d1) {
      return NextResponse.json({ error: "Database binding not found" }, { status: 500 })
    }

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    // Check for existing brand in this project
    const existing = await db.query.brands.findFirst({
      where: and(
        eq(brandsSchema.projectId, tenantId),
        eq(brandsSchema.name, name)
      )
    })

    if (existing) {
      return NextResponse.json({ error: "Brand name already exists" }, { status: 409 })
    }

    const [newBrand] = await db.insert(brandsSchema).values({
      name,
      projectId: tenantId,
    }).returning({
      id: brandsSchema.id,
      name: brandsSchema.name,
    })

    return NextResponse.json({ data: newBrand }, { status: 201 })
  } catch (error) {
    console.error("[brands][POST] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error creating brand" }, { status: 500 })
  }
}
