import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(_req, { params }) {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("registrations")
      .update({ status: "rejected" })
      .eq("id", params.id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Not found" }, { status: 400 });
    }

    const full = [data.first_name, data.last_name].filter(Boolean).join(" ");
    await sendEmail({
      to: data.email,
      subject: "Estado de tu registro",
      html: `
        <div style="font-family:sans-serif;line-height:1.5;color:#111">
          <h2>Hola ${full || ""}</h2>
          <p>En esta edición tu registro <b>no fue aceptado</b>.</p>
          <p>Gracias por el interés. ¡Te esperamos en próximas ediciones!</p>
          <hr/><small>Equipo del evento</small>
        </div>`,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
