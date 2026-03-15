import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { getDb } from "@/lib/db"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import { eq } from "drizzle-orm"
import { users } from "@/lib/db/schema"
import { compare } from "bcrypt-ts"

/**
 * Lazy Auth Initializer
 * This function creates a NextAuth instance using the provided environment.
 * This is CRITICAL for Cloudflare Edge because it ensures environment variables
 * are available at the time of initialization.
 */
export function getAuth(env: any, hostname?: string) {
    if (!env) {
        throw new Error("Cloudflare environment (env) is required to initialize Auth.js");
    }

    // Ensure the secret is available in process.env for providers that expect it there
    if (env.AUTH_SECRET) {
        (process.env as any).AUTH_SECRET = env.AUTH_SECRET;
    }

    const cookieDomain = hostname?.endsWith('.chirpcopilot.com') ? '.chirpcopilot.com' : undefined;

    return NextAuth({
        ...authConfig,
        cookies: {
            sessionToken: {
                name: `authjs.session-token`,
                options: {
                    httpOnly: true,
                    sameSite: "lax",
                    path: "/",
                    domain: cookieDomain,
                    secure: true,
                },
            },
        },
        secret: env.AUTH_SECRET || "placeholder-secret-for-boot",
        adapter: DrizzleAdapter(getDb(env.DB)),
        providers: [
            ...authConfig.providers.filter(p => (p as any).id !== "credentials"),
            Credentials({
                async authorize(credentials) {
                    if (!credentials?.email || !credentials?.password) return null;

                    const db = getDb(env.DB);
                    const user = await db.query.users.findFirst({
                        where: eq(users.email, credentials.email as string),
                    });

                    if (!user || !user.hashedPassword) return null;

                    const isPasswordValid = await compare(
                        credentials.password as string,
                        user.hashedPassword
                    );

                    if (!isPasswordValid) return null;

                    // Fetch user's projects to include in the token
                    const userProjects = await db.query.userProjects.findMany({
                        where: eq(users.id, user.id),
                        with: {
                            project: true
                        }
                    });

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        projects: userProjects.map(up => up.project)
                    };
                },
            }),
        ],
        callbacks: {
            ...authConfig.callbacks,
            async jwt({ token, user }) {
                if (user) {
                    token.projects = (user as any).projects;
                }
                return token;
            },
            async session({ session, token }) {
                if (session.user) {
                    session.user.id = token.sub as string;
                    (session.user as any).projects = token.projects;
                }
                return session;
            },
        }
    });
}
