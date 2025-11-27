"use client";

import { useState } from "react";
import Image from "next/image";
import { Linkedin } from "lucide-react";

import Agenda from "@/components/Agenda";
import Sponsor from "@/components/Sponsor";
import useScrollReveal from "@/hooks/useScrollReveal";

export default function AgendaPage() {
  const [agendaRef, agendaShow] = useScrollReveal();
  const [sponsorRef, sponsorShow] = useScrollReveal();

  // 🔹 Estado global del modal de speaker
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);

  return (
    <>
      <main className="mx-auto max-w-5xl px-6 py-16 text-black relative">
        <section id="agenda" className="scroll-mt-24" ref={agendaRef}>
          <div className={`reveal ${agendaShow ? "show" : ""}`}>
            {/* Le pasamos el callback al componente Agenda */}
            <Agenda onSelectSpeaker={setSelectedSpeaker} />
          </div>
        </section>

        <div
          ref={sponsorRef}
          className={`reveal ${sponsorShow ? "show" : ""} mt-16`}
        >
          <Sponsor />
        </div>
      </main>

      {/* 🔹 MODAL GLOBAL – COBRE TODA LA PANTALLA DE AGENDA */}
      {selectedSpeaker && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/70 backdrop-blur-sm
            p-4
            animate-fadeIn
          "
        >
          {/* Cerrar */}
          <button
            onClick={() => setSelectedSpeaker(null)}
            className="
              absolute top-6 right-6
              text-white text-4xl font-light
              hover:opacity-80 transition
            "
          >
            ×
          </button>

          {/* Contenedor que NUNCA sale del viewport */}
          <div
            className="
              w-full
              max-w-xl sm:max-w-2xl lg:max-w-3xl
              max-h-[90vh]
              overflow-y-auto
              animate-scaleIn
              px-10 md:px-0
            "
          >
            <SpeakerModalCard speaker={selectedSpeaker} />
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
   🔹 CARD DEL MODAL – adapta diseño de SpeakerCard
   ============================================================ */

function SpeakerModalCard({ speaker }) {
  if (!speaker) return null;

  const {
    name,
    lastname,
    img,
    role,
    company,
    linkedin,
    companyLogo,
    companyLogoWidth,
  } = speaker;

  // 🚨 ATENCIÓN: La clave para la réplica exacta es el 'p-6' condicional y el 'gap-6'.
  return (
    <div
      className="
        w-full md:h-[350px]
        bg-gradient-to-r from-[#021728] to-cyan-600
        text-white
        rounded-2xl
        overflow-hidden
        
        /* LAYOUT BASE */
        flex flex-col items-center md:flex-row md:items-stretch
        
        /* --- CLASES DE ESPACIADO IDÉNTICAS A SPEAKER CARD EN MÓVIL --- */
        p-6             /* Aplica padding a toda la tarjeta en móvil */
        md:p-0          /* Lo elimina en desktop para que la imagen quede full-bleed */
        gap-6           /* Separación vertical entre imagen y texto en móvil */
        md:gap-0        /* Sin gap extra en desktop */
      "
    >
      {/* IMAGEN */}
      <div
        className="
          relative
          overflow-hidden
          flex-shrink-0
          
          /* --- MÓVIL (Copia Fiel) --- */
          w-full               /* Ocupa el ancho completo del padding (p-6) */
          aspect-square        /* Fuerza el cuadrado perfecto */
          rounded-full         /* Círculo completo */
          flex items-end justify-center 
          
          /* --- DESKTOP (Tu diseño original) --- */
          md:w-2/5             /* Ancho de columna lateral */
          md:h-auto            
          md:aspect-auto       /* Quita la proporción cuadrada */
          md:rounded-none      /* Quita el borde circular */
          md:items-center      
        "
      >
        <Image
          src={img}
          alt={name}
          fill
          className="
            /* MÓVIL: Cover y Top (como SpeakerCard) */
            object-cover 
            object-top 
            
            /* DESKTOP: Contain y Bottom (como tu diseño original) */
            md:object-contain 
            md:object-bottom
          "
        />
      </div>

      {/* INFORMACIÓN */}
      <div
        className="
          flex flex-col justify-center
          w-full
          
          /* --- AJUSTE DE PADDING --- */
          /* MÓVIL: p-0 porque el padding ya lo tiene el div padre (p-6) */
          
          /* DESKTOP: Agregamos el padding que necesita el texto en desktop */
          md:p-8 
          
          text-center md:text-left
        "
      >
        {companyLogo && (
          <div className="flex justify-center md:justify-start">
            <Image
              src={companyLogo}
              alt={company}
              width={companyLogoWidth || 120}
              height={120}
              className="object-contain mb-4 drop-shadow-lg"
            />
          </div>
        )}

        <h3 className="text-2xl sm:text-3xl font-semibold leading-tight">
          {name} {lastname}
        </h3>

        {role && (
          <p className="text-sm sm:text-base opacity-90 mt-2">{role}</p>
        )}

        {company && (
          <p className="text-sm sm:text-base opacity-80">{company}</p>
        )}

        {linkedin && (
          <div className="flex justify-center md:justify-start">
            <a
              href={linkedin}
              target="_blank"
              rel="noreferrer"
              className="
                mt-4 inline-flex items-center gap-2
                text-sm sm:text-base
                text-white/90 hover:text-white
              "
            >
              <Linkedin className="w-5 h-5" />
              Ver en LinkedIn
            </a>
          </div>
        )}
      </div>
    </div>
  );
}