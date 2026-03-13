import { NextRequest, NextResponse } from "next/server"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { INSTAGRAM_RETURN_TO_COOKIE, INSTAGRAM_STATE_COOKIE } from "@/lib/meta/constants"
import { exchangeCodeForLongLivedToken, fetchInstagramPageCandidates, getRedirectUri } from "@/lib/meta/instagram"
import { getDb } from "@/lib/db"
import { instagramOAuthSessions } from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"


function sanitizeReturnTo(returnTo: string | null | undefined, fallback: string, origin: string) {
  if (!returnTo) {
    return new URL(fallback, origin).toString()
  }

  try {
    const url = new URL(returnTo, origin)
    if (!url.pathname.startsWith("/admin")) {
      return new URL(fallback, origin).toString()
    }
    return url.toString()
  } catch {
    return new URL(fallback, origin).toString()
  }
}

function buildRedirectResponse(
  origin: string,
  target: string,
  params: Record<string, string | undefined>,
  cookiesToClear: Array<{ name: string; secure: boolean }>,
) {
  const redirectUrl = new URL(target, origin)
  const searchParams = new URLSearchParams(redirectUrl.search)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.set(key, value)
    }
  }
  redirectUrl.search = searchParams.toString()

  const response = NextResponse.redirect(redirectUrl.toString(), { status: 302 })
  for (const cookie of cookiesToClear) {
    response.cookies.set({
      name: cookie.name,
      value: "",
      path: "/",
      secure: cookie.secure,
      sameSite: "lax",
      maxAge: 0,
    })
  }
  return response
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const stateParam = url.searchParams.get("state")
  const errorParam = url.searchParams.get("error")
  const errorDescription = url.searchParams.get("error_description")

  const { env } = await getCloudflareContext()
  const stateCookie = request.cookies.get(INSTAGRAM_STATE_COOKIE)?.value
  const returnToCookie = request.cookies.get(INSTAGRAM_RETURN_TO_COOKIE)?.value
  const isProduction = process.env.NODE_ENV === "production"

  // Use the configured redirect URI's origin to avoid localhost HTTPS issues
  const configuredRedirectUri = (env as any).INSTAGRAM_OAUTH_REDIRECT_URI
  let origin = `${url.protocol}//${url.host}`

  if (configuredRedirectUri) {
    try {
      const redirectUrl = new URL(configuredRedirectUri)
      origin = `${redirectUrl.protocol}//${redirectUrl.host}`
      console.log("[instagram][callback] Using configured origin for redirects:", origin)
    } catch (error) {
      console.warn("[instagram][callback] Failed to parse INSTAGRAM_OAUTH_REDIRECT_URI, using request origin")
    }
  }

  const sanitizedReturnTo = sanitizeReturnTo(returnToCookie, "/admin/settings", origin)

  if (errorParam) {
    console.error("[instagram][callback] User aborted or error from Meta", { errorParam, errorDescription })
    return buildRedirectResponse(
      origin,
      sanitizedReturnTo,
      {
        status: "error",
        reason: errorParam,
        message: errorDescription ?? "Instagram authorization was cancelled.",
      },
      [
        { name: INSTAGRAM_STATE_COOKIE, secure: isProduction },
        { name: INSTAGRAM_RETURN_TO_COOKIE, secure: isProduction },
      ],
    )
  }

  if (!code || !stateParam || !stateCookie || stateCookie !== stateParam) {
    console.error("[instagram][callback] Invalid OAuth state", {
      codePresent: Boolean(code),
      stateParam,
      stateCookie,
      stateMatch: stateCookie === stateParam,
      requestUrl: request.url,
      requestProtocol: url.protocol,
      requestHost: url.host,
      cookiesReceived: request.cookies.getAll().map(c => c.name),
      isProduction,
    })

    // Provide more specific error message
    let errorMessage = "Instagram authorization failed due to an invalid session. Please try again."
    if (!stateCookie) {
      errorMessage = "Session cookie was lost during redirect. This usually happens when accessing via different protocols (HTTP vs HTTPS). Try accessing your app via the ngrok URL directly."
    } else if (stateCookie !== stateParam) {
      errorMessage = "Session state mismatch. Please clear your cookies and try again."
    }

    return buildRedirectResponse(
      origin,
      sanitizedReturnTo,
      {
        status: "error",
        reason: "invalid_state",
        message: errorMessage,
      },
      [
        { name: INSTAGRAM_STATE_COOKIE, secure: isProduction },
        { name: INSTAGRAM_RETURN_TO_COOKIE, secure: isProduction },
      ],
    )
  }

  try {
    const redirectUri = getRedirectUri(request.url)
    const { longLivedToken, expiresAt, scopes } = await exchangeCodeForLongLivedToken({ code, redirectUri })
    const pageCandidates = await fetchInstagramPageCandidates(longLivedToken)

    const d1 = env.DB
    if (!d1) throw new Error("DB binding missing")
    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    const [session] = await db.insert(instagramOAuthSessions)
      .values({
        projectId: tenantId,
        state: stateParam,
        longLivedUserToken: longLivedToken,
        longLivedUserTokenExpiresAt: expiresAt ? new Date(expiresAt) : null,
        pages: pageCandidates,
        expiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 mins expiry for the session
        metadata: {
          scopes,
        },
      })
      .returning()

    if (!session) {
      throw new Error("Failed to persist OAuth session")
    }

    return buildRedirectResponse(
      origin,
      sanitizedReturnTo,
      {
        status: pageCandidates.length > 0 ? "pending" : "no_pages",
        session: session.id,
        message:
          pageCandidates.length > 0
            ? undefined
            : "No Instagram Business Accounts were found on the selected Facebook Pages.",
      },
      [
        { name: INSTAGRAM_STATE_COOKIE, secure: isProduction },
        { name: INSTAGRAM_RETURN_TO_COOKIE, secure: isProduction },
      ],
    )
  } catch (error) {
    console.error("[instagram][callback] Unexpected error", error)
    return buildRedirectResponse(
      origin,
      sanitizedReturnTo,
      {
        status: "error",
        reason: "exchange_failed",
        message: "Failed to complete Instagram authorization. Please try again.",
      },
      [
        { name: INSTAGRAM_STATE_COOKIE, secure: isProduction },
        { name: INSTAGRAM_RETURN_TO_COOKIE, secure: isProduction },
      ],
    )
  }
}
