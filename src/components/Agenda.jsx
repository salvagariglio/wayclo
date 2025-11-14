"use client";
import Image from "next/image";
import { useState } from "react";
import { speakers } from "@/components/Speakers"; // SpeakerCard no se usa acá, podés borrarlo del import
import { Linkedin } from "lucide-react";

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
      title: "Recepción y acreditación",
      description:
        "Bienvenida a los participantes con café de recepción. Networking inicial entre decisores y asistentes técnicos.",
    },
    {
      time: "18:15 - 18:30",
      title: "Introducción",
      description: "Apertura y bienvenida, Wayclo e Intercity. ",
    },
    {
      time: "18:30 - 19.15",
      title: " Panel de discusión: Desafíos reales y soluciones en IT en la región",
      description:
        "Participan Wayclo, Intercity y empresas invitadas. Casos de éxito, desafíos locales y debate sobre el futuro tecnológico de la región.",
      tag: "Panel",
      speakersNames: [
        "Cristian Mercado",
        "Martín Lovera",
        "Pablo Degiglio",
        "Eduardo Ochoa",
        "Ivan Pecovich",
      ],
    },
    {
      time: "19:15 – 19:30",
      title: "Break",
      description: "Coffee break y networking informal entre asistentes.",
    },
    {
      time: "19:30 – 20:15",
      title: "Charla: Ciberseguridad ",
      description: "Riesgos empresariales y legales.",
      tag: "Charla",
      speakersNames: ["Gustavo Matuk", "Emmanuel Villas"],
    },
    {
      time: "20:15 – 21:00",
      title: "Catering y Networking final",
      description: "Cierre con cóctel distendido y networking entre empresas.",
      tag: "Cóctel",
    },
  ];

  return (
    <section className="py-20 bg-white text-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-10 text-center">
          AGENDA DEL EVENTO
        </h2>

        <div className="flex flex-col gap-12">
          {agenda.map((it, idx) => {
            const isRight = idx % 2 !== 0; // alterna lado

            return (
              <div
                key={idx}
                className={`
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

      {/* MODAL – CARD GRANDE, CENTRADA, MISMO DISEÑO */}
      {selectedSpeaker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl mx-4">
            {/* Botón cerrar */}
            <button
              onClick={() => setSelectedSpeaker(null)}
              className="absolute -top-10 right-1 text-white text-3xl leading-none"
            >
              ×
            </button>

            <SpeakerModalCard speaker={selectedSpeaker} />
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * 🔹 CARD PARA EL MODAL
 * Replica tu SpeakerCard en grande y centrada.
 */
function SpeakerModalCard({ speaker }) {
  if (!speaker) return null;

  const { name, lastname, img, role, company, linkedin } = speaker;

  const index = speakers.findIndex(
    (sp) => sp.name === name && sp.lastname === lastname
  );
  const isOdd = index % 2 !== 0;

  const gradientClass = isOdd
    ? "bg-gradient-to-r from-[#021728] to-[#006AAE]"
    : "bg-gradient-to-r from-[#006AAE] to-[#021728]";

  const hasImage = typeof img === "string" && img.trim() !== "";

  return (
    <div
      className={`
        relative
        w-full
        h-[40vh]
        sm:h-[45vh]
        lg:h-[50vh]
        flex
        rounded-2xl
        px-5 sm:px-7 lg:px-8
        text-white
        overflow-hidden
        ${gradientClass}
      `}
    >
      {/* ⬇️ MISMO FIX: max-w y pr */}
      <div className="absolute bottom-10 left-5 flex flex-col gap-2 z-10 max-w-[55%] pr-3 break-words">
        <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
          {name} {lastname}
        </p>

        {role && (
          <p className="text-sm sm:text-base lg:text-lg opacity-90">
            {role}
          </p>
        )}

        {company && (
          <p className="text-sm sm:text-base lg:text-lg opacity-80">
            {company}
          </p>
        )}

        {linkedin && (
          <a
            href={linkedin}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-2 text-xs sm:text-sm lg:text-base opacity-90 hover:opacity-100"
          >
            <Linkedin className="w-4 h-4" />
            <span>Ver en LinkedIn</span>
          </a>
        )}
      </div>

      {hasImage && (
        <div className="absolute bottom-0 right-0 h-full w-[50%]">
          <Image
            src={img}
            alt={`${name} ${lastname} - Speaker en CyberCloud`}
            fill
            className="object-cover object-bottom"
          />
        </div>
      )}
    </div>
  );
}
