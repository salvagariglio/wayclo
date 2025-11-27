"use client";

import { useState } from "react";
import Scanner from "./scanner";
import Ingresos from "./ingresos";

export default function ValidacionesPage() {
    const [tab, setTab] = useState("scanner");

    return (
        <div className="min-h-screen bg-[#021728] text-white px-6 py-10">
            <h1 className="text-3xl font-bold mb-8">Validaciones</h1>

            {/* Sub-menú */}
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

            {/* Vista dinámica */}
            {tab === "scanner" ? <Scanner /> : <Ingresos />}
        </div>
    );
}