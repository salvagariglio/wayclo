import "server-only";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSupabaseServer } from "@/lib/supabaseServer";

// --- VERIFICACIÓN DE TURNSTILE ---
async function verifyTurnstile(token, ip) {
    const secret = process.env.TURNSTILE_SECRET_KEY;

    if (!secret) {
        console.warn("[Turnstile] Falta TURNSTILE_SECRET_KEY → NO se verifica");
        return { ok: true, skipped: true };
    }

    if (!token) {
        return { ok: false, error: "No llegó el token de Turnstile" };
    }

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
    return { ok: !!data.success, data };
}

// ============= POST =============
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
            turnstileToken,
        } = body;

        // Validaciones
        const required = { first_name, last_name, email, phone, company, role };
        for (const [key, value] of Object.entries(required)) {
            if (!value || !value.trim()) {
                return NextResponse.json(
                    { error: `Falta ${key}` },
                    { status: 400 }
                );
            }
        }

        // IP del cliente
        const ip =
            (headers().get("x-forwarded-for") || "").split(",")[0]?.trim() || "";

        // Verificación de Turnstile
        const turn = await verifyTurnstile(turnstileToken, ip);
        if (!turn.ok) {
            console.warn("Turnstile ERROR:", turn);
            return NextResponse.json(
                { error: "Verificado de seguridad inválido", detail: turn },
                { status: 400 }
            );
        }

        // Insert en Supabase
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
            return NextResponse.json(
                { error: "No se pudo crear el registro" },
                { status: 500 }
            );
        }

        return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
    } catch (e) {
        console.error("POST /api/registrations ERROR:", e);
        return NextResponse.json(
            { error: "Server error", detail: e.message },
            { status: 500 }
        );
    }
}
