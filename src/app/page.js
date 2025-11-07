import Empresas from "@/components/Empresas";
import Hero from "@/components/Hero";

export default function HomePage() {
  return (
    <>
      {/* <NavBar /> */}
      <main className="pt-24">
        <Hero />
        <Empresas />
      </main>
    </>
  );
}
