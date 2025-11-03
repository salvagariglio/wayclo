import { createClient } from "@supabase/supabase-js";
import { openai, EMBEDDING_MODEL } from "./openai";

const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

export async function fetchRAGContext(query, k = 5) {
    if (!query?.trim()) return "";
    const emb = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: query });
    const vector = emb.data[0].embedding;

    // RPC con vector(1536)
    const { data, error } = await supabaseAnon.rpc("match_docs", {
        query_embedding: vector,
        match_count: k,
        similarity_threshold: 0.2,
    });

    if (error) {
        const { data: fallback } = await supabaseAnon
            .from("docs")
            .select("title,content")
            .limit(k);
        return fallback?.map(d => `# ${d.title}\n${d.content}`).join("\n\n") ?? "";
    }

    return data?.map(d => `# ${d.title}\n${d.content}`).join("\n\n") ?? "";
}
