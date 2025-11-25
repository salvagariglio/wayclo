"use client";

import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import Speakers from "@/components/Speakers";
import Empresas from "@/components/Empresas";
import ExpoFeatures from "@/components/ExpoFeatures";
import SpeakersSection from "@/components/Objetivos";
import Sponsor from "@/components/Sponsor";
import AnimatedWordCloud from "@/components/AnimatedWordCloud";

import useScrollReveal from "@/hooks/useScrollReveal";

export default function HomePage() {

  // 👇 animaciones sección por sección
  const [heroRef, heroShow] = useScrollReveal();
  const [empRef, empShow] = useScrollReveal();
  const [expoRef, expoShow] = useScrollReveal();
  const [nubeRef, nubeShow] = useScrollReveal();

  return (
    <main className="min-h-screen bg-white text-black">
      <NavBar
        items={[
          { href: "#speakers", label: "Speakers" },
          { href: "#agenda", label: "Agenda" },
          { href: "#empresas", label: "Empresas" },
          { href: "#registro", label: "Inscribite" },
        ]}
      />

      {/* HERO */}
      <div ref={heroRef} className={`reveal ${heroShow ? "show" : ""}`}>
        <Hero />
      </div>

      {/* EMPRESAS */}
      <section id="empresas" className="scroll-mt-24">
        <div ref={empRef} className={`reveal ${empShow ? "show" : ""}`}>
          <Empresas />
        </div>
      </section>

      {/* EXPO FEATURES */}
      <div ref={expoRef} className={`reveal ${expoShow ? "show" : ""}`}>
        <ExpoFeatures />
      </div>

      {/* SPEAKERS + SPONSOR */}
      <div
        ref={nubeRef}
        className={`reveal ${nubeShow ? "show" : ""} mx-auto max-w-5xl px-6 py-8 text-black`}
      >
        <SpeakersSection />
        <Sponsor />
      </div>

      <div id="registro" className="h-1 w-1 opacity-0 pointer-events-none" />
    </main>
  );
}
