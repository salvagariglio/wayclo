import Agenda from "@/components/Agenda";

export default function AgendaPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-black">
      <section id="agenda" className="scroll-mt-24">
        <Agenda />
      </section>
    </main>
  );
}
