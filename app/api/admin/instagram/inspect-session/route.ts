import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"

/**
 * Debug endpoint to inspect a specific OAuth session
 * Usage: /api/admin/instagram/inspect-session?id=SESSION_ID
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("id")

    if (!sessionId) {
        return NextResponse.json({
            error: "Missing session ID",
            usage: "Add ?id=YOUR_SESSION_ID to this URL",
            note: "You can get the session ID from the URL after OAuth callback (session=...)",
        }, { status: 400 })
    }

    try {
        const supabase = getSupabaseServiceRoleClient()
        const { data: session, error } = await supabase
            .from("instagram_oauth_sessions")
            .select("*")
            .eq("id", sessionId)
            .maybeSingle()

        if (error) {
            return NextResponse.json({
                error: "Failed to fetch session",
                details: error.message,
            }, { status: 500 })
        }

        if (!session) {
            return NextResponse.json({
                error: "Session not found",
                sessionId,
            }, { status: 404 })
        }

        // Analyze the session data
        const pages = Array.isArray(session.pages) ? session.pages : []
        const analysis = {
            sessionId: session.id,
            createdAt: session.created_at,
            expiresAt: session.expires_at,
            consumedAt: session.consumed_at,
            isExpired: session.expires_at ? new Date(session.expires_at) < new Date() : false,
            isConsumed: !!session.consumed_at,
            totalPages: pages.length,
            pagesWithInstagram: pages.filter((p: any) => p?.instagramBusinessAccountId).length,
            pages: pages.map((page: any) => ({
                pageId: page?.pageId,
                pageName: page?.pageName,
                hasInstagramAccount: !!page?.instagramBusinessAccountId,
                instagramBusinessAccountId: page?.instagramBusinessAccountId,
                instagramUsername: page?.instagramUsername,
                instagramProfileName: page?.instagramProfileName,
                hasPageAccessToken: !!page?.pageAccessToken,
                category: page?.category,
                tasks: page?.tasks,
            })),
            scopes: session.metadata?.scopes || [],
            diagnosis: {
                status: pages.length === 0
                    ? "❌ No Facebook Pages found"
                    : pages.filter((p: any) => p?.instagramBusinessAccountId).length === 0
                        ? "❌ No Instagram Business Accounts found on any Page"
                        : "✓ Instagram Business Account(s) found",
                possibleIssues: [] as string[],
            },
        }

        // Add specific diagnoses
        if (pages.length === 0) {
            analysis.diagnosis.possibleIssues.push(
                "The Facebook account has no Pages, or the app doesn't have permission to access them",
                "Missing 'pages_show_list' permission",
                "User didn't select any Pages during authorization"
            )
        } else if (pages.filter((p: any) => p?.instagramBusinessAccountId).length === 0) {
            analysis.diagnosis.possibleIssues.push(
                "None of the Facebook Pages have an Instagram Business Account linked",
                "Instagram accounts are Personal (not Business/Creator)",
                "Missing 'instagram_basic' permission",
                "App doesn't have access to Instagram accounts in Business Portfolio"
            )
        }

        // Check for missing permissions
        const requiredScopes = [
            "instagram_basic",
            "pages_show_list",
            "pages_manage_metadata",
            "instagram_manage_messages",
            "pages_messaging",
        ]
        const grantedScopes = session.metadata?.scopes || []
        const missingScopes = requiredScopes.filter(s => !grantedScopes.includes(s))

        if (missingScopes.length > 0) {
            analysis.diagnosis.possibleIssues.push(
                `Missing required permissions: ${missingScopes.join(", ")}`
            )
        }

        return NextResponse.json(analysis, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            error: "Unexpected error",
            details: error instanceof Error ? error.message : String(error),
        }, { status: 500 })
    }
}
