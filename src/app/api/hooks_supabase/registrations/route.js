import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

export async function POST(req) {
    try {
        const payload = await req.json();

        // Supabase Webhooks suele mandar algo así:
        // { type: "INSERT" | "UPDATE" | "DELETE", table: "registrations", record, old_record }
        const { type, record, old_record } = payload;

        console.log("Webhook Supabase:", JSON.stringify(payload, null, 2));

        if (!record?.email) {
            return NextResponse.json(
                { error: "No email in record" },
                { status: 400 }
            );
        }

        const fullName =
            [record.first_name, record.last_name].filter(Boolean).join(" ") ||
            "participante";

        // --------------------------------------------------------------------
        // 👉 CASO 1: NUEVO REGISTRO (INSERT)
        // --------------------------------------------------------------------
        if (type === "INSERT") {
            // armamos un texto lindo con parte de los datos
            const dietText = record.diet_other
                ? `${record.diet || "Sin especificar"} (${record.diet_other})`
                : record.diet || "Sin especificar";

            const html = `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0f172a;">
          <h2 style="color:#0f172a;">¡Gracias por registrarte, ${fullName}!</h2>
          <p>Recibimos tu registro para <strong>CyberCloud</strong>.</p>
          <p><strong>Datos que enviaste:</strong></p>
          <ul>
            <li><strong>Nombre:</strong> ${fullName}</li>
            <li><strong>Empresa:</strong> ${record.company || "-"}</li>
            <li><strong>Rol:</strong> ${record.role || "-"}</li>
            <li><strong>Teléfono:</strong> ${record.phone || "-"}</li>
            <li><strong>Dieta:</strong> ${dietText}</li>
          </ul>
          <p>Tu estado actual es: <strong>${record.status}</strong>.</p>
          <p>Cuando tu invitación sea aprobada vas a recibir otro correo con la confirmación.</p>
        </div>
      `;

            await sendMail({
                to: record.email,
                subject: "Recibimos tu registro – CyberCloud",
                html,
            });

            return NextResponse.json({ ok: true, action: "sent_new_registration" });
        }

        // --------------------------------------------------------------------
        // 👉 CASO 2: UPDATE (nos interesa pending → approved)
        // --------------------------------------------------------------------
        if (type === "UPDATE" && old_record) {
            const oldStatus = old_record.status;
            const newStatus = record.status;

            // Solo disparamos mail cuando pasa de pending → approved
            if (oldStatus === "pending" && newStatus === "approved") {
                const html = `
          <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0f172a;">
            <h2 style="color:#0f172a;">¡Tu invitación fue aprobada, ${fullName}! ✅</h2>
            <p>Te confirmamos que tu registro para <strong>CyberCloud</strong> fue <strong>aprobado</strong>.</p>
            <p>Pronto vas a recibir más información sobre:</p>
            <ul>
              <li>Agenda del evento</li>
              <li>Ubicación y horarios</li>
              <li>Speakers y empresas participantes</li>
            </ul>
            <p>Gracias por ser parte de CyberCloud.</p>
          </div>
        `;

                await sendMail({
                    to: record.email,
                    subject: "Tu invitación a CyberCloud fue aprobada ✅",
                    html,
                });

                return NextResponse.json({
                    ok: true,
                    action: "sent_approved_email",
                });
            }

            // Si es otro tipo de update, simplemente lo ignoramos
            return NextResponse.json({
                ok: true,
                action: "ignored_update",
                reason: "status did not change from pending to approved",
            });
        }

        // --------------------------------------------------------------------
        // 👉 Cualquier otro tipo de evento (DELETE, etc.) lo ignoramos
        // --------------------------------------------------------------------
        return NextResponse.json({
            ok: true,
            action: "ignored",
            reason: "unsupported event type",
        });
    } catch (err) {
        console.error("Error en webhook registrations:", err);
        return NextResponse.json(
            { error: "Internal error" },
            { status: 500 }
        );
    }
}
