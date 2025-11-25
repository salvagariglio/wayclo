"use client";
import Agenda from "@/components/Agenda";
import Sponsor from "@/components/Sponsor";
import useScrollReveal from "@/hooks/useScrollReveal";

export default function AgendaPage() {
  const [agendaRef, agendaShow] = useScrollReveal();
  const [sponsorRef, sponsorShow] = useScrollReveal();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-black">
      <section id="agenda" className="scroll-mt-24" ref={agendaRef}>
        <div className={`reveal ${agendaShow ? "show" : ""}`}>
          <Agenda />
        </div>
      </section>

      <div ref={sponsorRef} className={`reveal ${sponsorShow ? "show" : ""}`}>
        <Sponsor />
      </div>
    </main>
  );
}
