"use client";

import Image from "next/image";
import WaycloLogo from "../../public/logo-wayclo.png";
import IntercityLogo from "../../public/intercity.png";

export default function EmpresasYCybercloud() {
  return (
    <section className="w-full px-6 md:px-20 lg:px-32 pt-4 pb-16">

      {/* LOGOS + TÍTULO SOLO ARRIBA DE LA COLUMNA IZQUIERDA */}
      <div className="pb-10 text-center">
        <h2 className="md:text-xl text-lg font-bold tracking-tight text-cyan-600 pb-2">
          ORGANIZAN
        </h2>

        <div className="flex items-center justify-center gap-10 sm:gap-12">
          <Image
            src={WaycloLogo}
            alt="Wayclo"
            className="h-12 sm:h-12 md:h-10 w-auto opacity-95 pt-1"
          />
          <Image
            src={IntercityLogo}
            alt="Intercity"
            className="h-12 sm:h-16 md:h-20 w-auto opacity-95"
          />
        </div>
      </div>


      {/* TEXTO — UNA SOLA FUENTE — SE DIVIDE EN COLUMNAS AUTOMÁTICAMENTE */}
      <div
        className="
    text-gray-600
    text-base leading-relaxed     /* base */
    md:text-lg md:leading-relaxed /* md */
    lg:text-lg lg:leading-relaxed /* lg */
    columns-1 lg:columns-2 gap-12
  "
      >

        {/* PÁRRAFO 1 */}
        <p>
          CyberCloud es el evento que reúne a líderes y empresarios para explorar los temas que hoy impulsan a las PYMES: crecimiento, conectividad y ciberseguridad. En un momento donde la transformación digital es una necesidad, este encuentro muestra cómo las empresas pueden evolucionar de forma estratégica y segura.
        </p>
        {/* 🔹 SALTO 1 — SIEMPRE */}
        <div className="block h-6" />

        {/* PÁRRAFO 2 */}
        <p>
          Río Cuarto se consolida como un polo tecnológico en expansión, con talento profesional e infraestructura capaz de acompañar a empresas de todos los tamaños. En esta edición, conocerás casos reales de organizaciones locales que modernizaron sus operaciones, fortalecieron su seguridad y encontraron en la tecnología un motor clave para seguir creciendo.
        </p>
      </div>



    </section>
  );
}
