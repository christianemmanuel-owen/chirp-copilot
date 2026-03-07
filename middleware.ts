import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { evaluateRateLimit, getClientKey } from "@/lib/rate-limit"

function isAuthenticated(request: NextRequest) {
  return request.cookies.get("admin_auth")?.value === "1"
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApiRoute = pathname.startsWith("/api/")
  const isAdminPage = pathname.startsWith("/admin")
  const authed = isAuthenticated(request)

  if (isAdminPage && !authed) {
    const loginUrl = new URL("/login", request.url)
    const redirectTarget = `${pathname}${request.nextUrl.search}`
    loginUrl.searchParams.set("redirectTo", redirectTarget)
    return NextResponse.redirect(loginUrl)
  }

  if (isApiRoute && pathname.startsWith("/api/admin") && !authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (isApiRoute) {
    const clientKey = getClientKey((request as any).ip, request.headers.get("x-forwarded-for"))
    const { allowed, resetAt } = evaluateRateLimit(clientKey)

    if (allowed) {
      return NextResponse.next()
    }

    const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
    const response = NextResponse.json(
      {
        error: "Too many requests",
        message: "You have sent too many requests. Please try again later.",
      },
      { status: 429 },
    )
    response.headers.set("Retry-After", retryAfterSeconds.toString())
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
}

