import { NextRequest, NextResponse } from "next/server"
import { INSTAGRAM_RETURN_TO_COOKIE, INSTAGRAM_STATE_COOKIE } from "@/lib/meta/constants"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"

interface FinalizeRequestBody {
  sessionId?: string
  pageId?: string
}

function ensureAdminAuthenticated(request: NextRequest) {
  const isAuthenticated = request.cookies.get("admin_auth")?.value === "1"
  if (!isAuthenticated) {
    return false
  }
  return true
}

export async function POST(request: NextRequest) {
  if (!ensureAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let payload: FinalizeRequestBody
  try {
    payload = (await request.json()) as FinalizeRequestBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  if (!payload.sessionId || !payload.pageId) {
    return NextResponse.json({ error: "sessionId and pageId are required" }, { status: 400 })
  }

  const supabase = getSupabaseServiceRoleClient()
  const { data: session, error: sessionError } = await supabase
    .from("instagram_oauth_sessions")
    .select("*")
    .eq("id", payload.sessionId)
    .maybeSingle()

  if (sessionError) {
    console.error("[instagram][finalize] Failed to load session", sessionError)
    return NextResponse.json({ error: "Failed to load Instagram authorization session" }, { status: 500 })
  }

  if (!session) {
    return NextResponse.json({ error: "Session not found or already consumed" }, { status: 404 })
  }

  if (session.consumed_at) {
    return NextResponse.json({ error: "Session already consumed" }, { status: 409 })
  }

  if (session.expires_at && new Date(session.expires_at) < new Date()) {
    return NextResponse.json({ error: "Session has expired" }, { status: 410 })
  }

  const pages = Array.isArray(session.pages) ? session.pages : []
  const selectedPage = pages.find((page: any) => page?.pageId === payload.pageId)

  if (!selectedPage) {
    return NextResponse.json({ error: "Selected page is not part of the authorization session" }, { status: 400 })
  }

  if (!selectedPage.pageAccessToken || !selectedPage.instagramBusinessAccountId) {
    return NextResponse.json({ error: "Selected page is missing Instagram credentials" }, { status: 400 })
  }

  const { data: existingConnection, error: fetchConnectionError } = await supabase
    .from("instagram_connections")
    .select("*")
    .eq("page_id", selectedPage.pageId)
    .maybeSingle()

  if (fetchConnectionError) {
    console.error("[instagram][finalize] Failed to load existing connection", fetchConnectionError)
    return NextResponse.json({ error: "Failed to verify existing Instagram connection" }, { status: 500 })
  }

  const nowIso = new Date().toISOString()
  const connectionPayload = {
    page_id: selectedPage.pageId,
    page_name: selectedPage.pageName ?? null,
    page_access_token: selectedPage.pageAccessToken,
    instagram_business_account_id: selectedPage.instagramBusinessAccountId,
    instagram_username: selectedPage.instagramUsername ?? null,
    user_access_token: session.long_lived_user_token,
    user_access_token_expires_at: session.long_lived_user_token_expires_at ?? null,
    scopes: Array.isArray(session.metadata?.scopes) ? session.metadata.scopes : [],
    status: "connected",
    metadata: {
      page_tasks: selectedPage.tasks ?? null,
      page_category: selectedPage.category ?? null,
      instagram_profile_name: selectedPage.instagramProfileName ?? null,
      instagram_profile_picture_url: selectedPage.instagramProfilePictureUrl ?? null,
      connected_via_session: session.id,
    },
  }

  let connectionId: string | null = existingConnection?.id ?? null

  if (existingConnection) {
    const { error: updateError } = await supabase
      .from("instagram_connections")
      .update({
        ...connectionPayload,
        connected_at: existingConnection.connected_at,
      })
      .eq("id", existingConnection.id)

    if (updateError) {
      console.error("[instagram][finalize] Failed to update connection", updateError)
      return NextResponse.json({ error: "Failed to update Instagram connection" }, { status: 500 })
    }
  } else {
    const { data: insertedConnection, error: insertError } = await supabase
      .from("instagram_connections")
      .insert({
        ...connectionPayload,
        connected_at: nowIso,
      })
      .select("id")
      .single()

    if (insertError || !insertedConnection) {
      console.error("[instagram][finalize] Failed to create connection", insertError)
      return NextResponse.json({ error: "Failed to create Instagram connection" }, { status: 500 })
    }

    connectionId = insertedConnection.id
  }

  const { error: consumeError } = await supabase
    .from("instagram_oauth_sessions")
    .update({
      consumed_at: nowIso,
      metadata: {
        ...(session.metadata ?? {}),
        selected_page_id: selectedPage.pageId,
        connection_id: connectionId,
      },
    })
    .eq("id", session.id)

  if (consumeError) {
    console.error("[instagram][finalize] Failed to mark session consumed", consumeError)
    return NextResponse.json({ error: "Failed to finalize Instagram authorization session" }, { status: 500 })
  }

  const response = NextResponse.json({ success: true })
  const isProduction = process.env.NODE_ENV === "production"

  response.cookies.set({
    name: INSTAGRAM_STATE_COOKIE,
    value: "",
    path: "/",
    secure: isProduction,
    sameSite: "lax",
    maxAge: 0,
  })

  response.cookies.set({
    name: INSTAGRAM_RETURN_TO_COOKIE,
    value: "",
    path: "/",
    secure: isProduction,
    sameSite: "lax",
    maxAge: 0,
  })

  return response
}
