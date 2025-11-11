"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setErr("");

    const res = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });

    if (res.ok) {
      window.location.href = "/admin/registrations";
    } else {
      setErr("Clave incorrecta");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={login}
        className="border p-6 rounded-xl shadow-xl max-w-sm w-full"
      >
        <h1 className="text-xl font-semibold mb-3">Acceso admin</h1>

        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Clave secreta"
          className="w-full border rounded px-3 py-2"
        />

        {err && <p className="text-red-600 text-sm mt-2">{err}</p>}

        <button className="mt-4 w-full bg-black text-white rounded py-2">
          Entrar
        </button>
      </form>
    </main>
  );
}
