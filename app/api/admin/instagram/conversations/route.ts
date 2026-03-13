import { NextRequest, NextResponse } from "next/server"
import { getCloudflareContext } from "@/lib/cloudflare/context"
import { getDb } from "@/lib/db"
import {
    instagramConnections,
    instagramMessages
} from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, and, desc } from "drizzle-orm"


export interface ConversationListItem {
    conversationId: string
    participantId: string
    participantName: string | null
    participantUsername: string | null
    lastMessage: string | null
    lastMessageAt: Date
    unreadCount: number
    isFromPage: boolean
}

export async function GET(request: NextRequest) {
    try {
        const { env } = await getCloudflareContext()
        const d1 = env.DB
        if (!d1) return NextResponse.json({ error: "DB binding missing" }, { status: 500 })

        const tenantId = await ensureTenantId(request, d1)
        const db = getDb(d1)

        // Get active Instagram connection for this project
        const connection = await db.query.instagramConnections.findFirst({
            where: and(
                eq(instagramConnections.projectId, tenantId),
                eq(instagramConnections.status, "connected")
            ),
            orderBy: [desc(instagramConnections.connectedAt)]
        })

        if (!connection) {
            return NextResponse.json({ conversations: [], connected: false })
        }

        // Get all messages for this connection
        const messages = await db.query.instagramMessages.findMany({
            where: and(
                eq(instagramMessages.projectId, tenantId),
                eq(instagramMessages.connectionId, connection.id)
            ),
            orderBy: [desc(instagramMessages.sentAt)]
        })

        // Group by conversation and get latest message + participant info
        const conversationMap = new Map<string, ConversationListItem>()

        for (const msg of messages ?? []) {
            if (conversationMap.has(msg.conversationId)) {
                continue // Already have latest message for this conversation
            }

            // Find participant (the non-page sender)
            let participantId = msg.senderId
            let participantName = msg.senderName
            let participantUsername = msg.senderUsername

            // If this message is from the page, look for customer info in other messages
            if (msg.isFromPage) {
                const customerMsg = messages.find(
                    (m) => m.conversationId === msg.conversationId && !m.isFromPage
                )
                if (customerMsg) {
                    participantId = customerMsg.senderId
                    participantName = customerMsg.senderName
                    participantUsername = customerMsg.senderUsername
                }
            }

            conversationMap.set(msg.conversationId, {
                conversationId: msg.conversationId,
                participantId,
                participantName,
                participantUsername,
                lastMessage: msg.messageText,
                lastMessageAt: msg.sentAt,
                unreadCount: 0,
                isFromPage: msg.isFromPage,
            })
        }

        const conversations = Array.from(conversationMap.values())
            .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())

        return NextResponse.json({
            conversations,
            connected: true,
            connectionId: connection.id,
        })
    } catch (error) {
        console.error("[instagram][conversations] Unexpected error", error)
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
    }
}
