import { NextResponse } from "next/server"

export const runtime = "edge"

export async function POST() {
  try {
    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name: "admin_auth",
      value: "",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    })
    return response
  } catch (error) {
    console.error("[auth][logout] Unexpected error", error)
    return NextResponse.json({ error: "Unexpected error during logout" }, { status: 500 })
  }
}

