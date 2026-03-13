import { NextResponse } from "next/server"
import { getCloudflareContext } from "@/lib/cloudflare/context"


export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null

    if (!body?.email || !body?.password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const { env } = await getCloudflareContext()
    const adminEmail = (env as any).ADMIN_EMAIL
    const adminPassword = (env as any).ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      console.error("[auth][login] Missing ADMIN_EMAIL or ADMIN_PASSWORD env vars")
      return NextResponse.json({ error: "Authentication is not configured" }, { status: 500 })
    }

    const normalizedEmail = body.email.trim().toLowerCase()
    const normalizedPassword = body.password.trim()

    if (normalizedEmail !== adminEmail.trim().toLowerCase() || normalizedPassword !== adminPassword.trim()) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name: "admin_auth",
      value: "1",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("[auth][login] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error during login" }, { status: 500 })
  }
}
