export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
    try {
        const supabase = getSupabaseServer();

        const { data, error } = await supabase
            .from("registrations")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json(
                {
                    success: false,
                    error: "DB error",
                    code: error.code,
                    message: error.message,
                    details: error.details,
                },
                { status: 500 }
            );
        }

        const summary = buildGuestSummary(data ?? []);

        return NextResponse.json({ success: true, summary });
    } catch (e) {
        return NextResponse.json(
            { success: false, error: "Server error", message: e?.message },
            { status: 500 }
        );
    }
}

function buildGuestSummary(rows) {
    const byDiet = {};
    const byCompany = {};
    const byRole = {};
    const specialNotes = [];

    for (const r of rows) {
        const diet = (r.diet || "none").toLowerCase();
        byDiet[diet] = (byDiet[diet] || 0) + 1;

        const company = r.company?.trim() || "Sin empresa";
        byCompany[company] = (byCompany[company] || 0) + 1;

        const role = r.role?.trim() || "Otro";
        byRole[role] = (byRole[role] || 0) + 1;

        if (diet === "otra" && r.diet_other) {
            specialNotes.push({
                guest: `${r.first_name} ${r.last_name}`,
                note: r.diet_other,
            });
        }
    }

    return {
        total_guests: rows.length,
        by_diet: byDiet,
        by_company: byCompany,
        by_role: byRole,
        special_notes: specialNotes,
    };
}
