import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
    });

    try {
        await transporter.verify();
        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json({
            ok: false,
            error: err.message,
            code: err.code,
            response: err.response,
        });
    }
}
