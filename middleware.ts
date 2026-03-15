import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { evaluateRateLimit, getClientKey } from "@/lib/rate-limit"
import { getCloudflareContext } from "@/lib/cloudflare/context"
import { checkFeature } from "@/lib/features"
import { getDb } from "@/lib/db"
import { projects } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getAuth } from "@/auth"

// Define admin subdomains or project root names that should not be treated as tenant slugs
const RESERVED_SUBDOMAINS = ["www", "admin", "api", "auth", "my", "chirp-copilot", "chirp-mvp"]

/**
 * Main Middleware Handler
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get("host") || ""

  // --- 1. ROBUST ASSET GUARD ---
  // Return immediately for any static file request. 
  if (
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico") ||
    pathname.includes("robots.txt") ||
    (pathname.includes(".") && !pathname.startsWith("/api"))
  ) {
    return NextResponse.next();
  }

  // --- 2. CONTEXT & AUTH ---
  const { env } = await getCloudflareContext()
  const { auth } = getAuth(env, hostname)

  // Wrap the logic in the auth handler
  return auth(async (req: any) => {
    const session = req.auth

    // A. Resolve tenant from hostname or pathname
    const parts = hostname.split('.')
    let tenantSlug: string | null = null

    // 1. Handle "my.chirpcopilot.com/[tenant]" (Admin)
    if (hostname === "my.chirpcopilot.com" || hostname.startsWith("my.localhost")) {
      const pathParts = pathname.split('/')
      if (pathParts[1] && !RESERVED_SUBDOMAINS.includes(pathParts[1])) {
        tenantSlug = pathParts[1]
      }
    }
    // 2. Handle "[tenant].chirpcopilot.com" (Storefront)
    else if (hostname.includes('localhost') && parts.length > 1) {
      tenantSlug = parts[0]
    } else if (hostname.endsWith('.pages.dev')) {
      if (parts.length === 4) {
        tenantSlug = parts[0]
      }
    } else if (parts.length > 2) {
      // Standard custom subdomain: [tenant].chirpcopilot.com
      const sub = parts[0]
      if (!RESERVED_SUBDOMAINS.includes(sub)) {
        tenantSlug = sub
      }
    }

    // --- NEW: Query Param Fallback for testing ---
    const qTenant = request.nextUrl.searchParams.get("tenant") || request.nextUrl.searchParams.get("store")
    if (qTenant) {
      tenantSlug = qTenant
    }

    if (tenantSlug && (RESERVED_SUBDOMAINS.includes(tenantSlug) || tenantSlug.match(/^[a-f0-9]{8}$/))) {
      tenantSlug = null
    }

    const requestHeaders = new Headers(request.headers)
    if (tenantSlug) {
      requestHeaders.set("x-tenant-slug", tenantSlug)
    }

    // --- NEW: Path Rewrite for Admin (my.domain.com/tenant/admin -> /admin) ---
    if (hostname.startsWith("my.") && tenantSlug && pathname.startsWith(`/${tenantSlug}`)) {
      const newPath = pathname.replace(`/${tenantSlug}`, "") || "/"
      const url = request.nextUrl.clone()
      url.pathname = newPath
      return NextResponse.rewrite(url, {
        request: {
          headers: requestHeaders
        }
      })
    }

    // B. Auth Redirection
    const isLoginPage = pathname === "/login" || pathname === "/signup"
    if (isLoginPage && session) {
      const userProjects = (session.user as any)?.projects || []
      if (userProjects.length > 0) {
        const firstProjectSlug = userProjects[0].slug
        const targetHost = hostname.replace(tenantSlug || "www", firstProjectSlug)
        return NextResponse.redirect(new URL("/admin", `https://${targetHost}`))
      }
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    // C. Auth Protection
    const isAdminPage = pathname.startsWith("/admin")
    const isApiRoute = pathname.startsWith("/api/")

    if (isAdminPage && !session) {
      const loginUrl = new URL("/login", request.url)
      const redirectTarget = `${pathname}${request.nextUrl.search}`
      loginUrl.searchParams.set("redirectTo", redirectTarget)
      return NextResponse.redirect(loginUrl)
    }

    if (isApiRoute && pathname.startsWith("/api/admin") && !session) {
      // Allow auth routes to proceed
      if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // D. Feature Entitlement & Maintenance Checks
    if (tenantSlug) {
      const isOmnichannelRoute = pathname.startsWith("/admin/messages") || pathname.startsWith("/api/admin/instagram")

      if (isOmnichannelRoute) {
        const db = getDb(env.DB)
        const project = await db.query.projects.findFirst({
          where: eq(projects.slug, tenantSlug)
        })

        if (project) {
          const status = await checkFeature(env.DB, project.id, "omnichannel")
          if (!status.isEnabled) {
            if (isApiRoute) {
              return NextResponse.json({
                error: "Feature Disabled",
                reason: status.reason,
                message: status.message
              }, { status: 403 })
            }
            return new NextResponse(status.message, { status: 403 })
          }
        }
      }
    }

    // E. Rate Limiting for API
    if (isApiRoute) {
      const clientKey = getClientKey((request as any).ip, request.headers.get("x-forwarded-for"))
      const { allowed, resetAt } = evaluateRateLimit(clientKey)

      if (!allowed) {
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
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  })(request, {} as any)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
