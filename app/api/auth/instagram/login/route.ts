import { NextRequest, NextResponse } from "next/server"
import { INSTAGRAM_RETURN_TO_COOKIE, INSTAGRAM_STATE_COOKIE } from "@/lib/meta/constants"
import { buildOAuthState, getRedirectUri, getRequiredScopes } from "@/lib/meta/instagram"

export async function GET(request: NextRequest) {
  const appId = process.env.FACEBOOK_APP_ID

  if (!appId) {
    console.error("[instagram][login] FACEBOOK_APP_ID is not configured")
    return NextResponse.json({ error: "Instagram integration is not configured" }, { status: 500 })
  }

  const url = new URL(request.url)
  const returnTo = url.searchParams.get("returnTo") || "/admin/settings"
  const redirectUri = getRedirectUri(request.url)
  const state = buildOAuthState()
  const scopes = getRequiredScopes().join(",")

  const authUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth")
  authUrl.searchParams.set("client_id", appId)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("scope", scopes)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("state", state)
  authUrl.searchParams.set("auth_type", "rerequest")
  authUrl.searchParams.set("display", "page")

  const response = NextResponse.redirect(authUrl.toString(), { status: 302 })
  const isProduction = process.env.NODE_ENV === "production"

  // For development with ngrok, we need to be more permissive with cookies
  // The issue: ngrok uses HTTPS but localhost uses HTTP, causing cookie issues
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction,
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  }

  response.cookies.set({
    name: INSTAGRAM_STATE_COOKIE,
    value: state,
    ...cookieOptions,
  })

  response.cookies.set({
    name: INSTAGRAM_RETURN_TO_COOKIE,
    value: returnTo,
    ...cookieOptions,
  })

  console.log("[instagram][login] Setting OAuth cookies", {
    state: state.substring(0, 8) + "...",
    returnTo,
    redirectUri,
    isProduction,
    cookieSecure: cookieOptions.secure,
    authUrl: authUrl.toString().substring(0, 100) + "...",
  })

  return response
}
