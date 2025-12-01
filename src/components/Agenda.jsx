"use client";
import { speakers } from "@/components/Speakers";
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

// 🔹 Agenda ahora recibe onSelectSpeaker desde la página
export default function Agenda({ onSelectSpeaker }) {
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
      title:
        "PRIMER PANEL DE DISCUSIÓN: Desafíos reales y soluciones en IT en la región",
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
      title:
        "SEGUNDO PANEL DE DISCUSIÓN: Desafíos reales y soluciones en IT en la región",
      description:
        "Participan Wayclo, Intercity y empresas invitadas. Casos de éxito, desafíos locales y debate sobre el futuro tecnológico de la región.",
      tag: "Panel 2",
      speakersNames: ["Luciano Gabutti", "Juan Ochoa", "Ivan Pecovich", "Gustavo Díaz"],
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
      tag: "Panel 3",
      speakersNames: ["Gustavo Matuk", "Emmanuel Vilas"],
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
            const [ref, show] = useScrollReveal();
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
                          onClick={() => {
                            if (onSelectSpeaker) onSelectSpeaker(sp);
                          }}
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
    </section>
  );
}
