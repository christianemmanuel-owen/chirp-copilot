import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import Credentials from "next-auth/providers/credentials"
import { getDb } from "@/lib/db"
import { users, userProjects } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import * as bcrypt from "bcrypt-ts"

export const { handlers, auth, signIn, signOut } = NextAuth(async (req) => {
    // In Cloudflare OpenNext, bindings might be in different places depending on the context
    // We try multiple ways to get the D1 binding safely
    let d1 = (process.env as any).DB as D1Database

    if (!d1) {
        try {
            const { getCloudflareContext } = await import("@/lib/cloudflare/context")
            const context = await getCloudflareContext()
            d1 = context.env.DB
        } catch (e) {
            console.error("[auth] Failed to get safe cloudflare context", e)
        }
    }

    if (!d1) {
        console.warn("[auth] D1 database binding not found, Auth.js might fail")
    }

    const db = getDb(d1)

    return {
        adapter: DrizzleAdapter(db),
        providers: [
            Credentials({
                credentials: {
                    email: { label: "Email", type: "email" },
                    password: { label: "Password", type: "password" },
                },
                async authorize(credentials) {
                    if (!credentials?.email || !credentials?.password) return null

                    const user = await db.query.users.findFirst({
                        where: eq(users.email, credentials.email as string),
                    })

                    if (!user || !user.hashedPassword) return null

                    const isValid = await bcrypt.compare(
                        credentials.password as string,
                        user.hashedPassword
                    )

                    if (!isValid) return null

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                    }
                },
            }),
        ],
        session: { strategy: "jwt" },
        callbacks: {
            async jwt({ token, user }) {
                if (user) {
                    const userWithProjects = await db.query.userProjects.findMany({
                        where: eq(userProjects.userId, user.id as string),
                        with: {
                            project: true,
                        },
                    })
                    token.projects = userWithProjects.map((up: any) => ({
                        id: up.projectId,
                        role: up.role,
                        slug: up.project.slug,
                        name: up.project.name,
                    }))
                }
                return token
            },
            async session({ session, token }) {
                if (token.sub && session.user) {
                    session.user.id = token.sub
                        ; (session.user as any).projects = token.projects
                }
                return session
            },
        },
        secret: process.env.AUTH_SECRET,
    }
})
