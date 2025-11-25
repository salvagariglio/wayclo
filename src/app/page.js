"use client";

import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import Speakers from "@/components/Speakers";
import Empresas from "@/components/Empresas";
import ExpoFeatures from "@/components/ExpoFeatures";
import SpeakersSection from "@/components/Objetivos";
import Sponsor from "@/components/Sponsor";
import AnimatedWordCloud from "@/components/AnimatedWordCloud";


export default function HomePage() {
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

      <Hero />

      <section id="empresas" className="scroll-mt-24">
        <Empresas />
      </section>

      <ExpoFeatures />

      {/* 🌟 NUEVA NUBE EN HOME */}

      <div className="mx-auto max-w-5xl px-6 py-8 text-black">
        <SpeakersSection />
        <Sponsor />
      </div>

      <div id="registro" className="h-1 w-1 opacity-0 pointer-events-none" />
    </main>
  );
}
