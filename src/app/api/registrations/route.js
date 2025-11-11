// src/app/api/registrations/route.js
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      first_name,
      last_name,
      email,
      phone,
      company,
      role,
      diet,
      diet_other,
    } = body || {};

    if (!first_name || !last_name || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer(); // usa SERVICE_ROLE en server
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
        diet_other: diet_other ?? null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      const status = error.code === "23505" ? 409 : 500;
      return NextResponse.json(
        { error: "DB error", detail: error.message },
        { status }
      );
    }

    // ==== Email "registro recibido" con Resend ====
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Evento <noreply@tudominio.com>", // usa un remitente de tu dominio verificado en Resend
      to: email,
      subject: "Registro recibido — ¡Gracias!",
      text: `Hola ${first_name},
Recibimos tu registro y quedó pendiente de aprobación.
Te avisamos por este mismo email cuando esté confirmado.
— Equipo del evento`,
    });

    return NextResponse.json({ ok: true, id: data.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
