import { getCloudflareContext as getOpenNextContext } from "@opennextjs/cloudflare"

/**
 * A safe wrapper around getCloudflareContext that handles the "async mode" requirement
 * and provides graceful fallbacks for static generation (build time).
 * 
 * In OpenNext, getCloudflareContext() throws if called synchronously during static generation.
 * This helper ensures we call it with { async: true } and returns an empty env if bindings are missing.
 */
export async function getCloudflareContext() {
    try {
        // We use async: true to allow it to be called during static generation
        const context = await getOpenNextContext({ async: true })

        // Ensure env is at least an empty object to prevent downstream crashes
        if (!context.env) {
            return { ...context, env: {} as any }
        }

        return context
    } catch (error) {
        // During next build (prerendering), bindings like D1/R2 are often unavailable.
        // We catch the error and return a skeleton context to allow the build to proceed.
        console.warn("[cloudflare-context] Failed to retrieve context (likely build time):", error)
        return {
            env: {} as any,
            cf: {} as any,
            ctx: {} as any,
        }
    }
}
