import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Document, Packer, Paragraph } from "docx";

// OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Supabase client (DEBE USAR SERVICE_ROLE)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE
);

// Generar TXT
function generateTXT(text) {
    return Buffer.from(text, "utf-8");
}

// Generar DOCX
async function generateDOCX(text) {
    const paragraphs = text.split("\n").map(line => new Paragraph(line));
    const doc = new Document({
        sections: [{ children: paragraphs }],
    });
    return await Packer.toBuffer(doc);
}

// Subir archivo al storage
async function uploadFile(buffer, path, mime) {
    const { error } = await supabase.storage
        .from("panels")
        .upload(path, buffer, { contentType: mime, upsert: true });

    if (error) throw error;
    return path;
}

export async function POST(request) {
    try {
        const form = await request.formData();

        const audio = form.get("audio");
        const panelName = form.get("panelName") || "Panel sin nombre";

        if (!audio) {
            return NextResponse.json({ error: "No se subió audio" }, { status: 400 });
        }

        // Convertir archivo a buffer
        const bytes = await audio.arrayBuffer();
        const audioBuffer = Buffer.from(bytes);
        const mime = audio.type || "audio/ogg";

        console.log("🔊 Processing audio:", {
            name: audio.name,
            size: audioBuffer.length,
            mime,
        });

        // Subir audio a storage
        const audioPath = `audios/${Date.now()}-${audio.name}`;
        await supabase.storage.from("panels").upload(audioPath, audioBuffer, {
            contentType: mime,
            upsert: true,
        });

        const audioUrl = supabase.storage.from("panels").getPublicUrl(audioPath).data.publicUrl;

        // Crear un File REAL para OpenAI
        const fileForOpenAI = new File([audioBuffer], audio.name, {
            type: mime,
        });

        // -----------------------------------
        // 1) TRANSCRIPCIÓN
        // -----------------------------------
        const transcription = await openai.audio.transcriptions.create({
            file: fileForOpenAI,
            model: "gpt-4o-transcribe",
            diarization: true,
            timestamp_granularities: ["segment"],
        });

        // diarized puede venir NULL → fallback a null
        const diarized = Array.isArray(transcription.segments)
            ? transcription.segments
            : null;

        // Texto base limpio (sin rawText expuesto)
        const baseText = transcription.text || "";

        // -----------------------------------
        // 2) LIMPIEZA (SIN rawText — con fallback seguro)
        // -----------------------------------
        let cleanInput;

        if (diarized) {
            // Hay speakers → mandar estructura diarizada
            cleanInput = JSON.stringify(diarized);
        } else {
            // No hay speakers → mandar solo el texto
            cleanInput = baseText;
        }

        const cleanReq = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "Limpia muletillas, repeticiones y mejora la gramática. Mantén la estructura por Speaker cuando sea posible.",
                },
                { role: "user", content: cleanInput }, // <-- nunca null
            ],
            temperature: 0.2,
        });

        const transcriptClean = cleanReq.choices[0].message.content;

        // -----------------------------------
        // 3) RESÚMENES
        // -----------------------------------
        const summaryReq = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Generá resumen, highlights, frases, insights y tags.",
                },
                { role: "user", content: transcriptClean },
            ],
            temperature: 0.25,
        });

        const summary = summaryReq.choices[0].message.content;

        // -----------------------------------
        // 4) TXT + DOCX
        // -----------------------------------
        const txt_transcript = generateTXT(transcriptClean);
        const txt_summary = generateTXT(summary);

        const docx_full = await generateDOCX(
            `TRANSCRIPCIÓN COMPLETA\n\n${transcriptClean}\n\n-----\n\n${summary}`
        );

        const timestamp = Date.now();

        const txt_transcript_path = await uploadFile(
            txt_transcript,
            `txt/${timestamp}-transcript.txt`,
            "text/plain"
        );

        const txt_summary_path = await uploadFile(
            txt_summary,
            `txt/${timestamp}-summary.txt`,
            "text/plain"
        );

        const docx_full_path = await uploadFile(
            docx_full,
            `docx/${timestamp}-full.docx`,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );

        // -----------------------------------
        // 5) DEBUG antes del INSERT
        // -----------------------------------
        console.log("📌 DEBUG — VALUES QUE SE VAN A INSERTAR:", {
            panel_name: panelName,
            audio_url: audioUrl,
            transcript_clean_preview: transcriptClean?.slice(0, 200),
            transcript_speakers_count: diarized?.length || 0,
            summary_preview: summary?.slice(0, 200),
            txt_transcript_path,
            txt_summary_path,
            docx_full_path,
        });

        // -----------------------------------
        // 6) INSERT EN SUPABASE
        // -----------------------------------
        const { data: saved, error } = await supabase
            .from("panel_transcripts")
            .insert({
                panel_name: panelName,
                audio_url: audioUrl,
                transcript_clean: transcriptClean,
                transcript_speakers: diarized, // puede ser null, OK
                summary: summary,
                txt_transcript_path,
                txt_summary_path,
                docx_full_path,
            })
            .select()
            .single();

        console.log("📌 DEBUG RESULTADO INSERT:", { saved, error });

        if (error) throw new Error("Error al insertar en Supabase: " + error.message);

        // -----------------------------------
        // 7) RESPUESTA FINAL
        // -----------------------------------
        return NextResponse.json({
            success: true,
            panel: saved,
        }, { status: 200 });

    } catch (e) {
        console.error("🔥 ERROR PANEL PROCESS:", e);
        return NextResponse.json(
            { error: e.message || "Error interno" },
            { status: 500 }
        );
    }
}
