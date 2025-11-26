"use client";
import Image from "next/image";
import { useState } from "react";
import { speakers } from "@/components/Speakers"; // SpeakerCard no se usa acá, podés borrarlo del import
import { Linkedin } from "lucide-react";
import useScrollReveal from "@/hooks/useScrollReveal";

// 👉 ahora devuelve DIRECTAMENTE el objeto speaker
const findSpeakerByFullName = (fullName) => {
  const trimmed = fullName.trim();
  const found = speakers.find(
    (sp) => `${sp.name} ${sp.lastname}`.trim() === trimmed
  );
  if (!found) {
    console.warn("Speaker no encontrado:", fullName);
  }
  return found || null;
};

export default function Agenda() {
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);

  const agenda = [
    {
      time: "17:45 – 18:15",
      title: "RECEPCIÓN Y ACREDITACIÓN",
      description:
        "Bienvenida a los participantes con café de recepción. Networking inicial entre decisores y asistentes técnicos.",
    },
    {
      time: "18:15 - 18:30",
      title: "APERTURA ",
      description: "Apertura y bienvenida, Wayclo e Intercity. ",
    },
    {
      time: "18:30 - 19.00",
      title: "PRIMER PANEL DE DISCUSIÓN: Desafíos reales y soluciones en IT en la región",
      description:
        "Participan Wayclo, Intercity y empresas invitadas. Casos de éxito, desafíos locales y debate sobre el futuro tecnológico de la región.",
      tag: "Panel 1",
      speakersNames: [
        "Cristian Mercado",
        "Martín Lovera",
        "Pablo Degiglio",
        "Eduardo Ochoa",
        "Ivan Pecovich",
      ],
    },
    {
      time: "19:00 - 19:30",
      title: "SEGUNDO PANEL DE DISCUSIÓN: Desafíos reales y soluciones en IT en la región",
      description: "Participan Wayclo, Intercity y empresas invitadas. Casos de éxito, desafíos locales y debate sobre el futuro tecnológico de la región.",
      tag: "Panel 2",
      speakersNames: ["Luciano Gabutti", "Juan Ochoa", "Ivan Pecovich", "Grassi"],
    },
    {
      time: "19:30 – 19:45",
      title: "BREAK",
      description: "Coffee break y networking informal entre asistentes.",
    },
    {
      time: "20:00 – 20:30",
      title: "CHARLA: Ciberseguridad ",
      description: "Riesgos empresariales y legales.",
      tag: "Charla",
      speakersNames: ["Gustavo Matuk", "Emmanuel Villas"],
    },
    {
      time: "20:30 – 21:00",
      title: "CATERING Y NETWORKING FINAL",
      description: "Cierre con cóctel distendido y networking entre empresas.",
      tag: "Cóctel",
    },
  ];

  return (
    <section className="bg-white text-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center text-slate-900">
          Agenda
        </h2>
        <p className="text-base md:text-lg text-slate-700 text-center mt-2 mb-10">
          Mirá el recorrido completo del evento.
        </p>


        <div className="flex flex-col gap-12">
          {agenda.map((it, idx) => {
            const [ref, show] = useScrollReveal();   // 👈 AGREGADO
            const isRight = idx % 2 !== 0;

            return (
              <div
                key={idx}
                ref={ref}
                className={`
          reveal ${show ? "show" : ""}
          relative
          py-4 px-6 rounded-xl
          transition-all duration-300
          hover:bg-gray-50
          ${isRight
                    ? "border-r-4 border-cyan-400 text-right pr-6 ml-auto"
                    : "border-l-4 border-cyan-400 text-left pl-6 mr-auto"
                  }
          max-w-3xl
        `}
              >

                {/* HORA + TÍTULO */}
                <h3
                  className={`
                    text-xl font-bold text-cyan-600 mb-1
                    ${isRight ? "text-right" : "text-left"}
                  `}
                >
                  {it.time} | {it.title}
                </h3>

                {/* DESCRIPCIÓN */}
                <p
                  className={`
                    text-gray-700 leading-relaxed
                    ${isRight ? "text-right" : "text-left"}
                  `}
                >
                  {it.description}
                </p>

                {/* TAG */}
                {it.tag && (
                  <div
                    className={`
                      mt-2
                      ${isRight ? "text-right" : "text-left"}
                    `}
                  >
                    <span className="text-xs rounded-full bg-black text-white px-2 py-0.5">
                      {it.tag}
                    </span>
                  </div>
                )}

                {/* SPEAKERS */}
                {it.speakersNames && it.speakersNames.length > 0 && (
                  <div
                    className={`
                      mt-3 flex flex-wrap gap-2 items-center
                      ${isRight ? "justify-end" : "justify-start"}
                    `}
                  >
                    <span className="text-xs sm:text-sm text-gray-500">
                      Speakers:
                    </span>

                    {it.speakersNames.map((fullName) => {
                      const sp = findSpeakerByFullName(fullName);
                      if (!sp) return null;

                      return (
                        <button
                          key={fullName}
                          type="button"
                          onClick={() => setSelectedSpeaker(sp)} // 👈 ahora seteamos el speaker directamente
                          className="px-3 py-1 rounded-full border border-cyan-400 text-cyan-700 text-xs sm:text-sm hover:bg-cyan-50 transition"
                        >
                          {fullName}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-center mt-16">
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


      {/* MODAL – CARD GRANDE, CENTRADA, MISMO DISEÑO */}
      {/* MODAL NUEVO – SIEMPRE CENTRADO */}
      {selectedSpeaker && (
        <div
          className="
      fixed inset-0 z-50 
      flex items-center justify-center 
      bg-black/70 backdrop-blur-sm
      p-4
      animate-fadeIn
    "
        >
          {/* Cerrar */}
          <button
            onClick={() => setSelectedSpeaker(null)}
            className="
        absolute top-6 right-6 
        text-white text-4xl font-light
        hover:opacity-80 transition
      "
          >
            ×
          </button>

          <div
            className="
        w-full 
        max-w-xl sm:max-w-2xl lg:max-w-3xl
        animate-scaleIn
      "
          >
            <SpeakerModalCard speaker={selectedSpeaker} />
          </div>
        </div>
      )}

    </section>
  );
}

/*
 * 🔹 CARD PARA EL MODAL
 * Replica tu SpeakerCard en grande y centrada.
*/
function SpeakerModalCard({ speaker }) {
  if (!speaker) return null;

  const { name, lastname, img, role, company, linkedin, companyLogo, companyLogoWidth } = speaker;

  return (
    <div
      className="
        w-full
        bg-gradient-to-r from-[#021728] to-cyan-600 
        text-white
        rounded-2xl
        overflow-hidden
        flex flex-col md:flex-row
      "
    >
      {/* IMAGEN – Mobile circular / Desktop contenida */}
      <div
        className="
          relative
          w-full md:w-2/5
          aspect-square md:aspect-auto
          h-56 md:h-auto
          flex-shrink-0
          overflow-hidden
        "
      >
        <Image
          src={img}
          alt={name}
          fill
          className="
            object-cover
            md:object-contain
            object-top md:object-bottom
            rounded-full md:rounded-none
            p-3 md:p-0
          "
        />
      </div>

      {/* INFORMACIÓN */}
      <div
        className="
          flex flex-col justify-center
          p-6 sm:p-8
          w-full
          text-left
        "
      >
        {companyLogo && (
          <Image
            src={companyLogo}
            alt={company}
            width={companyLogoWidth || 120}
            height={120}
            className="object-contain mb-4 drop-shadow-lg"
          />
        )}

        <h3 className="text-2xl sm:text-3xl font-semibold leading-tight">
          {name} {lastname}
        </h3>

        <p className="text-sm sm:text-base opacity-90 mt-2">{role}</p>

        <p className="text-sm sm:text-base opacity-80">{company}</p>

        {linkedin && (
          <a
            href={linkedin}
            target="_blank"
            rel="noreferrer"
            className="
              mt-4 inline-flex items-center gap-2 
              text-sm sm:text-base 
              text-white/90 hover:text-white
            "
          >
            <Linkedin className="w-5 h-5" />
            Ver en LinkedIn
          </a>
        )}
      </div>
    </div>
  );
}
