import "server-only";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSupabaseServer } from "@/lib/supabaseServer";

async function verifyTurnstile(token, ip) {
    if (!token) return { ok: false, reason: "missing-token" };

    const secret = process.env.TURNSTILE_SECRET_KEY || "";
    if (!secret) return { ok: false, reason: "missing-secret" };

    const res = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
            method: "POST",
            body: new URLSearchParams({
                secret,
                response: token,
                remoteip: ip || "",
            }),
        }
    );

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

        if (error) {
            console.error("GET error:", error);
            return NextResponse.json({ error: "Error al obtener registros" }, { status: 500 });
        }

        return NextResponse.json({ items: data || [] }, { status: 200 });
    } catch (e) {
        console.error("GET exception:", e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

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
            turnstileToken,
        } = body || {};

        const ip = (headers().get("x-forwarded-for") || "").split(",")[0]?.trim() || "";

        const ver = await verifyTurnstile(turnstileToken, ip);
        if (!ver.ok) {
            console.warn("Turnstile error:", ver);
            return NextResponse.json({ error: "Verificado inválido" }, { status: 400 });
        }

        if (!first_name) return NextResponse.json({ error: "Falta first_name" }, { status: 400 });
        if (!last_name) return NextResponse.json({ error: "Falta last_name" }, { status: 400 });
        if (!email) return NextResponse.json({ error: "Falta email" }, { status: 400 });
        if (!phone) return NextResponse.json({ error: "Falta phone" }, { status: 400 });
        if (!company) return NextResponse.json({ error: "Falta company" }, { status: 400 });
        if (!role) return NextResponse.json({ error: "Falta role" }, { status: 400 });

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
            console.error("Insert error:", error);
            return NextResponse.json({ error: "No se pudo insertar" }, { status: 500 });
        }

        return NextResponse.json({ ok: true, id: data?.id }, { status: 201 });
    } catch (e) {
        console.error("POST exception:", e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
