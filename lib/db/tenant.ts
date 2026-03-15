import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { projects } from "./schema";

export async function getTenantId(request: Request, d1: D1Database): Promise<string | null> {
    const slug = request.headers.get("x-tenant-slug");
    if (!slug || !d1) return null;

    try {
        const db = getDb(d1);
        const project = await db.query.projects.findFirst({
            where: eq(projects.slug, slug),
        });

        return project?.id ?? null;
    } catch (error) {
        console.error("[tenant] Failed to fetch tenant from request", error);
        return null;
    }
}

/**
 * Ensures a tenant exists and returns its ID.
 * Throws an error if the tenant is not found.
 */
export async function ensureTenantId(request: Request, d1: D1Database): Promise<string> {
    const tenantId = await getTenantId(request, d1);
    if (!tenantId) {
        throw new Error("Tenant not found or missing from request");
    }
    return tenantId;
}

export async function getTenantIdFromHeaders(headers: Headers, d1: D1Database): Promise<string | null> {
    const slug = headers.get("x-tenant-slug");
    if (!slug || !d1) return null;

    try {
        const db = getDb(d1);
        const project = await db.query.projects.findFirst({
            where: eq(projects.slug, slug),
        });

        return project?.id ?? null;
    } catch (error) {
        console.error("[tenant] Failed to fetch tenant from headers", error);
        return null;
    }
}

export async function ensureTenantIdFromHeaders(headers: Headers, d1: D1Database): Promise<string> {
    const tenantId = await getTenantIdFromHeaders(headers, d1);
    if (!tenantId) {
        throw new Error("Tenant not found or missing from request headers");
    }
    return tenantId;
}
