import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail"; // ✅ CORRECTO

export async function POST(req) {
    try {
        const payload = await req.json();
        const { type, record, old_record } = payload;

        console.log("📩 Webhook recibido:", JSON.stringify(payload, null, 2));

        if (!record?.email) {
            console.warn("⚠️ Webhook sin email, se ignora.");
            return NextResponse.json({ ok: true, skip: "no-email" });
        }

        // Nombre completo
        const fullName =
            [record.first_name, record.last_name].filter(Boolean).join(" ") ||
            "participante";

        // ======================================
        // 1) NUEVO REGISTRO (INSERT)
        // ======================================
        if (type === "INSERT") {
            console.log("📨 Enviando email de registro...");

            await sendEmail({
                to: record.email,
                subject: "Recibimos tu registro – CyberCloud",
                html: `
          <h2>¡Gracias por registrarte, ${fullName}!</h2>
          <p>Recibimos tu registro para <strong>CyberCloud</strong>.</p>
          <p>Tu estado actual es: <strong>${record.status}</strong>.</p>
        `,
            });

            return NextResponse.json({ ok: true, action: "sent-insert-email" });
        }

        // ======================================
        // 2) UPDATE: pending → approved
        // ======================================
        if (type === "UPDATE" && old_record) {
            const prev = old_record.status;
            const now = record.status;

            if (prev === "pending" && now === "approved") {
                console.log("📨 Enviando email de aprobación...");

                await sendEmail({
                    to: record.email,
                    subject: "Tu invitación a CyberCloud fue aprobada ✅",
                    html: `
            <h2>¡Buenas noticias, ${fullName}!</h2>
            <p>Tu invitación para <strong>CyberCloud</strong> fue <strong>aprobada</strong>.</p>
            <p>Pronto vas a recibir más información sobre la agenda y el lugar.</p>
          `,
                });

                return NextResponse.json({ ok: true, action: "sent-approval-email" });
            }
        }

        // ======================================
        // 3) Cualquier otro evento → ignorar
        // ======================================
        return NextResponse.json({ ok: true, action: "ignored" });
    } catch (err) {
        console.error("❌ Error en webhook:", err);
        return NextResponse.json(
            { error: "Webhook error", detail: err.message },
            { status: 500 }
        );
    }
}
