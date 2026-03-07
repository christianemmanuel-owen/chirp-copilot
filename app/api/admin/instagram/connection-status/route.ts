import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"

/**
 * Debug endpoint to check Instagram connection status
 * GET /api/admin/instagram/connection-status
 */
export async function GET(request: NextRequest) {
    const supabase = getSupabaseServiceRoleClient()

    // Check for admin cookie
    const adminAuth = request.cookies.get("admin_auth")?.value
    const isAuthenticated = adminAuth === "1"

    // Get all connections (for debugging)
    const { data: connections, error: connectionError } = await supabase
        .from("instagram_connections")
        .select("*")
        .order("connected_at", { ascending: false })

    if (connectionError) {
        return NextResponse.json({
            error: "Failed to fetch connections",
            details: connectionError.message,
            isAuthenticated,
            adminAuthCookie: adminAuth ?? "not set",
        }, { status: 500 })
    }

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
            instagram_username: c.instagram_username,
            page_name: c.page_name,
            connected_at: c.connected_at,
            instagram_business_account_id: c.instagram_business_account_id,
        })) ?? [],
        activeConnection: activeConnection ? {
            id: activeConnection.id,
            status: activeConnection.status,
            instagram_username: activeConnection.instagram_username,
            page_name: activeConnection.page_name,
        } : null,
    })
}
