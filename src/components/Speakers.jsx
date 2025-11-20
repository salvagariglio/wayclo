"use client";
import Image from "next/image";
import { Linkedin } from "lucide-react";

export const speakers = [
  // PANEL 1 — Wayclo
  {
    name: "Cristian",
    lastname: "Mercado",
    role: "Director",
    company: "Wayclo",
    companyLogo: "/logo-wayclo.png",
    linkedin: "https://www.linkedin.com/in/cristian--mercado/",
    img: "/speakers/cristian.png",
  },
  {
    name: "Martín",
    lastname: "Lovera",
    role: "Gerente de Auditorías",
    company: "Sala Hnos.",
    companyLogo: "/salahnos.png",
    linkedin: "",
    img: "/speakers/martin-lovera.jpg",
  },

  // PANEL 1 — Intercity
  {
    name: "Ivan",
    lastname: "Pecovich",
    role: "Socio Gerente",
    company: "Intercity Comunicaciones S.A.",
    companyLogo: "/intercity.png",
    linkedin: "",
    img: "/speakers/ivan-pecovich.jpg",
  },
  {
    name: "Eduardo",
    lastname: "Ochoa",
    role: "Director del Centro de Cómputos",
    company: "Municipalidad de Río Cuarto",
    companyLogo: "/universidad.png",
    linkedin: "",
    img: "/speakers/eduardo.png",
  },
  {
    name: "Pablo",
    lastname: "Degiglio",
    role: "Técnico Centro de Cómputos",
    company: "Municipalidad de Río Cuarto",
    companyLogo: "/universidad.png",
    linkedin: "",
    img: "/speakers/pablo-degiglio.jpg",
  },

  // PANEL 2
  {
    name: "Luciano",
    lastname: "Gabutti",
    role: "Lider de Operaciones y Proyectos",
    company: "Wayclo",
    companyLogo: "/logo-wayclo.png",
    linkedin: "https://www.linkedin.com/in/lucianogabutti",
    img: "/speakers/martin.png",
  },
  {
    name: "Juan",
    lastname: "Ochoa",
    role: "Coordinador de Plataforma Backup",
    company: "Aceitera General Deheza",
    companyLogo: "/logo-wayclo.png",
    linkedin: "",
    img: "/speakers/martin.png",
  },
  {
    name: "Gustavo",
    lastname: "Matuk",
    role: "Cybersecurity Advisor",
    company: "Wayclo",
    companyLogo: "/logo-wayclo.png",
    linkedin: "https://www.linkedin.com/in/gustavo-matuk-66b96613/",
    img: "/speakers/martin.png",
  },
  {
    name: "Emmanuel",
    lastname: "Villas",
    role: "Cybercrime Researcher - Director de carrera",
    company: "Universidad Siglo 21",
    companyLogo: "/universidadd.png",
    linkedin: "https://www.linkedin.com/in/emmanuelvilas/",
    img: "/speakers/emmanuel-villas.jpg",
  },
];

/** 🔹 CARD INDIVIDUAL – MISMO DISEÑO QUE VENÍAS HACIENDO */
export function SpeakerCard({ speaker, index }) {
  const { name, lastname, img } = speaker;

  const isOdd = index % 2 !== 0;

  const gradientClass = isOdd
    ? "bg-gradient-to-r from-[#021728] to-cyan-600"
    : "bg-gradient-to-r from-cyan-600 to-[#021728]";

  const alignmentClass = isOdd ? "ml-auto" : "";

  return (
    <div
      className={`
        relative
        w-full                  /* mobile */
        h-[26vh]                /* mobile base height */
        sm:w-[45vh] sm:h-[24vh] /* pantallas medianas */
        lg:w-[55vh] lg:h-[28vh] /* pantallas grandes */
        xl:w-[65vh] xl:h-[32vh] /* pantallas muy grandes */
        flex
        rounded-2xl
        text-white
        overflow-hidden
        ${gradientClass}
        ${alignmentClass}
      `}
    >
      {/* Texto abajo izquierda */}
      <div className="absolute bottom-10 left-5 flex flex-col gap-1 z-10">
        <p className="text-lg sm:text-xl lg:text-2xl font-semibold leading-tight">
          {name}
        </p>
        <p className="text-lg sm:text-xl lg:text-2xl font-semibold leading-tight">
          {lastname}
        </p>
        <p className="text-sm sm:text-base lg:text-lg opacity-90">
          Cyber Cloud
        </p>
      </div>

      {/* Imagen pegada abajo derecha */}
      <div className="absolute bottom-0 right-0 h-full w-[50%]">
        <Image
          src={img}
          alt={name}
          fill
          className="object-cover object-bottom"
        />
      </div>
    </div>
  );
}


export function SpeakerInfoRow({ speaker, index }) {
  const isOdd = index % 2 !== 0;

  return (
    <div
      className={`
        w-full py-10
        flex flex-col md:flex-row gap-6
        items-start md:items-end
        ${isOdd ? "md:flex-row-reverse" : ""}
      `}
    >
      {/* Card azul: prioridad de espacio (no se achica) */}
      <div className="w-full md:w-auto shrink-0">
        <SpeakerCard speaker={speaker} index={index} />
      </div>

      {/* Contenedor lateral de la caja de info */}
      <div
        className={`
          w-full 
          md:flex-1 min-w-0
          flex
          ${isOdd ? "md:justify-start" : "md:justify-end"}
        `}
      >
        {/* Caja blanca de info */}
        <div className="flex flex-col bg-white rounded-xl w-full max-w-md p-6">
          {/* Logo arriba (si existe) */}
          {speaker.companyLogo && (
            <Image
              src={speaker.companyLogo}
              alt={speaker.company}
              width={80}
              height={40}
              className="object-contain mb-4 drop-shadow-sm"
              style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" }}
            />
          )}

          {/* Contenido pegado ABAJO, alineado a la izquierda */}
          <div className="mt-auto flex flex-col text-left">
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {speaker.name} {speaker.lastname}
            </h3>

            <p className="text-gray-600 mt-1 text-sm">
              {speaker.role} – {speaker.company}
            </p>

            {speaker.linkedin && (
              <a
                href={speaker.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-cyan-700 hover:underline"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


/** 🔹 LISTA DE SPEAKERS – SOLO LOS RENDERIZA, SIN CAMBIAR DISEÑO */
export default function SpeakersSection() {
  return (
    <div className="flex flex-col ">
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center text-slate-900">
        Voces que impulsan el cambio
      </h2>
      <p className="text-base md:text-lg text-slate-700 text-center mt-2">
        Profesionales que comparten su mirada para potenciar el presente y futuro de las PYMES.
      </p>
      {speakers.map((sp, i) => (
        <SpeakerInfoRow key={i} speaker={sp} index={i} />
      ))}
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
    </div>
  );
}
