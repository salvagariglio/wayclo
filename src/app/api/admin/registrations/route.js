import "server-only";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSupabaseServer } from "@/lib/supabaseServer";

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

// ======================
// GET: lista registros
// /api/admin/registration?status=pending|approved|rejected
// ======================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // pending|approved|rejected
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

// ======================
// POST: crea registro con verificación Turnstile
// Body esperado (desde tu form):
// {
//   first_name, last_name, email, phone, company, role,
//   diet,         // string: ej "vegano,celiaco"
//   diet_other,   // string|null
//   status,       // "pending" por defecto
//   turnstileToken
// }
// ======================
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

    // IP del cliente (útil para verificación y auditoría)
    const ip =
      (headers().get("x-forwarded-for") || "").split(",")[0]?.trim() || "";

    // 1) Verificar Turnstile
    const ver = await verifyTurnstile(turnstileToken, ip);
    if (!ver.ok) {
      // podés loguear ver.data?.["error-codes"] si querés
      return NextResponse.json(
        { error: "Captcha inválido. Intentá nuevamente." },
        { status: 400 }
      );
    }

    // 2) Validaciones mínimas de server (defensa en profundidad)
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
          diet: (diet || "").trim(),   // ya viene como string "vegano,celiaco"
          diet_other: diet_other ? String(diet_other).trim() : null,
          status: status || "pending",
          ip: ip || null,              // opcional si tu tabla tiene esta columna
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "No se pudo crear el registro." }, { status: 500 });
    }

    // 4) Responder éxito
    return NextResponse.json({ ok: true, id: data?.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
