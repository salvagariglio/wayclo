export default function BootcampPage() {
    return (
        <main className="mx-auto max-w-5xl px-6 py-16 text-white">
            <h1 className="text-4xl font-bold mb-4">Bootcamp</h1>
            <p className="text-lg text-white/70 mb-8">
                Sumate al bootcamp y aprendé en un entorno colaborativo con proyectos
                reales, mentores y desafíos semanales.
            </p>

            <section className="space-y-6">
                <div>
                    <h2 className="text-2xl font-semibold mb-2">Metodología</h2>
                    <p className="text-white/70">
                        Trabajamos con metodologías ágiles, sprints semanales y feedback
                        constante. Cada alumno desarrolla un proyecto que forma parte de su
                        portfolio profesional.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-2">Mentores</h2>
                    <p className="text-white/70">
                        Nuestros mentores son profesionales activos en tecnología, diseño y
                        producto. Te acompañarán durante todo el proceso de aprendizaje.
                    </p>
                </div>
            </section>
        </main>
    );
}
