import { NextRequest } from "next/server"
import { getCloudflareContext } from "@/lib/cloudflare/context"
import { getAuth } from "@/auth"

/**
 * Lazy Auth API Route Handler
 * Explicitly initializes NextAuth inside the request handler to ensure
 * Cloudflare environment variables (DB, AUTH_SECRET) are available.
 */

export async function GET(request: NextRequest) {
    const { env } = await getCloudflareContext()
    const { handlers } = getAuth(env)
    return (handlers as any).GET(request)
}

export async function POST(request: NextRequest) {
    const { env } = await getCloudflareContext()
    const { handlers } = getAuth(env)
    return (handlers as any).POST(request)
}
