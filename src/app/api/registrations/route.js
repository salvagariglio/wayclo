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
        } = body;

        const required = { first_name, last_name, email, phone, company, role };
        for (const [k, v] of Object.entries(required)) {
            if (!v || !String(v).trim()) {
                return NextResponse.json({ error: `Falta ${k}` }, { status: 400 });
            }
        }

        const supabase = getSupabaseServer();

        const { data, error } = await supabase
            .from("registrations")
            .insert([
                {
                    first_name,
                    last_name,
                    email,
                    phone,
                    company,
                    role,
                    diet,
                    diet_other,
                    status: "pending",
                },
            ])
            .select("id")
            .single();

        if (error) {
            console.error("Supabase insert error:", error);
            return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
        }

        return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
