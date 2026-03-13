import { NextResponse } from "next/server"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb } from "@/lib/db"
import { categories } from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, and, sql } from "drizzle-orm"


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

    const data = await db.select()
      .from(categories)
      .where(eq(categories.projectId, tenantId))
      .orderBy(categories.name)

    return NextResponse.json({ data })
  } catch (error) {
    console.error("[categories][GET] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error retrieving categories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { name?: string | null } | null
    const name = normalizeName(payload?.name)

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    const { env } = await getCloudflareContext()
    const d1 = env.DB
    if (!d1) {
      return NextResponse.json({ error: "Database binding not found" }, { status: 500 })
    }

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const [data] = await db.insert(categories)
      .values({
        name,
        projectId: tenantId
      })
      .onConflictDoUpdate({
        target: [categories.projectId, categories.name],
        set: { name } // No-op to trigger return of existing if needed, or handle error
      })
      .returning()

    if (!data) {
      return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("[categories][POST] Unexpected error", error)
    if ((error as any).message?.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "Category name already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Unexpected error creating category" }, { status: 500 })
  }
}
