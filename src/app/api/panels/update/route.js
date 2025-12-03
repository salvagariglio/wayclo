import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE
);

export async function POST(request) {
    try {
        const body = await request.json();

        const { id, transcript_clean, summary } = body;

        const { data, error } = await supabase
            .from("panel_transcripts")
            .update({
                ...(transcript_clean && { transcript_clean }),
                ...(summary && { summary }),
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, panel: data });
    } catch (e) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
