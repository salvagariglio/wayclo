import "server-only";
import { getTransporter } from "@/lib/mailer";

export async function sendEmail({ to, subject, html }) {
  try {
    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    });

    console.log("📧 Email enviado (SMTP):", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Error enviando email SMTP:", err);
    throw err;
  }
}
