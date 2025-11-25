import nodemailer from "nodemailer";

export function getTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,           // smtp.office365.com
        port: Number(process.env.SMTP_PORT),   // 587
        secure: false,                         // TLS via STARTTLS
        requireTLS: true,                      // 🔥 OBLIGATORIO PARA MICROSOFT 365
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            ciphers: "TLSv1.2", // 🔥 Office365 exige TLS moderno
        },
    });
}
