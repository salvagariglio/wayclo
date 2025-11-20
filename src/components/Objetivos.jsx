"use client";
import Image from "next/image";

export const speakers = [
    {
        name: "Networking",
        lastname: "Empresarial",
        role: "Un espacio para conocerse, compartir experiencias y construir nuevas oportunidades junto a referentes y empresas de la región.",
        img: "/networking1.png",
    },
    {
        name: "Cóctel de Cierre",
        lastname: "",
        role: "Un espacio distendido para picotear, seguir conectando y fortalecer vínculos entre empresas y referentes locales.",
        img: "/networking2.png",
    },
];


// ------------------------------------------------------
// CARD AZUL (NO CAMBIAMOS TU DISEÑO)
// ------------------------------------------------------

export function SpeakerCard({ speaker, index }) {
    const { name, lastname, img } = speaker;

    const isOdd = index % 2 !== 0;
    const isSecond = index === 1;

    const gradientClass = isOdd
        ? "bg-gradient-to-r from-[#021728] to-[#006AAE]"
        : "bg-gradient-to-r from-[#006AAE] to-[#021728]";

    const alignmentClass = isOdd ? "ml-auto" : "";

    const imageWrapperClass = isSecond
        ? "absolute bottom-0 right-0 h-full w-[50%] flex items-end justify-center"
        : "absolute right-0 h-full w-[60%] flex items-center justify-center";

    const imageClass = isSecond
        ? "object-contain object-bottom"
        : "object-contain object-center scale-110";

    return (
        <div
            className={`
                relative
                w-full
                h-[26vh]
                sm:w-[45vh] sm:h-[24vh]
                lg:w-[55vh] lg:h-[28vh]
                xl:w-[65vh] xl:h-[32vh]
                flex
                rounded-2xl
                px-5 sm:px-7 lg:px-8
                text-white
                overflow-hidden
                ${gradientClass}
                ${alignmentClass}
            `}
        >
            {/* TEXTO */}
            <div className="absolute bottom-10 left-5 flex flex-col gap-1 z-10">
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold leading-tight">
                    {name}
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold leading-tight">
                    {lastname}
                </p>
                <p className="text-sm sm:text-base lg:text-lg opacity-90">
                    CyberCloud
                </p>
            </div>

            {/* IMAGEN */}
            <div className={imageWrapperClass}>
                <Image src={img} alt={name} fill className={imageClass} />
            </div>
        </div>
    );
}


// ------------------------------------------------------
// FILA COMPLETA (FIX DE ALINEACIÓN PERFECTA CON LA CARD)
// ------------------------------------------------------

export function SpeakerInfoRow({ speaker, index }) {
    const isOdd = index % 2 !== 0;

    return (
        <div
            className={`
                w-full 
                flex flex-col md:flex-row gap-6
                ${isOdd ? "md:flex-row-reverse" : ""}
            `}
        >
            {/* CARD AZUL */}
            <div className="w-full md:w-auto shrink-0">
                <SpeakerCard speaker={speaker} index={index} />
            </div>

            {/* TEXTO — MISMO ANCHO QUE LA CARD SI ES IMPAR */}
            <div
                className={`
        w-full 
        md:flex-1 min-w-0 
        flex flex-col justify-end 
        ${isOdd ? "items-end" : "items-start"}   /* 🔥 siempre se alinea con la card */
    `}
            >
                <div className="bg-white rounded-xl w-full max-w-md pb-4 px-2">
                    <h3 className="
    text-base 
    sm:text-md 
    md:text-lg 
    lg:text-xl 
    text-gray-600 
    leading-snug 
    sm:leading-normal 
    md:leading-relaxed
">
                        {speaker.role}
                    </h3>

                </div>
            </div>

        </div>
    );
}


// ------------------------------------------------------
// LISTA COMPLETA
// ------------------------------------------------------

export default function SpeakersSection() {
    return (
        <div className="flex flex-col gap-12">
            {speakers.map((sp, i) => (
                <SpeakerInfoRow key={i} speaker={sp} index={i} />
            ))}
        </div>
    );
}
