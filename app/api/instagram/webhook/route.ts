import crypto from "node:crypto"
import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"

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
  const url = new URL(request.url)
  const mode = url.searchParams.get("hub.mode")
  const verifyToken = url.searchParams.get("hub.verify_token")
  const challenge = url.searchParams.get("hub.challenge")
  const expectedToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN

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
  const appSecret = process.env.FACEBOOK_APP_SECRET
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

    const supabase = getSupabaseServiceRoleClient()

    for (const entry of payload.entry ?? []) {
      const pageId = entry.id

      // Find the connection for this page
      const { data: connection, error: connectionError } = await supabase
        .from("instagram_connections")
        .select("*")
        .eq("instagram_business_account_id", pageId)
        .eq("status", "connected")
        .maybeSingle()

      if (connectionError) {
        console.error("[instagram][webhook] Failed to fetch connection", connectionError)
        continue
      }

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
        const timestamp = new Date(messaging.timestamp).toISOString()

        // Determine if this is from the page or customer
        const isFromPage = senderId === pageId || senderId === connection.instagram_business_account_id

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
        const { error: insertError } = await supabase
          .from("instagram_messages")
          .upsert(
            {
              connection_id: connection.id,
              conversation_id: conversationId,
              instagram_message_id: messageId,
              sender_id: senderId,
              sender_name: null, // Not provided in webhook
              sender_username: null, // Not provided in webhook
              is_from_page: isFromPage,
              message_text: messageText,
              attachments: attachments,
              sent_at: timestamp,
            },
            {
              onConflict: "connection_id,instagram_message_id",
              ignoreDuplicates: true,
            }
          )

        if (insertError) {
          console.error("[instagram][webhook] Failed to insert message", insertError)
        } else {
          console.log("[instagram][webhook] Stored message:", messageId)
        }
      }
    }
  } catch (error) {
    console.error("[instagram][webhook] failed to parse payload", error)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
