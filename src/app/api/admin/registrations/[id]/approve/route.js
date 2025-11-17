"use server";

import "server-only";
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(_req, { params }) {
  try {
    const supabase = getSupabaseServer();
    const { id } = params; // 👈 viene de [id] en la URL

    if (!id) {
      return NextResponse.json(
        { error: "Falta id de registro en la URL" },
        { status: 400 }
      );
    }

    // 1) Obtener el registro actual (por si querés validar algo extra)
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

    // 2) Actualizar status a "approved"
    const { data, error } = await supabase
      .from("registrations")
      .update({ status: "approved" })
      .eq("id", id)
      .select("email, first_name, last_name")
      .single();

    if (error) {
      console.error("Error actualizando registro:", error);
      return NextResponse.json(
        { error: "No se pudo aprobar el registro" },
        { status: 500 }
      );
    }

    const fullName =
      [data.first_name, data.last_name].filter(Boolean).join(" ") ||
      "participante";

    // 3) Enviar email de aprobación (no rompe el flujo si falla)
    try {
      await sendEmail({
        to: data.email,
        subject: "Tu invitación a CyberCloud fue aprobada ✅",
        html: `
          <h2>¡Buenas noticias, ${fullName}!</h2>
          <p>Tu registro para <strong>CyberCloud</strong> fue <strong>aprobado</strong>.</p>
          <p>Pronto vas a recibir más información sobre la agenda, el lugar y los horarios.</p>
          <br />
          <p style="opacity: 0.7;">Equipo CyberCloud</p>
        `,
      });
    } catch (mailErr) {
      console.error("Error enviando mail de aprobación:", mailErr);
      // No devolvemos error al admin: la aprobación en la DB ya se hizo
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("POST /api/admin/registrations/[id]/approve ERROR:", e);
    return NextResponse.json(
      { error: "Server error", detail: e.message },
      { status: 500 }
    );
  }
}
