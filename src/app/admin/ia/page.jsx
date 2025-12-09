"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IARootPage() {
  const router = useRouter();
  const [auth, setAuth] = useState("checking"); // "checking" | "ok" | "unauth"

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
      } catch {
        setAuth("unauth");
      }
    })();
  }, []);

  // 🔁 Redirigir SOLO desde un useEffect
  useEffect(() => {
    if (auth === "unauth") {
      router.replace("/admin/login");
    }
  }, [auth, router]);

  // 🌀 Mientras valida sesión
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

  // 🔒 No autenticado (redirect ya se dispara)
  if (auth === "unauth") return null;

  // ✅ Autenticado
  return (
    <main className="min-h-screen bg-[#021728] text-white px-6 py-10">
      <div className="space-y-4 max-w-4xl">
        <h2 className="text-3xl font-bold">Centro de IA</h2>

        <p className="text-white/70 text-sm">
          Elegí una herramienta de IA arriba o usá los accesos rápidos:
        </p>

        <div className="flex flex-wrap gap-3 mt-4">
          <Button
            className="bg-white text-black font-semibold"
            onClick={() => router.push("/admin/ia/panels")}
          >
            Ir a Panels IA
          </Button>

          <Button
            variant="outline"
            className="border-white/40 text-white/80"
            onClick={() => router.push("/admin/ia/analysis")}
          >
            Ir a Análisis de invitados
          </Button>
        </div>
      </div>
    </main>
  );
}
