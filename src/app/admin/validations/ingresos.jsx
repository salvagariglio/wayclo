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
        <div className="max-w-4xl mx-auto">

            <div className="flex gap-4 mb-6">
                {[
                    { key: "todos", label: "Todos" },
                    { key: "ingresados", label: "Ingresados" },
                    { key: "noingresados", label: "No ingresados" },
                ].map((btn) => (
                    <button
                        key={btn.key}
                        onClick={() => setFilter(btn.key)}
                        className={`px-4 py-2 rounded-md ${filter === btn.key ? "bg-cyan-600" : "bg-white/10"
                            }`}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>

            <table className="w-full border-collapse text-left">
                <thead className="bg-white/10">
                    <tr>
                        <th className="p-3">Nombre</th>
                        <th className="p-3">Empresa</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3">Hora ingreso</th>
                    </tr>
                </thead>

                <tbody>
                    {filtered.map((item) => (
                        <tr key={item.id} className="border-b border-white/10">
                            <td className="p-3">
                                {item.first_name} {item.last_name}
                            </td>
                            <td className="p-3">{item.company}</td>
                            <td className="p-3">
                                {item.qr_used ? (
                                    <span className="text-green-400 font-semibold">
                                        Ingresado
                                    </span>
                                ) : (
                                    <span className="text-red-400 font-semibold">
                                        No ingresado
                                    </span>
                                )}
                            </td>
                            <td className="p-3">
                                {item.qr_used_at
                                    ? new Date(item.qr_used_at).toLocaleTimeString("es-AR")
                                    : "-"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
