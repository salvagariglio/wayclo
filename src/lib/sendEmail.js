import "server-only";
import { sendMail } from "@/lib/mailer";

export async function sendEmail({ to, subject, html }) {
  try {
    const info = await sendMail({ to, subject, html });
    console.log("Email enviado (SMTP):", info);
  } catch (err) {
    console.error("Error enviando email SMTP:", err);
  }
}
