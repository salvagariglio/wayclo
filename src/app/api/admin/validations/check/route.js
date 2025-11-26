import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
    const { id, token } = await req.json();
    const supabase = getSupabaseServer();

    // Buscar coincidencia exacta
    const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .eq("id", id)
        .eq("qr_token", token)
        .single();

    if (error || !data) {
        return NextResponse.json({
            ok: false,
            error: "QR inválido o usuario no encontrado",
        });
    }

    // Ya usado
    if (data.qr_used) {
        return NextResponse.json({
            ok: false,
            alreadyUsed: true,
            error: "Este QR ya fue utilizado",
            checkin_at: data.checkin_at,
            fullName: `${data.first_name} ${data.last_name}`,
        });
    }

    // Marcar ingreso
    await supabase
        .from("registrations")
        .update({
            qr_used: true,
            qr_used_at: new Date().toISOString(),
            checkin_at: new Date().toISOString(),
        })
        .eq("id", id);

    return NextResponse.json({
        ok: true,
        id: data.id,
        fullName: `${data.first_name} ${data.last_name}`,
        company: data.company,
        role: data.role,
    });
}
