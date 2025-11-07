export default function ProgramaPage() {
    return (
        <main className="mx-auto max-w-5xl px-6 py-16 text-black">
            <h1 className="text-4xl font-bold mb-4">Programa</h1>
            <p className="text-lg text-black/70 mb-8">
                Descubrí nuestro programa intensivo, diseñado para potenciar tus
                habilidades técnicas y profesionales con un enfoque práctico.
            </p>

            <section className="space-y-6">
                <div>
                    <h2 className="text-2xl font-semibold mb-2">Estructura del Programa</h2>
                    <p className="text-black/70">
                        El programa combina sesiones teóricas, workshops y proyectos reales
                        guiados por mentores de la industria. Está pensado para ayudarte a
                        desarrollarte desde el primer día.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-2">Duración</h2>
                    <p className="text-black/70">
                        El bootcamp tiene una duración total de 12 semanas, con clases en
                        vivo y material on-demand para reforzar cada módulo.
                    </p>
                </div>
            </section>
        </main>
    );
}
