import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import {
    instagramConnections,
    instagramMessages
} from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, and, desc } from "drizzle-orm"
import { sendInstagramMessage } from "@/lib/meta/instagram"

interface RouteParams {
    params: Promise<{ conversationId: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const d1 = (process.env as any).DB as D1Database
        if (!d1) return NextResponse.json({ error: "DB binding missing" }, { status: 500 })

        const tenantId = await ensureTenantId(request, d1)
        const db = getDb(d1)
        const { conversationId } = await params
        const body = await request.json()
        const { messageText } = body as { messageText: string }

        if (!messageText?.trim()) {
            return NextResponse.json({ error: "messageText is required" }, { status: 400 })
        }

        // Get active connection
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

        // Find the recipient (non-page participant) from existing messages
        const recipientMsg = await db.query.instagramMessages.findFirst({
            where: and(
                eq(instagramMessages.projectId, tenantId),
                eq(instagramMessages.connectionId, connection.id),
                eq(instagramMessages.conversationId, conversationId),
                eq(instagramMessages.isFromPage, false)
            ),
            columns: {
                senderId: true
            }
        })

        if (!recipientMsg) {
            return NextResponse.json({ error: "Could not determine recipient" }, { status: 400 })
        }

        // Send via Instagram API
        const { messageId } = await sendInstagramMessage(
            connection.pageAccessToken,
            connection.pageId,
            recipientMsg.senderId,
            messageText.trim(),
        )

        // Store sent message in D1
        await db.insert(instagramMessages)
            .values({
                projectId: tenantId,
                connectionId: connection.id,
                conversationId: conversationId,
                instagramMessageId: messageId,
                senderId: connection.instagramBusinessAccountId,
                isFromPage: true,
                messageText: messageText.trim(),
                attachments: [],
                sentAt: new Date(),
            })
            .onConflictDoUpdate({
                target: [instagramMessages.connectionId, instagramMessages.instagramMessageId],
                set: {
                    messageText: messageText.trim(),
                }
            })

        return NextResponse.json({ success: true, messageId })
    } catch (error) {
        console.error("[instagram][send] Failed to send message", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to send message" },
            { status: 500 },
        )
    }
}
