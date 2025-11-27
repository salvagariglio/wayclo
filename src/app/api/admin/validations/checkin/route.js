import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
    const { id } = await req.json();
    const supabase = getSupabaseServer();

    const { data: reg } = await supabase
        .from("registrations")
        .select("id, qr_used")
        .eq("id", id)
        .single();

    if (!reg) {
        return NextResponse.json({ ok: false, error: "Invitado no encontrado" });
    }

    // Evitar registrar ingreso duplicado
    const wasUsed = reg.qr_used === true;

    const { error } = await supabase
        .from("registrations")
        .update({
            qr_used: true,
            qr_used_at: wasUsed ? reg.qr_used_at : new Date().toISOString(),
        })
        .eq("id", id);

    if (error) {
        return NextResponse.json({ ok: false, error: error.message });
    }

    return NextResponse.json({
        ok: true,
        alreadyChecked: wasUsed,
    });
}