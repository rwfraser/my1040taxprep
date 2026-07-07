import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) {
    // Return a dummy client that won't crash during SSR/build
    // Auth calls will fail at runtime if env vars are missing
    _client = createClient("https://placeholder.supabase.co", "placeholder");
  } else {
    _client = createClient(url, key);
  }
  return _client;
}

// Convenience export for use in components
export const supabase = typeof window !== "undefined"
  ? getSupabase()
  : (null as unknown as SupabaseClient);
