"use server";

import "server-only";
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { sendEmailGraph } from "@/lib/sendEmailGraph";
import QRCode from "qrcode";
import crypto from "crypto";
import { generateTicketPDF } from "@/lib/generateTicketPDF";

export async function POST(_req, { params }) {
  try {
    const supabase = getSupabaseServer();
    const { id } = params;

    const { data: reg, error: fetchErr } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !reg)
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });

    const fullName = `${reg.first_name} ${reg.last_name}`;
    const company = reg.company || "";
    const role = reg.role || "";

    // 1) Generar token único
    const token = crypto.randomBytes(16).toString("hex");

    // 2) URL del QR
    const qrValue = `https://cybercloud.ar/validate?id=${id}&token=${token}`;

    // 3) Generar QR como PNG buffer
    const qrBuffer = await QRCode.toBuffer(qrValue, {
      type: "png",
      width: 600,
      margin: 1
    });

    // 4) Subir QR a Storage
    const qrFilename = `qr_${id}.png`;
    const { data: qrUpload, error: qrErr } = await supabase.storage
      .from("qr-codes")
      .upload(qrFilename, qrBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (qrErr) {
      console.error(qrErr);
      return NextResponse.json({ error: "No se pudo subir el QR" }, { status: 500 });
    }

    const { data: qrPublic } = supabase.storage
      .from("qr-codes")
      .getPublicUrl(qrFilename);

    const qrUrl = qrPublic.publicUrl;

    // 5) Generar PDF del ticket
    const pdfBuffer = await generateTicketPDF({
      fullName,
      company,
      role,
      qrBuffer,
    });

    const pdfFilename = `ticket_${id}.pdf`;

    const { error: pdfErr } = await supabase.storage
      .from("tickets")
      .upload(pdfFilename, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (pdfErr) {
      console.error(pdfErr);
      return NextResponse.json({ error: "No se pudo subir el PDF" }, { status: 500 });
    }

    const { data: pdfPublic } = supabase.storage
      .from("tickets")
      .getPublicUrl(pdfFilename);

    const pdfUrl = pdfPublic.publicUrl;

    // 6) Actualizar registro
    await supabase
      .from("registrations")
      .update({
        status: "approved",
        qr_token: token,
        qr_url: qrUrl,
        pdf_url: pdfUrl,
      })
      .eq("id", id);

    // 7) Enviar mail con QR + PDF adjunto
    await sendEmailGraph({
      to: reg.email,
      subject: "Tu acceso a CyberCloud fue aprobado 🔐",
      html: `
        <h2>¡Hola ${fullName}!</h2>
        <p>Tu pase digital para <strong>CyberCloud 2025</strong> está listo.</p>
        <p>Presentá este código QR en la entrada del evento:</p>
        <img src="${qrUrl}" style="width:200px;margin:20px 0;border-radius:8px" />
        <p>También te dejamos adjunto el pase completo en PDF.</p>
        <br />
        <p style="opacity:.7;font-size:14px">Equipo CyberCloud</p>
      `,
      attachments: [
        {
          name: `CyberCloud_Ticket_${id}.pdf`,
          contentBytes: pdfBuffer.toString("base64"),
          contentType: "application/pdf",
        }
      ]
    });

    return NextResponse.json({ ok: true }, { status: 200 });

  } catch (e) {
    console.error("POST /approve error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
