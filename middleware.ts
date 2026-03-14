import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Temporarily disabling auth() wrapper to test if it's the cause of the bundling error
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get("host") || ""

  // Define admin subdomains that should not be treated as tenant slugs
  const RESERVED_SUBDOMAINS = ["www", "admin", "api", "auth"]

  // Resolve tenant from subdomain
  const parts = hostname.split('.')
  const tenantSlug = parts.length > 2 || (hostname.includes('localhost') && parts.length > 1) ? parts[0] : null

  // Inject tenant info into headers for API usage
  const requestHeaders = new Headers(request.headers)
  if (tenantSlug && !RESERVED_SUBDOMAINS.includes(tenantSlug)) {
    requestHeaders.set("x-tenant-slug", tenantSlug)
  }

  // Note: We are temporarily skipping auth protection logic here to verify basic routing works.
  // This will help us confirm if the bundling error is caused by the auth() wrapper itself.

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
