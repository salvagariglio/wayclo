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
        if (filter === "ingresados") return item.qr_used === true;
        if (filter === "noingresados") return item.qr_used === false;
        return true;
    });

    return (
        <div className="max-w-4xl mx-auto">

            {/* Filtros */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setFilter("todos")}
                    className={`px-4 py-2 rounded-md ${filter === "todos" ? "bg-cyan-600" : "bg-white/10"
                        }`}
                >
                    Todos
                </button>

                <button
                    onClick={() => setFilter("ingresados")}
                    className={`px-4 py-2 rounded-md ${filter === "ingresados" ? "bg-green-600" : "bg-white/10"
                        }`}
                >
                    Ingresados
                </button>

                <button
                    onClick={() => setFilter("noingresados")}
                    className={`px-4 py-2 rounded-md ${filter === "noingresados" ? "bg-red-600" : "bg-white/10"
                        }`}
                >
                    No ingresados
                </button>
            </div>

            {/* Tabla */}
            <table className="w-full border-collapse">
                <thead className="bg-white/10">
                    <tr>
                        <th className="p-3 text-left">Nombre</th>
                        <th className="p-3 text-left">Empresa</th>
                        <th className="p-3 text-left">Estado</th>
                        <th className="p-3 text-left">Hora ingreso</th>
                    </tr>
                </thead>

                <tbody>
                    {filtered.map((item) => (
                        <tr key={item.id} className="border-b border-white/10">
                            <td className="p-3">{item.first_name} {item.last_name}</td>
                            <td className="p-3">{item.company}</td>
                            <td className="p-3">
                                {item.qr_used ? (
                                    <span className="text-green-400">Ingresado</span>
                                ) : (
                                    <span className="text-red-400">No ingresado</span>
                                )}
                            </td>
                            <td className="p-3">
                                {item.qr_used_at ? item.qr_used_at : "-"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
