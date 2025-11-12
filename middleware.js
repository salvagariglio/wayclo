import { NextResponse } from "next/server";
import { verifyAdminJWT, createAdminJWT } from "./src/lib/auth";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (!isAdminRoute) return NextResponse.next();

  // rutas públicas dentro de /admin (solo login)
  const isLogin = pathname.startsWith("/admin/login");
  const token = req.cookies.get("admin")?.value;

  // si no hay token válido y no es /admin/login -> mandar a login
  const verify = token ? await verifyAdminJWT(token) : { ok: false };
  if (!verify.ok && !isLogin) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  // si es login y ya estoy autenticado -> redirigir al panel
  if (isLogin && verify.ok) {
    const panelUrl = req.nextUrl.clone();
    panelUrl.pathname = "/admin/registrations";
    panelUrl.search = "";
    return NextResponse.redirect(panelUrl);
  }

  // Rolling session: si faltan <30 min, emitimos un nuevo JWT (8h)
  const res = NextResponse.next();
  if (verify.ok) {
    const now = Math.floor(Date.now() / 1000);
    const exp = verify.payload?.exp || 0;
    const timeLeft = exp - now;
    if (timeLeft > 0 && timeLeft < 30 * 60) {
      const refreshed = await createAdminJWT({ hours: 8 });
      res.cookies.set("admin", refreshed, {
        httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 8,
      });
    }
  }
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
