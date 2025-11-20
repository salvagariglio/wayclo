"use client";
import { useState } from "react";

// Data compartida
const FEATURES = [
  {
    title: "AGENDA",
    text: "Conocé lo que se viene.",
  },
  {
    title: "SPEAKERS",
    text: "Conocé a nuestros speakers. ",
  },
  {
    title: "EMPRESAS",
    text: "Conocé a los equipos detras del evento.",
  },
];

function CyberCloudButtons({ items = [] }) {
  return (
    <div className="sm:text-center w-full flex flex-col gap-6 lg:flex-row">
      {items.map((f) => {
        return (
          <a
            key={f.title}
            href={`${f.title.toLowerCase()}`} // agenda → #agenda
            className={[
              "flex-1 min-w-0 rounded-3xl border p-6 transition-all duration-300 ease-out",
              "bg-[#021728] border-slate-700",
              "hover:-translate-y-1 hover:shadow-[0_0_22px_rgba(56,189,248,0.35)] hover:border-cyan-400",
              "group block"
            ].join(" ")}
          >
            <h3
              className={[
                "text-lg md:text-xl font-bold tracking-wide mb-3 transition-colors",
                "group-hover:text-cyan-400 text-slate-100",
              ].join(" ")}
            >
              {f.title}
            </h3>

            <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors">
              {f.text}
            </p>
          </a>
        );
      })}
    </div>
  );
}


// COMPONENTE PRINCIPAL QUE USA LOS DOS ANTERIORES
export default function ExpoFeaturesDarkCyber() {
  return (
    <section className="pb-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid gap-12 items-start justify-items-center">
        <CyberCloudButtons items={FEATURES} />
      </div>
    </section>
  );
}
