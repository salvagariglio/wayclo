import { createClient } from "@supabase/supabase-js";

const supabaseSrv = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY  // server-side
);

// Guardar lead en DB y notificar n8n
export async function submitLead({ name, venue_name, phone, email, category, question, language }) {
    const { data, error } = await supabaseSrv
        .from("leads")
        .insert({
            name: name || null,
            venue_name: venue_name || null,
            phone: phone || null,
            email: email || null,
            category: category || null,
            question: question || null,
            language: language || "es",
            source: "chat",
        })
        .select("*")
        .single();
    if (error) throw error;

    if (process.env.N8N_WEBHOOK_NEW_LEAD) {
        await fetch(process.env.N8N_WEBHOOK_NEW_LEAD, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Importante: n8n espera body.*
            body: JSON.stringify({
                name, venue_name, phone, email, category, question, language, source: "chat",
                created_at: data.created_at,
            }),
        });
    }
    return { ok: true, leadId: data.id };
}

// Agendar demo/llamada para el día siguiente (lo hace n8n + Google Calendar)
export async function bookDemo({ name, phone, venue_name, email, language, preferred_slot_iso }) {
    const payload = { name, phone, venue_name, email, language: language || "es", preferred_slot_iso };
    if (process.env.N8N_WEBHOOK_BOOK_DEMO) {
        await fetch(process.env.N8N_WEBHOOK_BOOK_DEMO, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    }
    return { ok: true };
}

// Políticas (resumen rápido)
export async function checkPolicies() {
    return {
        cancellation: {
            es: "Cancelación: hasta 2 horas antes → cupón por el valor del turno. Dentro de 2 horas → se cobra la totalidad.",
            en: "Cancellation: up to 2 hours before the appointment → coupon for the appointment value. Within 2 hours → full charge."
        },
        payments: { es: "Pagos vía Mercado Pago.", en: "Payments via Mercado Pago." },
    };
}
