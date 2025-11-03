import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export async function POST(req, { params }) {
    const auth = req.headers.get("authorization") || "";
    if (auth !== `Bearer ${ADMIN_TOKEN}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;

    const { data, error } = await supabase
        .from("registrations")
        .update({ status: "rejected" })
        .eq("id", id)
        .select()
        .single();

    if (error || !data) return NextResponse.json({ error: "DB error" }, { status: 500 });

    await resend.emails.send({
        from: "Evento <noreply@TU_DOMINIO>",
        to: data.email,
        subject: "Estado de tu registro",
        text: `Hola ${data.first_name}, en esta edición no podremos confirmarte lugar. Gracias por registrarte; te tendremos en cuenta para próximos eventos.`,
    });

    return NextResponse.json({ ok: true });
}
