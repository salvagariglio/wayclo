import { createClient } from "@supabase/supabase-js";

export function getSupabaseServer() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    if (!url || !key) throw new Error("Missing Supabase env vars");
    return createClient(url, key, { auth: { persistSession: false } });
}
