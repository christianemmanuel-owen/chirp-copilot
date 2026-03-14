import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import Credentials from "next-auth/providers/credentials"
import { getDb } from "@/lib/db"
import { users, userProjects } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import * as bcrypt from "bcrypt-ts"

/**
 * Auth.js v5 Configuration
 * Standardizing on a flat configuration to ensure stable exports for OpenNext.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: {
        // We use a custom adapter proxy to handle the dynamic D1 binding
        // because the adapter is initialized before we have the request context.
        async createUser(user) {
            const d1 = (process.env as any).DB as D1Database
            return DrizzleAdapter(getDb(d1)).createUser!(user)
        },
        async getUser(id) {
            const d1 = (process.env as any).DB as D1Database
            return DrizzleAdapter(getDb(d1)).getUser!(id)
        },
        async getUserByEmail(email) {
            const d1 = (process.env as any).DB as D1Database
            return DrizzleAdapter(getDb(d1)).getUserByEmail!(email)
        },
        async getUserByAccount({ providerAccountId, provider }) {
            const d1 = (process.env as any).DB as D1Database
            return DrizzleAdapter(getDb(d1)).getUserByAccount!({ providerAccountId, provider })
        },
        async updateUser(user) {
            const d1 = (process.env as any).DB as D1Database
            return DrizzleAdapter(getDb(d1)).updateUser!(user)
        },
        async linkAccount(account) {
            const d1 = (process.env as any).DB as D1Database
            return DrizzleAdapter(getDb(d1)).linkAccount!(account)
        },
        async createSession(session) {
            const d1 = (process.env as any).DB as D1Database
            return DrizzleAdapter(getDb(d1)).createSession!(session)
        },
        async getSessionAndUser(sessionToken) {
            const d1 = (process.env as any).DB as D1Database
            return DrizzleAdapter(getDb(d1)).getSessionAndUser!(sessionToken)
        },
        async updateSession(session) {
            const d1 = (process.env as any).DB as D1Database
            return DrizzleAdapter(getDb(d1)).updateSession!(session)
        },
        async deleteSession(sessionToken) {
            const d1 = (process.env as any).DB as D1Database
            return DrizzleAdapter(getDb(d1)).deleteSession!(sessionToken)
        },
    },
    providers: [
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
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }) {
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
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                (session.user as any).projects = token.projects
            }
            return session
        },
    },
    secret: process.env.AUTH_SECRET,
})
