import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"

interface DisconnectPayload {
  connectionId?: string
}

function ensureAdminAuthenticated(request: NextRequest) {
  return request.cookies.get("admin_auth")?.value === "1"
}

export async function POST(request: NextRequest) {
  if (!ensureAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let payload: DisconnectPayload
  try {
    payload = (await request.json()) as DisconnectPayload
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  if (!payload.connectionId) {
    return NextResponse.json({ error: "connectionId is required" }, { status: 400 })
  }

  const supabase = getSupabaseServiceRoleClient()

  const { error } = await supabase
    .from("instagram_connections")
    .delete()
    .eq("id", payload.connectionId)

  if (error) {
    console.error("[instagram][disconnect] Failed to delete connection", error)
    return NextResponse.json({ error: "Failed to disconnect Instagram account" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
