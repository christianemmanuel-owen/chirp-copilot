import { NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb } from "@/lib/db"
import { brands as brandsSchema } from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, and } from "drizzle-orm"

export const runtime = "edge"

function parseId(value: string) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    throw new Error("Invalid brand id")
  }
  return numeric
}

function normalizeName(value: unknown): string {
  if (typeof value !== "string") return ""
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : ""
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await context.params
    const id = parseId(idParam)
    const payload = (await request.json()) as { name?: string | null } | null
    const name = normalizeName(payload?.name)

    if (!name) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 })
    }

    const { env } = getRequestContext()
    const d1 = env.DB
    if (!d1) {
      return NextResponse.json({ error: "Database binding not found" }, { status: 500 })
    }

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    // Ensure the brand belongs to this project
    const brand = await db.query.brands.findFirst({
      where: and(
        eq(brandsSchema.id, id),
        eq(brandsSchema.projectId, tenantId)
      )
    })

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    // Check for collision with another brand in the same project
    const collision = await db.query.brands.findFirst({
      where: and(
        eq(brandsSchema.projectId, tenantId),
        eq(brandsSchema.name, name)
      )
    })

    if (collision && collision.id !== id) {
      return NextResponse.json({ error: "Brand name already exists" }, { status: 409 })
    }

    const [updated] = await db.update(brandsSchema)
      .set({ name, updatedAt: new Date() })
      .where(and(eq(brandsSchema.id, id), eq(brandsSchema.projectId, tenantId)))
      .returning({ id: brandsSchema.id, name: brandsSchema.name })

    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid brand id") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("[brands][PATCH] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error updating brand" }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await context.params
    const id = parseId(idParam)

    const { env } = getRequestContext()
    const d1 = env.DB
    if (!d1) {
      return NextResponse.json({ error: "Database binding not found" }, { status: 500 })
    }

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const result = await db.delete(brandsSchema)
      .where(and(eq(brandsSchema.id, id), eq(brandsSchema.projectId, tenantId)))
      .returning()

    if (result.length === 0) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid brand id") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("[brands][DELETE] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error deleting brand" }, { status: 500 })
  }
}
