export default function EmpresasPage() {
    return (
        <main className="mx-auto max-w-5xl px-6 py-16 text-black">
            <h1 className="text-4xl font-bold mb-4">Empresas</h1>
            <p className="text-lg text-black/70 mb-8">
                Conectamos talento con empresas que apuestan por la innovación y el
                crecimiento tecnológico.
            </p>

            <section className="space-y-6">
                <div>
                    <h2 className="text-2xl font-semibold mb-2">Alianzas Corporativas</h2>
                    <p className="text-black/70">
                        Colaboramos con startups y compañías líderes que buscan nuevos
                        perfiles técnicos. Ofrecemos programas de inserción laboral y
                        prácticas profesionales.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-2">Contratación de Talento</h2>
                    <p className="text-black/70">
                        Si tu empresa busca incorporar desarrolladores formados en nuestro
                        bootcamp, te ayudamos a conectar con el perfil ideal.
                    </p>
                </div>
            </section>
        </main>
    );
}
