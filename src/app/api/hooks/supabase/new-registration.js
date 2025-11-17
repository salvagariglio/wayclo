import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

export async function POST(req) {
    try {
        const payload = await req.json();
        const { record } = payload;

        if (!record?.email) {
            return NextResponse.json({ error: "No email" }, { status: 400 });
        }

        const name = [record.first_name, record.last_name].filter(Boolean).join(" ");

        await sendMail({
            to: record.email,
            subject: "Recibimos tu registro – CyberCloud",
            html: `
        <h2>¡Gracias por registrarte, ${name || "participante"}!</h2>
        <p>Ya recibimos tu solicitud y el equipo revisará tu invitación.</p>
        <p>Actualmente tu estado es <strong>${record.status}</strong>.</p>
      `,
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("Error new-registration:", e);
        return NextResponse.json({ error: true }, { status: 500 });
    }
}
