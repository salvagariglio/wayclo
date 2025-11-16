"use client";
import Image from "next/image";

export const speakers = [
    {
        name: "Networking",
        lastname: "Empresarial",
        role: "Donde las conversaciones se transforman en alianzas y las conexiones en oportunidades reales para crecer juntos.",
        img: "/networking1.png",
    },
    {
        name: "Networking &",
        lastname: "Alianzas Estratégicas",
        role: "Un espacio para conocerse, compartir experiencias y construir nuevas oportunidades junto a referentes y empresas de la región.",
        img: "/networking2.png",
    },
];

export function SpeakerCard({ speaker, index }) {
    const { name, lastname, img } = speaker;

    const isOdd = index % 2 !== 0;
    const isSecond = index === 1;

    const gradientClass = isOdd
        ? "bg-gradient-to-r from-[#021728] to-[#006AAE]"
        : "bg-gradient-to-r from-[#006AAE] to-[#021728]";

    const alignmentClass = isOdd ? "ml-auto" : "";

    // ⚠️ La clave está acá
    const imageWrapperClass = isSecond
        ? "absolute bottom-0 right-0 h-full w-[50%] flex items-end justify-center" // SIEMPRE pega abajo
        : "absolute right-0 h-full w-[60%] flex items-center justify-center";      // centrada

    const imageClass = isSecond
        ? "object-contain object-bottom" // pega SIEMPRE al borde inferior
        : "object-contain object-center scale-110"; // más grande y centrada

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
                <Image
                    src={img}
                    alt={name}
                    fill
                    className={imageClass}
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
        w-full 
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
                <div className="flex flex-col bg-white rounded-xl w-full max-w-md pb-4 px-2">
                    <div className="mt-auto flex flex-col text-left">
                        <h3 className="text-lg  text-gray-600 leading-tight">
                            {speaker.role}
                        </h3>
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
