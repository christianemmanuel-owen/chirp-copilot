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
    const { data, error } = await supabase.from("brands").select("id, name").order("name", { ascending: true })

    if (error) {
      console.error("[brands][GET] Supabase error", error)
      return NextResponse.json({ error: "Failed to load brands" }, { status: 500 })
    }

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

    const supabase = getSupabaseServiceRoleClient()
    const { data, error } = await supabase
      .from("brands")
      .insert({ name, updated_at: new Date().toISOString() })
      .select("id, name")
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Brand name already exists" }, { status: 409 })
      }
      console.error("[brands][POST] Supabase error", error)
      return NextResponse.json({ error: "Failed to create brand" }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("[brands][POST] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error creating brand" }, { status: 500 })
  }
}
