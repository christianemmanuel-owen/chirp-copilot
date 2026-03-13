import Link from "next/link"
import SignUpForm from "@/components/signup-form"

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-background p-8 shadow-lg ring-1 ring-border">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Create your Store</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Join Chirp and start selling in minutes.
                    </p>
                </div>

                <SignUpForm />

                <div className="text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}
