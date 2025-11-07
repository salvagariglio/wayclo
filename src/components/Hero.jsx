// components/Hero.jsx
"use client"
import Image from "next/image";
import { DialogTrigger } from "@/components/ui/dialog";

// IMÁGENES (asegurate de tener estos nombres en /public)
import WaycloLogo from "../../public/logo-wayclo.png";
import IntercityLogo from "../../public/intercity.png";
import ShieldCheck from "../../public/shield-check.png";
import LaptopShield from "../../public/laptop-shield.png";


export default function Hero() {
  return (
    <section
      className="
        relative
        mx-auto max-w-6xl
        px-4 sm:px-6 lg:px-8
        pt-16 md:pt-20
        pb-40 md:pb-52
        text-center
      "
    >
      {/* TITULAR */}
      <h1
        className="
          text-black                      /* ✅ Título negro */
          font-extrabold leading-tight tracking-[-0.02em]
          text-4xl sm:text-5xl md:text-6xl lg:text-[64px]
        "
      >
        La nueva era de
        <br/>
        la ciberseguridad
        <br/>
        empresarial
      </h1>

      {/* FECHA */}
      <p
        className="
          text-black                      /* ✅ Fecha negra */
          mt-6 md:mt-10
          text-md sm:text-base md:text-2xl
          uppercase tracking-[0.2em]
        "
      >
        15 de diciembre 2025
      </p>

      {/* DESCRIPCIÓN */}
      <p
        className="
          mx-auto mt-4 md:mt-5
          max-w-lg
          text-[#333]                    /* ✅ Gris oscuro como en la captura */
          text-sm sm:text-base md:text-lg
        "
      >
        El evento donde líderes y creativos se reúnen
        para construir el futuro de la innovación digital.
      </p>

      {/* CTA */}
      <div className="mt-8 md:mt-10 flex justify-center" id="registro">
        <button
          type="button"
          onClick={() => document.dispatchEvent(new Event("open-register"))}
          className="inline-flex items-center justify-center rounded-full px-6 md:px-8 h-11 md:h-12 text-sm md:text-base font-semibold text-[#050057] border-2 border-[#050057] bg-transparent hover:bg-[#050057] hover:text-white transition-colors shadow-[0_2px_0_0_#050057] md:shadow-[0_3px_0_0_#050057]"
        >
          REGÍSTRATE AHORA
        </button>
      </div>


      {/* ======= IMÁGENES DECORATIVAS ======= */}
      {/* Escudo con check (izquierda) */}
<Image
  src={ShieldCheck}
  alt="Escudo con check"
  priority
  className="
    /* ✅ visible en mobile */
    block
    absolute

    /* ✅ posición y tamaño base (mobile first) */
    left-4 top-40 w-16

    /* ✅ overrides por breakpoint */
    sm:left-5  sm:top-40  sm:w-28
    md:left-[10px] md:top-48 md:w-40
    lg:left-[80px] lg:top-60 lg:w-48
    xl:left-[80px] xl:w-56

    drop-shadow-[0_8px_24px_rgba(0,0,0,0.20)]
    select-none pointer-events-none
    z-[1]
  "
/>

{/* Laptop con escudo (derecha) */}
<Image
  src={LaptopShield}
  alt="Laptop con escudo"
  priority
  className="
    /* ✅ visible en mobile */
    block
    absolute

    /* ✅ posición y tamaño base (mobile first) */
    right-1 top-[20rem] w-[120px]

    /* ✅ overrides por breakpoint */
    sm:right-[30px] sm:top-80   sm:w-[220px]
    md:right-[20px] md:top-96   md:w-[300px]
    lg:right-[40px] lg:top-[22rem] lg:w-[350px]
    xl:right-[10px] xl:top-96   xl:w-[400px]

    drop-shadow-[0_16px_40px_rgba(0,0,0,0.25)]
    select-none pointer-events-none
    z-[1]
  "
/>


      {/* Logos inferiores (Wayclo + Intercity) */}
      <div
        className="
          hidden sm:flex items-center gap-6
          absolute left-4 md:left-8 bottom-6
          z-[1]
        "
      >
        <Image
          src={WaycloLogo}
          alt="Wayclo"
          className="h-8 w-auto opacity-90"
          priority
        />
        <Image
          src={IntercityLogo}
          alt="Intercity"
          className="h-9 w-auto opacity-90"
          priority
        />
      </div>

      {/* NOTA:
         - z-index de imágenes = 1 para quedar sobre el contenido del hero,
           pero por debajo de la navbar (que debe tener z superior, ej. z-[9999]).
         - Se ocultan en mobile para priorizar legibilidad; si querés verlas también en mobile,
           quitá los 'hidden sm:block' y ajustamos tamaños.
      */}
    </section>
  );
}