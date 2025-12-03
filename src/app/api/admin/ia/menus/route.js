export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// 📌 AGENDA REAL DEL EVENTO
const EVENT_AGENDA_TEXT = `
AGENDA DEL EVENTO
17:45 - 18:15 | Recepción y acreditaciones 
Recepción con café y espacio de networking inicial entre decisores y equipos técnicos.

18:15 - 18:30 | Apertura 
Apertura y bienvenida por parte de Wayclo e Intercity.

18:30 - 19:00 | Panel 1: “Expansión Segura: El Desafío de la Red de Sucursales”
19:00 - 19:30 | Panel 2: “El Diseño de redes resilientes para la continuidad empresarial.”
19:30 - 19:45 | Break
Coffee break acompañado de un espacio de networking para conectar e intercambiar experiencias.

20:00 - 20:30 | Panel 3: “Ciberseguridad”
20:30 - 21:00 | Catering y Networking final
Cóctel de cierre y networking entre las empresas participantes.
`.trim();

export async function POST(req) {
    try {
        const supabase = getSupabaseServer();

        const { data, error } = await supabase
            .from("registrations")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json(
                { success: false, error: "DB error", details: error },
                { status: 500 }
            );
        }

        const summary = buildGuestSummary(data ?? []);

        const system = `
Eres un planner gastronómico experto en eventos corporativos de ciberseguridad.
Trabajas para un evento llamado CyberCloud con la siguiente agenda horaria:

${EVENT_AGENDA_TEXT}

Bloques clave de catering:
- Recepción (17:45 - 18:15): café de bienvenida + bocados muy livianos.
- Coffee break central (19:30 - 19:45): recarga de energía sin que la gente quede pesada, antes del Panel 3.
- Cóctel de cierre (20:30 - 21:00): espacio distendido para picotear y hacer networking entre empresas y referentes.

Debes:
1) Recomendar MENÚ para cada bloque (recepción, coffee central, cóctel) alineado a su horario y objetivo.
2) Ajustar cantidades y variedad en base a la distribución de dietas y al total de invitados.
3) Explicar cuidados especiales (celíacos, sin lactosa, veganos, etc.) con énfasis en contaminación cruzada y señalización de platos.
4) Usar contexto de Argentina (palabras, tipos de comida habituales).

MUY IMPORTANTE:
- Devolvé SOLO un JSON válido, sin texto adicional.
- Sin comentarios, sin markdown, sin explicación.
- El JSON debe tener exactamente esta forma:

{
  "reception": {
    "concept": "...",
    "items": ["...", "..."],
    "notes": ["...", "..."]
  },
  "coffee_break": {
    "concept": "...",
    "items": ["...", "..."],
    "notes": ["...", "..."]
  },
  "cocktail": {
    "concept": "...",
    "items": ["...", "..."],
    "notes": ["...", "..."]
  },
  "diet_care": {
    "general": ["...", "..."],
    "celiac": ["...", "..."],
    "vegan": ["...", "..."],
    "vegetarian": ["...", "..."],
    "lactose_free": ["...", "..."],
    "other": ["...", "..."]
  },
  "extra_insights": ["...", "..."]
}
`.trim();

        const user = `
Este es el resumen de invitados y dietas:

${JSON.stringify(summary, null, 2)}
`.trim();

        const completion = await openai.responses.create({
            model: "gpt-4.1-mini",
            input: [
                { role: "system", content: system },
                { role: "user", content: user },
            ],
            // 👇 Sacamos response_format; ahora solo instruimos al modelo
        });

        // La Responses API nueva devuelve algo así:
        // completion.output[0].content[0].text.value
        const msg = completion.output[0].content[0];
        const jsonString = msg.text?.value ?? msg.text ?? "";

        let parsed;
        try {
            parsed = JSON.parse(jsonString);
        } catch (e) {
            console.error("Error parseando JSON de IA:", jsonString);
            return NextResponse.json(
                {
                    success: false,
                    error: "La IA no devolvió un JSON válido",
                    raw: jsonString,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            summary,
            plan: parsed,
        });
    } catch (e) {
        console.error("IA menus error", e);
        return NextResponse.json(
            { success: false, error: "Server/IA error", message: e?.message },
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
