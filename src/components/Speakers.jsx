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
    companyLogo: "",
    linkedin: "",
    img: "/speakers/martin-lovera.jpg",
  },

  // PANEL 1 — Intercity
  {
    name: "Pablo",
    lastname: "Degiglio",
    role: "Técnico Centro de Cómputos",
    company: "Municipalidad de Río Cuarto",
    companyLogo: "/universidad.png",
    linkedin: "",
    img: "/speakers/pablo-degiglio.jpg",
  },
  {
    name: "Eduardo",
    lastname: "Ochoa",
    role: "Director del Centro de Cómputos",
    company: "Municipalidad de Río Cuarto",
    companyLogo: "/universidad.png",
    linkedin: "",
    img: "/speakers/eduardo-ochoa.jpg",
  },
  {
    name: "Ivan",
    lastname: "Pecovich",
    role: "Socio Gerente",
    company: "Intercity Comunicaciones S.A.",
    companyLogo: "/intercity.png",
    linkedin: "",
    img: "/speakers/ivan-pecovich.jpg",
  },

  // PANEL 2
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
    ? "bg-gradient-to-r from-[#021728] to-[#006AAE]"
    : "bg-gradient-to-r from-[#006AAE] to-[#021728]";

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
        px-5 sm:px-7 lg:px-8
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

  const InfoBox = (
    <div className="flex flex-col justify-center bg-white rounded-xl w-full max-w-md">
      <Image
        src={speaker.companyLogo}
        alt={speaker.company}
        width={80}
        height={40}
        className="object-contain mb-4"
      />
      <h3 className="text-xl font-bold text-gray-900 leading-tight">
        {speaker.name} {speaker.lastname}
      </h3>

      <p className="text-gray-600 mt-1 text-sm">{speaker.role} {speaker.company}</p>

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
  );

  return (
    <div
      className={`
        w-full flex flex-col lg:flex-row items-center gap-6
        ${isOdd ? "lg:flex-row-reverse" : ""}
      `}
    >
      {/* Card original */}
      <div className="w-full lg:w-auto">
        <SpeakerCard speaker={speaker} index={index} />
      </div>

      {/* Caja de información */}
      {InfoBox}
    </div>
  );
}

/** 🔹 LISTA DE SPEAKERS – SOLO LOS RENDERIZA, SIN CAMBIAR DISEÑO */
export default function SpeakersSection() {
  return (
    <div className="flex flex-col gap-12">
      {speakers.map((sp, i) => (
        <SpeakerInfoRow key={i} speaker={sp} index={i} />
      ))}
    </div>
  );
}
