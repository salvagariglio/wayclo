"use server";

import "server-only";
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { sendEmailGraph } from "@/lib/sendEmailGraph";
import QRCode from "qrcode";
import crypto from "crypto";

// 💡 CORRECCIÓN 1: Usamos 'request' y extraemos el ID manualmente de la URL
// Esto elimina el error 'sync-dynamic-apis' que persiste con 'params'
export async function POST(request) {
  try {
    const supabase = getSupabaseServer();

    // ✅ ACCESO MÁS ROBUSTO: Extraer el ID del pathname de la URL
    // Esto es compatible y no genera el error de Next.js
    const pathname = new URL(request.url).pathname;
    const segments = pathname.split('/');
    // El ID es el segmento anterior a 'approve'
    const id = segments[segments.length - 2];

    if (!id) {
      return NextResponse.json(
        { error: "Falta id de registro en la URL" },
        { status: 400 }
      );
    }

    // 1) Obtener datos del registro
    const { data: reg, error: fetchErr } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !reg) {
      console.error("Error buscando registro:", fetchErr);
      return NextResponse.json(
        { error: "No se encontró el registro" },
        { status: 404 }
      );
    }

    const fullName = [reg.first_name, reg.last_name].filter(Boolean).join(" ") || "participante";

    // --- Lógica del QR ---

    // 2) Generar token único
    const token = crypto.randomBytes(16).toString("hex");

    // 3) URL del QR (URL de validación)
    const qrValue = `https://cybercloud.ar/validate?id=${id}&token=${token}`;

    // 4) Generar QR como PNG buffer
    const qrBuffer = await QRCode.toBuffer(qrValue, {
      type: "png",
      width: 600,
      margin: 1
    });

    // 5) Subir QR a Storage
    const qrFilename = `qr_${id}.png`;
    const { error: qrErr } = await supabase.storage
      .from("qr-codes")
      .upload(qrFilename, qrBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (qrErr) {
      console.error("Error subiendo QR:", qrErr);
    }

    const { data: qrPublic } = supabase.storage
      .from("qr-codes")
      .getPublicUrl(qrFilename);

    const qrUrl = qrPublic.publicUrl;

    // 6) Actualizar registro con el nuevo estado, token y URL del QR
    const { error: updateError } = await supabase
      .from("registrations")
      .update({
        status: "approved",
        qr_token: token,
        qr_url: qrUrl,
        pdf_url: null,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error actualizando registro:", updateError);
      return NextResponse.json(
        { error: "No se pudo aprobar el registro" },
        { status: 500 }
      );
    }

    // --- Enviar Email ---

    try {
      await sendEmailGraph({
        to: reg.email,
        subject: "Confirmado: Nos vemos en CyberCloud ⚡",
        html: `
<div style="width:100%;padding:40px 0;background:linear-gradient(180deg,#021728 0%,#00263F 100%);font-family:Arial,sans-serif;color:#fff;">
  <div style="max-width:520px;margin:auto;background:rgba(255,255,255,0.07);padding:32px 36px;border-radius:14px;">
    
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://stazbtfqsejoolkdnlgb.supabase.co/storage/v1/object/public/email_assets/logo-slogan.png" 
            width="150" 
            alt="CyberCloud" />
    </div>

    <h2 style="text-align:center;font-size:22px;margin-bottom:26px;">
      Confirmado: Nos vemos en CyberCloud ⚡
    </h2>

    <p>¡Buenas noticias, <strong>${fullName}</strong>! 🎉</p>
    <p>Tu inscripción a <strong>CyberCloud</strong> fue aprobada.</p>

    <p>Ya podés acceder a tu entrada y presentarla el día del evento. 
    Abajo tenés tu <strong>código QR personal</strong>:</p>

    <div style="text-align:center;margin:28px 0;">
      <img src="${qrUrl}" width="180" style="border-radius:10px;" alt="QR CyberCloud" />
    </div>

    <p>
      📅 <strong>Fecha:</strong> 15 de diciembre<br>
      📍 <strong>Lugar:</strong> Polo Científico Tecnológico – Río Cuarto
    </p>

    <p>Te esperamos desde temprano para disfrutar de charlas, networking y el exclusivo 
    <strong>Cyber After Cocktail</strong>.</p>

    <p style="margin-top:28px;">¡Nos vemos ahí!</p>
    <p><strong>Equipo CyberCloud</strong></p>

    <div style="text-align:center;margin-top:32px;opacity:0.7;">
      <img src="https://stazbtfqsejoolkdnlgb.supabase.co/storage/v1/object/public/email_assets/logo-wayclo-speakers.png" 
            width="80" style="margin-right:18px;" />
      <img src="https://stazbtfqsejoolkdnlgb.supabase.co/storage/v1/object/public/email_assets/intercity.png" 
            width="80" />
    </div>

  </div>
</div>
`,
      });

    } catch (mailErr) {
      console.error("❌ Error enviando mail con Graph:", mailErr);
      // El error de envío de mail no impide la respuesta OK de la aprobación
    }

    return NextResponse.json({ ok: true }, { status: 200 });

  } catch (e) {
    console.error("POST /approve ERROR:", e);
    return NextResponse.json(
      { error: "Server error", detail: e.message },
      { status: 500 }
    );
  }
}