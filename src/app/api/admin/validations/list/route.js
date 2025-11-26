import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // "checked" | "pending" | null

    let query = supabase
        .from("registrations")
        .select("id, first_name, last_name, company, role, qr_used, checkin_at, pdf_url, qr_url, qr_token")
        .eq("status", "approved")
        .order("first_name", { ascending: true });

    if (filter === "checked") query = query.eq("qr_used", true);
    if (filter === "pending") query = query.eq("qr_used", false);

    const { data, error } = await query;

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, items: data });
}
