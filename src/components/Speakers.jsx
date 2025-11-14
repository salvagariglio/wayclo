"use client";
import Image from "next/image";
import { Linkedin } from "lucide-react";

const speakers = [
  // PANEL 1 — Wayclo
  {
    name: "Cristian",
    lastname: "Mercado",
    role: "Director",
    company: "Wayclo",
    linkedin: "https://www.linkedin.com/in/cristian--mercado/",
    img: "/speakers/cristian.png",
  },
  {
    name: "Martín",
    lastname: "Lovera",
    role: "Gerente de Auditorías",
    company: "Sala Hnos.",
    linkedin: "",
    img: "/speakers/martin-lovera.jpg",
  },

  // PANEL 1 — Intercity
  {
    name: "Pablo",
    lastname: "Degiglio",
    role: "Técnico Ctro. de Cómputos Municipalidad Río Cuarto",
    company: "Municipalidad de Río Cuarto",
    linkedin: "",
    img: "/speakers/pablo-degiglio.jpg",
  },
  {
    name: "Eduardo",
    lastname: "Ochoa",
    role: "Director del centro de Cómputos de la Municipalidad de Río Cuarto",
    company: "Municipalidad de Río Cuarto",
    linkedin: "",
    img: "/speakers/eduardo-ochoa.jpg", // ajustá al archivo real
  },
  {
    name: "Ivan",
    lastname: "Pecovich",
    role: "Socio Gerente",
    company: "Intercity Comunicaciones S.A.",
    linkedin: "",
    img: "/speakers/ivan-pecovich.jpg", // ajustá al archivo real
  },

  // PANEL 2
  {
    name: "Gustavo",
    lastname: "Matuk",
    role: "Cybersecurity Advisor",
    company: "Wayclo",
    linkedin: "https://www.linkedin.com/in/gustavo-matuk-66b96613/",
    img: "/speakers/martin.png",
  },
  {
    name: "Emmanuel",
    lastname: "Villas",
    role: "Cybercrime Researcher - Director de carrera",
    company: "Universidad Siglo 21",
    linkedin: "https://www.linkedin.com/in/emmanuelvilas/",
    img: "/speakers/emmanuel-villas.jpg", // ajustá al archivo real
  },
];


/** 🔹 CARD INDIVIDUAL – MISMO DISEÑO QUE VENÍAS HACIENDO */
function SpeakerCard({ speaker, index }) {
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



/** 🔹 LISTA DE SPEAKERS – SOLO LOS RENDERIZA, SIN CAMBIAR DISEÑO */
export default function SpeakersSection() {
  return (
    <div className="flex flex-col gap-6">
      {speakers.map((speaker, index) => (
        <SpeakerCard key={speaker.name} speaker={speaker} index={index} />
      ))}
    </div>
  );
}
