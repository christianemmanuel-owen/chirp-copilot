import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"

function ensureAdminAuthenticated(request: NextRequest) {
    const isAuthenticated = request.cookies.get("admin_auth")?.value === "1"
    return isAuthenticated
}

export interface ConversationListItem {
    conversationId: string
    participantId: string
    participantName: string | null
    participantUsername: string | null
    lastMessage: string | null
    lastMessageAt: string
    unreadCount: number
    isFromPage: boolean
}

/**
 * GET /api/admin/instagram/conversations
 * Returns a list of conversations with latest message info
 */
export async function GET(request: NextRequest) {
    if (!ensureAdminAuthenticated(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseServiceRoleClient()

    // Get active Instagram connection
    const { data: connection, error: connectionError } = await supabase
        .from("instagram_connections")
        .select("id, instagram_business_account_id")
        .eq("status", "connected")
        .order("connected_at", { ascending: false })
        .limit(1)
        .maybeSingle()

    if (connectionError) {
        console.error("[instagram][conversations] Failed to fetch connection", connectionError)
        return NextResponse.json({ error: "Failed to fetch Instagram connection" }, { status: 500 })
    }

    if (!connection) {
        return NextResponse.json({ conversations: [], connected: false })
    }

    // Get distinct conversations with latest message
    // Using a subquery approach to get the latest message per conversation
    const { data: messages, error: messagesError } = await supabase
        .from("instagram_messages")
        .select("*")
        .eq("connection_id", connection.id)
        .order("sent_at", { ascending: false })

    if (messagesError) {
        console.error("[instagram][conversations] Failed to fetch messages", messagesError)
        return NextResponse.json({
            error: "Failed to fetch conversations",
            details: messagesError.message,
            code: messagesError.code,
            hint: messagesError.hint,
        }, { status: 500 })
    }

    // Group by conversation and get latest message + participant info
    const conversationMap = new Map<string, ConversationListItem>()

    for (const msg of messages ?? []) {
        if (conversationMap.has(msg.conversation_id)) {
            continue // Already have latest message for this conversation
        }

        // Find participant (the non-page sender)
        let participantId = msg.sender_id
        let participantName = msg.sender_name
        let participantUsername = msg.sender_username

        // If this message is from the page, look for customer info in other messages
        if (msg.is_from_page) {
            const customerMsg = (messages ?? []).find(
                (m) => m.conversation_id === msg.conversation_id && !m.is_from_page
            )
            if (customerMsg) {
                participantId = customerMsg.sender_id
                participantName = customerMsg.sender_name
                participantUsername = customerMsg.sender_username
            }
        }

        conversationMap.set(msg.conversation_id, {
            conversationId: msg.conversation_id,
            participantId,
            participantName,
            participantUsername,
            lastMessage: msg.message_text,
            lastMessageAt: msg.sent_at,
            unreadCount: 0, // TODO: Implement read tracking
            isFromPage: msg.is_from_page,
        })
    }

    const conversations = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())

    return NextResponse.json({
        conversations,
        connected: true,
        connectionId: connection.id,
    })
}
