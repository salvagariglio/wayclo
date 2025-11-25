import nodemailer from "nodemailer";

export function getTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,        // smtp-mail.outlook.com
        port: Number(process.env.SMTP_PORT), // 587
        secure: false,                       // 🔥 correcto para Outlook
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            ciphers: "SSLv3"
        }
    });
}

