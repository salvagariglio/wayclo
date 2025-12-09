import "server-only";
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { sendEmailGraph } from "@/lib/sendEmailGraph";

// 🔐 Bloqueo básico de caracteres típicos de SQLi (pedido del cliente)
const FORBIDDEN_PATTERN = /['";]|--|\/\*/;

function containsForbidden(value) {
  if (typeof value !== "string") return false;
  return FORBIDDEN_PATTERN.test(value);
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
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

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

    // 🔐 0) Validar caracteres no permitidos antes de seguir
    const forbiddenFieldErrors = {};
    const textFields = {
      first_name,
      last_name,
      email,
      phone,
      company,
      role,
      diet,
      diet_other,
    };

    for (const [field, value] of Object.entries(textFields)) {
      if (value && containsForbidden(String(value).trim())) {
        forbiddenFieldErrors[field] =
          "Este campo contiene caracteres no permitidos (', \", ;, --, etc.).";
      }
    }

    if (Object.keys(forbiddenFieldErrors).length > 0) {
      return NextResponse.json(
        {
          detail: "Hay caracteres no permitidos en algunos campos.",
          field_errors: forbiddenFieldErrors,
        },
        { status: 400 }
      );
    }

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

    // 5) Enviar email (SIN CAMBIOS)
    try {
      await sendEmailGraph({
        to: email.trim(),
        subject: "¡Un paso más cerca del CyberCloud!",
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
              style="display: block; margin: 0 auto;"
            />
          </td>
        </tr>

        <!-- TÍTULO -->
        <tr>
          <td align="center" style="font-size: 22px; font-weight: bold; padding-bottom: 20px;">
            ¡Un paso más cerca del CyberCloud!
          </td>
        </tr>

        <!-- CUERPO -->
        <tr>
          <td style="font-size: 15px; line-height: 1.6; font-weight: bold;">
            Hola <strong>${first_name}</strong>,<br/><br/>
            ¡Gracias por registrarte en <strong>CyberCloud</strong>! 🙌
          </td>
        </tr>

        <tr>
          <td style="padding-top: 16px; font-size: 15px; line-height: 1.6; font-weight: bold;">
            Tu inscripción fue recibida correctamente y nuestro equipo está revisando tu participación.
            En breve recibirás la confirmación definitiva en este mismo correo.
          </td>
        </tr>

        <tr>
          <td style="padding-top: 28px; font-size: 15px; font-weight: bold;">
            Nos vemos pronto,<br/>
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
    <table cellpadding="0" cellspacing="0" border="0">
      <tr>

        <!-- LENOVO -->
        <td align="center" style="padding: 0 20px;">
          <img
            src="https://stazbtfqsejoolkdnlgb.supabase.co/storage/v1/object/public/email_assets/lenovo.png"
            width="120"
            alt="Lenovo"
            style="display:block; margin:auto;"
          />
        </td>

        <!-- CLUSTER TECNOLÓGICO -->
        <td align="center" style="padding: 0 20px;">
          <img
            src="https://stazbtfqsejoolkdnlgb.supabase.co/storage/v1/object/public/email_assets/cluster-logo.png"
            width="120"
            alt="Cluster Tecnológico"
            style="display:block; margin:auto;"
          />
        </td>

        <!-- VMUG -->
        <td align="center" style="padding: 0 20px;">
          <img
            src="https://stazbtfqsejoolkdnlgb.supabase.co/storage/v1/object/public/email_assets/vmug-logo.jpeg"
            width="120"
            alt="VMUG"
            style="display:block; margin:auto;"
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
      console.error("❌ Error enviando mail:", mailErr);
    }

    return NextResponse.json({ ok: true, id: data?.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}
