export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';       // aseguramos Node runtime
export const preferredRegion = 'auto';  // opcional

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export async function GET(req) {
    const auth = req.headers.get("authorization") || "";
    if (auth !== `Bearer ${ADMIN_TOKEN}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";

    const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
    return NextResponse.json({ items: data });
}
