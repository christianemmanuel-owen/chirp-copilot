import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import Credentials from "next-auth/providers/credentials"
import { getDb } from "@/lib/db"
import { users, userProjects } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import * as bcrypt from "bcrypt-ts"

/**
 * Auth.js v5 Configuration
 * We use a factory pattern because Drizzle needs the D1 binding which is only 
 * available at request time in Cloudflare.
 */
export const { handlers, auth, signIn, signOut } = NextAuth((req) => {
    // In Cloudflare OpenNext, bindings are available on process.env at request time.
    // This is synchronous during the initialization call for each request.
    const d1 = (process.env as any).DB as D1Database
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
