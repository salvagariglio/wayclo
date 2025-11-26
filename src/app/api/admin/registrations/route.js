import "server-only";
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { sendEmailGraph } from "@/lib/sendEmailGraph"; // 👈 AGREGADO

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

// POST: crea registro
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
        { error: "Captcha inválido. Intentá nuevamente." },
        { status: 400 }
      );
    }

    // 2) Validaciones mínimas
    if (!first_name?.trim()) return NextResponse.json({ error: "Falta first_name" }, { status: 400 });
    if (!last_name?.trim()) return NextResponse.json({ error: "Falta last_name" }, { status: 400 });
    if (!email?.trim()) return NextResponse.json({ error: "Falta email" }, { status: 400 });
    if (!phone?.trim()) return NextResponse.json({ error: "Falta phone" }, { status: 400 });
    if (!company?.trim()) return NextResponse.json({ error: "Falta company" }, { status: 400 });
    if (!role?.trim()) return NextResponse.json({ error: "Falta role" }, { status: 400 });

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

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "No se pudo crear el registro." },
        { status: 500 }
      );
    }

    // 4) Enviar email de confirmación de registro
    try {
      await sendEmailGraph({
        to: email.trim(),
        subject: "Recibimos tu registro – CyberCloud",
        html: `
          <h2>¡Gracias por registrarte, ${first_name}!</h2>
          <p>Tu registro fue recibido correctamente y está en proceso de revisión.</p>
          <p>En cuanto sea aprobado, vas a recibir otro correo con la confirmación.</p>
          <br />
          <p style="opacity: 0.7;">Equipo CyberCloud</p>
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
