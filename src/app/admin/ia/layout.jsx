"use client";

import { usePathname, useRouter } from "next/navigation";

export default function IALayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();

    const active = pathname.includes("/analysis") ? "analysis" : "panels";

    return (
        <main className="min-h-screen bg-[#021728] text-white px-4 py-10 md:px-10">
            <div className="max-w-6xl mx-auto">
                {/* HEADER IA + TABS (común a Panels y Analysis) */}
                <h1 className="text-3xl font-bold mb-8">IA</h1>

                <div className="flex gap-6 border-b border-white/10 mb-8 pb-2">
                    <button
                        onClick={() => router.push("/admin/ia/panels")}
                        className={`pb-2 text-lg font-semibold ${active === "panels"
                                ? "text-cyan-400 border-b-2 border-cyan-400"
                                : "text-white/60 hover:text-white"
                            }`}
                    >
                        Panels IA
                    </button>

                    <button
                        onClick={() => router.push("/admin/ia/analysis")}
                        className={`pb-2 text-lg font-semibold ${active === "analysis"
                                ? "text-cyan-400 border-b-2 border-cyan-400"
                                : "text-white/60 hover:text-white"
                            }`}
                    >
                        Análisis
                    </button>
                </div>

                {/* 👇 acá se renderiza Panels o Analysis sin tocarlos */}
                {children}
            </div>
        </main>
    );
}
