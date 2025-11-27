"use server";

import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { sendEmailGraph } from "@/lib/sendEmailGraph";
import QRCode from "qrcode";
import crypto from "crypto";
import { generateTicketPDF } from "@/lib/generateTicketPDF";
import { verifyAdminJWT } from "@/lib/auth";

async function requireAdmin() {
  const token = cookies().get("admin")?.value;
  const v = token ? await verifyAdminJWT(token) : { ok: false };
  if (!v.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(_req, { params }) {
  try {
    // 🔐 solo admin
    const guard = await requireAdmin();
    if (guard) return guard;

    const supabase = getSupabaseServer();
    const { id } = params;

    const { data: reg, error: fetchErr } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !reg)
      return NextResponse.json(
        { error: "Registro no encontrado" },
        { status: 404 }
      );

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
      margin: 1,
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
      return NextResponse.json(
        { error: "No se pudo subir el QR" },
        { status: 500 }
      );
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
      return NextResponse.json(
        { error: "No se pudo subir el PDF" },
        { status: 500 }
      );
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

    await sendEmailGraph({
      to: reg.email,
      subject: "Confirmado: Nos vemos en CyberCloud ⚡",
      html: `
<div style="width:100%;padding:40px 0;background:linear-gradient(180deg,#021728 0%,#00263F 100%);font-family:Arial,sans-serif;color:#fff;">
  <div style="max-width:520px;margin:auto;background:rgba(255,255,255,0.07);padding:32px 36px;border-radius:14px;">
    
    <!-- LOGO -->
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

    <!-- QR -->
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

    <!-- LOGOS -->
    <div style="text-align:center;margin-top:32px;opacity:0.7;">
      <img src="https://stazbtfqsejoolkdnlgb.supabase.co/storage/v1/object/public/email_assets/logo-wayclo-speakers.png" 
           width="80" style="margin-right:18px;" />
      <img src="https://stazbtfqsejoolkdnlgb.supabase.co/storage/v1/object/public/email_assets/intercity.png" 
           width="80" />
    </div>

  </div>
</div>
`,
      attachments: [
        {
          "@odata.type": "#microsoft.graph.fileAttachment",
          name: `CyberCloud_Ticket_${id}.pdf`,
          contentBytes: pdfBuffer.toString("base64"),
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("POST /approve error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
