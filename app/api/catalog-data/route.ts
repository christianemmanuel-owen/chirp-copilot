import { getCloudflareContext } from "@/lib/cloudflare/context"
import { NextResponse, type NextRequest } from "next/server"
import { getDb } from "@/lib/db"
import { ensureTenantId } from "@/lib/db/tenant"
import { getCatalogData } from "@/lib/storefront-data"


export async function GET(req: NextRequest) {
    try {
        const { env } = await getCloudflareContext()
        const projectId = await ensureTenantId(req, env.DB)
        const db = getDb(env.DB)

        const data = await getCatalogData(db, projectId)
        return NextResponse.json(data)
    } catch (error) {
        console.error("[api][catalog-data][GET] Unexpected error", error)
        return NextResponse.json({ error: "Failed to load catalog data" }, { status: 500 })
    }
}
