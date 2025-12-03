// scripts/ingest.mjs
import fs from "fs/promises";
import path from "path";
import "dotenv/config";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE
);

const EMBEDDING_MODEL = "text-embedding-3-small";

async function ingest() {
    const file = path.resolve("content/cybercloud.txt");
    const text = await fs.readFile(file, "utf8");

    const embedding = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
    });

    const { error } = await supabase.from("documents").insert({
        title: "CyberCloud Info",
        content: text,
        embedding: embedding.data[0].embedding,
        metadata: {}
    });

    if (error) console.error(error);
    else console.log("Documento cargado!");
}

ingest();
