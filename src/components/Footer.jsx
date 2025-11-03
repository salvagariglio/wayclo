"use client";
export default function Footer() {
    return (
        <footer className="py-12 border-t border-white/10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                    <p className="text-white/60 text-sm">
                        © {new Date().getFullYear()} Aesthetic — Plataforma de reservas para belleza y bienestar.
                    </p>
                    <div className="flex md:justify-end gap-3 text-sm text-white/70">
                        <a href="#" className="hover:text-white">Términos</a>
                        <a href="#" className="hover:text-white">Privacidad</a>
                        <a href="#" className="hover:text-white">Contacto</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
