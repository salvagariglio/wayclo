import "server-only";
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { sendEmailGraph } from "@/lib/sendEmailGraph";

// --- helper: verificar Turnstile ---
async function verifyTurnstile(token, ip) {
  if (!token) return { ok: false, reason: "missing-token" };

  const secret = process.env.TURNSTILE_SECRET_KEY || "";
  if (!secret) return { ok: false, reason: "missing-secret" };

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({
      secret,
      response: token,
      remoteip: ip || "",
    }),
  });

  const data = await res.json();
  return { ok: !!data?.success, data };
}

// ========================
//     GET REGISTRATIONS
// ========================
export async function GET(req) {
  try {
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

// ========================
//          POST
// ========================
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

    // 1) Verificar Turnstile
    const ver = await verifyTurnstile(turnstileToken, ip);
    if (!ver.ok) {
      return NextResponse.json(
        {
          detail: "Captcha inválido",
          field_errors: { captcha: "Captcha inválido. Intentá nuevamente." },
        },
        { status: 400 }
      );
    }

    // 2) Validaciones mínimas
    let missing = {};
    if (!first_name?.trim()) missing.first_name = "Falta el nombre.";
    if (!last_name?.trim()) missing.last_name = "Falta el apellido.";
    if (!email?.trim()) missing.email = "Falta el email.";
    if (!phone?.trim()) missing.phone = "Falta el teléfono.";
    if (!company?.trim()) missing.company = "Falta la empresa.";
    if (!role?.trim()) missing.role = "Falta el puesto.";

    if (Object.keys(missing).length > 0) {
      return NextResponse.json(
        {
          detail: "Hay errores en los campos",
          field_errors: missing,
        },
        { status: 400 }
      );
    }

    // 3) Insertar en Supabase
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

    // 4) Manejo de errores claros (email duplicado, teléfono duplicado)
    if (error) {
      console.error("Supabase insert error:", error);

      const msg = (error.message || "").toLowerCase();
      const det = (error.details || "").toLowerCase();
      const hint = (error.hint || "").toLowerCase();

      let fieldErrors = {};

      // detect email duplicate
      if (
        msg.includes("email") ||
        det.includes("email") ||
        hint.includes("email")
      ) {
        fieldErrors.email = "Este email ya está registrado.";
      }

      // detect phone duplicate
      if (
        msg.includes("phone") ||
        det.includes("phone") ||
        hint.includes("phone")
      ) {
        fieldErrors.phone = "Este teléfono ya está registrado.";
      }

      // unknown error → fallback
      if (Object.keys(fieldErrors).length === 0) {
        return NextResponse.json(
          {
            detail: "No se pudo crear el registro.",
            field_errors: {},
          },
          { status: 500 }
        );
      }

      // return structured field errors
      return NextResponse.json(
        {
          detail: "Hay errores en los campos.",
          field_errors: fieldErrors,
        },
        { status: 400 }
      );
    }

    // 5) Enviar email
    try {
      await sendEmailGraph({
        to: email.trim(),
        subject: "¡Un paso más cerca del CyberCloud!",
        html: `
          <div style="width:100%;padding:40px 0;background:linear-gradient(180deg,#021728 0%,#00263F 100%);font-family:Arial,sans-serif;color:#fff;">
            <div style="max-width:520px;margin:auto;background:rgba(255,255,255,0.07);padding:32px 36px;border-radius:14px;">
              
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
              <p>Tu inscripción fue recibida y estamos procesándola.</p>

              <p style="margin-top:28px;">Nos vemos pronto,</p>
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
      console.error("❌ Error enviando mail:", mailErr);
    }

    return NextResponse.json({ ok: true, id: data?.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}
