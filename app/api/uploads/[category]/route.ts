import { NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"


export const runtime = "edge"

const BUCKET_MAP = {
  products: "product-images",
  payments: "payment-proofs",
  branding: "branding-assets",
  campaigns: "campaign-banners",
} as const

type UploadCategory = keyof typeof BUCKET_MAP

function assertCategory(value: string): value is UploadCategory {
  return value in BUCKET_MAP
}

function sanitizeSegment(value: string | null): string | undefined {
  if (!value) return undefined
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return cleaned || undefined
}

export async function POST(request: Request, context: { params: Promise<{ category: string }> }) {
  try {
    const { category } = await context.params
    const categoryParam = category

    if (!assertCategory(categoryParam)) {
      return NextResponse.json({ error: "Unsupported upload category" }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file in upload payload" }, { status: 400 })
    }

    // In Cloudflare, R2 bindings are on env in getRequestContext()
    const { env } = getRequestContext()
    const bucket = env.UPLOADS as unknown as R2Bucket
    if (!bucket) {
      return NextResponse.json({ error: "R2 Bucket binding not found" }, { status: 500 })
    }

    const prefix = sanitizeSegment(formData.get("prefix")?.toString() ?? null) ?? categoryParam
    const extensionFromName = file.name?.split(".").pop()
    const fallbackExtension = file.type?.split("/").pop()
    const extension = (extensionFromName || fallbackExtension || "bin").toLowerCase()

    // We keep the prefix structure but put it in the R2 bucket
    const objectPath = `${prefix}/${Date.now()}-${crypto.randomUUID()}.${extension}`

    const arrayBuffer = await file.arrayBuffer()

    // Put object into R2
    await bucket.put(objectPath, arrayBuffer, {
      httpMetadata: {
        contentType: file.type || "application/octet-stream",
      },
      customMetadata: {
        originalName: file.name,
        category: categoryParam,
      }
    })

    // Construct the public URL
    // Note: You must configure a custom domain or public access for the R2 bucket
    const publicBaseUrl = (env as any).NEXT_PUBLIC_R2_PUBLIC_URL || "https://assets.chirp.com"
    const publicUrl = `${publicBaseUrl}/${objectPath}`

    return NextResponse.json({ url: publicUrl, path: objectPath })
  } catch (error) {
    console.error("[uploads] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error during file upload" }, { status: 500 })
  }
}
