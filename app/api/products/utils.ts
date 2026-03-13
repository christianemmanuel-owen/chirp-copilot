import { eq, and, inArray, sql } from "drizzle-orm"
import { brands, categories } from "@/lib/db/schema"
import type { DbClient } from "@/lib/db"
import type { ProductBrandInput, ProductCategoryInput } from "@/lib/types"

export function normalizeLabel(value: string | null | undefined): string {
  if (typeof value !== "string") return ""
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : ""
}

export async function resolveBrandId(
  db: DbClient,
  projectId: string,
  input: ProductBrandInput | null | undefined,
): Promise<number | null> {
  if (input === null || input === undefined) {
    return null
  }

  if (typeof input.id === "number" && Number.isFinite(input.id)) {
    return input.id
  }

  const name = normalizeLabel(input.name)
  if (!name) {
    return null
  }

  // Drizzle upsert for Brands
  const [data] = await db.insert(brands)
    .values({ name, projectId })
    .onConflictDoUpdate({
      target: [brands.projectId, brands.name],
      set: { name } // No-op update to get the ID back
    })
    .returning({ id: brands.id })

  if (!data) {
    throw new Error("Failed to resolve brand")
  }

  return data.id
}

export async function resolveCategoryIds(
  db: DbClient,
  projectId: string,
  inputs: ProductCategoryInput[] | null | undefined,
): Promise<number[]> {
  if (!inputs || inputs.length === 0) {
    return []
  }

  const uniqueIds = new Set<number>()
  const newNames: string[] = []
  const seenNameKeys = new Set<string>()

  for (const entry of inputs) {
    if (!entry) continue
    if (typeof entry.id === "number" && Number.isFinite(entry.id)) {
      uniqueIds.add(entry.id)
      continue
    }

    const name = normalizeLabel(entry.name)
    if (!name) continue
    const key = name.toLowerCase()
    if (seenNameKeys.has(key)) continue
    seenNameKeys.add(key)
    newNames.push(name)
  }

  if (newNames.length > 0) {
    // Drizzle upsert for Categories
    const data = await db.insert(categories)
      .values(newNames.map(name => ({ name, projectId })))
      .onConflictDoUpdate({
        target: [categories.projectId, categories.name],
        set: { name: sql`EXCLUDED.name` }
      })
      .returning({ id: categories.id })

    if (!data) {
      throw new Error("Failed to resolve categories")
    }

    for (const category of data) {
      uniqueIds.add(category.id)
    }
  }

  return Array.from(uniqueIds).sort((a, b) => a - b)
}
