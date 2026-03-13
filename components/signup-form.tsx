"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

export default function SignUpForm() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [projectName, setProjectName] = useState("")
    const [projectSlug, setProjectSlug] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, name, projectName, projectSlug }),
            })

            if (!response.ok) {
                const payload = await response.json().catch(() => ({})) as { error?: string }
                throw new Error(payload.error || "Signup failed")
            }

            // Automatically log in after signup
            router.push("/login?signup_success=1")
        } catch (err) {
            console.error("Signup failed", err)
            setError(err instanceof Error ? err.message : "Signup failed")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-2 flex items-center"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <hr className="my-6 border-muted" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Store Details</h3>

            <div className="space-y-2">
                <Label htmlFor="projectName">Store Name</Label>
                <Input id="projectName" placeholder="My Awesome Store" value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="projectSlug">Store URL Slug</Label>
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">https://</span>
                    <Input id="projectSlug" placeholder="my-store" value={projectSlug} onChange={(e) => setProjectSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} required />
                    <span className="text-muted-foreground">.chirp.com</span>
                </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
                {isSubmitting ? "Creating Account..." : "Create Account & Store"}
            </Button>
        </form>
    )
}
