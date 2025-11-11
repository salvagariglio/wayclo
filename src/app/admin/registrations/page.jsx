"use client";
import { useEffect, useState } from "react";

export default function AdminPanel() {
  const [status, setStatus] = useState("pending");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/registrations?status=${status}`);
    const out = await res.json();
    setItems(out.items || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [status]);

  const act = async (id, action) => {
    await fetch(`/api/admin/registrations/${id}/${action}`, { method: "POST" });
    load();
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Panel de Invitados</h1>

      <div className="mb-4 flex gap-2">
        {["pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            className={`px-3 py-1 border rounded ${
              status === s ? "bg-black text-white" : ""
            }`}
            onClick={() => setStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Cargando…</p>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Empresa</th>
              <th className="p-2 border">Rol</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td className="p-2 border">
                  {r.first_name} {r.last_name}
                </td>
                <td className="p-2 border">{r.email}</td>
                <td className="p-2 border">{r.company}</td>
                <td className="p-2 border">{r.role}</td>
                <td className="p-2 border">
                  {status !== "approved" && (
                    <button
                      onClick={() => act(r.id, "approve")}
                      className="mr-2 px-2 py-1 bg-green-600 text-white rounded"
                    >
                      Aprobar
                    </button>
                  )}
                  {status !== "rejected" && (
                    <button
                      onClick={() => act(r.id, "reject")}
                      className="px-2 py-1 bg-red-600 text-white rounded"
                    >
                      Rechazar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  Sin registros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </main>
  );
}
//ADMIN_TOKEN=loquesea123
//RESEND_API_KEY=re_xxxxx
