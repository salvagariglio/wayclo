"use server";

import "server-only";
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

// 💡 CAMBIO CLAVE: Cambiar la firma para usar 'context' en lugar de desestructurar '{ params }'
export async function POST(_req, context) {
  try {
    const supabase = getSupabaseServer();

    // 💡 SOLUCIÓN: Acceder a params desde 'context'
    // Y luego obtener 'id' del objeto params
    const { id } = context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Falta id de registro en la URL" },
        { status: 400 }
      );
    }

    // Obtener registro
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

    // Actualizar estado a "rejected"
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

    // ❌ Sin envío de email

    return NextResponse.json({ ok: true }, { status: 200 });

  } catch (e) {
    console.error("POST /reject ERROR:", e);
    return NextResponse.json(
      { error: "Server error", detail: e.message },
      { status: 500 }
    );
  }
}