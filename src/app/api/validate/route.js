import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    const token = searchParams.get("token");

    const { data } = await supabase
        .from("registrations")
        .select("*")
        .eq("id", id)
        .eq("qr_token", token)
        .single();

    if (!data) {
        return NextResponse.json({ ok: false });
    }

    return NextResponse.json({
        ok: true,
        fullName: `${data.first_name} ${data.last_name}`,
    });
}
