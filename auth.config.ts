import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"

/**
 * Edge-compatible Auth.js Configuration
 * This file contains only the configuration that can run in the Edge runtime.
 * We exclude the Drizzle adapter here because it's only needed for persistence (login/signup),
 * and the middleware only needs to check the JWT session.
 */
export const authConfig = {
    providers: [
        // We include an empty Credentials provider just to satisfy the type requirement.
        // The actual authorization logic will be in auth.ts.
        Credentials({
            async authorize() {
                return null
            },
        }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }) {
            // In the middleware, 'user' is only present on first sign-in.
            // But since middleware only reads the cookie, this callback mostly just passes through.
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
    pages: {
        signIn: "/login",
    },
    secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig
