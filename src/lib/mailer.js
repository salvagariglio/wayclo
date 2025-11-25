import nodemailer from "nodemailer";

export function getTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: { ciphers: "TLSv1.2" },

        // 🔥 AGREGAR ESTO:
        logger: true,
        debug: true,
    });
}

