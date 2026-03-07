import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"

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

    const supabase = getSupabaseServiceRoleClient()
    const bucket = BUCKET_MAP[categoryParam]

    await ensureBucketExists(supabase, bucket)

    const prefix =
      sanitizeSegment(formData.get("prefix")?.toString() ?? null) ?? categoryParam
    const extensionFromName = file.name?.split(".").pop()
    const fallbackExtension = file.type?.split("/").pop()
    const extension = (extensionFromName || fallbackExtension || "bin").toLowerCase()
    const objectPath = `${prefix}/${Date.now()}-${randomUUID()}.${extension}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    })

    if (uploadError) {
      console.error(`[uploads][${categoryParam}] Supabase storage error`, uploadError)
      return NextResponse.json({ error: "Failed to store file" }, { status: 500 })
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(objectPath)
    const publicUrl = publicUrlData.publicUrl

    return NextResponse.json({ url: publicUrl, path: objectPath })
  } catch (error) {
    console.error("[uploads] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error during file upload" }, { status: 500 })
  }
}

async function ensureBucketExists(
  supabase: ReturnType<typeof getSupabaseServiceRoleClient>,
  bucket: string,
) {
  const { data, error } = await supabase.storage.getBucket(bucket)

  if (data) {
    return
  }

  if (error) {
    const status = (error as any)?.statusCode ?? (error as any)?.status
    if (status !== "404" && status !== 404) {
      throw error
    }
  }

  const { error: createError } = await supabase.storage.createBucket(bucket, {
    public: true,
  })

  if (createError) {
    const status = (createError as any)?.statusCode ?? (createError as any)?.status
    if (status !== "409" && status !== 409) {
      throw createError
    }
  }
}
