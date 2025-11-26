import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
    const { id, token } = await req.json();
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .eq("id", id)
        .eq("qr_token", token)
        .eq("status", "approved")
        .single();

    if (error || !data) {
        return NextResponse.json({
            ok: false,
            error: "QR inválido o invitado no aprobado"
        });
    }

    return NextResponse.json({
        ok: true,
        guest: {
            id: data.id,
            fullName: `${data.first_name} ${data.last_name}`,
            company: data.company,
            role: data.role,
            alreadyChecked: data.qr_used
        }
    });
}
