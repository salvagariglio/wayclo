// src/app/api/registrations/route.js
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
// (si querés mandar mail “pendiente” acá, podés importar Resend y usarlo dentro del handler)

export async function POST(req) {
    try {
        const { first_name, last_name, email, phone, company, role, diet } = await req.json();

        // validaciones básicas
        if (!first_name || !last_name || !email || !phone) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = getSupabaseServer(); // ✅ dentro del handler
        const { data, error } = await supabase
            .from("registrations")
            .insert({
                first_name,
                last_name,
                email,
                phone,
                company: company ?? null,
                role: role ?? null,
                diet: diet ?? "Ninguna",
                status: "pending",
            })
            .select()
            .single();

        if (error) {
            console.error(error);
            // conflicto por email/phone únicos (si pusiste unique index)
            const status = error.code === "23505" ? 409 : 500;
            return NextResponse.json({ error: "DB error", detail: error.message }, { status });
        }

        // si querés: enviar acá el mail “registro recibido, pendiente de aprobación”
        // const resend = new Resend(process.env.RESEND_API_KEY);
        // await resend.emails.send({ ... });

        return NextResponse.json({ ok: true, id: data.id });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function GET() {
    // opcional, por compatibilidad, podés redirigir a /api/registrations/list
    return NextResponse.json({ ok: true, hint: "Use /api/registrations/list" });
}
