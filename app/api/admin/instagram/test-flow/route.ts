import { NextResponse } from "next/server"
import { getCloudflareContext } from "@/lib/cloudflare/context"


/**
 * Test endpoint to verify OAuth flow configuration
 * Visit: http://localhost:3000/api/admin/instagram/test-flow
 */
export async function GET() {
    const { env } = await getCloudflareContext()
    const appId = (env as any).FACEBOOK_APP_ID
    const appSecret = (env as any).FACEBOOK_APP_SECRET
    const redirectUri = (env as any).INSTAGRAM_OAUTH_REDIRECT_URI
    const scopes = (env as any).INSTAGRAM_REQUIRED_SCOPES

    const issues: string[] = []
    const warnings: string[] = []

    // Check required environment variables
    if (!appId) {
        issues.push("FACEBOOK_APP_ID is not set in .env")
    } else if (appId.length < 10) {
        warnings.push("FACEBOOK_APP_ID looks too short - verify it's correct")
    }

    if (!appSecret) {
        issues.push("FACEBOOK_APP_SECRET is not set in .env")
    } else if (appSecret.length < 20) {
        warnings.push("FACEBOOK_APP_SECRET looks too short - verify it's correct")
    }

    if (!redirectUri) {
        warnings.push("INSTAGRAM_OAUTH_REDIRECT_URI not set - will use dynamic URL")
    } else {
        // Validate redirect URI format
        try {
            const url = new URL(redirectUri)
            if (url.protocol !== "https:") {
                warnings.push("Redirect URI should use HTTPS in production")
            }
            if (!url.pathname.endsWith("/callback")) {
                warnings.push("Redirect URI should end with /callback")
            }
            if (url.hostname.includes("ngrok") && !url.hostname.includes("ngrok-free.app")) {
                warnings.push("Ngrok URL format looks unusual - verify it's correct")
            }
        } catch (e) {
            issues.push("INSTAGRAM_OAUTH_REDIRECT_URI is not a valid URL")
        }
    }

    // Build the OAuth URL that would be used
    const testRedirectUri = redirectUri || "http://localhost:3000/api/auth/instagram/callback"
    const testScopes = scopes || "instagram_basic,pages_show_list,pages_manage_metadata,pages_read_engagement,pages_manage_engagement,pages_messaging,instagram_manage_messages"

    const authUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth")
    authUrl.searchParams.set("client_id", appId || "YOUR_APP_ID")
    authUrl.searchParams.set("redirect_uri", testRedirectUri)
    authUrl.searchParams.set("scope", testScopes)
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("state", "test-state-123")
    authUrl.searchParams.set("auth_type", "rerequest")
    authUrl.searchParams.set("display", "page")

    const status = issues.length > 0 ? "error" : warnings.length > 0 ? "warning" : "ok"

    return NextResponse.json({
        status,
        timestamp: new Date().toISOString(),
        configuration: {
            appId: appId ? `${appId.substring(0, 4)}...${appId.substring(appId.length - 4)}` : "NOT SET",
            appSecret: appSecret ? "✓ Set (hidden)" : "✗ NOT SET",
            redirectUri: redirectUri || "Not set (will use dynamic)",
            scopes: testScopes.split(","),
        },
        oauthUrl: authUrl.toString(),
        issues,
        warnings,
        nextSteps: issues.length > 0
            ? [
                "Fix the issues listed above in your .env file",
                "Restart your dev server after making changes",
                "Try this test endpoint again"
            ]
            : warnings.length > 0
                ? [
                    "Review the warnings above",
                    "Verify your Meta App settings at https://developers.facebook.com/apps/",
                    "Make sure the redirect URI is added to 'Valid OAuth Redirect URIs'",
                    "Try connecting from /admin/settings"
                ]
                : [
                    "✓ Configuration looks good!",
                    "Make sure the redirect URI is added to Meta App settings",
                    "Go to /admin/settings and click 'Connect Instagram Account'",
                    "If it still doesn't work, check the setup checklist in INSTAGRAM_SETUP_CHECKLIST.md"
                ],
        metaAppDashboard: appId ? `https://developers.facebook.com/apps/${appId}/` : null,
        setupChecklist: "/INSTAGRAM_SETUP_CHECKLIST.md",
    }, {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        }
    })
}
