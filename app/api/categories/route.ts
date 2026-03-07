import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"

function normalizeName(value: unknown): string {
  if (typeof value !== "string") return ""
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : ""
}

export async function GET() {
  try {
    const supabase = getSupabaseServiceRoleClient()
    const { data, error } = await supabase.from("categories").select("id, name").order("name", { ascending: true })

    if (error) {
      console.error("[categories][GET] Supabase error", error)
      return NextResponse.json({ error: "Failed to load categories" }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [] })
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

    const supabase = getSupabaseServiceRoleClient()
    const { data, error } = await supabase
      .from("categories")
      .insert({ name, updated_at: new Date().toISOString() })
      .select("id, name")
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Category name already exists" }, { status: 409 })
      }
      console.error("[categories][POST] Supabase error", error)
      return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("[categories][POST] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error creating category" }, { status: 500 })
  }
}
