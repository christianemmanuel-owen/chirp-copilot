import { NextResponse } from "next/server"
import { getCatalogData } from "@/lib/storefront-data"

export async function GET() {
    try {
        const data = await getCatalogData()
        return NextResponse.json(data)
    } catch (error) {
        console.error("[catalog-data][GET] Unexpected error", error)
        return NextResponse.json({ error: "Failed to load catalog data" }, { status: 500 })
    }
}
