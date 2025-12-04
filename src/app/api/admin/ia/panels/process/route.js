export const runtime = "nodejs";

import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import fs from "fs";
import path from "path";

import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    ImageRun,
    Header,
} from "docx";

// OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Supabase client (DEBE USAR SERVICE_ROLE)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE
);

// 🎨 Colores y estilo compartidos
const BRAND_PRIMARY = "00E0FF";   // cyan
const BRAND_SUBTITLE = "0F172A";  // azul/gris oscuro
const BODY_TEXT = "374151";       // gris para cuerpo

// Colores por speaker
const SPEAKER_COLORS = [
    "DC2626", // rojo
    "2563EB", // azul
    "16A34A", // verde
    "D97706", // naranja
    "7C3AED", // violeta
    "0891B2", // teal
];

// ===============================
// HELPERS BÁSICOS
// ===============================

function generateTXT(text) {
    return Buffer.from(text || "", "utf-8");
}

function paragraphsFromText(text, options = {}) {
    const { size = 22, color = BODY_TEXT } = options;
    const lines = (text || "").split(/\n+/).filter(Boolean);

    if (lines.length === 0) {
        return [
            new Paragraph({
                children: [new TextRun({ text: "—", size, color })],
                spacing: { after: 120 },
            }),
        ];
    }

    return lines.map((line) =>
        new Paragraph({
            children: [
                new TextRun({
                    text: line,
                    size,
                    color,
                }),
            ],
            spacing: { after: 120 },
        })
    );
}

// ===============================
// PARSEAR SECCIONES DEL SUMMARY
// ===============================
//
// Secciones de marketing:
// **Resumen:**
// **Highlights:**
// **Frases:**
// **Insights:**
// **Tags:**
//
function parseSummarySections(summary) {
    const labels = [
        {
            key: "resumen",
            regex: /^\s*\*\*Resumen\b.*\*\*\s*$/i,
            title: "Resumen",
        },
        {
            key: "highlights",
            regex: /^\s*\*\*Highlights\b.*\*\*\s*$/i,
            title: "Highlights",
        },
        {
            key: "frases",
            regex: /^\s*\*\*Frases\b.*\*\*\s*$/i,
            title: "Frases",
        },
        {
            key: "insights",
            regex: /^\s*\*\*Insights\b.*\*\*\s*$/i,
            title: "Insights",
        },
        {
            key: "tags",
            regex: /^\s*\*\*Tags\b.*\*\*\s*$/i,
            title: "Tags",
        },
    ];

    const result = {
        resumen: null,
        highlights: null,
        frases: null,
        insights: null,
        tags: null,
        order: [],
    };

    const lines = (summary || "").split("\n");
    let currentKey = null;
    let buffer = [];

    function commitCurrent() {
        if (currentKey && buffer.length > 0) {
            const text = buffer.join("\n").trim();
            if (text) {
                result[currentKey] = text;
                if (!result.order.includes(currentKey)) {
                    result.order.push(currentKey);
                }
            }
        }
        buffer = [];
    }

    for (const rawLine of lines) {
        const line = rawLine.trimEnd();

        const matchLabel = labels.find((l) => l.regex.test(line));

        if (matchLabel) {
            commitCurrent();
            currentKey = matchLabel.key;
            continue;
        }

        if (currentKey) {
            buffer.push(line);
        }
    }

    commitCurrent();

    return result;
}

// ===============================
// TRANSCRIPCIÓN FORMATEADA POR SPEAKER
// ===============================
//
// Usa diarized si existe:
// Carolina: ...
// Ana: ...
//
function paragraphsFromDiarized(diarized, fallbackText, options = {}) {
    const { size = 22 } = options;

    if (!Array.isArray(diarized) || diarized.length === 0) {
        // fallback: texto plano
        return paragraphsFromText(fallbackText, { size, color: BODY_TEXT });
    }

    // 1) Agrupar segmentos consecutivos por speaker
    const merged = [];
    for (const seg of diarized) {
        if (!seg) continue;
        const speakerId = seg.speaker ?? seg.spk ?? 0;
        const text = (seg.text || "").trim();
        if (!text) continue;

        const last = merged[merged.length - 1];
        if (last && last.speakerId === speakerId) {
            last.text += (last.text ? " " : "") + text;
        } else {
            merged.push({ speakerId, text });
        }
    }

    if (merged.length === 0) {
        return paragraphsFromText(fallbackText, { size, color: BODY_TEXT });
    }

    // 2) Crear un párrafo por intervención: Speaker X: texto...
    return merged.map(({ speakerId, text }) => {
        const idx = Number.isFinite(Number(speakerId))
            ? Number(speakerId)
            : 0;
        const color = SPEAKER_COLORS[idx % SPEAKER_COLORS.length];

        const speakerLabel = `Speaker ${idx + 1}: `;

        return new Paragraph({
            children: [
                new TextRun({
                    text: speakerLabel,
                    bold: true,
                    color,
                    size,
                }),
                new TextRun({
                    text,
                    color: BODY_TEXT,
                    size,
                }),
            ],
            spacing: { after: 120 },
        });
    });
}

// ===============================
// DOCX CON DISEÑO VISUAL + SPEAKERS COLOREADOS
// ===============================
async function generatePanelDOCX({ panelName, transcriptClean, summary, diarized }) {
    // 🖼 Logos (mismos que el otro reporte)
    const headerLogoPath = path.join(process.cwd(), "public", "logo2.png");        // rectangular
    const coverLogoPath = path.join(process.cwd(), "public", "logo-chat-2.png");  // cuadrado

    const headerLogoBuffer = fs.existsSync(headerLogoPath)
        ? await fs.promises.readFile(headerLogoPath)
        : null;

    const coverLogoBuffer = fs.existsSync(coverLogoPath)
        ? await fs.promises.readFile(coverLogoPath)
        : null;

    const panelTitle = panelName || "Panel sin nombre";

    // Parsear summary en secciones de marketing
    const sections = parseSummarySections(summary);

    const children = [];

    // ⭐ PORTADA ⭐
    if (coverLogoBuffer) {
        children.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new ImageRun({
                        data: coverLogoBuffer,
                        transformation: {
                            width: 260,
                            height: 260,
                        },
                    }),
                ],
                spacing: { after: 360 },
            })
        );
    }

    // Título principal
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({
                    text: "CyberCloud 2025 – Panel",
                    size: 32,
                    bold: true,
                    color: BRAND_SUBTITLE,
                }),
            ],
            spacing: { after: 80 },
        })
    );

    // Subtítulo con nombre del panel
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({
                    text: panelTitle,
                    size: 28,
                    bold: true,
                    color: BRAND_PRIMARY,
                }),
            ],
            spacing: { after: 200 },
        })
    );

    // Bajada (más grande y en negrita)
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({
                    text: "Transcripción, resumen e insights",
                    size: 30,
                    bold: true,
                    color: BRAND_SUBTITLE,
                }),
            ],
            spacing: { after: 260 },
        })
    );

    // 👉 Salto de página para contenido
    children.push(
        new Paragraph({
            text: "",
            pageBreakBefore: true,
        })
    );

    // ===========================
    // SECCIONES: Resumen / Highlights / Frases / Insights / Tags
    // ===========================
    const titlesMap = {
        resumen: "Resumen",
        highlights: "Highlights",
        frases: "Frases",
        insights: "Insights",
        tags: "Tags",
    };

    const order = sections.order.length
        ? sections.order
        : ["resumen", "highlights", "frases", "insights", "tags"];

    order.forEach((key) => {
        const content = sections[key];
        if (!content) return;

        children.push(
            new Paragraph({
                heading: HeadingLevel.HEADING_1,
                children: [
                    new TextRun({
                        text: titlesMap[key] || "",
                        size: 28,
                        bold: true,
                        color: BRAND_PRIMARY,
                    }),
                ],
                spacing: { before: 200, after: 200 },
            })
        );

        children.push(
            ...paragraphsFromText(content, {
                size: 22,
                color: BODY_TEXT,
            })
        );
    });

    // ===========================
    // SECCIÓN: TRANSCRIPCIÓN COMPLETA (FORMATO POR SPEAKER)
    // ===========================
    children.push(
        new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
                new TextRun({
                    text: "Transcripción completa",
                    size: 28,
                    bold: true,
                    color: BRAND_PRIMARY,
                }),
            ],
            spacing: { before: 200, after: 200 },
        })
    );

    children.push(
        ...paragraphsFromDiarized(diarized, transcriptClean, {
            size: 22,
        })
    );

    // 📄 Documento final con encabezado como el otro reporte
    const doc = new Document({
        sections: [
            {
                properties: {
                    titlePage: true,
                    page: {
                        margin: {
                            top: 2200,
                            right: 1440,
                            bottom: 1440,
                            left: 1440,
                            header: 720,
                            footer: 720,
                        },
                    },
                },
                headers: headerLogoBuffer
                    ? {
                        first: new Header({ children: [] }), // sin header en portada
                        default: new Header({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new ImageRun({
                                            data: headerLogoBuffer,
                                            transformation: {
                                                width: 420,
                                                height: 70,
                                            },
                                        }),
                                    ],
                                    spacing: { after: 200 },
                                }),
                            ],
                        }),
                    }
                    : {},
                children,
            },
        ],
    });

    return await Packer.toBuffer(doc);
}

// ===============================
// SUBIR ARCHIVO AL STORAGE
// ===============================
async function uploadFile(buffer, pathKey, mime) {
    const { error } = await supabase.storage
        .from("panels")
        .upload(pathKey, buffer, { contentType: mime, upsert: true });

    if (error) throw error;
    return pathKey;
}

// ===============================
// ENDPOINT PRINCIPAL
// ===============================
export async function POST(request) {
    try {
        const form = await request.formData();

        const audio = form.get("audio");
        const panelName = form.get("panelName") || "Panel sin nombre";

        if (!audio) {
            return NextResponse.json(
                { error: "No se subió audio" },
                { status: 400 }
            );
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

        const audioUrl = supabase.storage
            .from("panels")
            .getPublicUrl(audioPath).data.publicUrl;

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

        const diarized = Array.isArray(transcription.segments)
            ? transcription.segments
            : null;

        const baseText = transcription.text || "";

        // -----------------------------------
        // 2) LIMPIEZA
        // -----------------------------------
        let cleanInput;

        if (diarized) {
            cleanInput = JSON.stringify(diarized);
        } else {
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
                { role: "user", content: cleanInput },
            ],
            temperature: 0.2,
        });

        const transcriptClean = cleanReq.choices[0].message.content;

        // -----------------------------------
        // 3) RESUMEN / CONTENIDO DE MARKETING
        // -----------------------------------
        const summaryReq = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `
Actúas como estratega de contenidos y marketing B2B para un evento de ciberseguridad.
A partir de la transcripción, generá un bloque EN ESPAÑOL en formato markdown con EXACTAMENTE estas secciones, en este orden:

**Resumen:**
- 1–2 párrafos que expliquen de qué se habló, con enfoque claro, profesional y listo para usar en un email o landing.

**Highlights:**
- Lista con 4 a 8 bullets con los puntos más potentes, accionables o atractivos para comunicación (web, redes, email).

**Frases:**
- Lista de 3 a 6 citas textuales o parafraseadas, cortas y potentes, útiles como quotes.

**Insights:**
- Lista de 3 a 6 ideas clave, aprendizajes o conclusiones estratégicas.

**Tags:**
- Lista en una sola línea o varias líneas de hashtags o etiquetas tipo #Ciberseguridad #Cloud #Pymes, etc.

Reglas:
- No agregues títulos fuera de estos.
- Usá un estilo claro y directo, sin vender humo.
- No inventes información que no esté en la transcripción.
                `.trim(),
                },
                { role: "user", content: transcriptClean },
            ],
            temperature: 0.3,
        });

        const summary = summaryReq.choices[0].message.content;

        // -----------------------------------
        // 4) TXT + DOCX (CON DISEÑO)
        // -----------------------------------
        const txt_transcript = generateTXT(transcriptClean);
        const txt_summary = generateTXT(summary);

        const docx_full = await generatePanelDOCX({
            panelName,
            transcriptClean,
            summary,
            diarized,
        });

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
        // 5) INSERT EN SUPABASE
        // -----------------------------------
        const { data: saved, error } = await supabase
            .from("panel_transcripts")
            .insert({
                panel_name: panelName,
                audio_url: audioUrl,
                transcript_clean: transcriptClean,
                transcript_speakers: diarized,
                summary: summary,
                txt_transcript_path,
                txt_summary_path,
                docx_full_path,
            })
            .select()
            .single();

        if (error) {
            throw new Error("Error al insertar en Supabase: " + error.message);
        }

        return NextResponse.json(
            {
                success: true,
                panel: saved,
            },
            { status: 200 }
        );
    } catch (e) {
        console.error("🔥 ERROR PANEL PROCESS:", e);
        return NextResponse.json(
            { error: e.message || "Error interno" },
            { status: 500 }
        );
    }
}
