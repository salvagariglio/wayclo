import "server-only";
import { NextResponse } from "next/server";
import { createAdminJWT, verifyAdminJWT } from "@/lib/auth";

// GET: usado por el panel para chequear sesión
export async function GET(req) {
  const token = req.cookies.get("admin")?.value;
  const v = token ? await verifyAdminJWT(token) : { ok: false };
  return NextResponse.json({ ok: v.ok }, { status: v.ok ? 200 : 401 });
}

// POST: login con clave -> emite JWT con 8h
export async function POST(req) {
  const { key } = await req.json();
  if (!key || key !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const jwt = await createAdminJWT({ hours: 8 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin", jwt, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 8, // 8h (browser hint)
  });
  return res;
}

// DELETE: logout (borra cookie)
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin", "", { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 0 });
  return res;
}
