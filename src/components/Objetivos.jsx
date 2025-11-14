"use client";
import Image from "next/image";
import { Linkedin } from "lucide-react";

export const speakers = [
    // PANEL 1 — Wayclo
    {
        name: "Networking",
        lastname: "Empresarial",
        role: "Donde las conversaciones se transforman en alianzas y las conexiones en oportunidades reales para crecer CyberCloud juntos.",
        img: "/speakers/cristian.png",
    },
    {
        name: "Networking",
        lastname: "Alianzas Estratégicas",
        role: "Un espacio para conocerse, compartir experiencias y construir nuevas oportunidades junto a referentes y empresas de la región. ",
        img: "/speakers/cristian.png",
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

    return (
        <div
            className={`
        w-full flex flex-col lg:flex-row gap-6
        items-start lg:items-end
        ${isOdd ? "lg:flex-row-reverse" : ""}
      `}
        >
            {/* Card azul original */}
            <div className="w-full lg:w-auto">
                <SpeakerCard speaker={speaker} index={index} />
            </div>

            {/* Contenedor lateral de la caja de info */}
            <div
                className={`w-full lg:w-[40%] flex ${isOdd ? "lg:justify-start" : "lg:justify-end"
                    }`}
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
        <div className="flex flex-col gap-12">
            {speakers.map((sp, i) => (
                <SpeakerInfoRow key={i} speaker={sp} index={i} />
            ))}
        </div>
    );
}
