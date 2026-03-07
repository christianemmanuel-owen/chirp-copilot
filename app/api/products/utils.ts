import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/supabase/types"
import type { ProductBrandInput, ProductCategoryInput } from "@/lib/types"

export const PRODUCT_SELECT_FIELDS =
  "*, brand:brands(*), product_categories(category:categories(*)), product_variants(*, variant_sizes(*))"

type ServiceSupabaseClient = SupabaseClient<Database>

export function normalizeLabel(value: string | null | undefined): string {
  if (typeof value !== "string") return ""
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : ""
}

export async function resolveBrandId(
  supabase: ServiceSupabaseClient,
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

  const { data, error } = await supabase
    .from("brands")
    .upsert({ name }, { onConflict: "name" })
    .select("id")
    .single()

  if (error || !data) {
    console.error("[products][resolveBrandId] Failed to upsert brand", error)
    throw new Error("Failed to resolve brand")
  }

  return data.id
}

export async function resolveCategoryIds(
  supabase: ServiceSupabaseClient,
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
    const { data, error } = await supabase
      .from("categories")
      .upsert(
        newNames.map((name) => ({ name })),
        { onConflict: "name" },
      )
      .select("id, name")

    if (error || !data) {
      console.error("[products][resolveCategoryIds] Failed to upsert categories", error)
      throw new Error("Failed to resolve categories")
    }

    for (const category of data) {
      if (!category) continue
      if (typeof category.id === "number" && Number.isFinite(category.id)) {
        uniqueIds.add(category.id)
      }
    }
  }

  return Array.from(uniqueIds).sort((a, b) => a - b)
}
