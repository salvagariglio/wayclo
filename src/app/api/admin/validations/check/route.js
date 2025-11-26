import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
    const { id, token } = await req.json();
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
        .from("registrations")
        .select("id, first_name, last_name, company, role, qr_used, checkin_at")
        .eq("id", id)
        .eq("qr_token", token)
        .single();

    if (error || !data) {
        return NextResponse.json({ ok: false, error: "QR inválido" });
    }

    return NextResponse.json({
        ok: true,
        alreadyUsed: data.qr_used,
        ...data,
    });
}
