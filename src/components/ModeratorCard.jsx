"use client";
import Image from "next/image";
import { Linkedin } from "lucide-react";
import useScrollReveal from "@/hooks/useScrollReveal";

export default function ModeratorCard() {
    const [ref, show] = useScrollReveal();

    const moderator = {
        name: "Paula",
        lastname: "Stecco",
        role: "Periodista, Conductora",
        linkedin: "https://www.linkedin.com/in/mar%C3%ADa-paula-stecco-826bb61b9/",
        img: "/speakers/paula.png", // 👉 poné la imagen real
    };

    return (
        <div className="w-full flex flex-col items-center mt-20">

            {/* ⭐ SUBTÍTULO FUERA DE LA CARD */}
            <h3 className="text-center text-cyan-700 text-xl md:text-2xl font-bold tracking-wide mb-6">
                MODERA
            </h3>

            {/* CARD */}
            <div
                ref={ref}
                className={`
          reveal ${show ? "show" : ""}
          w-full
          max-w-2xl
          mx-auto
          rounded-2xl
          text-white
          overflow-hidden
          bg-gradient-to-r from-[#021728] to-cyan-600
          pt-6 px-6
          flex flex-col
          gap-6
        `}
            >

                <div className="flex flex-col md:flex-row items-center gap-6">

                    {/* IMAGEN */}
                    <div
                        className="
              w-full md:w-1/2
              relative
              aspect-square md:aspect-auto
              rounded-full md:rounded-xl
              overflow-hidden
              flex items-end md:items-center justify-center
              md:h-[260px]
            "
                    >
                        <Image
                            src={moderator.img}
                            alt={moderator.name}
                            fill
                            className="object-cover md:object-contain object-top md:object-bottom"
                        />
                    </div>

                    {/* TEXTO */}
                    <div className="w-full md:w-[40%] flex flex-col justify-end pb-6 text-center md:text-left">

                        <p className="text-2xl font-semibold leading-tight">
                            {moderator.name} {moderator.lastname}
                        </p>

                        <p className="text-sm md:text-base opacity-90 mt-1">
                            {moderator.role}
                        </p>

                        {moderator.linkedin && (
                            <a
                                href={moderator.linkedin}
                                target="_blank"
                                className="mt-3 inline-flex items-center justify-center md:justify-start gap-2 text-white/90 hover:text-white transition"
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
