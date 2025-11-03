// app/api/registrations/route.js
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';       // aseguramos Node runtime
export const preferredRegion = 'auto';  // opcional

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function POST(req) {
    try {
        const body = await req.json();
        const {
            firstName, lastName, email, phone, company, role, diet, dietOther
        } = body;

        // 1) Validaciones mínimas
        if (!firstName || !lastName || !email || !phone || !company || !role || !diet) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // 2) Intentar insertar (si ya existe email/phone único, falla)
        const { data, error } = await supabase
            .from("registrations")
            .insert([{
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                company: company.trim(),
                role: role.trim(),
                diet,
                diet_other: diet === "otro" ? (dietOther || "").trim() : null,
                status: "pending",
            }])
            .select()
            .single();

        if (error) {
            // Si choca por unique constraint, devolvemos “ya registrado”
            if (error.code === "23505") {
                return NextResponse.json({ exists: true }, { status: 200 });
            }
            console.error(error);
            return NextResponse.json({ error: "DB error" }, { status: 500 });
        }

        // 3) Enviar email de “registro recibido, invitación pendiente”
        await resend.emails.send({
            from: "Evento <noreply@TU_DOMINIO>",
            to: email,
            subject: "Registro recibido — Invitación pendiente",
            text: `¡Hola ${firstName}! Recibimos tu registro para el evento. Tu invitación está pendiente de aprobación. Te avisaremos por email.`,
        });

        return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
