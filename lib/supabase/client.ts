"use client"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./types"

let client: SupabaseClient<Database, "public"> | null = null

export function getSupabaseBrowserClient() {
  if (!client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase client is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.")
    }

    client = createClient<Database, "public">(supabaseUrl, supabaseAnonKey)
  }

  return client
}
