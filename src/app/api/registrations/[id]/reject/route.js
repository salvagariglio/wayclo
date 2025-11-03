export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req, { params }) {
    try {
        // Autenticación interna (admin)
        const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
        const auth = req.headers.get("authorization") || "";
        if (auth !== `Bearer ${ADMIN_TOKEN}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        if (!id) {
            return NextResponse.json({ error: "Missing ID parameter" }, { status: 400 });
        }

        // Crear clientes dentro del handler
        const supabase = getSupabaseServer();
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Actualizar registro a rechazado
        const { data, error } = await supabase
            .from("registrations")
            .update({ status: "rejected" })
            .eq("id", id)
            .select()
            .single();

        if (error || !data) {
            console.error("Supabase error:", error);
            return NextResponse.json({ error: "Database update failed" }, { status: 500 });
        }

        // Enviar mail al usuario notificando rechazo
        await resend.emails.send({
            from: "Evento <noreply@tudominio.com>",
            to: data.email,
            subject: "🚫 Invitación rechazada",
            text: `Hola ${data.first_name},

Lamentamos informarte que tu solicitud de registro para el evento no ha sido aprobada.

Agradecemos tu interés y esperamos verte en futuras ediciones.

— El equipo del evento`,
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Reject route error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
