export const runtime = "edge"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import LoginForm from "@/components/login-form"

function sanitizeRedirectPath(path?: string | null) {
  if (!path) return "/admin"
  try {
    const url = new URL(path, "https://example.com")
    const safePath = url.pathname + url.search
    if (!safePath.startsWith("/admin")) {
      return "/admin"
    }
    return safePath
  } catch {
    return "/admin"
  }
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirectTo?: string }> }) {
  const params = await searchParams;
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get("admin_auth")?.value === "1"
  const redirectTo = sanitizeRedirectPath(params?.redirectTo)

  if (isLoggedIn) {
    redirect(redirectTo)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Admin Login</h1>
          <p className="text-sm text-muted-foreground">
            Enter your admin credentials to access the dashboard.
          </p>
        </div>
        <div className="border border-border rounded-xl bg-card shadow-sm p-6 space-y-4">
          <LoginForm redirectTo={redirectTo} />
          <a
            href="/"
            className="block text-center text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to Store
          </a>
        </div>
      </div>
    </div>
  )
}
