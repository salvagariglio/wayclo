import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // fuerza a leer .env.local en la raíz
/**
 * Ejecutar: node scripts/ingest.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";

function chunkText(text, chunkSize = 1200, overlap = 150) {
    const words = text.split(/\s+/);
    const out = [];
    for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
        const slice = words.slice(i, i + chunkSize).join(" ");
        if (slice.trim()) out.push(slice);
    }
    return out;
}

async function embedAll(texts) {
    const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: texts });
    return res.data.map(d => d.embedding);
}

async function upsertDoc(title, url, content, meta = {}) {
    const chunks = chunkText(content);
    const vecs = await embedAll(chunks);
    for (let i = 0; i < chunks.length; i++) {
        const { error } = await supabase.from("docs").insert({
            title, url, content: chunks[i], metadata: meta, embedding: vecs[i]
        });
        if (error) throw error;
    }
}

async function run() {
    const docsDir = path.resolve("content");
    try { await fs.access(docsDir); } catch { await fs.mkdir(docsDir, { recursive: true }); }
    const files = await fs.readdir(docsDir);
    if (!files.length) {
        console.log("No hay archivos en /content. Agregá .md o .txt y reintentá.");
        return;
    }
    for (const f of files) {
        const full = path.join(docsDir, f);
        const content = await fs.readFile(full, "utf8");
        await upsertDoc(path.parse(f).name, null, content, { filename: f });
        console.log("Ingerido:", f);
    }
    console.log("Listo ✅");
}

run().catch(err => { console.error(err); process.exit(1); });
