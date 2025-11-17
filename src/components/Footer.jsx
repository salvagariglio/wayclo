"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();

    const isAdmin = pathname.startsWith("/admin");
    const isEmpresas = pathname.startsWith("/empresas");

    // Mostrar info solo en Home y Agenda, y nunca en admin
    const showEventInfo =
        (pathname === "/" || pathname.startsWith("/agenda")) && !isAdmin;

    const baseBg = isAdmin
        ? "bg-[#021728] text-white border-[#021728]" // Footer en ADMIN (login + registros)
        : isEmpresas
            ? "bg-[#1a1a1a] text-white border-white/10" // Footer en EMPRESAS
            : "bg-[#1a1a1a] text-white border-white/10"; // Footer default

    return (
        <footer className={["py-12 border-t", baseBg].join(" ")}>

            {/* INFO EXTRA SOLO PARA HOME / AGENDA */}
            {showEventInfo && (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
                    <h2 className="text-2xl font-bold text-center mb-10 tracking-tight">
                        Información del Evento
                    </h2>

                    <div className="grid md:grid-cols-2 gap-10 items-start">
                        {/* MAPA */}
                        <div className="w-full">
                            <iframe
                                className="w-full h-72 rounded-xl shadow-lg border border-white/20"
                                loading="lazy"
                                allowFullScreen
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3341.8056480028295!2d-64.352871!3d-33.114193!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95d20100236dca37%3A0x99057b0bf5da3255!2sPolo%20Cient%C3%ADfico%20Tecnol%C3%B3gico!5e0!3m2!1ses!2sar!4v1763153367330!5m2!1ses!2sar"
                            ></iframe>
                        </div>

                        {/* INFO CONTACTO */}
                        <div className="flex flex-col justify-center space-y-5 text-lg text-center md:text-left">
                            <div>
                                <h3 className="font-bold text-xl mb-1">Lugar</h3>
                                <p>📍 Polo Científico Tecnologico Río Cuarto</p>
                            </div>

                            <div>
                                <h3 className="font-bold text-xl mb-1">Contacto</h3>
                                <p>✉️ info@cybercloud.ar</p>
                                <p>📞 +54 9 358 422 03 86</p>
                            </div>

                            <div>
                                <h3 className="font-bold text-xl mb-1">Horario</h3>
                                <p>🕒 17:45 hs – 21:00 hs</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* COPYRIGHT */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center text-center">
                    <p className="text-sm opacity-80">
                        © {new Date().getFullYear()} Copyright Wayclo-Intercity
                    </p>
                </div>
            </div>
        </footer>
    );
}
