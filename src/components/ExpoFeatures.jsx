// components/ExpoFeaturesDarkCyber.jsx
"use client";
import { useState } from "react";
import Image from "next/image";
import ExpoImg from "../../public/polo.jpg";

export default function ExpoFeaturesDarkCyber() {
  const features = [
    {
      title: "TENDENCIAS",
      text: "Analizá los desafíos emergentes en ciberseguridad, inteligencia artificial y transformación digital que marcarán el futuro de las empresas.",
    },
    {
      title: "NETWORKING",
      text: "Conectate con líderes de tecnología, responsables de seguridad y expertos del sector para compartir experiencias y construir alianzas estratégicas.",
    },
    {
      title: "APRENDIZAJE",
      text: "Accedé a perspectivas reales de quienes protegen, gestionan y optimizan los entornos tecnológicos más exigentes del mercado.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(0);
  const toggle = (i) => setOpenIndex(i);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center justify-items-center">

        {/* IZQUIERDA */}
        <div className="lg:pr-12 lg:text-left text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
            UNA EXPERIENCIA ÚNICA PARA LÍDERES Y EXPERTOS EN TECNOLOGÍA
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
            CyberCloud reúne a los principales referentes del mundo digital y la
            ciberseguridad para explorar cómo la innovación impulsa la
            competitividad y la resiliencia empresarial.
          </p>

          <div className="mt-10 w-full">
            <div className="relative w-full">
              <Image
                src={ExpoImg}
                alt="Vista previa de la expo"
                className="w-full h-auto rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.10)] object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* DERECHA */}
        <div className="flex flex-col gap-6 w-full">
          {features.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={f.title}
                className={[
                  "rounded-3xl border p-0 transition-all duration-300 ease-out overflow-hidden w-full",
                  "bg-slate-900 border-slate-700",
                  "hover:-translate-y-1 hover:shadow-[0_0_22px_rgba(56,189,248,0.35)] hover:border-cyan-400",
                  isOpen
                    ? "border-cyan-400 shadow-[0_0_14px_rgba(56,189,248,0.28)]"
                    : "",
                ].join(" ")}
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left"
                >
                  <h3
                    className={[
                      "text-lg md:text-xl font-bold transition-colors tracking-wide",
                      isOpen ? "text-cyan-400" : "text-slate-100",
                    ].join(" ")}
                  >
                    {f.title}
                  </h3>

                  <svg
                    className={[
                      "h-5 w-5 flex-shrink-0 transition-transform",
                      isOpen
                        ? "rotate-180 text-cyan-400"
                        : "rotate-0 text-slate-400",
                    ].join(" ")}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <div
                  className={[
                    "transition-all duration-300 ease-out px-6",
                    isOpen
                      ? "max-h-64 pb-6 opacity-100"
                      : "max-h-0 pb-0 opacity-0",
                    "overflow-hidden",
                  ].join(" ")}
                >
                  <p className="text-slate-300 leading-relaxed">{f.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
