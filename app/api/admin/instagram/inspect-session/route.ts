import { NextRequest, NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb } from "@/lib/db"
import {
    instagramOAuthSessions
} from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, and } from "drizzle-orm"

export const runtime = "edge"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("id")

    if (!sessionId) {
        return NextResponse.json({
            error: "Missing session ID",
            usage: "Add ?id=YOUR_SESSION_ID to this URL",
        }, { status: 400 })
    }

    try {
        const { env } = getRequestContext()
        const d1 = env.DB
        if (!d1) return NextResponse.json({ error: "DB binding missing" }, { status: 500 })

        const tenantId = await ensureTenantId(request, d1)
        const db = getDb(d1)

        const session = await db.query.instagramOAuthSessions.findFirst({
            where: and(
                eq(instagramOAuthSessions.id, sessionId),
                eq(instagramOAuthSessions.projectId, tenantId)
            )
        })

        if (!session) {
            return NextResponse.json({
                error: "Session not found",
                sessionId,
            }, { status: 404 })
        }

        // Analyze the session data
        const pages = Array.isArray(session.pages) ? session.pages : []
        const metadata = typeof session.metadata === 'string' ? JSON.parse(session.metadata) : session.metadata
        const analysis = {
            sessionId: session.id,
            createdAt: session.createdAt,
            expiresAt: session.expiresAt,
            consumedAt: session.consumedAt,
            isExpired: session.expiresAt ? new Date(session.expiresAt) < new Date() : false,
            isConsumed: !!session.consumedAt,
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
            scopes: metadata?.scopes || [],
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
        const grantedScopes = metadata?.scopes || []
        const missingScopes = requiredScopes.filter(s => !grantedScopes.includes(s))

        if (missingScopes.length > 0) {
            analysis.diagnosis.possibleIssues.push(
                `Missing required permissions: ${missingScopes.join(", ")}`
            )
        }

        return NextResponse.json(analysis, { status: 200 })

    } catch (error) {
        console.error("[instagram][inspect-session] Unexpected error", error)
        return NextResponse.json({
            error: "Unexpected error",
            details: error instanceof Error ? error.message : String(error),
        }, { status: 500 })
    }
}
