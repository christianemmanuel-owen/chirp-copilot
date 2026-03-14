import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { evaluateRateLimit, getClientKey } from "@/lib/rate-limit"
import { getCloudflareContext } from "@/lib/cloudflare/context"
import { checkFeature } from "@/lib/features"
import { getDb } from "@/lib/db"
import { projects } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

// Initialize NextAuth with only the Edge-compatible config for the middleware
const { auth } = NextAuth(authConfig)

// Define admin subdomains or project root names that should not be treated as tenant slugs
const RESERVED_SUBDOMAINS = ["www", "admin", "api", "auth", "chirp-copilot", "chirp-mvp"]

/**
 * Main Middleware Function
 */
export async function middleware(request: NextRequest) {
  // Use auth() as a function to get the session inside the middleware
  // This is the Edge-safe version of auth
  const session = await auth(request)

  const { pathname } = request.nextUrl
  const hostname = request.headers.get("host") || ""
  const { env } = await getCloudflareContext()

  // 1. Resolve tenant from subdomain
  const parts = hostname.split('.')

  let tenantSlug: string | null = null

  // Handle localhost
  if (hostname.includes('localhost') && parts.length > 1) {
    tenantSlug = parts[0]
  }
  // Handle pages.dev
  else if (hostname.endsWith('.pages.dev')) {
    if (parts.length === 4) {
      tenantSlug = parts[0]
    }
  }
  // Handle custom domains
  else if (parts.length > 2) {
    tenantSlug = parts[0]
  }

  // Ensure we don't treat hashes or reserved names as slugs
  if (tenantSlug && (RESERVED_SUBDOMAINS.includes(tenantSlug) || tenantSlug.match(/^[a-f0-9]{8}$/))) {
    tenantSlug = null
  }

  // 2. Inject tenant info into headers
  const requestHeaders = new Headers(request.headers)
  if (tenantSlug) {
    requestHeaders.set("x-tenant-slug", tenantSlug)
  }

  // 3. Auth Redirection
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

  // 4. Auth Protection
  const isAdminPage = pathname.startsWith("/admin")
  const isApiRoute = pathname.startsWith("/api/")

  if (isAdminPage && !session) {
    const loginUrl = new URL("/login", request.url)
    const redirectTarget = `${pathname}${request.nextUrl.search}`
    loginUrl.searchParams.set("redirectTo", redirectTarget)
    return NextResponse.redirect(loginUrl)
  }

  if (isApiRoute && pathname.startsWith("/api/admin") && !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 5. Feature Entitlement & Maintenance Checks
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

  // 6. Rate Limiting for API
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
}

// Ensure both default and named exports exist
export default middleware;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
