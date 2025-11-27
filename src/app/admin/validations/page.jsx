"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import Scanner from "./scanner";
import Ingresos from "./ingresos";

export default function ValidacionesPage() {
    const [tab, setTab] = useState("scanner");
    const [auth, setAuth] = useState("checking");
    const router = useRouter();

    // 1) Verificar sesión
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/admin/session", { method: "GET" });
                setAuth(res.ok ? "ok" : "unauth");
            } catch {
                setAuth("unauth");
            }
        })();
    }, []);

    // 2) Redirigir si no está autorizado
    useEffect(() => {
        if (auth === "unauth") {
            router.push("/admin/login");
        }
    }, [auth, router]);

    // 3) Mientras verifica
    if (auth === "checking") {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#021728] text-white/80">
                <div className="flex items-center gap-2">
                    <RotateCcw className="animate-spin" size={18} />
                    <p>Verificando acceso...</p>
                </div>
            </main>
        );
    }

    // 4) Si redirecciona no mostrar nada
    if (auth === "unauth") return null;

    return (
        <div className="min-h-screen bg-[#021728] text-white px-6 py-10">
            <h1 className="text-3xl font-bold mb-8">Validaciones</h1>

            <div className="flex gap-6 border-b border-white/10 mb-8 pb-2">
                <button
                    onClick={() => setTab("scanner")}
                    className={`pb-2 text-lg font-semibold ${tab === "scanner"
                            ? "text-cyan-400 border-b-2 border-cyan-400"
                            : "text-white/60 hover:text-white"
                        }`}
                >
                    Escáner
                </button>

                <button
                    onClick={() => setTab("ingresos")}
                    className={`pb-2 text-lg font-semibold ${tab === "ingresos"
                            ? "text-cyan-400 border-b-2 border-cyan-400"
                            : "text-white/60 hover:text-white"
                        }`}
                >
                    Ingresos
                </button>
            </div>

            {tab === "scanner" ? <Scanner /> : <Ingresos />}
        </div>
    );
}
