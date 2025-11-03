export const runtime = "edge";
export async function GET() {
    return new Response(
        JSON.stringify({
            hasOPENAI: Boolean(process.env.OPENAI_API_KEY),
            hasURL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
            hasAnon: Boolean(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        }),
        { headers: { "Content-Type": "application/json" } }
    );
}
