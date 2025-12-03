import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE
);

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const path = searchParams.get("path");

        if (!path) {
            return NextResponse.json(
                { error: "Missing path parameter" },
                { status: 400 }
            );
        }

        // 🔥 Descargar como archivo binario desde Supabase Storage
        const { data, error } = await supabase.storage
            .from("panels")
            .download(path);

        if (error || !data) {
            return NextResponse.json(
                { error: "File not found in storage" },
                { status: 404 }
            );
        }

        // Detectar MIME según extensión
        const ext = path.split(".").pop().toLowerCase();
        let mime = "application/octet-stream";

        if (ext === "txt") mime = "text/plain";
        if (ext === "docx") mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

        return new Response(data, {
            headers: {
                "Content-Type": mime,
                "Content-Disposition": `attachment; filename="${path.split("/").pop()}"`
            }
        });

    } catch (e) {
        console.error("DOWNLOAD ERROR:", e);
        return NextResponse.json(
            { error: e.message || "Error downloading file" },
            { status: 500 }
        );
    }
}
