import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

/**
 * Debug endpoint to check what Facebook Pages and Instagram accounts are accessible
 * This helps diagnose why no Instagram Business Accounts are found
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const userToken = searchParams.get("token")

    if (!userToken) {
        return NextResponse.json({
            error: "Missing token parameter",
            usage: "Add ?token=YOUR_USER_ACCESS_TOKEN to this URL",
            note: "You can get a temporary token from https://developers.facebook.com/tools/explorer/",
        }, { status: 400 })
    }

    try {
        // Fetch user's Facebook Pages
        const pagesResponse = await fetch(
            `https://graph.facebook.com/v18.0/me/accounts?access_token=${userToken}&fields=name,id,access_token,category,tasks,instagram_business_account`,
            { method: "GET", headers: { Accept: "application/json" } }
        )

        if (!pagesResponse.ok) {
            const errorText = await pagesResponse.text()
            return NextResponse.json({
                error: "Failed to fetch Facebook Pages",
                details: errorText,
                status: pagesResponse.status,
            }, { status: 500 })
        }

        const pagesData = (await pagesResponse.json()) as any
        const pages = pagesData.data || []

        // For each page, try to get Instagram account details
        const results = []
        for (const page of pages) {
            const result: any = {
                pageName: page.name,
                pageId: page.id,
                category: page.category,
                tasks: page.tasks,
                hasAccessToken: !!page.access_token,
                hasInstagramBusinessAccount: !!page.instagram_business_account,
                instagramBusinessAccountId: page.instagram_business_account?.id || null,
            }

            // If there's an Instagram Business Account, fetch its details
            if (page.instagram_business_account?.id && page.access_token) {
                try {
                    const igResponse = await fetch(
                        `https://graph.facebook.com/v18.0/${page.instagram_business_account.id}?access_token=${page.access_token}&fields=id,username,name,profile_picture_url`,
                        { method: "GET", headers: { Accept: "application/json" } }
                    )

                    if (igResponse.ok) {
                        const igData = (await igResponse.json()) as any
                        result.instagramAccount = {
                            id: igData.id,
                            username: igData.username,
                            name: igData.name,
                            profilePictureUrl: igData.profile_picture_url,
                        }
                        result.success = true
                    } else {
                        const errorText = await igResponse.text()
                        result.instagramError = errorText
                        result.success = false
                    }
                } catch (error) {
                    result.instagramError = error instanceof Error ? error.message : String(error)
                    result.success = false
                }
            } else {
                result.success = false
                result.reason = !page.instagram_business_account
                    ? "No Instagram Business Account linked to this Page"
                    : "No page access token available"
            }

            results.push(result)
        }

        return NextResponse.json({
            totalPages: pages.length,
            pagesWithInstagram: results.filter(r => r.hasInstagramBusinessAccount).length,
            successfullyFetched: results.filter(r => r.success).length,
            pages: results,
            diagnosis: {
                issue: results.filter(r => r.success).length === 0
                    ? "No Instagram accounts could be fetched"
                    : null,
                possibleCauses: results.filter(r => r.success).length === 0 ? [
                    "Instagram account is not a Business or Creator account",
                    "Facebook Page doesn't have 'instagram_business_account' field populated",
                    "Missing required permissions (instagram_basic, pages_show_list, etc.)",
                    "App doesn't have access to the Business Portfolio",
                ] : null,
            },
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            error: "Unexpected error",
            details: error instanceof Error ? error.message : String(error),
        }, { status: 500 })
    }
}
