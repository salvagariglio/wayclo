"use client";

import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import Speakers from "@/components/Speakers";
import Empresas from "@/components/Empresas";
import ExpoFeatures from "@/components/ExpoFeatures";
import SpeakersSection from "@/components/Objetivos";
import Sponsor from "@/components/Sponsor";

import LiveWordCloud from "@/components/LiveWordCloud";
import WordForm from "@/components/WordForm";
import useWordCloud from "@/lib/useWordCloud";

export default function HomePage() {
  const { words, addWord } = useWordCloud();

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
      <section className="px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-4 text-cyan-700">
          ¿Qué representa la CyberCloud para vos?
        </h2>

        {/* Render de la nube */}
        <LiveWordCloud words={words} />

        {/* Form para enviar palabras */}
        <div className="max-w-xl mx-auto">
          <WordForm onSend={addWord} />
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-8 text-black">
        <SpeakersSection />
        <Sponsor />
      </div>

      <div id="registro" className="h-1 w-1 opacity-0 pointer-events-none" />
    </main>
  );
}
