"use server";

import "server-only";
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { sendEmailGraph } from "@/lib/sendEmailGraph"; // 👈 AHORA Graph API

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

    // --- enviar email con Microsoft Graph ---
    try {
      await sendEmailGraph({
        to: data.email,
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
      📅 <strong>Fecha:</strong> 12 de diciembre<br>
      📍 <strong>Lugar:</strong> Campus Siglo 21 – Río Cuarto
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