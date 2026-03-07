import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"

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

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await context.params
    const id = parseId(idParam)
    const payload = (await request.json()) as { name?: string | null } | null
    const name = normalizeName(payload?.name)

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    const supabase = getSupabaseServiceRoleClient()
    const { data, error } = await supabase
      .from("categories")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, name")
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Category not found" }, { status: 404 })
      }
      if (error.code === "23505") {
        return NextResponse.json({ error: "Category name already exists" }, { status: 409 })
      }
      console.error("[categories][PATCH] Supabase error", error)
      return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid category id") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("[categories][PATCH] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error updating category" }, { status: 500 })
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await context.params
    const id = parseId(idParam)

    const supabase = getSupabaseServiceRoleClient()
    const { error } = await supabase.from("categories").delete().eq("id", id)

    if (error) {
      console.error("[categories][DELETE] Supabase error", error)
      return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
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
