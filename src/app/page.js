import Empresas from "@/components/Empresas";
import ExpoFeatures from "@/components/ExpoFeatures";
import Hero from "@/components/Hero";
import Speakers from "@/components/Speakers";
import Agenda from "@/components/Agenda";

export default function HomePage() {
  return (
    <>
      {/* <NavBar /> */}
      <main className="pt-24">
        <Hero />
        <Empresas />
        <ExpoFeatures/>
        <Speakers />
        <Agenda />
      </main>
    </>
  );
}
