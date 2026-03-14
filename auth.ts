import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import Credentials from "next-auth/providers/credentials"
import { getDb } from "@/lib/db"
import { users, userProjects } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import * as bcrypt from "bcrypt-ts"
import { authConfig } from "./auth.config"

/**
 * Full Auth.js Configuration
 * This file is used by the main application (server actions, API routes).
 * It extends the Edge-compatible configuration with database-dependent logic.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    secret: process.env.AUTH_SECRET || "placeholder-secret-for-initialization",
    adapter: DrizzleAdapter(getDb((process.env as any).DB)),
    providers: [
        ...authConfig.providers.filter(p => p.id !== "credentials"),
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const d1 = (process.env as any).DB as D1Database
                const db = getDb(d1)

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
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user, trigger, session }) {
            // Add custom projects logic which requires DB access
            if (user) {
                const d1 = (process.env as any).DB as D1Database
                const db = getDb(d1)
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
    }
})
