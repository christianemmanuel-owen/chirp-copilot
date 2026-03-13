import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { instagramConnections } from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, desc } from "drizzle-orm"

/**
 * Debug endpoint to check Instagram connection status
 * GET /api/admin/instagram/connection-status
 */
export async function GET(request: NextRequest) {
    const d1 = (process.env as any).DB as D1Database
    if (!d1) return NextResponse.json({ error: "DB binding missing" }, { status: 500 })

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    // Check for admin cookie (existing auth)
    const adminAuth = request.cookies.get("admin_auth")?.value
    const isAuthenticated = adminAuth === "1"

    // Get all connections for this tenant
    const connections = await db.query.instagramConnections.findMany({
        where: eq(instagramConnections.projectId, tenantId),
        orderBy: [desc(instagramConnections.connectedAt)]
    })

    // Find the active connection
    const activeConnection = connections?.find(c => c.status === "connected")

    return NextResponse.json({
        isAuthenticated,
        adminAuthCookie: adminAuth ?? "not set",
        totalConnections: connections?.length ?? 0,
        hasActiveConnection: !!activeConnection,
        connections: connections?.map(c => ({
            id: c.id,
            status: c.status,
            instagram_username: c.instagramUsername,
            page_name: c.pageName,
            connected_at: c.connectedAt,
            instagram_business_account_id: c.instagramBusinessAccountId,
        })) ?? [],
        activeConnection: activeConnection ? {
            id: activeConnection.id,
            status: activeConnection.status,
            instagram_username: activeConnection.instagramUsername,
            page_name: activeConnection.pageName,
        } : null,
    })
}
