import { getSupabaseAnon } from "./supabaseAnon.js";
import { getOpenAI, EMBEDDING_MODEL } from "./openia.js";

export async function fetchRAGContext(query, k = 5) {
    if (!query?.trim()) return "";

    const supabase = getSupabaseAnon();
    if (!supabase) return "";

    try {
        const openai = getOpenAI();

        // 1) Embedding del mensaje del usuario
        const emb = await openai.embeddings.create({
            model: EMBEDDING_MODEL,
            input: query,
        });

        const vector = emb.data[0].embedding;

        // 2) Consulta RPC match_docs
        const { data, error } = await supabase.rpc("match_docs", {
            query_embedding: vector,
            match_count: k,
            similarity_threshold: 0.2,
        });

        if (error) {
            console.error("RAG RPC error:", error);
            return "";
        }

        // 3) Formatear documentos para el contexto
        return (
            data
                ?.map((d) => `# ${d.title}\n${d.content}`)
                .join("\n\n") ?? ""
        );
    } catch (err) {
        console.error("RAG fatal error:", err);
        return "";
    }
}
