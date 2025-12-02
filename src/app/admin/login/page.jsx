"use client";
import { useState } from "react";
import { LockKeyhole } from "lucide-react";

export default function AdminLogin() {
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    setLoading(false);
    if (res.ok) {
      window.location.href = "/admin/registrations";
    } else {
      setErr("Clave incorrecta");
    }
  };

  return (
    <main className="h-[85vh] flex items-center justify-center bg-[#021728] p-6">
      <form
        onSubmit={login}
        className="bg-white shadow-xl border border-slate-200 rounded-2xl p-8 w-full max-w-sm flex flex-col items-center"
      >
        <div className="flex items-center gap-2 mb-4">
          <LockKeyhole size={26} className="text-cyan-600" />
          <h1 className="text-xl font-semibold text-[#021728]">Panel Admin</h1>
        </div>

        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Ingresá tu clave"
          className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:cyan-700 text-slate-700 placeholder:text-slate-400"
        />

        {err && <p className="text-red-600 text-sm mt-2 w-full text-center">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 rounded-lg transition-all"
        >
          {loading ? "Ingresando..." : "Entrar"}
        </button>

        <p className="text-xs text-slate-400 mt-6 text-center">
          Acceso restringido al equipo organizador
        </p>
      </form>
    </main>
  );
}
