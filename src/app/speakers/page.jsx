import Speakers from "@/components/Speakers";
import Sponsor from "@/components/Sponsor";

export default function AgendaPage() {
    return (
        <main className="px-6 py-16 text-black">
            <section id="speaker" className="scroll-mt-24 max-w-7xl mx-auto">
                <Speakers />
            </section>
            <div className="mt-20 max-w-5xl mx-auto">
                <Sponsor />
            </div>
        </main>
    );
}
