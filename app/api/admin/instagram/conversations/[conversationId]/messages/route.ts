import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import {
    instagramConnections,
    instagramMessages
} from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, and, asc, desc } from "drizzle-orm"

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
    sentAt: Date
}

interface RouteParams {
    params: Promise<{ conversationId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const d1 = (process.env as any).DB as D1Database
        if (!d1) return NextResponse.json({ error: "DB binding missing" }, { status: 500 })

        const tenantId = await ensureTenantId(request, d1)
        const db = getDb(d1)
        const { conversationId } = await params

        if (!conversationId) {
            return NextResponse.json({ error: "conversationId is required" }, { status: 400 })
        }

        // Get active Instagram connection for this project
        const connection = await db.query.instagramConnections.findFirst({
            where: and(
                eq(instagramConnections.projectId, tenantId),
                eq(instagramConnections.status, "connected")
            ),
            orderBy: [desc(instagramConnections.connectedAt)]
        })

        if (!connection) {
            return NextResponse.json({ error: "No Instagram account connected" }, { status: 404 })
        }

        // Fetch messages for this conversation
        const messages = await db.query.instagramMessages.findMany({
            where: and(
                eq(instagramMessages.projectId, tenantId),
                eq(instagramMessages.connectionId, connection.id),
                eq(instagramMessages.conversationId, conversationId)
            ),
            orderBy: [asc(instagramMessages.sentAt)]
        })

        const formattedMessages: MessageItem[] = (messages ?? []).map((msg) => ({
            id: msg.id,
            instagramMessageId: msg.instagramMessageId,
            senderId: msg.senderId,
            senderName: msg.senderName,
            senderUsername: msg.senderUsername,
            isFromPage: msg.isFromPage,
            messageText: msg.messageText,
            attachments: Array.isArray(msg.attachments)
                ? (msg.attachments as any[]).map((att: any) => ({
                    id: att.id as string ?? `att-${msg.id}`,
                    type: att.mime_type as string ?? undefined,
                    url: (att.image_url as string) || (att.file_url as string) || (att.video_url as string) || undefined,
                    mime_type: att.mime_type as string ?? undefined,
                }))
                : [],
            sentAt: msg.sentAt,
        }))

        return NextResponse.json({
            messages: formattedMessages,
            conversationId,
        })
    } catch (error) {
        console.error("[instagram][messages] Unexpected error", error)
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
    }
}
