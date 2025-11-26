"use client";

import { useEffect, useState } from "react";

export default function Ingresos() {
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState("todos");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const res = await fetch("/api/admin/validations/list");
        const json = await res.json();
        setItems(json.items || []);
    };

    const filtered = items.filter((item) => {
        if (filter === "ingresados") return item.qr_used;
        if (filter === "noingresados") return !item.qr_used;
        return true;
    });

    return (
        <div className="max-w-5xl mx-auto py-8">

            {/* ---------------- FILTROS ---------------- */}
            <div className="flex gap-2 mb-6 bg-white/5 backdrop-blur-sm p-2 rounded-xl w-fit mx-auto">
                {[
                    { key: "todos", label: "Todos" },
                    { key: "ingresados", label: "Ingresados" },
                    { key: "noingresados", label: "No ingresados" },
                ].map((btn) => (
                    <button
                        key={btn.key}
                        onClick={() => setFilter(btn.key)}
                        className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${filter === btn.key
                                ? "bg-cyan-600 text-white shadow-md"
                                : "text-white/70 hover:bg-white/10"}
            `}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>

            {/* ---------------- TABLA ---------------- */}
            <div className="rounded-xl overflow-hidden shadow-xl border border-white/10">
                <table className="w-full text-left">
                    <thead className="bg-white/10 backdrop-blur-xl">
                        <tr className="text-sm text-white/70">
                            <th className="p-4 font-semibold">Nombre</th>
                            <th className="p-4 font-semibold">Empresa</th>
                            <th className="p-4 font-semibold">Estado</th>
                            <th className="p-4 font-semibold">Hora ingreso</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                        {filtered.map((item) => (
                            <tr
                                key={item.id}
                                className="hover:bg-white/5 transition-all"
                            >
                                <td className="p-4 font-medium text-white">
                                    {item.first_name} {item.last_name}
                                </td>

                                <td className="p-4 text-white/80">{item.company}</td>

                                <td className="p-4">
                                    {item.qr_used ? (
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/20">
                                            Ingresado
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/20">
                                            No ingresado
                                        </span>
                                    )}
                                </td>

                                <td className="p-4 text-white/70">
                                    {item.qr_used_at
                                        ? new Date(item.qr_used_at).toLocaleTimeString("es-AR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : "-"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
