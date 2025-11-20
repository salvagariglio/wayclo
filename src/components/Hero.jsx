"use client";
import Image from "next/image";
import ShieldCheck from "../../public/shield-check.png";
import LaptopShield from "../../public/laptop-shield.png";
import CyberCloudLogoSlogan from "../../public/logo-slogan.png";

export default function Hero() {
  return (
    <section
      className="
        relative
        mx-auto max-w-6xl
        px-4 sm:px-6 lg:px-8
        pb-32
        pt-8 md:pt-14
        text-center
      "
    >
      <div className=" flex justify-center">
        <Image
          src={CyberCloudLogoSlogan}
          alt="CyberCloud"
          className="h-12 sm:h-16 md:h-40 w-auto opacity-95"
          priority
        />
      </div>
      {/* FECHA */}
      <p
        className="
          text-black                      /* ✅ Fecha negra */
          mt-6 md:mt-10
          text-lg  md:text-2xl
          uppercase tracking-[0.2em]
        "
      >
        15 de diciembre 2025
      </p>

      {/* DESCRIPCIÓN */}
      <p
        className="
          mx-auto mt-4 md:mt-5
          max-w-xl
          text-[#333]                    /* ✅ Gris oscuro como en la captura */
          text-lg md:text-xl
        "
      >
        El evento donde líderes y creativos se reúnen para construir el futuro
        de la innovación digital.
      </p>

      {/* CTA */}
      <div className="mt-8 md:mt-10 flex justify-center" id="registro">
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
          left-4 top-32 w-20

          /* ✅ overrides por breakpoint */
          sm:left-0  sm:top-18  sm:w-32
          md:left-[60px] md:top-40 md:w-40
          lg:left-[20px] lg:top-44 lg:w-48
          xl:left-[30px] xl:w-48

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
          right-1 top-[26rem] w-[130px]
          /* ✅ overrides por breakpoint */
          sm:right-[30px] sm:top-80   sm:w-[220px]
          md:top-96   md:w-[280px]
          lg:right-[40px] lg:top-96 lg:w-[350px]
          xl:right-[-20px] xl:top-80   xl:w-[340px]

          drop-shadow-[0_16px_40px_rgba(0,0,0,0.25)]
          select-none pointer-events-none
          z-[1]
        "
      />

      {/* NOTA:
         - z-index de imágenes = 1 para quedar sobre el contenido del hero,
           pero por debajo de la navbar (que debe tener z superior, ej. z-[9999]).
         - Se ocultan en mobile para priorizar legibilidad; si querés verlas también en mobile,
           quitá los 'hidden sm:block' y ajustamos tamaños.
      */}
    </section>
  );
}
