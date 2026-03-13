import { NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"

export const runtime = "edge"

export async function GET() {
    const { env } = getRequestContext()
    const diagnostics = {
        timestamp: new Date().toISOString(),
        environment: {
            FACEBOOK_APP_ID: (env as any).FACEBOOK_APP_ID ? "✓ Set" : "✗ Missing",
            FACEBOOK_APP_SECRET: (env as any).FACEBOOK_APP_SECRET ? "✓ Set" : "✗ Missing",
            INSTAGRAM_OAUTH_REDIRECT_URI: (env as any).INSTAGRAM_OAUTH_REDIRECT_URI || "Not set (will use dynamic)",
            INSTAGRAM_REQUIRED_SCOPES: (env as any).INSTAGRAM_REQUIRED_SCOPES || "Using defaults",
            INSTAGRAM_WEBHOOK_VERIFY_TOKEN: (env as any).INSTAGRAM_WEBHOOK_VERIFY_TOKEN ? "✓ Set" : "✗ Missing",
        },
        requiredScopes: [
            "instagram_basic",
            "pages_show_list",
            "pages_manage_metadata",
            "pages_read_engagement",
            "pages_manage_engagement",
            "pages_messaging",
            "instagram_manage_messages",
        ],
        oauthFlow: {
            loginUrl: "/api/auth/instagram/login",
            callbackUrl: "/api/auth/instagram/callback",
            configuredRedirectUri: (env as any).INSTAGRAM_OAUTH_REDIRECT_URI,
        },
        checklist: [
            {
                step: "1. Meta App Created",
                description: "Create a Meta developer app with Instagram Graph API and Messenger API enabled",
                status: (env as any).FACEBOOK_APP_ID ? "✓" : "✗",
            },
            {
                step: "2. Redirect URI Configured",
                description: "Add the redirect URI to Meta App's Valid OAuth Redirect URIs",
                status: (env as any).INSTAGRAM_OAUTH_REDIRECT_URI ? "⚠" : "✗",
                note: (env as any).INSTAGRAM_OAUTH_REDIRECT_URI
                    ? `Ensure ${(env as any).INSTAGRAM_OAUTH_REDIRECT_URI} is added to Meta App settings`
                    : "Will use dynamic URL - ensure it's whitelisted in Meta App",
            },
            {
                step: "3. Instagram Business Account",
                description: "Instagram must be a Business/Creator account linked to a Facebook Page",
                status: "⚠",
                note: "Verify in Instagram app: Settings → Account → Switch to Professional Account",
            },
            {
                step: "4. Facebook Page Connection",
                description: "Instagram Business Account must be connected to a Facebook Page",
                status: "⚠",
                note: "Verify in Facebook Page Settings → Instagram",
            },
            {
                step: "5. App Permissions",
                description: "Meta App must have required permissions approved",
                status: "⚠",
                note: "Check Meta App Dashboard → App Review → Permissions and Features",
            },
        ],
    }

    return NextResponse.json(diagnostics, { status: 200 })
}
