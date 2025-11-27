import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { verifyAdminJWT } from "@/lib/auth";

async function requireAdmin() {
    const token = cookies().get("admin")?.value;
    const v = token ? await verifyAdminJWT(token) : { ok: false };
    if (!v.ok) {
        return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    return null;
}

export async function GET(req) {
    // 🔐 solo admin
    const guard = await requireAdmin();
    if (guard) return guard;

    const supabase = getSupabaseServer();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // "checked" | "pending" | null

    const { data, error } = await supabase
        .from("registrations")
        .select(
            "id, first_name, last_name, company, role, qr_used, qr_used_at"
        )
        .eq("status", "approved")
        .order("first_name", { ascending: true });

    if (error) {
        return NextResponse.json(
            { ok: false, error: error.message },
            { status: 500 }
        );
    }

    const filtered = data.filter((item) => {
        if (filter === "checked") return item.qr_used;
        if (filter === "pending") return !item.qr_used;
        return true;
    });

    return NextResponse.json({ ok: true, items: filtered });
}
