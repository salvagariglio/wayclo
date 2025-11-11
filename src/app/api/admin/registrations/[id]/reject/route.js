import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req, { params }) {
  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from("registrations")
    .update({ status: "rejected" })
    .eq("id", params.id)
    .select()
    .single();

  if (error || !data)
    return NextResponse.json(
      { error: error?.message || "Not found" },
      { status: 400 }
    );

  const full = `${data.first_name} ${data.last_name}`;

  await sendEmail({
    to: data.email,
    subject: "Estado de tu registro",
    html: `<h2>Hola ${full}</h2><p>Tu registro no fue aceptado esta vez.</p>`,
  });

  return NextResponse.json({ ok: true });
}
