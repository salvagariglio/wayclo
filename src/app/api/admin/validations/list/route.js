import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // "checked" | "pending" | null

    const { data, error } = await supabase
        .from("registrations")
        .select("id, first_name, last_name, company, role, qr_used, qr_used_at")
        .eq("status", "approved")
        .order("first_name", { ascending: true });

    if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const filtered = data.filter((item) => {
        if (filter === "checked") return item.qr_used;
        if (filter === "pending") return !item.qr_used;
        return true;
    });

    return NextResponse.json({ ok: true, items: filtered });
}