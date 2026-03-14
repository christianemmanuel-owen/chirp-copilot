import { eq, and, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { projectFeatures, maintenanceOverrides } from "@/lib/db/schema";

export type FeatureKey = "omnichannel" | "advanced-analytics" | string;

export interface FeatureStatus {
    isEnabled: boolean;
    reason?: "maintenance" | "not-purchased" | "expired" | "not-found";
    message?: string;
}

/**
 * Checks if a specific feature is available for a project.
 * Considers both global maintenance overrides and project-specific entitlements.
 */
export async function checkFeature(
    d1: D1Database,
    projectId: string,
    featureKey: FeatureKey
): Promise<FeatureStatus> {
    const db = getDb(d1);

    // 1. Check for Global Maintenance Overrides
    const override = await db.query.maintenanceOverrides.findFirst({
        where: or(
            eq(maintenanceOverrides.featureKey, featureKey),
            eq(maintenanceOverrides.featureKey, "all")
        )
    });

    if (override?.isDisabled) {
        return {
            isEnabled: false,
            reason: "maintenance",
            message: override.message || `The ${featureKey} feature is currently down for maintenance.`
        };
    }

    // 2. Check Project Entitlement
    const now = new Date();
    const entitlement = await db.query.projectFeatures.findFirst({
        where: and(
            eq(projectFeatures.projectId, projectId),
            eq(projectFeatures.featureKey, featureKey)
        )
    });

    if (!entitlement) {
        return {
            isEnabled: false,
            reason: "not-purchased",
            message: `Your project does not have the ${featureKey} feature enabled.`
        };
    }

    if (!entitlement.isActive) {
        return {
            isEnabled: false,
            reason: "not-purchased",
            message: `The ${featureKey} feature is disabled for your project.`
        };
    }

    if (entitlement.expiresAt && entitlement.expiresAt < now) {
        return {
            isEnabled: false,
            reason: "expired",
            message: `Your entitlement for ${featureKey} has expired.`
        };
    }

    return { isEnabled: true };
}

/**
 * Bulk check for multiple features (optimization for dashboard loads).
 */
export async function checkFeatures(
    d1: D1Database,
    projectId: string,
    featureKeys: FeatureKey[]
): Promise<Record<FeatureKey, FeatureStatus>> {
    const results: Record<FeatureKey, FeatureStatus> = {};

    // For simplicity in the first version, we just loop. 
    // In production, you might want a more complex single-query join.
    for (const key of featureKeys) {
        results[key] = await checkFeature(d1, projectId, key);
    }

    return results;
}
