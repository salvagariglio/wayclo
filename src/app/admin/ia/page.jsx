"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function IARootPage() {
    const router = useRouter();

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Centro de IA</h2>
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
    );
}
