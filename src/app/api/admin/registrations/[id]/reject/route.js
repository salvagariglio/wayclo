"use server";

import "server-only";
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
// import { sendEmailGraph } from "@/lib/sendEmailGraph"; // 👈 No se necesita si no envía email

// 💡 CAMBIO CLAVE: Usamos 'request' y extraemos el ID manualmente
export async function POST(request) {
  try {
    const supabase = getSupabaseServer();

    // ✅ SOLUCIÓN ROBUSTA: Acceder al ID desde el pathname de la URL
    // Esto evita el error 'sync-dynamic-apis' que persiste con 'context.params'
    const pathname = new URL(request.url).pathname;
    const segments = pathname.split('/');
    // El ID es el segmento anterior a 'reject'
    const id = segments[segments.length - 2];

    if (!id) {
      return NextResponse.json(
        { error: "Falta id de registro en la URL" },
        { status: 400 }
      );
    }

    // Obtener registro (Opcional, pero bueno para verificar existencia)
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

    return NextResponse.json({ ok: true }, { status: 200 });

  } catch (e) {
    console.error("POST /reject ERROR:", e);
    return NextResponse.json(
      { error: "Server error", detail: e.message },
      { status: 500 }
    );
  }
}