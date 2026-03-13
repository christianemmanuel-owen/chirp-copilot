import { NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb } from "@/lib/db"
import { users, projects, userProjects } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import * as bcrypt from "bcrypt-ts"

export const runtime = "edge"

export async function POST(request: Request) {
    try {
        const body = await request.json() as {
            email?: string;
            password?: string;
            name?: string;
            projectName?: string;
            projectSlug?: string;
        }
        const { email, password, name, projectName, projectSlug } = body

        if (!email || !password || !projectName || !projectSlug) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const { env } = getRequestContext()
        const d1 = env.DB
        if (!d1) {
            return NextResponse.json({ error: "Database binding not found" }, { status: 500 })
        }

        const db = getDb(d1)

        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email)
        })

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 })
        }

        // Check if project slug is taken
        const existingProject = await db.query.projects.findFirst({
            where: eq(projects.slug, projectSlug)
        })

        if (existingProject) {
            return NextResponse.json({ error: "Project slug already exists" }, { status: 409 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user and project in a transaction
        const result = await db.transaction(async (tx) => {
            const [newUser] = await tx.insert(users).values({
                email,
                name,
                hashedPassword,
            }).returning()

            const [newProject] = await tx.insert(projects).values({
                name: projectName,
                slug: projectSlug,
            }).returning()

            await tx.insert(userProjects).values({
                userId: newUser.id,
                projectId: newProject.id,
                role: "owner",
            })

            return { userId: newUser.id, projectId: newProject.id }
        })

        return NextResponse.json({ success: true, ...result }, { status: 201 })
    } catch (error) {
        console.error("[auth][signup] Unexpected error", error)
        return NextResponse.json({ error: "Unexpected error during signup" }, { status: 500 })
    }
}
