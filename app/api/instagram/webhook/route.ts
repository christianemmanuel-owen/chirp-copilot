import crypto from "node:crypto"
import { NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb } from "@/lib/db"
import { instagramConnections, instagramMessages } from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, and } from "drizzle-orm"

export const runtime = "edge"
export const dynamic = "force-dynamic"

function isValidSignature(secret: string, rawBody: string, headerSignature: string | null) {
  if (!headerSignature) return false

  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex")

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(headerSignature))
  } catch {
    return false
  }
}

// Webhook verification for Meta
export async function GET(request: Request) {
  const { env } = getRequestContext()
  const url = new URL(request.url)
  const mode = url.searchParams.get("hub.mode")
  const verifyToken = url.searchParams.get("hub.verify_token")
  const challenge = url.searchParams.get("hub.challenge")
  const expectedToken = (env as any).INSTAGRAM_WEBHOOK_VERIFY_TOKEN

  const isSubscribe = mode === "subscribe"
  const tokenMatches = expectedToken && verifyToken === expectedToken

  if (isSubscribe && tokenMatches) {
    return new NextResponse(challenge ?? "", { status: 200 })
  }

  return NextResponse.json({ error: "Invalid verify token" }, { status: 403 })
}

// Types for Instagram webhook payloads
interface WebhookMessageEntry {
  id: string
  time: number
  messaging?: Array<{
    sender: { id: string }
    recipient: { id: string }
    timestamp: number
    message?: {
      mid: string
      text?: string
      attachments?: Array<{
        type: string
        payload: {
          url?: string
          sticker_id?: number
        }
      }>
    }
  }>
}

interface WebhookPayload {
  object: string
  entry?: WebhookMessageEntry[]
}

// Process incoming Instagram DM webhook events
export async function POST(request: Request) {
  const { env } = getRequestContext()
  const appSecret = (env as any).FACEBOOK_APP_SECRET
  if (!appSecret) {
    return NextResponse.json({ error: "App secret not configured" }, { status: 500 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get("x-hub-signature-256")

  if (!isValidSignature(appSecret, rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
  }

  try {
    const payload = JSON.parse(rawBody) as WebhookPayload
    console.log("[instagram][webhook] received", JSON.stringify(payload, null, 2))

    // Only process instagram platform messages
    if (payload.object !== "instagram") {
      console.log("[instagram][webhook] ignoring non-instagram object:", payload.object)
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const d1 = env.DB
    if (!d1) {
      console.error("[instagram][webhook] DB binding missing")
      return NextResponse.json({ error: "Configuration error" }, { status: 500 })
    }
    const db = getDb(d1)

    for (const entry of payload.entry ?? []) {
      const pageId = entry.id

      // Find the connection for this page
      const connection = await db.query.instagramConnections.findFirst({
        where: and(
          eq(instagramConnections.instagramBusinessAccountId, pageId),
          eq(instagramConnections.status, "connected")
        )
      })

      if (!connection) {
        console.warn("[instagram][webhook] No connection found for page:", pageId)
        continue
      }

      for (const messaging of entry.messaging ?? []) {
        if (!messaging.message) {
          continue // Skip non-message events (read receipts, etc.)
        }

        const senderId = messaging.sender.id
        const recipientId = messaging.recipient.id
        const messageId = messaging.message.mid
        const messageText = messaging.message.text ?? null
        const timestamp = new Date(messaging.timestamp)

        // Determine if this is from the page or customer
        const isFromPage = senderId === pageId || senderId === connection.instagramBusinessAccountId

        // Build conversation ID (consistent ordering)
        const participantIds = [senderId, recipientId].sort()
        const conversationId = `${pageId}_${participantIds.join("_")}`

        // Extract attachments
        const attachments = (messaging.message.attachments ?? []).map((att, idx) => ({
          id: `${messageId}_att_${idx}`,
          type: att.type,
          url: att.payload?.url ?? null,
          sticker_id: att.payload?.sticker_id ?? null,
        }))

        // Upsert the message (ignore duplicates)
        try {
          await db.insert(instagramMessages)
            .values({
              projectId: connection.projectId,
              connectionId: connection.id,
              conversationId: conversationId,
              instagramMessageId: messageId,
              senderId: senderId,
              senderName: null, // Not provided in webhook
              senderUsername: null, // Not provided in webhook
              isFromPage: isFromPage,
              messageText: messageText,
              attachments: attachments,
              sentAt: timestamp,
            })
            .onConflictDoNothing()

          console.log("[instagram][webhook] Stored message:", messageId)
        } catch (insertError) {
          console.error("[instagram][webhook] Failed to insert message", insertError)
        }
      }
    }
  } catch (error) {
    console.error("[instagram][webhook] failed to parse payload", error)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
