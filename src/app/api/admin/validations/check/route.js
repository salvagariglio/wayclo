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

export async function POST(req) {
    try {
        // 🔐 solo admin (scanner)
        const guard = await requireAdmin();
        if (guard) return guard;

        const { id, token } = await req.json();

        if (!id || !token) {
            return NextResponse.json({
                ok: false,
                error: "QR inválido",
            });
        }

        const supabase = getSupabaseServer();

        const { data, error } = await supabase
            .from("registrations")
            .select("*")
            .eq("id", id)
            .eq("qr_token", token)
            .eq("status", "approved")
            .single();

        if (error || !data) {
            return NextResponse.json({
                ok: false,
                error: "Invitación no válida",
            });
        }

        return NextResponse.json({
            ok: true,
            guest: {
                id: data.id,
                fullName: `${data.first_name} ${data.last_name}`,
                company: data.company,
                role: data.role,
                alreadyChecked: data.qr_used === true,
                checkInTime: data.qr_used_at || null,
            },
        });
    } catch (e) {
        console.error("CHECK ERROR:", e);
        return NextResponse.json({
            ok: false,
            error: "Error procesando QR",
        });
    }
}