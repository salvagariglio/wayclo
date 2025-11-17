"use server";

import "server-only";
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(_req, { params }) {
  try {
    const supabase = getSupabaseServer();
    const { id } = params; // 👈 viene de [id] en la ruta

    if (!id) {
      return NextResponse.json(
        { error: "Falta id de registro en la URL" },
        { status: 400 }
      );
    }

    // 1) Obtener el registro actual (para validar y tener email/nombre)
    const { data: current, error: fetchError } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !current) {
      console.error("Error buscando registro:", fetchError);
      return NextResponse.json(
        { error: "No se encontró el registro" },
        { status: 404 }
      );
    }

    // 2) Actualizar status a "rejected"
    const { data, error } = await supabase
      .from("registrations")
      .update({ status: "rejected" })
      .eq("id", id)
      .select("email, first_name, last_name")
      .single();

    if (error) {
      console.error("Error actualizando registro:", error);
      return NextResponse.json(
        { error: "No se pudo rechazar el registro" },
        { status: 500 }
      );
    }

    const fullName =
      [data.first_name, data.last_name].filter(Boolean).join(" ") ||
      "participante";

    // 3) Enviar email de rechazo (no rompe el flujo si falla)
    try {
      await sendEmail({
        to: data.email,
        subject: "Tu invitación a CyberCloud fue rechazada ❌",
        html: `
          <h2>Hola ${fullName},</h2>
          <p>Lamentamos informarte que tu registro para <strong>CyberCloud</strong> ha sido <strong>rechazado</strong>.</p>
          <p>Podés volver a intentarlo más adelante o contactarnos si creés que se trata de un error.</p>
          <br />
          <p style="opacity: 0.7;">Equipo CyberCloud</p>
        `,
      });
    } catch (mailErr) {
      console.error("Error enviando mail de rechazo:", mailErr);
      // No devolvemos error al admin: el rechazo se hizo igual en la DB
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("POST /api/admin/registrations/[id]/reject ERROR:", e);
    return NextResponse.json(
      { error: "Server error", detail: e.message },
      { status: 500 }
    );
  }
}
