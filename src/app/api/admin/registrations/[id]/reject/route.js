"use server";

import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServer } from "@/lib/supabaseServer";
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

    if (!id) {
      return NextResponse.json(
        { error: "Falta id de registro en la URL" },
        { status: 400 }
      );
    }

    const { data: reg, error: fetchError } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !reg) {
      console.error("Error buscando registro:", fetchError);
      return NextResponse.json(
        { error: "No se encontró el registro" },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from("registrations")
      .update({ status: "rejected" })
      .eq("id", id);

    if (updateError) {
      console.error(updateError);
      return NextResponse.json(
        { error: "No se pudo rechazar el registro" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("POST /reject ERROR:", e);
    return NextResponse.json(
      { error: "Server error", detail: e.message },
      { status: 500 }
    );
  }
}