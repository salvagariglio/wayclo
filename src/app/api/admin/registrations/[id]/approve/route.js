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
<!-- Contenedor general -->
<div style="width:100%; padding:40px 0; background:linear-gradient(180deg,#021728 0%,#00263F 100%); font-family:Arial,sans-serif; color:#fff;">

  <!-- Card -->
  <div style="max-width:560px; margin:auto; background:rgba(255,255,255,0.08); padding:40px 36px; border-radius:16px;">

    <!-- LOGO PRINCIPAL -->
    <table width="100%" style="margin-bottom:32px;">
      <tr>
        <td align="center">
          <img 
            src="https://stazbtfqsejoolkdnlgb.supabase.co/storage/v1/object/public/email_assets/pixelcut-export.png"
            alt="CyberCloud"
            width="220"
            style="display:block; margin:auto; margin-bottom:10px;"
          />
        </td>
      </tr>
    </table>

    <!-- TÍTULO -->
    <h2 style="text-align:center; font-size:24px; margin-bottom:26px; font-weight:600;">
      Confirmado: Nos vemos en CyberCloud ⚡
    </h2>

    <!-- TEXTO -->
    <p style="font-size:15px;">
      ¡Buenas noticias, <strong>${fullName}</strong>! 🎉<br/>
      Tu inscripción a <strong>CyberCloud</strong> fue aprobada.
    </p>

    <p style="font-size:15px;">
      Presentá este <strong>código QR personal</strong> el día del evento:
    </p>

    <!-- QR -->
    <table width="100%" style="margin:28px 0;">
      <tr>
        <td align="center">
          <img 
            src="${qrUrl}" 
            width="220" 
            style="display:block; border-radius:12px;" 
            alt="QR CyberCloud"
          />
        </td>
      </tr>
    </table>

    <!-- INFO -->
    <p style="font-size:15px; line-height:1.6;">
      📅 <strong>Fecha:</strong> 15 de diciembre<br/>
      📍 <strong>Lugar:</strong> Polo Científico Tecnológico — Río Cuarto
    </p>

    <p style="font-size:15px;">
      Te esperamos para un día lleno de charlas, networking y el exclusivo 
      <strong>Cyber After Cocktail</strong>.
    </p>

    <p style="margin-top:28px; font-size:15px;">
      ¡Nos vemos ahí!<br/>
      <strong>Equipo CyberCloud</strong>
    </p>


    <!-- ============================================== -->
    <!-- ORGANIZAN -->
    <!-- ============================================== -->
    <h3 style="text-align:center; font-size:16px; margin-top:46px; margin-bottom:18px; letter-spacing:1px; opacity:0.9;">
      ORGANIZAN
    </h3>

    <table width="100%" style="margin-bottom:38px;">
      <tr>
        <td align="center">
          <table style="margin:auto;">
            <tr>
              <td align="center" style="padding-right:32px;">
                <img 
                  src="https://stazbtfqsejoolkdnlgb.supabase.co/storage/v1/object/public/email_assets/logo-wayclo-speakers.png"
                  width="110"
                  alt="Wayclo"
                  style="display:block;"
                />
              </td>

              <td align="center" style="padding-left:32px;">
                <img 
                  src="https://stazbtfqsejoolkdnlgb.supabase.co/storage/v1/object/public/email_assets/intercity.png"
                  width="110"
                  alt="Intercity"
                  style="display:block;"
                />
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>


    <!-- ============================================== -->
    <!-- ACOMPAÑA -->
    <!-- ============================================== -->
    <h3 style="text-align:center; font-size:16px; margin-bottom:18px; letter-spacing:1px; opacity:0.9;">
      ACOMPAÑA
    </h3>

    <table width="100%" style="margin-bottom:10px;">
      <tr>
        <td align="center">
          <img 
            src="https://stazbtfqsejoolkdnlgb.supabase.co/storage/v1/object/public/email_assets/lenovo.png"
            width="140"
            alt="Lenovo"
            style="display:block; margin:auto;"
          />
        </td>
      </tr>
    </table>

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