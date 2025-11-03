export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req, { params }) {
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
    const auth = req.headers.get("authorization") || "";
    if (auth !== `Bearer ${ADMIN_TOKEN}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { id } = params;
    const { data, error } = await supabase
        .from("registrations")
        .update({ status: "approved" })
        .eq("id", id)
        .select()
        .single();

    if (error || !data) {
        console.error(error);
        return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    await resend.emails.send({
        from: "Evento <noreply@tudominio.com>",
        to: data.email,
        subject: "🎟️ ¡Invitación confirmada!",
        text: `Hola ${data.first_name}, tu invitación al evento ha sido APROBADA.\nNos vemos pronto. Detalles en breve.`,
    });

    return NextResponse.json({ ok: true });
}
