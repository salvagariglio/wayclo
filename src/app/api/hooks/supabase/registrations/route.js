import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

export async function POST(req) {
    try {
        const payload = await req.json();
        // Supabase suele mandar algo así:
        // { type: "INSERT" | "UPDATE" | "DELETE", table: "...", record, old_record }
        const { type, record, old_record } = payload;

        console.log("Webhook Supabase:", type, record?.email);

        if (!record?.email) {
            return NextResponse.json({ error: "No email in record" }, { status: 400 });
        }

        const fullName =
            [record.first_name, record.last_name].filter(Boolean).join(" ") ||
            "¡Hola!";

        // 👉 CASO 1: NUEVO REGISTRO (INSERT)
        if (type === "INSERT") {
            await sendMail({
                to: record.email,
                subject: "Recibimos tu registro – CyberCloud",
                html: `
          <h2>¡Gracias por registrarte, ${fullName}!</h2>
          <p>Recibimos tu solicitud para participar de CyberCloud.</p>
          <p>Tu estado actual es: <strong>${record.status}</strong>.</p>
          <p>Te vamos a avisar por este mismo medio cuando tu invitación sea aprobada.</p>
        `,
            });

            return NextResponse.json({ ok: true, action: "sent_new_registration" });
        }

        // 👉 CASO 2: UPDATE (posible cambio de estado)
        if (type === "UPDATE" && old_record) {
            const oldStatus = old_record.status;
            const newStatus = record.status;

            // Solo nos interesa cuando pasa de pending → approved
            if (oldStatus === "pending" && newStatus === "approved") {
                await sendMail({
                    to: record.email,
                    subject: "Tu invitación a CyberCloud fue aprobada ✅",
                    html: `
            <h2>¡Buenas noticias, ${fullName}!</h2>
            <p>Tu invitación para CyberCloud fue <strong>aprobada</strong>.</p>
            <p>Pronto vas a recibir más información sobre el evento, la agenda y el lugar.</p>
          `,
                });

                return NextResponse.json({
                    ok: true,
                    action: "sent_approved_email",
                });
            }

            // Si es otro tipo de update, no hacemos nada
            return NextResponse.json({
                ok: true,
                action: "ignored_update",
                reason: "status did not change from pending to approved",
            });
        }

        // Otros tipos de evento (DELETE, etc.) se ignoran
        return NextResponse.json({
            ok: true,
            action: "ignored",
            reason: "unsupported event type",
        });
    } catch (err) {
        console.error("Error en webhook registrations:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
