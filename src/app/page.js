"use client";
import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import Speakers from "@/components/Speakers";
import Agenda from "@/components/Agenda";
import Empresas from "@/components/Empresas";
import ExpoFeatures from "@/components/ExpoFeatures";
import Footer from "@/components/Footer";

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
      <section id="speakers" className="scroll-mt-24">
        <Speakers />
      </section>
      <section id="agenda" className="scroll-mt-24">
        <Agenda />
      </section>
      <section id="empresas" className="scroll-mt-24">
        <Empresas />
      </section>
      <ExpoFeatures />
      {/* ancla para que el botón de la navbar/hero enfoque el formulario/modal */}
      <div id="registro" className="h-1 w-1 opacity-0 pointer-events-none" />
      <Footer />
    </main>
  );
}
