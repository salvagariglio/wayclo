import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
    try {
        const { id, token } = await req.json();

        if (!id || !token) {
            return NextResponse.json({
                ok: false,
                error: "QR inválido",
            });
        }

        const supabase = getSupabaseServer();

        // Buscar el registro aprobado con ese ID + token
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
                error: "Invitación no válida",
            });
        }

        return NextResponse.json({
            ok: true,
            guest: {
                id: data.id,
                fullName: `${data.first_name} ${data.last_name}`,
                company: data.company,
                role: data.role,
                alreadyChecked: data.qr_used === true,
                checkInTime: data.qr_used_at || null,
            },
        });

    } catch (e) {
        console.error("CHECK ERROR:", e);
        return NextResponse.json({
            ok: false,
            error: "Error procesando QR",
        });
    }
}
