"use server";

import "server-only";
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { sendEmail } from "@/lib/sendEmail";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

export async function POST(_req, { params }) {
  try {
    const supabase = getSupabaseServer();
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Falta id de registro en la URL" },
        { status: 400 }
      );
    }

    // 1) Buscar registro original
    const { data: reg, error: fetchError } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !reg) {
      console.error("Error buscando registro:", fetchError);
      return NextResponse.json(
        { error: "No se encontró el registro" },
        { status: 404 }
      );
    }

    // 2) GENERAR QR solo si no tiene
    const qr_token = uuidv4();
    const payload = JSON.stringify({ id, token: qr_token });

    const qrBase64 = await QRCode.toDataURL(payload);

    const fileName = `qr-${id}.png`;
    const base64Data = qrBase64.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const { data: upload, error: uploadError } = await supabase.storage
      .from("qr-codes")
      .upload(fileName, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error subiendo QR:", uploadError);
      return NextResponse.json(
        { error: "No se pudo generar el QR" },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("qr-codes").getPublicUrl(fileName);

    // 3) ACTUALIZAR STATUS + GUARDAR QR
    const { data: updated, error: updateError } = await supabase
      .from("registrations")
      .update({
        status: "approved",
        qr_token,
        qr_url: publicUrl,
      })
      .eq("id", id)
      .select("email, first_name, last_name, qr_url")
      .single();

    if (updateError) {
      console.error("Error actualizando registro:", updateError);
      return NextResponse.json(
        { error: "No se pudo aprobar el registro" },
        { status: 500 }
      );
    }

    const fullName =
      [updated.first_name, updated.last_name].filter(Boolean).join(" ") ||
      "participante";

    // 4) Enviar mail con el QR
    try {
      await sendEmail({
        to: updated.email,
        subject: "Tu invitación a CyberCloud fue aprobada ✅",
        html: `
          <h2>¡Buenas noticias, ${fullName}!</h2>
          <p>Tu registro para <strong>CyberCloud</strong> fue <strong>aprobado</strong>.</p>
          <p>Este es tu código QR personal para ingresar al evento:</p>
          <br/>
          <img src="${updated.qr_url}" width="220" style="border-radius:12px" />
          <br/><br/>
          <p>Mostralo en la entrada para validar tu acceso.</p>
          <p style="opacity:0.6">Equipo CyberCloud</p>
        `,
      });
    } catch (mailErr) {
      console.error("Error enviando mail de aprobación:", mailErr);
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
