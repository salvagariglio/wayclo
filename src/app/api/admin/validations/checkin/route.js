import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
    const { id } = await req.json();
    const supabase = getSupabaseServer();

    const { error } = await supabase
        .from("registrations")
        .update({
            qr_used: true,
            qr_used_at: new Date().toISOString(),
            checkin_at: new Date().toISOString(),
        })
        .eq("id", id);

    if (error) {
        return NextResponse.json({ ok: false, error: "No se pudo registrar el ingreso" });
    }

    return NextResponse.json({ ok: true });
}
