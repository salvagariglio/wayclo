"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Menu, X } from "lucide-react";
import Logo from "../../public/logo-wayclo.png";

const LINKS = [
    { href: "/", label: "Inicio" },
    { href: "/programa", label: "Programa" },
    { href: "/bootcamp", label: "Bootcamp" },
    { href: "/empresas", label: "Empresas" },
];

export default function NavBar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    // Sombra al scrollear
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 6);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // ya no bloqueamos scroll (el panel empuja el contenido)
    useEffect(() => {
        document.body.style.overflow = "";
        return () => (document.body.style.overflow = "");
    }, []);

    const closeMenu = () => setOpen(false);
    const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

    return (
        <header
        className={[
            "fixed top-0 left-0 right-0 z-[9999] bg-white", // ← siempre arriba y con fondo
            scrolled ? "shadow-[0_4px_20px_rgba(0,0,0,0.15)]" : "shadow-none",
        ].join(" ")}
        >
            {/* Barra principal */}
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
                {/* Brand */}
                <div className=" flex items-center gap-3 min-w-0">
                    <Link href="/" className="flex items-center gap-3 group">
                        <Image
                            src={Logo}
                            width={150}
                            height={150}
                            alt="Wayclo logo"
                            className="object-contain"
                            priority
                        />
                    </Link>
                </div>

                {/* Links + CTA desktop */}
                <div className="hidden md:flex items-center gap-6">
                    <ul className="hidden md:flex items-center gap-6 text-sm">
                        {LINKS.map((l) => (
                            <li key={l.href}>
                                <Link
                                    href={l.href}
                                    className={[
                                        "text-black opacity-80 hover:opacity-100 transition-opacity relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[var(--brand)] after:transition-[width] hover:after:w-full",
                                        isActive(l.href) ? "after:w-full opacity-100" : "",
                                    ].join(" ")}
                                >
                                    {l.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-[var(--brand)] text-white hover:opacity-90">
                            Inscripción
                        </Button>
                    </DialogTrigger>
                </div>

                {/* Botón hamburguesa (mobile) */}
                <div className="md:hidden">
                    <button
                        aria-label={open ? "Cerrar menú" : "Abrir menú"}
                        aria-expanded={open}
                        onClick={() => setOpen((v) => !v)}
                        className="text-black inline-flex items-center justify-center rounded-md p-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/70"
                    >
                        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </nav>

            {/* Panel mobile: colapsable que empuja el contenido */}
            <div
                data-state={open ? "open" : "closed"}
                className={[
                    "md:hidden overflow-hidden  border-b border-white/10",
                    "transition-[max-height,opacity] duration-1000 ease-in-out",
                    "max-h-0 opacity-0",
                    "data-[state=open]:max-h-[80vh] data-[state=open]:opacity-100",
                ].join(" ")}
            >

                {/* Links + CTA */}
                <div className="px-4 sm:px-6 pb-6">
                    <ul className="flex flex-col gap-1">
                        {LINKS.map((l) => (
                            <li key={l.href} className="flex">
                                <Link
                                    href={l.href}
                                    onClick={closeMenu}
                                    aria-current={isActive(l.href) ? "page" : undefined}
                                    className={[
                                        "w-full rounded-md px-3 py-3 text-base text-center transition",
                                        "text-black/90 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/60",
                                        // sin bordes para evitar el “rectángulo” raro
                                        isActive(l.href) ? "bg-white/[0.08] text-black" : "",
                                    ].join(" ")}
                                >
                                    {l.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-4 flex justify-center">
                        <DialogTrigger asChild>
                            <Button
                                onClick={closeMenu}
                                className="w-full max-w-xs gap-2 bg-[var(--brand)] text-white hover:opacity-90"
                            >
                                Inscripción
                            </Button>
                        </DialogTrigger>
                    </div>
                </div>
            </div>
        </header>
    );
}
