import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const oa = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function getSupabaseSafe() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
        process.env.SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) return null; // ← RAG opcional
    try {
        return createClient(url, key, { auth: { persistSession: false } });
    } catch (e) {
        console.error("[chat] supabase createClient error:", e);
        return null;
    }
}

async function fetchRAGContextSafe(query, k = 5) {
    try {
        if (!query?.trim()) return "";
        const supabase = getSupabaseSafe();
        if (!supabase) return ""; // sin RAG

        const emb = await oa.embeddings.create({
            model: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
            input: query,
        });

        // RPC opcional: si no existe 'match_docs' simplemente devolvemos ""
        const { data, error } = await supabase.rpc("match_docs", {
            query_embedding: emb.data[0].embedding,
            match_count: k,
            similarity_threshold: 0.2,
        });

        if (error) {
            console.error("[chat] match_docs error:", error);
            return "";
        }
        return (data || []).map((d) => `# ${d.title}\n${d.content}`).join("\n\n");
    } catch (e) {
        console.error("[chat] fetchRAGContextSafe error:", e);
        return "";
    }
}

function inferLang(text = "") {
    const t = text.trim();
    if (!t) return "es";
    const hasTilde = /[áéíóúñ]/i.test(t);
    const commonEs = /\b(el|la|los|las|de|por|para|con|cómo|qué|cuál|políticas|registro)\b/i.test(t);
    if (hasTilde || commonEs) return "es";
    return "en";
}

export async function POST(req) {
    try {
        const body = await req.json().catch(() => ({}));
        const { messages = [], hint = "" } = body;

        if (!process.env.OPENAI_API_KEY) {
            console.error("[chat] Missing OPENAI_API_KEY");
            return new Response(JSON.stringify({ error: "OPENAI_API_KEY missing" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        const userText = lastUser?.content || "";
        const lang = inferLang(userText);

        const context = await fetchRAGContextSafe(userText, 5);

        const system = `
Eres la asistente oficial de Aesthetic.
Responde en ${lang.toUpperCase()} y mantente enfocada en Aesthetic (app, servicios, procesos).
Si la pregunta es ajena a Aesthetic, respóndela muy brevemente y redirige:
"${lang === "es"
                ? "Puedo ayudarte con temas relacionados a Aesthetic y su app."
                : "I can help with topics related to Aesthetic and its app."
            }"

Estilo:
- 80–140 palabras, claro y sin relleno.
- Tono cercano, femenino, profesional; máx. 2 emojis si suman.
- Usa viñetas solo si ayudan.
- Termina con 1 pregunta de avance.

Reglas:
- Usa el Contexto si es relevante; si no existe info, dilo en 1 línea y propone cómo verificar.
- No inventes datos ni compartas información confidencial.

Contexto:
${context}

# Hints del flujo (prioritarios):
${hint}
`.trim();

        // Creamos el stream de OpenAI
        const completion = await oa.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            stream: true,
            temperature: 0.2,
            max_tokens: 220,
            messages: [{ role: "system", content: system }, ...messages],
        });

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of completion) {
                        const delta = chunk?.choices?.[0]?.delta?.content;
                        if (delta) controller.enqueue(encoder.encode(delta));
                    }
                } catch (err) {
                    console.error("[chat] streaming error:", err);
                    controller.enqueue(
                        encoder.encode(
                            lang === "es"
                                ? "\n\nLo siento, hubo un error. Probá de nuevo 💛"
                                : "\n\nSorry, something went wrong. Please try again 💛"
                        )
                    );
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
        });
    } catch (err) {
        // Errores antes del stream (parsing/env/etc.)
        console.error("[chat] top-level error:", err);
        return new Response(JSON.stringify({ error: String(err?.message || err) }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
