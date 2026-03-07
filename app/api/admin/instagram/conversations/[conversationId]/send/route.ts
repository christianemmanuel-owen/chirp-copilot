import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import { sendInstagramMessage } from "@/lib/meta/instagram"

function ensureAdminAuthenticated(request: NextRequest) {
    const isAuthenticated = request.cookies.get("admin_auth")?.value === "1"
    return isAuthenticated
}

interface RouteParams {
    params: Promise<{ conversationId: string }>
}

/**
 * POST /api/admin/instagram/conversations/[conversationId]/send
 * Sends a message to the participant in this conversation
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
    if (!ensureAdminAuthenticated(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conversationId } = await params
    const body = await request.json()
    const { messageText } = body as { messageText: string }

    if (!messageText?.trim()) {
        return NextResponse.json({ error: "messageText is required" }, { status: 400 })
    }

    const supabase = getSupabaseServiceRoleClient()

    // Get active connection
    const { data: connection, error: connectionError } = await supabase
        .from("instagram_connections")
        .select("*")
        .eq("status", "connected")
        .order("connected_at", { ascending: false })
        .limit(1)
        .maybeSingle()

    if (connectionError || !connection) {
        return NextResponse.json({ error: "No Instagram account connected" }, { status: 404 })
    }

    // Find the recipient (non-page participant) from existing messages
    const { data: recipientMsg, error: recipientError } = await supabase
        .from("instagram_messages")
        .select("sender_id, sender_name, sender_username")
        .eq("connection_id", connection.id)
        .eq("conversation_id", conversationId)
        .eq("is_from_page", false)
        .limit(1)
        .maybeSingle()

    if (recipientError || !recipientMsg) {
        return NextResponse.json({ error: "Could not determine recipient" }, { status: 400 })
    }

    try {
        // Send via Instagram API
        const { messageId } = await sendInstagramMessage(
            connection.page_access_token,
            connection.page_id,
            recipientMsg.sender_id,
            messageText.trim(),
        )

        // Store sent message in Supabase
        await supabase.from("instagram_messages").upsert(
            {
                connection_id: connection.id,
                conversation_id: conversationId,
                instagram_message_id: messageId,
                sender_id: connection.instagram_business_account_id,
                sender_name: null,
                sender_username: null,
                is_from_page: true,
                message_text: messageText.trim(),
                attachments: [],
                sent_at: new Date().toISOString(),
            },
            { onConflict: "connection_id,instagram_message_id", ignoreDuplicates: true },
        )

        return NextResponse.json({ success: true, messageId })
    } catch (error) {
        console.error("[instagram][send] Failed to send message", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to send message" },
            { status: 500 },
        )
    }
}
