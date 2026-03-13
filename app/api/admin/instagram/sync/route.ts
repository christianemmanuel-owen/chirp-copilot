import { NextRequest, NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb } from "@/lib/db"
import {
    instagramConnections,
    instagramMessages
} from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, and, desc } from "drizzle-orm"
import {
    fetchInstagramConversations,
    fetchConversationMessages,
} from "@/lib/meta/instagram"

export const runtime = "edge"

export async function POST(request: NextRequest) {
    try {
        const { env } = getRequestContext()
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
            return NextResponse.json({ error: "No Instagram account connected" }, { status: 404 })
        }

        // Fetch conversations from Instagram
        const { conversations } = await fetchInstagramConversations(
            connection.pageAccessToken,
            connection.pageId,
            50
        )

        console.log(`[instagram][sync] Found ${conversations.length} conversations`)

        let messagesStored = 0
        let conversationsSynced = 0

        for (const conv of conversations) {
            try {
                const { messages } = await fetchConversationMessages(
                    connection.pageAccessToken,
                    conv.id,
                    100
                )

                for (const msg of messages) {
                    const isFromPage = msg.from.id === connection.instagramBusinessAccountId ||
                        msg.from.id === connection.pageId

                    const attachments = (msg.attachments?.data ?? []).map((att) => ({
                        id: att.id,
                        mime_type: att.mime_type ?? null,
                        name: att.name ?? null,
                        file_url: att.file_url ?? null,
                        image_url: att.image_data?.url ?? null,
                        video_url: att.video_data?.url ?? null,
                    }))

                    // Upsert message using Drizzle
                    // SQLite doesn't have native json types, Drizzle handles serialization for JSON mode
                    await db.insert(instagramMessages)
                        .values({
                            projectId: tenantId,
                            connectionId: connection.id,
                            conversationId: conv.id,
                            instagramMessageId: msg.id,
                            senderId: msg.from.id,
                            senderName: msg.from.name ?? null,
                            senderUsername: msg.from.username ?? null,
                            isFromPage: isFromPage,
                            messageText: msg.message ?? null,
                            attachments: attachments,
                            sentAt: new Date(msg.created_time),
                        })
                        .onConflictDoUpdate({
                            target: [instagramMessages.connectionId, instagramMessages.instagramMessageId],
                            set: {
                                messageText: msg.message ?? null,
                                attachments: attachments,
                                senderName: msg.from.name ?? null,
                                senderUsername: msg.from.username ?? null,
                            }
                        })

                    messagesStored++
                }

                conversationsSynced++
            } catch (convError) {
                console.error(`[instagram][sync] Error processing conversation ${conv.id}`, convError)
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
