import nodemailer from "nodemailer";

export function getTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true, // 465 usa SSL
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

export async function sendMail({ to, subject, html }) {
    const transporter = getTransporter();

    const info = await transporter.sendMail({
        from: `"CyberCloud" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
    });

    console.log("Mail enviado:", info.messageId);
}
