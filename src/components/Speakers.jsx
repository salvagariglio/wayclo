"use client";
import Image from "next/image";
import { Linkedin } from "lucide-react";
import useScrollReveal from "@/hooks/useScrollReveal";

export const speakers = [
  // PANEL 1 — Wayclo
  {
    name: "Cristian",
    lastname: "Mercado",
    role: "Director",
    company: "Wayclo",
    companyLogo: "/logo-wayclo-speakers.png",
    companyLogoWidth: 130,
    linkedin: "https://www.linkedin.com/in/cristian--mercado/",
    img: "/speakers/cristian.png",
  },
  {
    name: "Martín",
    lastname: "Lovera",
    role: "Gerente de Auditorías",
    company: "Sala Hnos.",
    companyLogo: "/salahnos.PNG",
    companyLogoWidth: 80,
    linkedin: "",
    img: "/speakers/silueta.png",
  },

  // PANEL 1 — Intercity
  {
    name: "Ivan",
    lastname: "Pecovich",
    role: "Socio Gerente",
    company: "Intercity Comunicaciones S.A.",
    companyLogo: "/intercity.png",
    companyLogoWidth: 120,
    linkedin: "",
    img: "/speakers/ivan.png",
  },
  {
    name: "Eduardo",
    lastname: "Ochoa",
    role: "Director del Centro de Cómputos",
    company: "Municipalidad de Río Cuarto",
    companyLogo: "/municipalidad.png",
    companyLogoWidth: 130,
    linkedin: "",
    img: "/speakers/eduardo2.png",
  },
  {
    name: "Pablo",
    lastname: "Degiglio",
    role: "Técnico Centro de Cómputos",
    company: "Municipalidad de Río Cuarto",
    companyLogo: "/municipalidad.png",
    companyLogoWidth: 130,
    linkedin: "",
    img: "/speakers/pablo.png",
  },

  // PANEL 2
  {
    name: "Luciano",
    lastname: "Gabutti",
    role: "Lider de Operaciones y Proyectos",
    company: "Wayclo",
    companyLogo: "/logo-wayclo-speakers.png",
    companyLogoWidth: 130,
    linkedin: "https://www.linkedin.com/in/lucianogabutti",
    img: "/speakers/luciano.png",
  },
  {
    name: "Juan",
    lastname: "Ochoa",
    role: "Coordinador de Plataforma Backup",
    company: "Aceitera General Deheza",
    companyLogo: "/agd.png",
    companyLogoWidth: 110,
    linkedin: "",
    img: "/speakers/juan.png",
  },
  {
    name: "Gustavo",
    lastname: "Díaz",
    role: "IT de Grassi",
    company: "",
    companyLogo: "/grassi.png",
    companyLogoWidth: 110,
    linkedin: "",
    img: "/speakers/gustavoD.png",
  },
  {
    name: "Gustavo",
    lastname: "Matuk",
    role: "Cybersecurity Advisor",
    company: "Wayclo",
    companyLogo: "/logo-wayclo-speakers.png",
    companyLogoWidth: 130,
    linkedin: "https://www.linkedin.com/in/gustavo-matuk-66b96613/",
    img: "/speakers/martin.png",
  },
  {
    name: "Emmanuel",
    lastname: "Vilas",
    role: "Director de carrera - Lic. en Seguridad Informática",
    company: "Universidad Siglo 21",
    companyLogo: "/universidadd.PNG",
    companyLogoWidth: 100,
    linkedin: "https://www.linkedin.com/in/emmanuelvilas/",
    img: "/speakers/emmanuel.png",
  },
];

/* ============================================================
   🔹 TARJETA DE SPEAKER
   ============================================================ */

export function SpeakerCard({ speaker, index }) {
  const isOdd = index % 2 !== 0;
  const isSilhouette = speaker.img.includes("silueta");

  // 👇 NUEVO
  const [ref, show] = useScrollReveal();

  const gradientClass = isOdd
    ? "bg-gradient-to-r from-[#021728] to-cyan-600"
    : "bg-gradient-to-r from-cyan-600 to-[#021728]";

  const alignClass = isOdd ? "ml-auto" : "mr-auto";

  return (
    <div
      ref={ref}
      className={`
        reveal ${show ? "show" : ""}
        w-full
        max-w-2xl
        ${alignClass}
        rounded-2xl
        text-white
        overflow-hidden
        ${gradientClass}
        pt-6 px-6
        flex flex-col
        gap-6
      `}
    >

      <div
        className={`
          flex flex-col md:flex-row 
          items-center md:items-stretch
          gap-6
          ${isOdd ? "md:flex-row-reverse" : ""}
        `}
      >
        {/* IMAGEN — circular en mobile, rectangular en desktop */}
        <div
          className="
    w-full md:w-1/2
    relative

    /* MOBILE → CÍRCULO COMPLETO */
    aspect-square md:aspect-auto
    rounded-full md:rounded-xl

    overflow-hidden
    flex items-end md:items-center justify-center

    md:h-[260px]      /* altura fija en desktop para uniformidad */
  "
        >
          <Image
            src={speaker.img}
            alt={speaker.name}
            fill
            className={`
    ${isSilhouette ? "opacity-50" : ""}
    object-cover md:object-contain
    object-top md:object-bottom
  `}
          />

        </div>



        {/* TEXTO + LOGO */}
        <div className="w-full md:w-[40%] flex flex-col justify-end pb-6">
          {speaker.companyLogo && (
            <Image
              src={speaker.companyLogo}
              alt={speaker.company}
              width={speaker.companyLogoWidth || 100}  // 👈 ancho dinámico
              height={120}
              className="object-contain mb-4 drop-shadow-lg"
            />
          )}

          <div className="flex flex-col">
            <p className="text-xl font-semibold leading-tight">
              {speaker.name} {speaker.lastname}
            </p>

            <p className="text-sm md:text-base opacity-90 mt-1">
              {speaker.role}
            </p>

            {speaker.linkedin && (
              <a
                href={speaker.linkedin}
                target="_blank"
                className="mt-3 inline-flex items-center gap-2 text-white/90 hover:text-white transition"
              >
                <Linkedin className="w-5 h-5" />
                Ver LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   🔹 LISTA COMPLETA DE SPEAKERS
   ============================================================ */

export default function SpeakersSection() {
  return (
    <div className="flex flex-col">
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center text-slate-900">
        Voces que impulsan el cambio
      </h2>

      <p className="text-base md:text-lg text-slate-700 text-center mt-2">
        Profesionales que comparten su mirada para potenciar el presente y futuro de las PYMES.
      </p>

      <div className="mt-10 w-full max-w-7xl mx-auto flex flex-col gap-10">
        {speakers.map((sp, i) => (
          <SpeakerCard key={i} speaker={sp} index={i} />
        ))}
      </div>

      <div className="flex justify-center mt-20">
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
