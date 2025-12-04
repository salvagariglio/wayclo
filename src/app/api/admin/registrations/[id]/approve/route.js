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
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; padding: 40px 0;">
  <tr>
    <td align="center">

      <!-- CARD -->
      <table width="560" cellpadding="0" cellspacing="0" border="0" style="width: 560px; background: #ffffff; border-radius: 12px; padding: 40px 32px;">

        <!-- LOGO -->
        <tr>
          <td align="center" style="padding-bottom: 24px;">
            <img 
              src="https://stazbtfqsejoolkdnlgb.supabase.co/storage/v1/object/public/email_assets/pixelcut-export.png"
              alt="CyberCloud"
              width="180"
            />
          </td>
        </tr>

        <!-- TÍTULO -->
        <tr>
          <td align="center" style="font-size: 22px; font-weight: bold; padding-bottom: 20px;">
            Confirmado: ¡Nos vemos en CyberCloud! ⚡
          </td>
        </tr>

        <!-- TEXTO -->
        <tr>
          <td style="font-size: 15px; font-weight: bold; line-height: 1.6;">
            ¡Buenas noticias, <strong>${fullName}</strong>! 🎉<br/>
            Tu inscripción fue aprobada.
          </td>
        </tr>

        <tr>
          <td style="padding-top: 16px; font-size: 15px; font-weight: bold;">
            Presentá este código QR personal el día del evento:
          </td>
        </tr>

        <!-- QR -->
        <tr>
          <td align="center" style="padding: 28px 0;">
            <img 
              src="${qrUrl}" 
              width="220" 
              style="display:block; border-radius:12px;" 
              alt="QR CyberCloud"
            />
          </td>
        </tr>

        <!-- INFO DEL EVENTO -->
        <tr>
          <td style="font-size: 15px; line-height: 1.6; font-weight: bold;">
            📅 <strong>Fecha:</strong> 15 de diciembre<br/>
            📍 <strong>Lugar:</strong> Polo Científico Tecnológico — Río Cuarto
          </td>
        </tr>

        <tr>
          <td style="padding-top: 16px; font-size: 15px; font-weight: bold;">
            Te esperamos para un día lleno de charlas, networking y el exclusivo <strong>Cyber After Cocktail</strong>.
          </td>
        </tr>

        <tr>
          <td style="padding-top: 28px; font-size: 15px; font-weight: bold;">
            ¡Nos vemos pronto!<br/>
            <strong>Equipo CyberCloud</strong>
          </td>
        </tr>

        <!-- ORGANIZAN -->
<tr>
  <td align="center" style="padding-top: 40px; font-size: 14px; font-weight: bold; letter-spacing: 1px; opacity: 0.8;">
    ORGANIZAN
  </td>
</tr>

<tr>
  <td align="center" style="padding-top: 16px;">
    <table>
      <tr>

        <!-- WAYCLO -->
        <td align="center" style="padding-right: 32px;">

          <!-- LOGO CLARO -->
          <img
            src="https://stazbtfqsejoolkdnlgb.supabase.co/storage/v1/object/public/email_assets/logo-wayclo.png"
            width="100"
            style="display:block; margin:auto;"
            alt="Wayclo"
            class="wayclo-light"
          />

          <!-- LOGO OSCURO -->
          <img
            src="https://stazbtfqsejoolkdnlgb.supabase.co/storage/v1/object/public/email_assets/logo-wayclo-speakers.png"
            width="100"
            style="display:none; margin:auto;"
            alt="Wayclo Dark"
            class="wayclo-dark"
          />

        </td>

        <!-- INTERCITY -->
        <td align="center" style="padding-left: 32px;">
          <img 
            src="https://stazbtfqsejoolkdnlgb.supabase.co/storage/v1/object/public/email_assets/intercity.png"
            width="100"
            alt="Intercity"
          />
        </td>

      </tr>
    </table>
  </td>
</tr>


        <!-- ACOMPAÑA -->
        <tr>
          <td align="center" style="padding-top: 36px; font-size: 14px; font-weight: bold; letter-spacing: 1px; opacity: 0.8;">
            ACOMPAÑA
          </td>
        </tr>

        <tr>
          <td align="center" style="padding-top: 16px;">
            <img 
              src="https://stazbtfqsejoolkdnlgb.supabase.co/storage/v1/object/public/email_assets/lenovo.png"
              width="130"
              alt="Lenovo"
            />
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>
<style>
  @media (prefers-color-scheme: dark) {
    .wayclo-light { display: none !important; }
    .wayclo-dark  { display: block !important; }
  }

  @media (prefers-color-scheme: light) {
    .wayclo-light { display: block !important; }
    .wayclo-dark  { display: none !important; }
  }
</style>

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