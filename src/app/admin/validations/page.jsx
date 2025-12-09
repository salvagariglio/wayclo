"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import Scanner from "./scanner";
import Ingresos from "./ingresos";

export default function ValidacionesPage() {
  const [tab, setTab] = useState("scanner");
  const [auth, setAuth] = useState("checking"); // 👈 ESTA es la línea correcta
  const router = useRouter();

  // 🔐 Verificar cookie de sesión al montar
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/session", { method: "GET" });
        if (!res.ok) {
          setAuth("unauth");
        } else {
          setAuth("ok");
        }
      } catch (e) {
        setAuth("unauth");
      }
    })();
  }, []);

  // 🔁 Redirigir a /admin/login SOLO desde un effect
  useEffect(() => {
    if (auth === "unauth") {
      router.replace("/admin/login");
    }
  }, [auth, router]);

  // 🌀 Mientras valida auth
  if (auth === "checking") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#021728] text-white/80 px-6">
        <div className="flex items-center gap-2">
          <RotateCcw className="animate-spin" size={18} />
          <p>Verificando acceso...</p>
        </div>
      </main>
    );
  }

  // 🔒 Si no hay sesión, no renderizamos nada (el redirect ya se disparó)
  if (auth === "unauth") {
    return null;
  }

  // ✅ Autenticado → render normal
  return (
    <main className="min-h-screen bg-[#021728] text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Validaciones</h1>

      {/* Sub-menú */}
      <div className="flex gap-6 border-b border-white/10 mb-8 pb-2">
        <button
          onClick={() => setTab("scanner")}
          className={`pb-2 text-lg font-semibold ${
            tab === "scanner"
              ? "text-cyan-400 border-b-2 border-cyan-400"
              : "text-white/60 hover:text-white"
          }`}
        >
          Escáner
        </button>

        <button
          onClick={() => setTab("ingresos")}
          className={`pb-2 text-lg font-semibold ${
            tab === "ingresos"
              ? "text-cyan-400 border-b-2 border-cyan-400"
              : "text-white/60 hover:text-white"
          }`}
        >
          Ingresos
        </button>
      </div>

      {/* Vista dinámica */}
      {tab === "scanner" ? <Scanner /> : <Ingresos />}
    </main>
  );
}
