export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
    try {
        // Auth opcional (si querés proteger el listado)
        const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
        const auth = req.headers.get("authorization") || "";
        if (ADMIN_TOKEN && auth !== `Bearer ${ADMIN_TOKEN}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 🔍 Diagnóstico de envs (booleans, sin exponer valores)
        const envDiag = {
            has_SUPABASE_URL: !!process.env.SUPABASE_URL,
            has_SUPABASE_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE,
        };

        let supabase;
        try {
            supabase = getSupabaseServer();
        } catch (e) {
            // Si falta alguna env o el helper arroja error, lo mostramos
            return NextResponse.json(
                { error: "Supabase init failed", message: e?.message, env: envDiag },
                { status: 500 }
            );
        }

        const { data, error } = await supabase
            .from("registrations")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            // Devolver detalle para depurar ahora
            return NextResponse.json(
                { error: "DB error", code: error.code, message: error.message, details: error.details, env: envDiag },
                { status: 500 }
            );
        }

        return NextResponse.json({ rows: data ?? [], env: envDiag });
    } catch (e) {
        return NextResponse.json(
            { error: "Server error", message: e?.message },
            { status: 500 }
        );
    }
}
