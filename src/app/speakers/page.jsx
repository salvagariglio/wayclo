import Speakers from "@/components/Speakers";

export default function AgendaPage() {
    return (
        <main className="mx-auto max-w-5xl px-6 py-16 text-black">
            <section id="speaker" className="scroll-mt-24">
                <Speakers />
            </section>
        </main>
    );
}
