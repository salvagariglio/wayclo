import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { sendEmailGraph } from "@/lib/sendEmailGraph";
import { verifyAdminJWT } from "@/lib/auth";

async function requireAdmin() {
  const token = cookies().get("admin")?.value;
  const v = token ? await verifyAdminJWT(token) : { ok: false };
  if (!v.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

// --- helper: verificar Turnstile ---
async function verifyTurnstile(token, ip) {
  if (!token) return { ok: false, reason: "missing-token" };

  const secret = process.env.TURNSTILE_SECRET_KEY || "";
  if (!secret) return { ok: false, reason: "missing-secret" };

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: ip || "",
      }),
    }
  );

  const data = await res.json();
  return { ok: !!data?.success, data };
}

export async function GET(req) {
  try {
    // 🔐 solo admin para listar
    const guard = await requireAdmin();
    if (guard) return guard;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const supabase = getSupabaseServer();

    let q = supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) q = q.eq("status", status);

    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ items: data || [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: crea registro (público, con Turnstile)
export async function POST(req) {
  try {
    const supabase = getSupabaseServer();
    const body = await req.json();

    const {
      first_name,
      last_name,
      email,
      phone,
      company,
      role,
      diet,
      diet_other = null,
      status = "pending",
      turnstileToken,
    } = body || {};

    const ip =
      (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "";

    const ver = await verifyTurnstile(turnstileToken, ip);
    if (!ver.ok) {
      return NextResponse.json(
        { error: "Captcha inválido. Intentá nuevamente." },
        { status: 400 }
      );
    }

    if (!first_name?.trim())
      return NextResponse.json({ error: "Falta first_name" }, { status: 400 });
    if (!last_name?.trim())
      return NextResponse.json({ error: "Falta last_name" }, { status: 400 });
    if (!email?.trim())
      return NextResponse.json({ error: "Falta email" }, { status: 400 });
    if (!phone?.trim())
      return NextResponse.json({ error: "Falta phone" }, { status: 400 });
    if (!company?.trim())
      return NextResponse.json({ error: "Falta company" }, { status: 400 });
    if (!role?.trim())
      return NextResponse.json({ error: "Falta role" }, { status: 400 });

    const { data, error } = await supabase
      .from("registrations")
      .insert([
        {
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          company: company.trim(),
          role: role.trim(),
          diet: (diet || "").trim(),
          diet_other: diet_other ? String(diet_other).trim() : null,
          status: status || "pending",
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "No se pudo crear el registro." },
        { status: 500 }
      );
    }

    try {
      await sendEmailGraph({
        to: email.trim(),
        subject: "¡Un paso más cerca del CyberCloud!",
        html: `
<div style="width:100%;padding:40px 0;background:linear-gradient(180deg,#021728 0%,#00263F 100%);font-family:Arial,sans-serif;color:#fff;">
  <div style="max-width:520px;margin:auto;background:rgba(255,255,255,0.07);padding:32px 36px;border-radius:14px;">
    
    <!-- LOGO -->
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://stazbtfqsejoolkdnlgb.supabase.co/storage/v1/object/public/email_assets/logo-slogan.png" 
           width="150" 
           alt="CyberCloud" 
           style="margin-bottom:10px;" />
    </div>

    <h2 style="text-align:center;font-size:22px;margin-bottom:26px;">
      ¡Un paso más cerca del CyberCloud!
    </h2>

    <p>Hola <strong>${first_name}</strong>,</p>
    <p>¡Gracias por registrarte en <strong>CyberCloud</strong>! 🙌</p>

    <p>Tu inscripción fue recibida correctamente y nuestro equipo ya está revisando tu participación.
    En breve recibirás una confirmación en este mismo correo.</p>

    <p>Mientras tanto, preparate para una experiencia única junto a líderes de ciberseguridad,
    telecomunicaciones y tecnología de la región.</p>

    <p style="margin-top:28px;">Nos vemos pronto,</p>
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
      });
    } catch (mailErr) {
      console.error("❌ Error enviando mail de registro:", mailErr);
    }

    return NextResponse.json({ ok: true, id: data?.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
