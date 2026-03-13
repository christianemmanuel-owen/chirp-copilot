import { NextRequest, NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { INSTAGRAM_RETURN_TO_COOKIE, INSTAGRAM_STATE_COOKIE } from "@/lib/meta/constants"
import { getDb } from "@/lib/db"
import { instagramConnections, instagramOAuthSessions } from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { and, eq } from "drizzle-orm"

export const runtime = "edge"

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

  const { env } = getRequestContext()
  const d1 = env.DB
  if (!d1) return NextResponse.json({ error: "DB binding missing" }, { status: 500 })

  const tenantId = await ensureTenantId(request, d1)
  const db = getDb(d1)

  const supabase = null // Supabase removed

  const session = await db.query.instagramOAuthSessions.findFirst({
    where: and(
      eq(instagramOAuthSessions.id, payload.sessionId),
      eq(instagramOAuthSessions.projectId, tenantId)
    )
  })

  if (!session) {
    return NextResponse.json({ error: "Session not found or not owned by project" }, { status: 404 })
  }

  if (session.consumedAt) {
    return NextResponse.json({ error: "Session already consumed" }, { status: 409 })
  }

  if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Session has expired" }, { status: 410 })
  }

  const pages = Array.isArray(session.pages) ? session.pages : (typeof session.pages === 'string' ? JSON.parse(session.pages) : [])
  const selectedPage = (pages as any[]).find((page: any) => page?.pageId === payload.pageId)

  if (!selectedPage) {
    return NextResponse.json({ error: "Selected page is not part of the authorization session" }, { status: 400 })
  }

  if (!selectedPage.pageAccessToken || !selectedPage.instagramBusinessAccountId) {
    return NextResponse.json({ error: "Selected page is missing Instagram credentials" }, { status: 400 })
  }

  const existingConnection = await db.query.instagramConnections.findFirst({
    where: and(
      eq(instagramConnections.pageId, selectedPage.pageId),
      eq(instagramConnections.projectId, tenantId)
    )
  })

  const now = new Date()
  const sessionMetadata = typeof session.metadata === 'string' ? JSON.parse(session.metadata) : session.metadata

  const connectionPayload = {
    projectId: tenantId,
    pageId: selectedPage.pageId,
    pageName: selectedPage.pageName ?? null,
    pageAccessToken: selectedPage.pageAccessToken,
    instagramBusinessAccountId: selectedPage.instagramBusinessAccountId,
    instagramUsername: selectedPage.instagramUsername ?? null,
    userAccessToken: session.longLivedUserToken,
    userAccessTokenExpiresAt: session.longLivedUserTokenExpiresAt ?? null,
    scopes: sessionMetadata?.scopes ?? [],
    status: "connected",
    metadata: {
      page_tasks: selectedPage.tasks ?? null,
      page_category: selectedPage.category ?? null,
      instagram_profile_name: selectedPage.instagramProfileName ?? null,
      instagram_profile_picture_url: selectedPage.instagramProfilePictureUrl ?? null,
      connected_via_session: session.id,
    },
    updatedAt: now
  }

  let connectionId: string

  if (existingConnection) {
    await db.update(instagramConnections)
      .set(connectionPayload)
      .where(eq(instagramConnections.id, existingConnection.id))
    connectionId = existingConnection.id
  } else {
    const [inserted] = await db.insert(instagramConnections)
      .values({
        ...connectionPayload,
        connectedAt: now
      })
      .returning({ id: instagramConnections.id })
    connectionId = inserted.id
  }

  await db.update(instagramOAuthSessions)
    .set({
      consumedAt: now,
      metadata: {
        ...(sessionMetadata ?? {}),
        selected_page_id: selectedPage.pageId,
        connection_id: connectionId,
      },
      updatedAt: now
    })
    .where(eq(instagramOAuthSessions.id, session.id))

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
