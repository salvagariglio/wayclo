export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

import OpenAI from "openai";
import fs from "fs";
import path from "path";

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
    AlignmentType,
    ImageRun,
    Header,
} from "docx";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// 🎨 Colores de marca
const BRAND_PRIMARY = "00E0FF"; // cyan (título principal)
const BRAND_SUBTITLE = "0F172A"; // azul/gris oscuro (subtítulos)
const HEADER_BG = "020617";      // fondo header de tabla
const HEADER_TEXT = "E5F9FF";
const CELL_BORDER_COLOR = "0B2538";

// AGENDA DEL EVENTO (texto para la IA)
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

// AGENDA estructurada para el DOC
const AGENDA_ITEMS = [
    {
        time: "17:45 – 18:15",
        title: "Recepción y acreditaciones",
        desc: "Recepción con café y primer espacio de networking entre decisores y equipos técnicos.",
    },
    {
        time: "18:15 – 18:30",
        title: "Apertura",
        desc: "Bienvenida a cargo de Wayclo e Intercity, contexto del evento y objetivos.",
    },
    {
        time: "18:30 – 19:00",
        title: "Panel 1",
        desc: "“Expansión Segura: El Desafío de la Red de Sucursales”.",
    },
    {
        time: "19:00 – 19:30",
        title: "Panel 2",
        desc: "“Diseño de Redes Resilientes para la Continuidad Empresarial”.",
    },
    {
        time: "19:30 – 19:45",
        title: "Break",
        desc: "Coffee break y networking intermedio.",
    },
    {
        time: "20:00 – 20:30",
        title: "Panel 3",
        desc: "“Ciberseguridad: Riesgos Empresariales y Legales”.",
    },
    {
        time: "20:30 – 21:00",
        title: "Catering y networking final",
        desc: "Cóctel de cierre y networking entre empresas, directivos y equipos técnicos.",
    },
];

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
    "celiacos": [],
    "veganos": [],
    "vegetarianos": [],
    "lactose_free": [],
    "otros": []
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

    const output = completion.output?.[0];
    if (!output || !output.content) {
        console.error("Respuesta IA sin output o content:", completion);
        return null;
    }

    const textPart =
        output.content.find(
            (c) => c.type === "output_text" && c.text && c.text.value
        ) || output.content[0];

    let jsonString =
        (textPart && textPart.text && textPart.text.value) ??
        textPart?.text ??
        (typeof textPart === "string" ? textPart : "");

    if (!jsonString) {
        console.error("No se encontró texto en la respuesta IA:", output.content);
        return null;
    }

    jsonString = jsonString.trim();
    if (jsonString.startsWith("```")) {
        jsonString = jsonString
            .replace(/^```[a-zA-Z]*\n?/, "")
            .replace(/```$/, "")
            .trim();
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

        const rows = data || [];
        const summary = buildGuestSummary(rows);
        const menu = await generateMenuPlan(summary);

        // AGRUPAR POR EMPRESA
        const byCompany = {};
        const specialDiets = [];

        for (const r of rows) {
            const company = r.company || "Sin empresa";
            if (!byCompany[company]) byCompany[company] = [];
            byCompany[company].push(r);

            if (r.diet?.toLowerCase() !== "ninguna" && r.diet !== "none") {
                specialDiets.push(r);
            }
        }

        // 📊 Métricas para portada
        const totalGuests = rows.length;
        const totalCompanies = Object.keys(byCompany).length;
        const dietsByType = summary.by_diet || {};

        // 🖼 Logos (header: rectangular, portada: cuadrado)
        const headerLogoPath = path.join(process.cwd(), "public", "logo2.png");
        const headerLogoBuffer = fs.existsSync(headerLogoPath)
            ? await fs.promises.readFile(headerLogoPath)
            : null;

        const coverLogoPath = path.join(process.cwd(), "public", "logo-chat-2.png");
        const coverLogoBuffer = fs.existsSync(coverLogoPath)
            ? await fs.promises.readFile(coverLogoPath)
            : null;

        // ===============================
        // 📄 Construcción del DOCX
        // ===============================
        const doc = new Document({
            sections: [
                {
                    properties: {
                        // Primera página distinta (sin header)
                        titlePage: true,
                        page: {
                            margin: {
                                // 👉 TOP más grande: empuja el contenido hacia abajo
                                top: 2200,     // ~3 cm de espacio entre header (o borde) y contenido
                                right: 1440,
                                bottom: 1440,
                                left: 1440,

                                // 👉 HEADER chico: logo más cerca del borde superior
                                header: 720,   // distancia del borde superior al header
                                footer: 720,
                            },
                        },
                    },
                    headers: headerLogoBuffer
                        ? {
                            // portada: sin encabezado
                            first: new Header({ children: [] }),

                            // resto de páginas: encabezado con logo
                            default: new Header({
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        children: [
                                            new ImageRun({
                                                data: headerLogoBuffer,
                                                transformation: {
                                                    width: 420,
                                                    height: 90,
                                                },
                                            }),
                                        ],
                                        // 👉 pequeño after; el "aire" real viene del margin.top grande
                                        spacing: { after: 200 },
                                    }),
                                ],
                            }),
                        }
                        : {},
                    children: [
                        // ⭐ PORTADA ⭐
                        ...(coverLogoBuffer
                            ? [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new ImageRun({
                                            data: coverLogoBuffer,
                                            transformation: {
                                                width: 320, // logo portada más grande
                                                height: 320,
                                            },
                                        }),
                                    ],
                                    spacing: { after: 360 },
                                }),
                            ]
                            : []),

                        // PRIMER TEXTO: CyberCloud 2025…
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "CyberCloud 2025 – Invitados, Empresas y Catering",
                                    size: 32,
                                    bold: true,
                                    color: BRAND_SUBTITLE,
                                }),
                            ],
                            spacing: { after: 120 },
                        }),

                        // SEGUNDO TEXTO: Reporte ejecutivo
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "Reporte ejecutivo",
                                    size: 28,
                                    bold: true,
                                    color: BRAND_PRIMARY,
                                }),
                            ],
                            spacing: { after: 260 },
                        }),

                        // BULLETS DE MÉTRICAS
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `• Total de invitados: ${totalGuests}`,
                                    size: 24,
                                    color: BRAND_SUBTITLE,
                                }),
                            ],
                            spacing: { after: 80 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `• Total de empresas: ${totalCompanies}`,
                                    size: 24,
                                    color: BRAND_SUBTITLE,
                                }),
                            ],
                            spacing: { after: 80 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "• Dietas registradas por tipo:",
                                    size: 24,
                                    color: BRAND_SUBTITLE,
                                }),
                            ],
                            spacing: { after: 60 },
                        }),

                        ...Object.entries(dietsByType).map(([diet, count]) =>
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `   - ${diet}: ${count}`,
                                        size: 22,
                                        color: "374151",
                                    }),
                                ],
                                spacing: { after: 40 },
                            })
                        ),

                        // 👉 Salto de página a la agenda
                        new Paragraph({
                            text: "",
                            pageBreakBefore: true,
                        }),

                        // ===========================
                        // AGENDA DEL EVENTO
                        // ===========================
                        new Paragraph({
                            heading: HeadingLevel.HEADING_1,
                            children: [
                                new TextRun({
                                    text: "Agenda del Evento",
                                    size: 28,
                                    bold: true,
                                    color: BRAND_PRIMARY,
                                }),
                            ],
                            spacing: {
                                before: 200,
                                after: 200,
                            },
                        }),

                        ...AGENDA_ITEMS.flatMap((item) => [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `${item.time} — `,
                                        bold: true,
                                        color: BRAND_PRIMARY,
                                        size: 24,
                                    }),
                                    new TextRun({
                                        text: item.title,
                                        bold: true,
                                        size: 24,
                                        color: BRAND_SUBTITLE,
                                    }),
                                ],
                                spacing: { after: 40 },
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: item.desc,
                                        size: 22,
                                        color: "374151",
                                    }),
                                ],
                                spacing: { after: 200 },
                            }),
                        ]),

                        new Paragraph({ text: "", spacing: { after: 300 } }),

                        // ===========================
                        // LISTADO POR EMPRESA
                        // ===========================
                        new Paragraph({
                            heading: HeadingLevel.HEADING_1,
                            children: [
                                new TextRun({
                                    text: "Listado por Empresa",
                                    size: 28,
                                    bold: true,
                                    color: BRAND_PRIMARY,
                                }),
                            ],
                            spacing: { before: 200, after: 200 },
                        }),

                        ...Object.entries(byCompany).flatMap(
                            ([company, people]) => [
                                new Paragraph({
                                    heading: HeadingLevel.HEADING_2,
                                    children: [
                                        new TextRun({
                                            text: company,
                                            size: 24,
                                            bold: true,
                                            color: BRAND_SUBTITLE,
                                        }),
                                    ],
                                    spacing: { after: 120 },
                                }),

                                table3cols(
                                    ["Nombre", "Rol", "Dieta"],
                                    people.map((p) => [
                                        `${p.first_name} ${p.last_name}`,
                                        p.role || "—",
                                        p.diet === "ninguna"
                                            ? "Sin restricción"
                                            : p.diet,
                                    ])
                                ),

                                new Paragraph({
                                    text: "",
                                    spacing: { after: 300 },
                                }),
                            ]
                        ),

                        // ===========================
                        // DIETAS ESPECIALES
                        // ===========================
                        new Paragraph({
                            heading: HeadingLevel.HEADING_1,
                            children: [
                                new TextRun({
                                    text: "Dietas Especiales",
                                    size: 28,
                                    bold: true,
                                    color: BRAND_PRIMARY,
                                }),
                            ],
                            spacing: { before: 200, after: 200 },
                        }),

                        specialDiets.length === 0
                            ? new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "No hay dietas especiales registradas.",
                                        size: 22,
                                        color: BRAND_SUBTITLE,
                                    }),
                                ],
                            })
                            : table3cols(
                                ["Nombre", "Empresa", "Dieta"],
                                specialDiets.map((p) => [
                                    `${p.first_name} ${p.last_name}`,
                                    p.company || "—",
                                    p.diet === "otra"
                                        ? p.diet_other
                                        : p.diet,
                                ])
                            ),

                        new Paragraph({ text: "", spacing: { after: 300 } }),

                        // ===========================
                        // LISTADO COMPLETO
                        // ===========================
                        new Paragraph({
                            heading: HeadingLevel.HEADING_1,
                            children: [
                                new TextRun({
                                    text: "Listado Completo de Invitados",
                                    size: 28,
                                    bold: true,
                                    color: BRAND_PRIMARY,
                                }),
                            ],
                            spacing: { before: 200, after: 200 },
                        }),

                        table4cols(
                            ["Nombre", "Empresa", "Rol", "Dieta"],
                            rows.map((p) => [
                                `${p.first_name} ${p.last_name}`,
                                p.company || "—",
                                p.role || "—",
                                p.diet === "ninguna"
                                    ? "Sin restricción"
                                    : p.diet,
                            ])
                        ),

                        new Paragraph({ text: "", spacing: { after: 300 } }),

                        // ===========================
                        // ⭐ MENÚ RECOMENDADO POR IA ⭐
                        // ===========================
                        new Paragraph({
                            heading: HeadingLevel.HEADING_1,
                            children: [
                                new TextRun({
                                    text: "Recomendación de Menú (IA)",
                                    size: 28,
                                    bold: true,
                                    color: BRAND_PRIMARY,
                                }),
                            ],
                            spacing: { before: 200, after: 200 },
                        }),

                        ...(menu
                            ? [
                                ...menuBlock("Recepción", menu.reception),
                                ...menuBlock(
                                    "Coffee Break",
                                    menu.coffee_break
                                ),
                                ...menuBlock(
                                    "Cóctel Final",
                                    menu.cocktail
                                ),
                            ]
                            : [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: "No se pudo generar automáticamente el menú con IA en este momento.",
                                            size: 22,
                                            color: BRAND_SUBTITLE,
                                        }),
                                    ],
                                }),
                            ]),

                        new Paragraph({ text: "", spacing: { after: 200 } }),

                        new Paragraph({
                            heading: HeadingLevel.HEADING_2,
                            children: [
                                new TextRun({
                                    text: "Cuidados por Dieta",
                                    size: 24,
                                    bold: true,
                                    color: BRAND_SUBTITLE,
                                }),
                            ],
                            spacing: { before: 200, after: 200 },
                        }),

                        ...(menu?.diet_care
                            ? Object.entries(menu.diet_care).flatMap(
                                ([k, arr]) => [
                                    new Paragraph({
                                        heading: HeadingLevel.HEADING_3,
                                        children: [
                                            new TextRun({
                                                text: String(k).toUpperCase(),
                                                size: 22,
                                                bold: true,
                                                color: BRAND_SUBTITLE,
                                            }),
                                        ],
                                        spacing: { after: 80 },
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text:
                                                    (arr || []).join("\n") ||
                                                    "—",
                                                size: 22,
                                                color: "374151",
                                            }),
                                        ],
                                        spacing: { after: 200 },
                                    }),
                                ]
                            )
                            : []),

                        new Paragraph({
                            heading: HeadingLevel.HEADING_2,
                            children: [
                                new TextRun({
                                    text: "Insights Adicionales",
                                    size: 24,
                                    bold: true,
                                    color: BRAND_SUBTITLE,
                                }),
                            ],
                            spacing: { before: 200, after: 200 },
                        }),

                        new Paragraph({
                            children: [
                                new TextRun({
                                    text:
                                        (menu &&
                                            menu.extra_insights &&
                                            menu.extra_insights.join("\n")) ||
                                        "—",
                                    size: 22,
                                    color: "374151",
                                }),
                            ],
                        }),
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
                "Content-Disposition":
                    "attachment; filename=Reporte_CyberCloud.docx",
            },
        });
    } catch (e) {
        console.error("DOCX error", e);
        return NextResponse.json(
            {
                success: false,
                error: "Error generando DOCX",
                message: e?.message || "Unknown error",
            },
            { status: 500 }
        );
    }
}

// ===============================
// HELPERS DE TABLAS
// ===============================
function table3cols(headers, rows) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            // header
            new TableRow({
                cantSplit: true,
                tableHeader: true, // repite encabezado si la tabla salta de página
                children: headers.map(
                    (h) =>
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: h,
                                            bold: true,
                                            size: 22,
                                            color: HEADER_TEXT,
                                        }),
                                    ],
                                    alignment: AlignmentType.LEFT,
                                }),
                            ],
                            shading: {
                                type: "clear",
                                fill: HEADER_BG,
                                color: HEADER_TEXT,
                            },
                        })
                ),
            }),
            // data rows
            ...rows.map(
                (r) =>
                    new TableRow({
                        cantSplit: true, // la fila no se parte entre páginas
                        children: r.map(
                            (v) =>
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            children: [
                                                new TextRun({
                                                    text: v ?? "—",
                                                    size: 22,
                                                    color: BRAND_SUBTITLE,
                                                }),
                                            ],
                                        }),
                                    ],
                                })
                        ),
                    })
            ),
        ],
        borders: {
            top: { color: CELL_BORDER_COLOR, size: 4 },
            bottom: { color: CELL_BORDER_COLOR, size: 4 },
            left: { color: CELL_BORDER_COLOR, size: 4 },
            right: { color: CELL_BORDER_COLOR, size: 4 },
            insideHorizontal: { color: CELL_BORDER_COLOR, size: 4 },
            insideVertical: { color: CELL_BORDER_COLOR, size: 4 },
        },
    });
}

function table4cols(headers, rows) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                cantSplit: true,
                tableHeader: true,
                children: headers.map(
                    (h) =>
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: h,
                                            bold: true,
                                            size: 22,
                                            color: HEADER_TEXT,
                                        }),
                                    ],
                                    alignment: AlignmentType.LEFT,
                                }),
                            ],
                            shading: {
                                type: "clear",
                                fill: HEADER_BG,
                                color: HEADER_TEXT,
                            },
                        })
                ),
            }),
            ...rows.map(
                (r) =>
                    new TableRow({
                        cantSplit: true,
                        children: r.map(
                            (v) =>
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            children: [
                                                new TextRun({
                                                    text: v ?? "—",
                                                    size: 22,
                                                    color: BRAND_SUBTITLE,
                                                }),
                                            ],
                                        }),
                                    ],
                                })
                        ),
                    })
            ),
        ],
        borders: {
            top: { color: CELL_BORDER_COLOR, size: 4 },
            bottom: { color: CELL_BORDER_COLOR, size: 4 },
            left: { color: CELL_BORDER_COLOR, size: 4 },
            right: { color: CELL_BORDER_COLOR, size: 4 },
            insideHorizontal: { color: CELL_BORDER_COLOR, size: 4 },
            insideVertical: { color: CELL_BORDER_COLOR, size: 4 },
        },
    });
}

// ===============================
// SECCIÓN DE MENÚ
// ===============================
function menuBlock(title, block) {
    if (!block) return [];

    return [
        new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
                new TextRun({
                    text: title,
                    size: 24,
                    bold: true,
                    color: BRAND_SUBTITLE,
                }),
            ],
            spacing: { before: 120, after: 160 },
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: block.concept || "",
                    size: 24,
                    color: BRAND_SUBTITLE,
                }),
            ],
            spacing: { after: 200 },
        }),

        new Paragraph({
            heading: HeadingLevel.HEADING_3,
            children: [
                new TextRun({
                    text: "Items:",
                    size: 22,
                    bold: true,
                    color: BRAND_SUBTITLE,
                }),
            ],
            spacing: { after: 80 },
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: (block.items || []).join("\n") || "—",
                    size: 22,
                    color: "374151",
                }),
            ],
            spacing: { after: 160 },
        }),

        new Paragraph({
            heading: HeadingLevel.HEADING_3,
            children: [
                new TextRun({
                    text: "Notas:",
                    size: 22,
                    bold: true,
                    color: BRAND_SUBTITLE,
                }),
            ],
            spacing: { after: 80 },
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: (block.notes || []).join("\n") || "—",
                    size: 22,
                    color: "374151",
                }),
            ],
            spacing: { after: 280 },
        }),
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

        const company = (r.company && r.company.trim()) || "Sin empresa";
        byCompany[company] = (byCompany[company] || 0) + 1;

        const role = (r.role && r.role.trim()) || "Otro";
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
