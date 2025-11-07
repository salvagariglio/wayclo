import Empresas from "@/components/Empresas";
import ExpoFeatures from "@/components/ExpoFeatures";
import Hero from "@/components/Hero";

export default function HomePage() {
  return (
    <>
      {/* <NavBar /> */}
      <main className="pt-24">
        <Hero />
        <Empresas />
        <ExpoFeatures/>
      </main>
    </>
  );
}
