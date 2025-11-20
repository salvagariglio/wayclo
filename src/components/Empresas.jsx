"use client";

import Image from "next/image";
import WaycloLogo from "../../public/logo-wayclo.png";
import IntercityLogo from "../../public/intercity.png";

export default function EmpresasYCybercloud() {
  return (
    <section className="w-full px-6 md:px-20 lg:px-32 pt-4 pb-16">

      {/* LOGOS + TÍTULO SOLO ARRIBA DE LA COLUMNA IZQUIERDA */}
      <div className="pb-10">
        <h2 className="md:text-xl text-lg text-start font-bold tracking-tight text-cyan-600 pb-2">
          ORGANIZAN
        </h2>

        <div className="flex items-center gap-10 sm:gap-12">
          <Image
            src={WaycloLogo}
            alt="Wayclo"
            className="h-12 sm:h-12 md:h-14 w-auto opacity-95"
          />
          <Image
            src={IntercityLogo}
            alt="Intercity"
            className="h-12 sm:h-16 md:h-20 w-auto opacity-95"
          />
        </div>
      </div>

      {/* TEXTO — UNA SOLA FUENTE — SE DIVIDE EN COLUMNAS AUTOMÁTICAMENTE */}
      <div className="text-gray-600 text-lg leading-relaxed columns-1 lg:columns-2 gap-12">

        {/* PÁRRAFO 1 */}
        <p>
          CyberCloud es el evento que reúne a líderes y empresarios para profundizar en los temas que hoy impulsan y desafían a las PYMES: crecimiento, conectividad y ciberseguridad. En un contexto donde la transformación digital dejó de ser opcional, este encuentro busca poner en foco cómo las empresas pueden evolucionar de manera estratégica, segura y sostenida.        </p>

        {/* 🔹 SALTO 1 — SIEMPRE */}
        <div className="block h-6" />


        {/* PÁRRAFO 2 */}
        <p>
          Porque Río Cuarto no se queda atrás. La ciudad se ha consolidado como un polo en expansión, con talento profesional, infraestructura tecnológica y servicios de alto nivel, capaces de acompañar tanto a emprendimientos en crecimiento como a organizaciones que ya operan a escala regional y nacional. Hoy, las empresas locales no necesitan recurrir a grandes proveedores de las capitales provinciales: el ecosistema tecnológico de la región tiene todo lo necesario para impulsar su desarrollo.        </p>

        {/* 🔹 SALTO 2 — SOLO EN UNA COLUMNA (mobile/tablet) */}
        <div className="block lg:hidden h-6" />


        {/* PÁRRAFO 3 */}
        <p>
          En esta edición de CyberCloud, vas a conocer casos reales de empresas de Río Cuarto y la zona que atravesaron procesos de expansión, modernizaron sus operaciones y decidieron invertir en tecnología como parte central de su estrategia. Sus experiencias muestran cómo la seguridad de la información y la conectividad confiable se convirtieron en factores clave para sostener la actividad, profesionalizar procesos y abrir nuevas oportunidades de negocio.        </p>

        {/* 🔹 SALTO 3 — SIEMPRE */}
        <div className="block h-6" />


        {/* PÁRRAFO 4 */}
        <p>
          CyberCloud es un espacio creado para conectarte con la innovación, inspirarte con historias locales, descubrir tendencias y generar nuevas alianzas. Un evento pensado para quienes quieren entender hacia dónde va el mundo digital y cómo potenciar el crecimiento tecnológico desde una mirada práctica, cercana y orientada a resultados.        </p>

      </div>


    </section>
  );
}
