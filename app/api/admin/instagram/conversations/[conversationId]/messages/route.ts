import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"

function ensureAdminAuthenticated(request: NextRequest) {
    const isAuthenticated = request.cookies.get("admin_auth")?.value === "1"
    return isAuthenticated
}

export interface MessageItem {
    id: string
    instagramMessageId: string
    senderId: string
    senderName: string | null
    senderUsername: string | null
    isFromPage: boolean
    messageText: string | null
    attachments: Array<{
        id: string
        type?: string
        url?: string
        mime_type?: string
    }>
    sentAt: string
}

interface RouteParams {
    params: Promise<{ conversationId: string }>
}

/**
 * GET /api/admin/instagram/conversations/[conversationId]/messages
 * Returns messages for a specific conversation
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    if (!ensureAdminAuthenticated(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conversationId } = await params

    if (!conversationId) {
        return NextResponse.json({ error: "conversationId is required" }, { status: 400 })
    }

    const supabase = getSupabaseServiceRoleClient()

    // Get active Instagram connection
    const { data: connection, error: connectionError } = await supabase
        .from("instagram_connections")
        .select("id")
        .eq("status", "connected")
        .order("connected_at", { ascending: false })
        .limit(1)
        .maybeSingle()

    if (connectionError) {
        console.error("[instagram][messages] Failed to fetch connection", connectionError)
        return NextResponse.json({ error: "Failed to fetch Instagram connection" }, { status: 500 })
    }

    if (!connection) {
        return NextResponse.json({ error: "No Instagram account connected" }, { status: 404 })
    }

    // Fetch messages for this conversation
    const { data: messages, error: messagesError } = await supabase
        .from("instagram_messages")
        .select("*")
        .eq("connection_id", connection.id)
        .eq("conversation_id", conversationId)
        .order("sent_at", { ascending: true })

    if (messagesError) {
        console.error("[instagram][messages] Failed to fetch messages", messagesError)
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }

    const formattedMessages: MessageItem[] = (messages ?? []).map((msg) => ({
        id: msg.id,
        instagramMessageId: msg.instagram_message_id,
        senderId: msg.sender_id,
        senderName: msg.sender_name,
        senderUsername: msg.sender_username,
        isFromPage: msg.is_from_page,
        messageText: msg.message_text,
        attachments: Array.isArray(msg.attachments)
            ? msg.attachments.map((att: Record<string, unknown>) => ({
                id: att.id as string ?? `att-${msg.id}`,
                type: att.mime_type as string ?? undefined,
                url: (att.image_url as string) || (att.file_url as string) || (att.video_url as string) || undefined,
                mime_type: att.mime_type as string ?? undefined,
            }))
            : [],
        sentAt: msg.sent_at,
    }))

    return NextResponse.json({
        messages: formattedMessages,
        conversationId,
    })
}
