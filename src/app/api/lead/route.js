export const runtime = "edge";

export async function POST(req) {
    try {
        const body = await req.json();

        // Campos mínimos
        const payload = {
            name: body.name ?? "",
            venue_name: body.venue_name ?? "",
            phone: body.phone ?? "",
            email: body.email ?? "",
            category: body.category ?? "",
            question: body.question ?? "",
            language: body.language ?? "es",
            source: "chat",
            created_at: new Date().toISOString(),
        };

        const url = process.env.N8N_WEBHOOK_NEW_LEAD;
        if (!url) {
            return new Response(JSON.stringify({ ok: false, error: "Falta N8N_WEBHOOK_NEW_LEAD" }), { status: 500 });
        }

        const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const txt = await r.text().catch(() => null);
        return new Response(JSON.stringify({ ok: r.ok, status: r.status, txt }), {
            headers: { "Content-Type": "application/json" },
            status: r.ok ? 200 : 502,
        });
    } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
    }
}
