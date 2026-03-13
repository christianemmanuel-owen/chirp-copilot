import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { evaluateRateLimit, getClientKey } from "@/lib/rate-limit"
import { jwtVerify } from "jose"

// Define admin subdomains that should not be treated as tenant slugs
const RESERVED_SUBDOMAINS = ["www", "admin", "api", "auth"]

/**
 * Manually decode the NextAuth.js session JWT from cookies.
 * This avoids importing anything from next-auth, which pulls in
 * @auth/core and its async_hooks dependency (unsupported on Cloudflare Edge).
 */
async function getSessionFromCookie(request: NextRequest) {
  const secret = process.env.AUTH_SECRET
  if (!secret) return null

  // NextAuth v5 uses these cookie names
  const cookieName =
    request.nextUrl.protocol === "https:"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token"

  const token = request.cookies.get(cookieName)?.value
  if (!token) return null

  try {
    const secretKey = new TextEncoder().encode(secret)
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    })
    return {
      user: {
        id: payload.sub,
        projects: (payload as any).projects || [],
      },
    }
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get("host") || ""

  // Resolve tenant from subdomain
  const parts = hostname.split(".")
  const tenantSlug =
    parts.length > 2 || (hostname.includes("localhost") && parts.length > 1)
      ? parts[0]
      : null

  const isApiRoute = pathname.startsWith("/api/")
  const isAdminPage = pathname.startsWith("/admin")
  const isLoginPage = pathname === "/login" || pathname === "/signup"

  // Decode session from JWT cookie — no next-auth import needed
  const session = await getSessionFromCookie(request)

  // Inject tenant info into headers for API usage
  const requestHeaders = new Headers(request.headers)
  if (tenantSlug && !RESERVED_SUBDOMAINS.includes(tenantSlug)) {
    requestHeaders.set("x-tenant-slug", tenantSlug)
  }

  // Redirect authenticated users away from login/signup to their project
  if (isLoginPage && session) {
    const userProjects = (session.user as any)?.projects || []
    if (userProjects.length > 0) {
      const firstProjectSlug = userProjects[0].slug
      const targetHost = hostname.replace(tenantSlug || "www", firstProjectSlug)
      return NextResponse.redirect(new URL("/admin", `https://${targetHost}`))
    }
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  // Protect Admin Pages
  if (isAdminPage && !session) {
    const loginUrl = new URL("/login", request.url)
    const redirectTarget = `${pathname}${request.nextUrl.search}`
    loginUrl.searchParams.set("redirectTo", redirectTarget)
    return NextResponse.redirect(loginUrl)
  }

  // Ensure Admin is on the correct subdomain for their project
  if (
    isAdminPage &&
    session &&
    tenantSlug &&
    !RESERVED_SUBDOMAINS.includes(tenantSlug)
  ) {
    const userProjects = (session.user as any)?.projects || []
    const hasAccess = userProjects.some((p: any) => p.slug === tenantSlug)
    if (!hasAccess) {
      return new NextResponse(
        "Forbidden: You do not have access to this project",
        { status: 403 }
      )
    }
  }

  // Protect Admin API Routes
  if (isApiRoute && pathname.startsWith("/api/admin") && !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Rate Limiting for API
  if (isApiRoute) {
    const clientKey = getClientKey(
      (request as any).ip,
      request.headers.get("x-forwarded-for")
    )
    const { allowed, resetAt } = evaluateRateLimit(clientKey)

    if (allowed) {
      return NextResponse.next({
        request: { headers: requestHeaders },
      })
    }

    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((resetAt - Date.now()) / 1000)
    )
    const response = NextResponse.json(
      {
        error: "Too many requests",
        message: "You have sent too many requests. Please try again later.",
      },
      { status: 429 }
    )
    response.headers.set("Retry-After", retryAfterSeconds.toString())
    return response
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
