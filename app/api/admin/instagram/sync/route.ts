import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import {
    fetchInstagramConversations,
    fetchConversationMessages,
} from "@/lib/meta/instagram"

function ensureAdminAuthenticated(request: NextRequest) {
    const isAuthenticated = request.cookies.get("admin_auth")?.value === "1"
    return isAuthenticated
}

/**
 * POST /api/admin/instagram/sync
 * Syncs conversations and messages from Instagram to the database
 */
export async function POST(request: NextRequest) {
    if (!ensureAdminAuthenticated(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseServiceRoleClient()

    // Get active Instagram connection
    const { data: connection, error: connectionError } = await supabase
        .from("instagram_connections")
        .select("*")
        .eq("status", "connected")
        .order("connected_at", { ascending: false })
        .limit(1)
        .maybeSingle()

    if (connectionError) {
        console.error("[instagram][sync] Failed to fetch connection", connectionError)
        return NextResponse.json({ error: "Failed to fetch Instagram connection" }, { status: 500 })
    }

    if (!connection) {
        return NextResponse.json({ error: "No Instagram account connected" }, { status: 404 })
    }

    try {
        // Fetch conversations from Instagram using Page ID (not Instagram Business Account ID)
        // The conversations endpoint works with the Page ID, not the IG account ID
        const { conversations } = await fetchInstagramConversations(
            connection.page_access_token,
            connection.page_id, // Use Page ID, not Instagram Business Account ID
            50
        )

        console.log(`[instagram][sync] Found ${conversations.length} conversations`)

        let messagesStored = 0
        let conversationsSynced = 0

        for (const conv of conversations) {
            try {
                console.log(`[instagram][sync] Processing conversation ${conv.id}`)

                // Fetch messages for this conversation
                const { messages } = await fetchConversationMessages(
                    connection.page_access_token,
                    conv.id,
                    100
                )

                console.log(`[instagram][sync] Conversation ${conv.id}: found ${messages.length} messages`)

                for (const msg of messages) {
                    // Determine if message is from the page
                    const isFromPage = msg.from.id === connection.instagram_business_account_id ||
                        msg.from.id === connection.page_id

                    // Build attachments array
                    const attachments = (msg.attachments?.data ?? []).map((att) => ({
                        id: att.id,
                        mime_type: att.mime_type ?? null,
                        name: att.name ?? null,
                        file_url: att.file_url ?? null,
                        image_url: att.image_data?.url ?? null,
                        video_url: att.video_data?.url ?? null,
                    }))

                    // Upsert message
                    const { error: insertError } = await supabase
                        .from("instagram_messages")
                        .upsert(
                            {
                                connection_id: connection.id,
                                conversation_id: conv.id,
                                instagram_message_id: msg.id,
                                sender_id: msg.from.id,
                                sender_name: msg.from.name ?? null,
                                sender_username: msg.from.username ?? null,
                                is_from_page: isFromPage,
                                message_text: msg.message ?? null,
                                attachments,
                                sent_at: new Date(msg.created_time).toISOString(),
                            },
                            {
                                onConflict: "connection_id,instagram_message_id",
                                ignoreDuplicates: true,
                            }
                        )

                    if (!insertError) {
                        messagesStored++
                    } else {
                        console.error(`[instagram][sync] Failed to store message ${msg.id}`, insertError)
                    }
                }

                conversationsSynced++
            } catch (convError) {
                console.error(`[instagram][sync] Error processing conversation ${conv.id}`, convError)
                // Continue to next conversation
            }
        }

        return NextResponse.json({
            success: true,
            conversationsSynced,
            messagesStored,
        })
    } catch (error) {
        console.error("[instagram][sync] Error syncing conversations", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to sync conversations" },
            { status: 500 }
        )
    }
}
