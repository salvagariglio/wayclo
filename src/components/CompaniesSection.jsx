"use client";
import useScrollReveal from "@/hooks/useScrollReveal";
import { useMemo, useState } from "react";
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

  if (safeData.length === 0) return null;

  return (
    <section id="empresas" className="bg-white">
      <div className="mx-auto max-w-6xl px-6 p-16 md:pb-20">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center text-slate-900">
          Empresas organizadoras
        </h2>

        <p className="text-base md:text-lg text-slate-700 text-center mt-2">
          Conocé a los equipos detrás del evento.
        </p>

        <div className="mt-10 space-y-16 md:space-y-20">
          {safeData.map((c) => {
            const [ref, show] = useScrollReveal();
            return (
              <div
                key={c.id}
                id={c.id}
                ref={ref}
                className={`reveal ${show ? "show" : ""} scroll-mt-24`}
              >
                <CompanyPanel {...c} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button
          type="button"
          onClick={() => document.dispatchEvent(new Event("open-register"))}
          className="
            inline-flex items-center justify-center
            rounded-full
            px-10 md:px-12
            h-14 md:h-16
            text-md md:text-xl
            font-semibold
            text-cyan-600
            border-2 border-cyan-600
            bg-transparent
            hover:bg-cyan-600 hover:text-white
            transition-colors
            shadow-[0_2px_0_0_#0891b2]
            md:shadow-[0_3px_0_0_#0891b2]
          "
        >
          INSCRIBITE AHORA
        </button>
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

  const highlightText =
    "Soluciones integrales y ciberseguridad para el crecimiento empresarial";

  function renderParagraph(p) {
    if (!p.includes(highlightText)) return p;
    const [before, after] = p.split(highlightText);

    return (
      <>
        {before}
        <span className="inline-block font-semibold text-lg md:text-xl bg-gradient-to-r from-cyan-500 to-cyan-700 bg-clip-text text-transparent">
          {highlightText}
        </span>
        {after}
      </>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
      {/* IZQUIERDA */}
      <div>
        {/* LOGO CON TAMAÑOS PERSONALIZADOS */}
        <div className="flex items-center gap-3 mb-4">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={`${name} logo`}
              className={`
                w-auto object-contain
                ${name.toLowerCase().includes("intercity")
                  ? "h-12 md:h-16"     /* 🔥 Intercity más grande */
                  : "h-6 md:h-8"      /* 🔥 Wayclo más chico */
                }
              `}
            />
          ) : null}
        </div>

        <div
          className={[
            "space-y-4 relative overflow-hidden transition-all duration-500 ease-in-out",
            expanded ? "max-h-[1000px]" : "max-h-64 md:max-h-80",
          ].join(" ")}
        >
          {paragraphs.map((p, idx) => (
            <p
              key={idx}
              className="text-base text-slate-700/90 leading-relaxed"
            >
              {renderParagraph(p)}
            </p>
          ))}

          {!expanded && paragraphs.length > 2 && (
            <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent" />
          )}
        </div>

        {paragraphs.length > 2 && (
          <button
            onClick={() => setExpanded((s) => !s)}
            className="mt-4 inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-500 md:text-sm text-xs"
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

        <div className="mt-6 pt-2">
          <a
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-700 text-white px-5 py-2.5 md:text-sm text-xs font-semibold hover:from-cyan-400 hover:to-cyan-600 transition"
          >
            {ctaLabel}
            <ArrowRight className="w-4 h-4 text-white" />
          </a>
        </div>
      </div>

      {/* DERECHA */}
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-300 bg-white/80 backdrop-blur-sm p-6 md:p-8 shadow-lg">
          <h4 className="text-base font-semibold text-slate-900 mb-4">
            Áreas Clave
          </h4>

          <ul className="space-y-3">
            {(Array.isArray(keyServices) ? keyServices : []).map((s) => (
              <li
                key={s.title}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-100"
              >
                <Icon
                  name={s.icon}
                  className="w-5 h-5 text-cyan-500 mt-1 flex-shrink-0"
                />

                <div>
                  <h5 className="text-base font-semibold text-slate-900">
                    {s.title}
                  </h5>
                  <p className="md:text-sm text-xs text-slate-700">
                    {s.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {Array.isArray(links) && links.length > 0 && (
          <div className="rounded-2xl border border-slate-300 bg-white/80 backdrop-blur-sm p-6 md:p-8 shadow-lg">
            <h4 className="text-base md:text-lg font-semibold text-slate-900 mb-4">
              Enlaces
            </h4>

            <div className="flex flex-wrap items-center gap-3">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl border border-slate-300 bg-slate-100 text-slate-700 hover:border-cyan-400/60 hover:text-cyan-600 transition group"
                >
                  <Icon
                    name={l.iconName}
                    className="w-5 h-5 text-cyan-500 group-hover:text-cyan-400 transition"
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
