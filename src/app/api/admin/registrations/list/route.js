export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

export async function GET(req) {
    try {
        // 🔐 solo admin
        const guard = await requireAdmin();
        if (guard) return guard;

        const envDiag = {
            has_SUPABASE_URL: !!process.env.SUPABASE_URL,
            has_SUPABASE_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE,
        };

        let supabase;
        try {
            supabase = getSupabaseServer();
        } catch (e) {
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
            return NextResponse.json(
                {
                    error: "DB error",
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    env: envDiag,
                },
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
