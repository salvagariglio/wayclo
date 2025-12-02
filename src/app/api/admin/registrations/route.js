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
            width="200"
            style="display:block; margin:auto; margin-bottom:10px;"
          />
        </td>
      </tr>
    </table>

    <!-- TÍTULO -->
    <h2 style="text-align:center; font-size:24px; margin-bottom:26px; font-weight:600;">
      ¡Un paso más cerca del CyberCloud!
    </h2>

    <!-- TEXTO -->
    <p>Hola <strong>${first_name}</strong>,</p>
    <p>¡Gracias por registrarte en <strong>CyberCloud</strong>! 🙌</p>

    <p>
      Tu inscripción fue recibida correctamente y nuestro equipo ya está revisando tu participación.
      En breve recibirás la confirmación definitiva en este mismo correo.
    </p>

    <p style="margin-top:28px;">Nos vemos pronto,</p>
    <p><strong>Equipo CyberCloud</strong></p>

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
      console.error("❌ Error enviando mail:", mailErr);
    }

    return NextResponse.json({ ok: true, id: data?.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}
