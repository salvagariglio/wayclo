import { NextResponse } from "next/server";
import { verifyAdminJWT, createAdminJWT } from "./src/lib/auth";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Rutas que queremos proteger SIEMPRE
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  // Si no es admin ni api admin, dejar pasar
  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const token = req.cookies.get("admin")?.value;
  const verify = token ? await verifyAdminJWT(token) : { ok: false };

  const isLogin = pathname.startsWith("/admin/login");

  // ❌ No autenticado y no está en login
  if (!verify.ok && !isLogin) {
    // APIs → 401
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Páginas → redirect a login
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Ya autenticado y quiere ir a login → mandarlo al panel
  if (isLogin && verify.ok) {
    const dash = req.nextUrl.clone();
    dash.pathname = "/admin/panels";
    dash.search = "";
    return NextResponse.redirect(dash);
  }

  // 🔁 Rolling session
  const res = NextResponse.next();

  if (verify.ok) {
    const now = Math.floor(Date.now() / 1000);
    const exp = verify.payload?.exp || 0;
    const timeLeft = exp - now;

    if (timeLeft > 0 && timeLeft < 30 * 60) {
      const refreshed = await createAdminJWT({ hours: 8 });
      res.cookies.set("admin", refreshed, {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 8,
      });
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
