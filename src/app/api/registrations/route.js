// src/app/api/registrations/route.js
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      first_name,
      last_name,
      email,
      phone,
      company,
      role,
      diet,
      diet_other,
    } = body || {};

    // validaciones básicas
    if (!first_name || !last_name || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer(); // usa SERVICE_ROLE en servidor (como en tu helper) :contentReference[oaicite:3]{index=3}

    const { data, error } = await supabase
      .from("registrations")
      .insert({
        first_name,
        last_name,
        email,
        phone,
        company: company ?? null,
        role: role ?? null,
        diet: diet ?? "Ninguna",
        diet_other: diet_other ?? null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      const status = error.code === "23505" ? 409 : 500; // por si tenés unique indexes
      return NextResponse.json(
        { error: "DB error", detail: error.message },
        { status }
      );
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
