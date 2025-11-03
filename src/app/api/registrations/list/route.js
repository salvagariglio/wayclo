// src/app/api/registrations/list/route.js
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
    try {
        // auth opcional para listar (si querés limitarlo, igual que approve/reject)
        const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
        const auth = req.headers.get("authorization") || "";
        if (ADMIN_TOKEN && auth !== `Bearer ${ADMIN_TOKEN}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = getSupabaseServer(); // ✅ dentro del handler
        const { data, error } = await supabase
            .from("registrations")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            return NextResponse.json({ error: "DB error" }, { status: 500 });
        }

        return NextResponse.json({ rows: data ?? [] });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
