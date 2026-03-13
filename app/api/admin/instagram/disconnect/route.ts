import { NextRequest, NextResponse } from "next/server"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb } from "@/lib/db"
import {
  instagramConnections
} from "@/lib/db/schema"
import { ensureTenantId } from "@/lib/db/tenant"
import { eq, and } from "drizzle-orm"


interface DisconnectPayload {
  connectionId?: string
}

export async function POST(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext()
    const d1 = env.DB
    if (!d1) return NextResponse.json({ error: "DB binding missing" }, { status: 500 })

    const tenantId = await ensureTenantId(request, d1)
    const db = getDb(d1)

    let payload: DisconnectPayload
    try {
      payload = (await request.json()) as DisconnectPayload
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
    }

    if (!payload.connectionId) {
      return NextResponse.json({ error: "connectionId is required" }, { status: 400 })
    }

    const result = await db.delete(instagramConnections)
      .where(and(
        eq(instagramConnections.id, payload.connectionId),
        eq(instagramConnections.projectId, tenantId)
      ))
      .returning()

    if (result.length === 0) {
      return NextResponse.json({ error: "Connection not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[instagram][disconnect] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
