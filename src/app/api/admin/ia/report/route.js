export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

import OpenAI from "openai";
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
} from "docx";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// AGENDA DEL EVENTO
const EVENT_AGENDA_TEXT = `
AGENDA DEL EVENTO
17:45 - 18:15 | Recepción y acreditaciones 
Recepción con café y espacio de networking inicial entre decisores y equipos técnicos.

18:15 - 18:30 | Apertura 
Apertura y bienvenida por parte de Wayclo e Intercity.

18:30 - 19:00 | Panel 1
19:00 - 19:30 | Panel 2
19:30 - 19:45 | Break
20:00 - 20:30 | Panel 3
20:30 - 21:00 | Catering y Networking final
`.trim();

// ===============================
// 🔥 AI: Generador de menú
// ===============================
async function generateMenuPlan(summary) {
    const system = `
Eres un planner gastronómico para un evento corporativo llamado CyberCloud.
Usa esta agenda:

${EVENT_AGENDA_TEXT}

Generá un menú estructurado en JSON con:
- Recepción
- Coffee break
- Cóctel final
- Cuidados especiales por dieta
- Insights adicionales

Formato obligatorio (solo JSON):
{
  "reception": { "concept": "", "items": [], "notes": [] },
  "coffee_break": { "concept": "", "items": [], "notes": [] },
  "cocktail": { "concept": "", "items": [], "notes": [] },
  "diet_care": {
    "general": [],
    "celiac": [],
    "vegan": [],
    "vegetarian": [],
    "lactose_free": [],
    "other": []
  },
  "extra_insights": []
}
`.trim();

    const user = `Resumen de invitados:\n${JSON.stringify(summary, null, 2)}`;

    const completion = await openai.responses.create({
        model: "gpt-4.1-mini",
        input: [
            { role: "system", content: system },
            { role: "user", content: user },
        ],
    });

    // 👇 Buscar el bloque de texto dentro del output
    const output = completion.output?.[0];
    if (!output || !output.content) {
        console.error("Respuesta IA sin output o content:", completion);
        return null;
    }

    // En la Responses API, el texto suele estar en content[].text.value
    const textPart = output.content.find(
        (c) => c.type === "output_text" && c.text && c.text.value
    ) || output.content[0];

    let jsonString =
        textPart?.text?.value ??
        textPart?.text ??
        (typeof textPart === "string" ? textPart : "");

    if (!jsonString) {
        console.error("No se encontró texto en la respuesta IA:", output.content);
        return null;
    }

    // Por las dudas, limpiar ``` si el modelo se zarpó y mandó fences
    jsonString = jsonString.trim();
    if (jsonString.startsWith("```")) {
        jsonString = jsonString.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "");
        jsonString = jsonString.trim();
    }

    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Error parseando menú:", jsonString);
        return null;
    }
}


// ===============================
// 📄 DOCX REPORT
// ===============================
export async function GET() {
    try {
        const supabase = getSupabaseServer();

        const { data, error } = await supabase
            .from("registrations")
            .select("*")
            .order("company", { ascending: true })
            .order("last_name", { ascending: true });

        if (error) {
            return NextResponse.json(
                { success: false, error: "DB error", details: error },
                { status: 500 }
            );
        }

        const summary = buildGuestSummary(data);
        const menu = await generateMenuPlan(summary);

        // AGRUPAR POR EMPRESA
        const byCompany = {};
        const specialDiets = [];

        for (const r of data) {
            const company = r.company || "Sin empresa";
            if (!byCompany[company]) byCompany[company] = [];
            byCompany[company].push(r);

            if (r.diet?.toLowerCase() !== "ninguna" && r.diet !== "none") {
                specialDiets.push(r);
            }
        }

        // ===============================
        // 📄 Construcción del DOCX
        // ===============================
        const doc = new Document({
            sections: [
                {
                    children: [
                        new Paragraph({
                            text: "CyberCloud – Reporte de Invitados y Plan de Catering",
                            heading: HeadingLevel.TITLE,
                        }),

                        new Paragraph({
                            text: `Total de invitados: ${data.length}`,
                            spacing: { after: 200 },
                        }),

                        // AGENDA
                        new Paragraph({
                            text: "Agenda del Evento",
                            heading: HeadingLevel.HEADING_1,
                        }),
                        new Paragraph(EVENT_AGENDA_TEXT),
                        new Paragraph({ text: "", spacing: { after: 300 } }),

                        // ===========================
                        // POR EMPRESA
                        // ===========================
                        new Paragraph({
                            text: "Listado por Empresa",
                            heading: HeadingLevel.HEADING_1,
                        }),

                        ...Object.entries(byCompany).flatMap(([company, people]) => [
                            new Paragraph({
                                text: company,
                                heading: HeadingLevel.HEADING_2,
                            }),

                            table3cols(["Nombre", "Rol", "Dieta"], people.map((p) => [
                                `${p.first_name} ${p.last_name}`,
                                p.role || "—",
                                p.diet === "ninguna" ? "Sin restricción" : p.diet,
                            ])),

                            new Paragraph({ text: "", spacing: { after: 300 } }),
                        ]),

                        // ===========================
                        // DIETAS ESPECIALES
                        // ===========================
                        new Paragraph({
                            text: "Dietas Especiales",
                            heading: HeadingLevel.HEADING_1,
                        }),

                        specialDiets.length === 0
                            ? new Paragraph("No hay dietas especiales registradas.")
                            : table3cols(
                                ["Nombre", "Empresa", "Dieta"],
                                specialDiets.map((p) => [
                                    `${p.first_name} ${p.last_name}`,
                                    p.company,
                                    p.diet === "otra" ? p.diet_other : p.diet,
                                ])
                            ),

                        new Paragraph({ text: "", spacing: { after: 300 } }),

                        // ===========================
                        // LISTADO COMPLETO
                        // ===========================
                        new Paragraph({
                            text: "Listado Completo de Invitados",
                            heading: HeadingLevel.HEADING_1,
                        }),

                        table4cols(
                            ["Nombre", "Empresa", "Rol", "Dieta"],
                            data.map((p) => [
                                `${p.first_name} ${p.last_name}`,
                                p.company || "—",
                                p.role || "—",
                                p.diet === "ninguna" ? "Sin restricción" : p.diet,
                            ])
                        ),

                        // ===========================
                        // ⭐ MENÚ RECOMENDADO POR IA ⭐
                        // ===========================
                        new Paragraph({ text: "", spacing: { after: 400 } }),

                        new Paragraph({
                            text: "Recomendación de Menú (IA)",
                            heading: HeadingLevel.HEADING_1,
                        }),

                        ...(menu
                            ? [
                                ...menuBlock("Recepción", menu.reception),
                                ...menuBlock("Coffee Break", menu.coffee_break),
                                ...menuBlock("Cóctel Final", menu.cocktail),
                            ]
                            : [
                                new Paragraph(
                                    "No se pudo generar automáticamente el menú con IA en este momento."
                                ),
                                new Paragraph({ text: "", spacing: { after: 300 } }),
                            ]),


                        new Paragraph({
                            text: "Cuidados por Dieta",
                            heading: HeadingLevel.HEADING_2,
                        }),

                        ...(menu?.diet_care
                            ? Object.entries(menu.diet_care).flatMap(([k, arr]) => [
                                new Paragraph({
                                    text: k.toUpperCase(),
                                    heading: HeadingLevel.HEADING_3,
                                }),
                                new Paragraph(arr.join("\n") || "—"),
                                new Paragraph({ text: "", spacing: { after: 200 } }),
                            ])
                            : []),

                        new Paragraph({
                            text: "Insights Adicionales",
                            heading: HeadingLevel.HEADING_2,
                        }),

                        new Paragraph(menu?.extra_insights?.join("\n") || "—"),
                    ],
                },
            ],
        });

        const buffer = await Packer.toBuffer(doc);

        return new Response(buffer, {
            status: 200,
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition": `attachment; filename=Reporte_CyberCloud.docx`,
            },
        });
    } catch (e) {
        console.error("DOCX error", e);
        return NextResponse.json(
            { success: false, error: "Error generando DOCX", message: e.message },
            { status: 500 }
        );
    }
}

// ===============================
// HELPERS DE TABLAS
// ===============================
const table3cols = (headers, rows) =>
    new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: headers.map((h) =>
                    new TableCell({ children: [new Paragraph(h)] })
                ),
            }),
            ...rows.map(
                (r) =>
                    new TableRow({
                        children: r.map((v) =>
                            new TableCell({ children: [new Paragraph(v)] })
                        ),
                    })
            ),
        ],
    });

const table4cols = (headers, rows) =>
    new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: headers.map((h) =>
                    new TableCell({ children: [new Paragraph(h)] })
                ),
            }),
            ...rows.map(
                (r) =>
                    new TableRow({
                        children: r.map((v) =>
                            new TableCell({ children: [new Paragraph(v)] })
                        ),
                    })
            ),
        ],
    });

// ===============================
// SECCIÓN DE MENÚ
// ===============================
function menuBlock(title, block) {
    if (!block) return [];

    return [
        new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_2,
        }),

        new Paragraph({
            text: block.concept || "",
            spacing: { after: 200 },
        }),

        new Paragraph({
            text: "Items:",
            heading: HeadingLevel.HEADING_3,
        }),
        new Paragraph(block.items?.join("\n") || "—"),

        new Paragraph({
            text: "Notas:",
            heading: HeadingLevel.HEADING_3,
        }),
        new Paragraph(block.notes?.join("\n") || "—"),

        new Paragraph({ text: "", spacing: { after: 400 } }),
    ];
}

// ===============================
// BUILDER DE SUMMARY
// ===============================
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
            specialNotes.push({ guest: `${r.first_name} ${r.last_name}`, note: r.diet_other });
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
