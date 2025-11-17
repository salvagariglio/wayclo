import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

export async function POST(req) {
    try {
        const payload = await req.json();
        const { record, old_record } = payload;

        if (!record || !old_record) {
            return NextResponse.json({ skip: true });
        }

        // Confirmamos que cambió de pending a approved
        if (
            old_record.status === "pending" &&
            record.status === "approved"
        ) {
            await sendMail({
                to: record.email,
                subject: "Tu invitación a CyberCloud fue aprobada",
                html: `
          <h2>¡Bienvenido/a, ${record.first_name || ""}!</h2>
          <p>Tu invitación fue aprobada ✔</p>
          <p>Pronto recibirás más información del evento.</p>
        `,
            });
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("Error approved-registration:", e);
        return NextResponse.json({ error: true }, { status: 500 });
    }
}
