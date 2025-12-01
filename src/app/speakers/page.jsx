import Speakers from "@/components/Speakers";
import Sponsor from "@/components/Sponsor";
import ModeratorCard from "@/components/ModeratorCard";

export default function AgendaPage() {
    return (
        <main className="px-6 py-16 text-black">
            <section id="speaker" className="scroll-mt-24 max-w-7xl mx-auto">
                <Speakers />
            </section>
            <div>
                <Sponsor />
            </div>
        </main>
    );
}
