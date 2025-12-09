"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RotateCcw,
  Users,
  Building2,
  UserCircle2,
  AlertTriangle,
  Download,
} from "lucide-react";

export default function AnalysisPage() {
  // 🔐 Auth
  const [auth, setAuth] = useState("checking"); // "checking" | "ok" | "unauth"
  const router = useRouter();

  // 🔐 Verificar sesión al montar
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/session", { method: "GET" });
        if (!res.ok) setAuth("unauth");
        else setAuth("ok");
      } catch {
        setAuth("unauth");
      }
    })();
  }, []);

  // 🔁 Redirigir a login si no hay sesión
  useEffect(() => {
    if (auth === "unauth") {
      router.replace("/admin/login");
    }
  }, [auth, router]);

  // ===========================
  // ESTADOS ANÁLISIS
  // ===========================
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");

  const [plan, setPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [planError, setPlanError] = useState("");

  // ===========================
  // CARGAR SUMMARY (GET)
  // ===========================
  useEffect(() => {
    // Solo cargar si hay auth OK
    if (auth !== "ok") return;

    (async () => {
      try {
        setLoadingSummary(true);
        const res = await fetch("/api/admin/ia/analysis", {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setSummaryError(data.error || "Error al cargar análisis");
        } else {
          setSummary(data.summary);
        }
      } catch (e) {
        setSummaryError("Error de red");
      } finally {
        setLoadingSummary(false);
      }
    })();
  }, [auth]);

  // ===========================
  // DERIVADOS
  // ===========================
  const stats = useMemo(() => {
    if (!summary) return null;
    const totalGuests = summary.total_guests || 0;
    const totalCompanies = Object.keys(summary.by_company || {}).length;
    const totalRoles = Object.keys(summary.by_role || {}).length;
    const specialCount = summary.special_notes?.length || 0;
    return { totalGuests, totalCompanies, totalRoles, specialCount };
  }, [summary]);

  const dietEntries = useMemo(() => {
    if (!summary) return [];
    const entries = Object.entries(summary.by_diet || {});
    const total = summary.total_guests || 1;
    return entries
      .map(([diet, count]) => ({
        diet,
        count,
        pct: Math.round((count * 100) / total),
      }))
      .sort((a, b) => b.count - a.count);
  }, [summary]);

  const topCompanies = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.by_company || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [summary]);

  const roleEntries = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.by_role || {}).sort((a, b) => b[1] - a[1]);
  }, [summary]);

  // ===========================
  // GENERAR PLAN IA (POST)
  // ===========================
  async function handleGeneratePlan() {
    try {
      setLoadingPlan(true);
      setPlanError("");
      const res = await fetch("/api/admin/ia/menus", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setPlanError(data.error || "No se pudo generar el plan");
        return;
      }
      setPlan(data.plan);
    } catch (e) {
      setPlanError("Error de red al generar el plan");
    } finally {
      setLoadingPlan(false);
    }
  }

  // ===========================
  // RENDER AUTENTICACIÓN
  // ===========================
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

  if (auth === "unauth") {
    // El redirect ya se disparó, no mostramos nada
    return null;
  }

  // ===========================
  // RENDER ANÁLISIS
  // ===========================
  if (loadingSummary) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-white/80">
        <RotateCcw className="animate-spin mr-2" size={20} />
        Cargando análisis de invitados...
      </div>
    );
  }

  if (summaryError) {
    return <p className="text-red-400 text-sm">{summaryError}</p>;
  }

  if (!summary || !stats) {
    return (
      <p className="text-white/60 text-sm">
        No hay datos suficientes para el análisis.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {/* AGENDA DEL EVENTO */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Agenda del evento</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 space-y-1">
          <p>
            <span className="font-semibold">17:45 - 18:15</span> · Recepción y
            acreditaciones — café de bienvenida y networking inicial.
          </p>
          <p>
            <span className="font-semibold">18:15 - 18:30</span> · Apertura —
            bienvenida Wayclo e Intercity.
          </p>
          <p>
            <span className="font-semibold">18:30 - 19:00</span> · Panel 1:
            Expansión segura de sucursales.
          </p>
          <p>
            <span className="font-semibold">19:00 - 19:30</span> · Panel 2:
            Redes resilientes y continuidad.
          </p>
          <p>
            <span className="font-semibold">19:30 - 19:45</span> · Break —
            coffee + networking.
          </p>
          <p>
            <span className="font-semibold">20:00 - 20:30</span> · Panel 3:
            Ciberseguridad.
          </p>
          <p>
            <span className="font-semibold">20:30 - 21:00</span> · Catering y
            networking final — cóctel distendido.
          </p>
        </div>
      </section>

      {/* BARRA DE ACCIONES + TITULO */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Análisis de invitados</h2>
          <p className="text-white/60 text-sm">
            Distribución por dietas, empresas y roles para definir el catering,
            los cuidados especiales y el brief para el proveedor.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-start md:justify-end">
          {/* Botón IA */}
          <button
            onClick={handleGeneratePlan}
            disabled={loadingPlan}
            className="bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg hover:bg-cyan-300 disabled:opacity-60"
          >
            {loadingPlan ? "Generando plan..." : "Generar plan de menú con IA"}
          </button>

          {/* Botón DOCX */}
          <a
            href="/api/admin/ia/report"
            className="flex items-center gap-2 bg-white text-black font-semibold px-4 py-2 rounded-lg hover:bg-white/90"
          >
            <Download size={18} />
            Descargar reporte DOCX
          </a>
        </div>
      </section>

      {/* KPIs PRINCIPALES */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<Users size={20} />}
            label="Invitados"
            value={stats.totalGuests}
          />
          <KpiCard
            icon={<Building2 size={20} />}
            label="Empresas"
            value={stats.totalCompanies}
          />
          <KpiCard
            icon={<UserCircle2 size={20} />}
            label="Roles distintos"
            value={stats.totalRoles}
          />
          <KpiCard
            icon={<AlertTriangle size={20} />}
            label="Dietas especiales"
            value={stats.specialCount}
            accent={stats.specialCount > 0}
          />
        </div>
      </section>

      {/* DIETAS */}
      <section>
        <div className="flex items-center justify-between mb-3 gap-2">
          <h3 className="text-xl font-semibold">Distribución por dieta</h3>
          <p className="text-xs text-white/50">
            Base para definir menú, cantidades y señalización.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {dietEntries.map((item) => (
            <div
              key={item.diet}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3"
            >
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm uppercase tracking-[0.12em] text-white/60">
                  {formatDietLabel(item.diet)}
                </p>
                <span className="text-xs text-white/60">
                  {item.pct}% ({item.count})
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-cyan-400"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EMPRESAS */}
      <section>
        <h3 className="text-xl font-semibold mb-2">
          Top empresas por cantidad de invitados
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topCompanies.map(([company, count]) => (
            <div
              key={company}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3"
            >
              <p className="text-sm text-white/80 mb-1">{company}</p>
              <p className="text-lg font-bold">{count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROLES */}
      <section>
        <h3 className="text-xl font-semibold mb-2">Roles de los invitados</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roleEntries.map(([role, count]) => (
            <div
              key={role}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3"
            >
              <p className="text-sm text-white/80 mb-1">{role}</p>
              <p className="text-lg font-bold">{count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NOTAS ESPECIALES */}
      {summary.special_notes?.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-2">
            Notas de dietas / alergias específicas
          </h3>
          <ul className="list-disc list-inside text-sm text:white/80 space-y-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
            {summary.special_notes.map((note, idx) => (
              <li key={idx}>
                <span className="font-semibold">{note.guest}:</span> {note.note}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* INSIGHT RÁPIDO */}
      <section className="bg-white/5 border border-cyan-400/30 rounded-xl px-5 py-4">
        <h3 className="text-lg font-semibold mb-2 text-cyan-300">
          Lectura rápida del evento
        </h3>
        <p className="text-sm text-white/80 leading-relaxed">
          Tenés{" "}
          <span className="font-semibold">{stats.totalGuests} invitados</span>{" "}
          distribuidos entre{" "}
          <span className="font-semibold">{stats.totalCompanies} empresas</span>{" "}
          y{" "}
          <span className="font-semibold">{stats.totalRoles} tipos de rol</span>
          . La mezcla de dietas muestra que{" "}
          {dietEntries[0]
            ? `la mayor concentración está en “${formatDietLabel(
                dietEntries[0].diet
              )}” (${dietEntries[0].pct}%)`
            : "no hay una dieta predominante"}{" "}
          {stats.specialCount > 0
            ? `y hay ${stats.specialCount} casos con requerimientos especiales a tener muy en cuenta para el menú y la señalización de platos.`
            : "y casi no hay restricciones especiales, lo que simplifica el menú base."}
        </p>
      </section>

      {/* PLAN DE MENÚ CON IA */}
      <section className="mt-4 space-y-4">
        <h3 className="text-xl font-semibold mb-2 text-cyan-300">
          Plan de menú recomendado por IA
        </h3>

        {planError && <p className="text-red-400 text-sm mb-2">{planError}</p>}

        {!plan && !planError && !loadingPlan && (
          <p className="text-white/60 text-sm">
            Generá un plan de menú con el botón de arriba. Se tendrá en cuenta
            la distribución de dietas, empresas y roles, junto con la agenda del
            evento.
          </p>
        )}

        {plan && (
          <>
            {/* Bloques de catering */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <BlockCard
                title="Recepción (17:45 - 18:15)"
                data={plan.reception}
              />
              <BlockCard
                title="Coffee break (19:30 - 19:45)"
                data={plan.coffee_break}
              />
              <BlockCard
                title="Cóctel de cierre (20:30 - 21:00)"
                data={plan.cocktail}
              />
            </div>

            {/* Cuidados por dieta */}
            {plan.diet_care && (
              <div className="mt-4 bg-white/5 border border-cyan-400/40 rounded-xl px-4 py-3">
                <h4 className="text-lg font-semibold mb-2 text-cyan-300">
                  Cuidados especiales por dieta
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/80">
                  {Object.entries(plan.diet_care).map(([key, arr]) => (
                    <div key={key}>
                      <p className="text-xs uppercase tracking-[0.16em] text-white/50 mb-1">
                        {formatDietLabel(key)}
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {arr.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights extra */}
            {plan.extra_insights && plan.extra_insights.length > 0 && (
              <div className="mt-4 bg-white/5 border border-white/15 rounded-xl px-4 py-3">
                <h4 className="text-lg font-semibold mb-2">
                  Insights adicionales
                </h4>
                <ul className="list-disc list-inside text-sm text-white/80 space-y-1">
                  {plan.extra_insights.map((it, idx) => (
                    <li key={idx}>{it}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

/* ──────────────────────────────
   COMPONENTES AUXILIARES
────────────────────────────── */

function KpiCard({ icon, label, value, accent = false }) {
  return (
    <div
      className={[
        "rounded-xl px-4 py-3 border bg-white/5 flex items-center gap-3",
        accent ? "border-amber-400/60 bg-amber-400/10" : "border-white/10",
      ].join(" ")}
    >
      <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs text-white/60 uppercase tracking-[0.16em]">
          {label}
        </p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function BlockCard({ title, data }) {
  if (!data) return null;
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 space-y-2">
      <h4 className="text-lg font-semibold">{title}</h4>
      {data.concept && (
        <p className="text-xs text-white/60 mb-1">{data.concept}</p>
      )}
      {data.items && data.items.length > 0 && (
        <ul className="list-disc list-inside text-sm text-white/80 space-y-1">
          {data.items.map((it, idx) => (
            <li key={idx}>{it}</li>
          ))}
        </ul>
      )}
      {data.notes && data.notes.length > 0 && (
        <div className="mt-2 border-t border-white/10 pt-2">
          <p className="text-xs text-white/50 mb-1">Notas:</p>
          <ul className="list-disc list-inside text-xs text-white/70 space-y-1">
            {data.notes.map((n, idx) => (
              <li key={idx}>{n}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function formatDietLabel(key) {
  const k = key?.toLowerCase() || "";
  if (k === "none" || k === "ninguna") return "Sin restricción";
  if (k.includes("celi")) return "Sin TACC / celíaco";
  if (k.includes("vegan")) return "Vegano";
  if (k.includes("veget")) return "Vegetariano";
  if (k.includes("lact")) return "Sin lactosa";
  if (k === "otra") return "Otra";
  if (k === "general") return "General";
  return key;
}
