import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./types"

let serverClient: SupabaseClient<Database, "public"> | null = null

export function getSupabaseServiceRoleClient() {
  if (!serverClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase service role client is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
    }

    serverClient = createClient<Database, "public">(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return serverClient
}
