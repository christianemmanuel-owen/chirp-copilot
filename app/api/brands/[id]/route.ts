import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"

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

    const supabase = getSupabaseServiceRoleClient()
    const { data, error } = await supabase
      .from("brands")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, name")
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Brand not found" }, { status: 404 })
      }
      if (error.code === "23505") {
        return NextResponse.json({ error: "Brand name already exists" }, { status: 409 })
      }
      console.error("[brands][PATCH] Supabase error", error)
      return NextResponse.json({ error: "Failed to update brand" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid brand id") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("[brands][PATCH] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error updating brand" }, { status: 500 })
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await context.params
    const id = parseId(idParam)

    const supabase = getSupabaseServiceRoleClient()
    const { error } = await supabase.from("brands").delete().eq("id", id)

    if (error) {
      console.error("[brands][DELETE] Supabase error", error)
      return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 })
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
