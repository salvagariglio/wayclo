import { SignJWT, jwtVerify } from "jose";

const encoder = () => new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);

// crea un JWT con vencimiento en `hours` horas
export async function createAdminJWT({ hours = 8, sub = "admin" } = {}) {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + hours * 60 * 60;
    return await new SignJWT({ role: "admin" })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setSubject(sub)
        .setIssuedAt(now)
        .setExpirationTime(exp)
        .sign(encoder());
}

// verifica el JWT y devuelve { ok, payload | error }
export async function verifyAdminJWT(token) {
    try {
        const { payload } = await jwtVerify(token, encoder(), { algorithms: ["HS256"] });
        if (payload?.role !== "admin") throw new Error("role mismatch");
        return { ok: true, payload };
    } catch (e) {
        return { ok: false, error: e?.message || String(e) };
    }
}
