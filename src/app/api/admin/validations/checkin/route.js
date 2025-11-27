import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { verifyAdminJWT } from "@/lib/auth";

// 🔐 Middleware simple para exigir sesión admin
async function requireAdmin() {
    const token = cookies().get("admin")?.value;
    const v = token ? await verifyAdminJWT(token) : { ok: false };

    if (!v.ok) {
        return NextResponse.json(
            { ok: false, error: "unauthorized" },
            { status: 401 }
        );
    }
    return null;
}

export async function POST(req) {
    // ✅ Solo permite seguir si el admin está loggeado
    const guard = await requireAdmin();
    if (guard) return guard;

    const { id } = await req.json();
    const supabase = getSupabaseServer();

    const { data: reg } = await supabase
        .from("registrations")
        .select("id, qr_used, qr_used_at") // incluimos qr_used_at
        .eq("id", id)
        .single();

    if (!reg) {
        return NextResponse.json({ ok: false, error: "Invitado no encontrado" });
    }

    // Evitar registrar ingreso duplicado
    const wasUsed = reg.qr_used === true;

    const { error } = await supabase
        .from("registrations")
        .update({
            qr_used: true,
            qr_used_at: wasUsed ? reg.qr_used_at : new Date().toISOString(),
        })
        .eq("id", id);

    if (error) {
        return NextResponse.json({ ok: false, error: error.message });
    }

    return NextResponse.json({
        ok: true,
        alreadyChecked: wasUsed,
    });
}
