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
    const res = await fetch(`/api/admin/registrations?status=${status}`, {
      cache: "no-store",
    });
    const out = await res.json();
    setItems(out.items || []);
    setLoading(false);
  };

  useEffect(() => {
    if (auth === "ok") load();
  }, [status, auth]);

  const act = async (id, action) => {
    const res = await fetch(`/api/admin/registrations/${id}/${action}`, {
      method: "POST",
    });
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
      <main className="min-h-screen flex items-center justify-center bg-[#021728] text-white/80">
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
    <main className="min-h-screen bg-[#021728] text-white px-4 py-8 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER + CONTROLES EN CARD TRANSLÚCIDA */}
        <section className="mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 md:px-6 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-[0_0_22px_rgba(255,255,255,0.12)]">
            <div className="flex items-center gap-2">
              <LockKeyhole size={22} className="text-cyan-400" />
              <div>
                <h1 className="text-xl md:text-2xl font-semibold">
                  Gestión de Invitados
                </h1>
                <p className="text-xs md:text-sm text-white/60">
                  Revisá, aprobá o rechazá las solicitudes al evento.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-start md:justify-end">
              {["pending", "approved", "rejected"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`capitalize px-4 py-2 rounded-full border text-xs md:text-sm font-medium transition
                  ${status === s
                      ? "bg-white text-[#021728] border-white shadow-sm"
                      : "bg-transparent text-white border-white/40 hover:bg-white/10"
                    }`}
                >
                  {s === "pending"
                    ? "Pendientes"
                    : s === "approved"
                      ? "Aprobados"
                      : "Rechazados"}
                </button>
              ))}
              <button
                onClick={load}
                className="px-4 py-2 rounded-full border text-xs md:text-sm font-medium bg-transparent text-white border-white/40 hover:bg-white/10 flex items-center justify-center gap-2"
              >
                <RotateCcw
                  size={18}
                  className={`transition-transform ${loading ? "animate-spin" : ""
                    }`}
                />
                {!loading}
              </button>
            </div>
          </div>
        </section>

        {/* ESTADO LISTA */}
        {loading && (
          <p className="text-center py-10 text-white/70">Cargando…</p>
        )}
        {!loading && items.length === 0 && (
          <p className="text-center py-10 text-white/50">
            No hay registros en esta categoría.
          </p>
        )}

        {/* GRID DE TARJETAS BLANCAS, COMO EL LOGIN */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 flex flex-col justify-between"
            >
              <div>
                <p className="text-xs text-slate-400">
                  {new Date(r.created_at).toLocaleString()}
                </p>
                <h2 className="text-lg font-semibold mt-1 text-slate-900">
                  {r.first_name} {r.last_name}
                </h2>
                <p className="text-sm text-slate-700 mt-1">{r.email}</p>
                <p className="text-sm text-slate-700">
                  {r.company} — {r.role}
                </p>
                {r.diet && (
                  <p className="text-xs text-slate-500 mt-1">
                    Dieta: {r.diet}
                  </p>
                )}
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
        </section>
      </div>
    </main>
  );
}
