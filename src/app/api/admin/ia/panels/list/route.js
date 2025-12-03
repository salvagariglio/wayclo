import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE
);

export async function GET() {
    const { data, error } = await supabase
        .from("panel_transcripts")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, panels: data });
}
