"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Server,
  Database,
  Zap,
  Building,
  Tv,
  Globe,
  Linkedin,
  Wrench,
  Lock,
  Instagram,
} from "lucide-react";

const iconMap = {
  ShieldCheck,
  Server,
  Database,
  Zap,
  Building,
  Tv,
  Globe,
  Linkedin,
  Wrench,
  Lock,
  Instagram,
};
function Icon({ name, className = "w-5 h-5" }) {
  const LucideIcon = iconMap[name];
  if (!LucideIcon) return null;
  return <LucideIcon className={className} />;
}

export default function CompaniesSection({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];
  const firstId = safeData[0]?.id ?? "";

  const [active, setActive] = useState(firstId);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = new URL(window.location.href);
    const empresa = u.searchParams.get("empresa");
    if (empresa && safeData.some((d) => d.id === empresa)) {
      setActive(empresa);
    }
  }, [safeData]);

  if (safeData.length === 0) {
    return null;
  }

  return (
    <section id="empresas" className="bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center">
          Empresas organizadoras
        </h2>
        <p className="text-base md:text-lg text-slate-300/90 text-center mt-2">
          Conocé a los equipos detrás del evento.
        </p>

        {/* Botones (Tabs responsivos, usando flex-wrap) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          {safeData.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={[
                "px-4 py-2 rounded-xl border text-sm md:text-base transition",
                active === c.id
                  ? "border-cyan-400/40 bg-cyan-500/10 text-white"
                  : "border-slate-800 bg-slate-900/40 text-slate-300 hover:text-slate-100 hover:border-cyan-400/20",
              ].join(" ")}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Panel activo */}
        <div className="block mt-10">
          {safeData.map((c) =>
            active === c.id ? <CompanyPanel key={c.id} {...c} /> : null
          )}
        </div>
      </div>
    </section>
  );
}

function CompanyPanel({
  name = "",
  logoSrc = "",
  about = "",
  keyServices = [],
  links = [],
  ctaHref = "#registro",
  ctaLabel = "Hablar",
}) {
  const paragraphs = useMemo(() => {
    if (!about || typeof about !== "string") return [];
    const raw = about
      .split(/\n+|\r\n/g)
      .map((p) => p.trim())
      .filter(Boolean);
    return raw.length ? raw : [about];
  }, [about]);

  const [expanded, setExpanded] = useState(false);

  return (
    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
      {/* Izquierda: texto + CTA principal */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={`${name} logo`}
              className="h-16 md:h-22 w-auto"
            />
          ) : null}
        </div>

        {/* Contenedor "Leer más" con transición max-height */}
        <div
          className={[
            "space-y-4 relative overflow-hidden transition-all duration-500 ease-in-out",
            expanded ? "max-h-[1000px]" : "max-h-64 md:max-h-80",
          ].join(" ")}
        >
          {paragraphs.map((p, idx) => (
            <p
              key={idx}
              className="text-base md:text-lg text-slate-300/90 leading-relaxed"
            >
              {p}
            </p>
          ))}
          {/* Efecto "fade-out" */}
          {!expanded && paragraphs.length > 2 && (
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-950 to-transparent" />
          )}
        </div>

        {/* Botón "Leer más" */}
        {paragraphs.length > 2 && (
          <button
            onClick={() => setExpanded((s) => !s)}
            className="mt-4 inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 text-sm md:text-base"
          >
            {expanded ? "Ver menos" : "Leer más"}
            <ChevronDown
              className={[
                "w-4 h-4 transition-transform",
                expanded ? "rotate-180" : "rotate-0",
              ].join(" ")}
            />
          </button>
        )}

        {/* CTA Principal */}
        <div className="mt-6 pt-2">
          <a
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 text-cyan-950 px-5 py-2.5 text-sm md:text-base font-semibold hover:bg-cyan-400 transition"
          >
            {ctaLabel} <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* DERECHA: Ahora solo tiene espacio, los fondos están en los hijos */}
      <div className="space-y-5">
        {/* Sección 1: Áreas Clave (con su propio background y borde) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
          <h4 className="text-lg md:text-xl font-semibold text-white mb-4">
            Áreas Clave
          </h4>
          <ul className="space-y-3">
            {(Array.isArray(keyServices) ? keyServices : []).map((s) => (
              <li
                key={s.title}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40"
              >
                <Icon
                  name={s.icon}
                  className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0"
                />
                <div>
                  <h5 className="text-base md:text-lg font-semibold text-white">
                    {s.title}
                  </h5>
                  <p className="text-sm md:text-base text-slate-300/90">
                    {s.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Sección 2: Enlaces (con su propio background y borde) */}
        {links.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
            <h4 className="text-lg md:text-xl font-semibold text-white mb-4">
              Enlaces
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              {(Array.isArray(links) ? links : []).map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-200 hover:border-cyan-400/30 hover:text-cyan-200 transition group"
                  aria-label={`Ir a ${l.label}`}
                >
                  <Icon
                    name={l.iconName}
                    className="w-5 h-5 text-cyan-300 group-hover:text-cyan-200 transition"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
