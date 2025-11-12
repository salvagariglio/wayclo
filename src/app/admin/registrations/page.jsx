"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, LockKeyhole } from "lucide-react";

export default function AdminRegistrations() {
  const [status, setStatus] = useState("pending");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [auth, setAuth] = useState("checking");
  const router = useRouter();

  // 🔐 Verificar cookie de sesión
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/session", { method: "GET" });
      if (!res.ok) {
        setAuth("unauth");
      } else {
        setAuth("ok");
      }
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/registrations?status=${status}`, { cache: "no-store" });
    const out = await res.json();
    setItems(out.items || []);
    setLoading(false);
  };

  useEffect(() => {
    if (auth === "ok") load();
  }, [status, auth]);

  const act = async (id, action) => {
    const res = await fetch(`/api/admin/registrations/${id}/${action}`, { method: "POST" });
    if (!res.ok) {
      const out = await res.json();
      alert(out.error || "Error");
    } else {
      load();
    }
  };

  // 🌀 Pantalla mientras valida auth
  if (auth === "checking") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <div className="flex items-center gap-2">
          <RotateCcw className="animate-spin" size={18} />
          <p>Verificando acceso...</p>
        </div>
      </main>
    );
  }

  // 🔒 Si no hay sesión, redirigir a login
  if (auth === "unauth") {
    router.push("/admin/login");
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-2">
            <LockKeyhole size={22} className="text-indigo-600" />
            <h1 className="text-2xl font-semibold">Gestión de Invitados</h1>
          </div>

          <div className="mt-3 sm:mt-0 flex gap-2">
            {["pending", "approved", "rejected"].map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`capitalize px-4 py-2 rounded-lg border text-sm font-medium transition
                ${status === s
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white border-slate-300 hover:bg-slate-100"
                  }`}
              >
                {s}
              </button>
            ))}
            <button
              onClick={load}
              className="px-4 py-2 rounded-lg border text-sm font-medium bg-white border-slate-300 hover:bg-slate-100 flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} className={`transition-transform ${loading ? "animate-spin" : ""}`} />
              {!loading && <span>Refrescar</span>}
            </button>
          </div>
        </header>

        {loading && <p className="text-center py-10 text-slate-500">Cargando…</p>}
        {!loading && items.length === 0 && (
          <p className="text-center py-10 text-slate-400">No hay registros en esta categoría.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(r => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between">
              <div>
                <p className="text-sm text-slate-400">{new Date(r.created_at).toLocaleString()}</p>
                <h2 className="text-lg font-semibold mt-1">{r.first_name} {r.last_name}</h2>
                <p className="text-sm text-slate-600 mt-1">{r.email}</p>
                <p className="text-sm text-slate-600">{r.company} — {r.role}</p>
                {r.diet && <p className="text-xs text-slate-500 mt-1">Dieta: {r.diet}</p>}
              </div>

              <div className="mt-4 flex gap-2">
                {status !== "approved" && (
                  <button
                    onClick={() => act(r.id, "approve")}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 rounded-lg transition"
                  >
                    Aprobar
                  </button>
                )}
                {status !== "rejected" && (
                  <button
                    onClick={() => act(r.id, "reject")}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-2 rounded-lg transition"
                  >
                    Rechazar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
