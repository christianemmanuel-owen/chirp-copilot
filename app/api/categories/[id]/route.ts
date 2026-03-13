import { NextRequest, NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb } from "@/lib/db"
import { categories } from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, and } from "drizzle-orm"

export const runtime = "edge"

function parseId(value: string) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    throw new Error("Invalid category id")
  }
  return numeric
}

function normalizeName(value: unknown): string {
  if (typeof value !== "string") return ""
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : ""
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await context.params
    const id = parseId(idParam)
    const payload = (await request.json()) as { name?: string | null } | null
    const name = normalizeName(payload?.name)

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    const { env } = getRequestContext()
    const d1 = env.DB
    if (!d1) return NextResponse.json({ error: "DB binding missing" }, { status: 500 })

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    // Check if category exists and belongs to this project
    const existing = await db.query.categories.findFirst({
      where: and(
        eq(categories.id, id),
        eq(categories.projectId, tenantId)
      )
    })

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Check for collision
    const collision = await db.query.categories.findFirst({
      where: and(
        eq(categories.name, name),
        eq(categories.projectId, tenantId)
      )
    })

    if (collision && collision.id !== id) {
      return NextResponse.json({ error: "Category name already exists" }, { status: 409 })
    }

    const [updated] = await db.update(categories)
      .set({ name, updatedAt: new Date() })
      .where(and(eq(categories.id, id), eq(categories.projectId, tenantId)))
      .returning()

    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid category id") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("[categories][PATCH] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error updating category" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await context.params
    const id = parseId(idParam)

    const { env } = getRequestContext()
    const d1 = env.DB
    if (!d1) return NextResponse.json({ error: "DB binding missing" }, { status: 500 })

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const result = await db.delete(categories)
      .where(and(eq(categories.id, id), eq(categories.projectId, tenantId)))
      .returning()

    if (result.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid category id") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("[categories][DELETE] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error deleting category" }, { status: 500 })
  }
}
