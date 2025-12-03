import { NextResponse } from "next/server";
import { verifyAdminJWT, createAdminJWT } from "./src/lib/auth";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Rutas protegidas nuevas (AUDIO/IA)
  const protectedPanelAPIs = [
    "/api/admin/ia/panels/process",
    "/api/admin/ia/panels/list",
    "/api/admin/ia/panels/update",
    "/api/admin/ia/panels/download",
  ];

  // Rutas ya protegidas por vos
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  const isPanelRoute = protectedPanelAPIs.some((p) =>
    pathname.startsWith(p)
  );

  // ————————————————————————————————
  // 1) SI NO ES ADMIN NI PANEL ROUTE → permitir
  // ————————————————————————————————
  if (!isAdminRoute && !isPanelRoute) {
    return NextResponse.next();
  }

  // ————————————————————————————————
  // 2) Obtener JWT admin
  // ————————————————————————————————
  const token = req.cookies.get("admin")?.value;
  const verify = token ? await verifyAdminJWT(token) : { ok: false };

  // ————————————————————————————————
  // 3) PUBLIC ROUTE: /admin/login
  // ————————————————————————————————
  const isLogin = pathname.startsWith("/admin/login");

  // Si NO está autenticado y NO está en login → bloquear/redirect
  if (!verify.ok && !isLogin) {
    // Si es API → devolver 401
    if (isPanelRoute || pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Si es página → redirigir
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  // Si está autenticado e intenta ir a login → mandar a dashboard
  if (isLogin && verify.ok) {
    const dash = req.nextUrl.clone();
    dash.pathname = "/admin/panels";
    dash.search = "";
    return NextResponse.redirect(dash);
  }

  // ————————————————————————————————
  // 4) Rolling session: renovar token si faltan <30 min
  // ————————————————————————————————
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
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/admin/ia/panels/:path*", // 👈 Ahora está protegido
  ],
};
