"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Logo from "../../public/logo-wayclo.png";

const LINKS = [
  { href: "/", label: "EVENTO" },
  { href: "/agenda", label: "AGENDA" },
  { href: "/empresas", label: "EMPRESAS" },
];

export default function NavBar({ dimmed = false }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, []);

  const closeMenu = () => setOpen(false);
  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const baseBg = dimmed
    ? "bg-slate-900/90 text-white backdrop-blur"
    : "bg-white text-black";

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-[50]",
        baseBg,
        scrolled ? "shadow-[0_4px_20px_rgba(0,0,0,0.15)]" : "shadow-none",
      ].join(" ")}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src={Logo}
              width={180}
              height={180}
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
                    // texto base en mayúsculas y espaciado tipo la captura
                    "uppercase tracking-[0.18em] text-lg transition leading-none",

                    // color general y hover
                    " hover:text-black",

                    // cuando está activo, lo hacemos bold
                    isActive(l.href) ? "font-extrabold text-black" : "font-medium text-black/70",

                  ].join(" ")}
                >
                  {l.label}
                </Link>

              </li>
            ))}
          </ul>

          {/* CTA → abre modal via evento */}
          <Button
            onClick={() => document.dispatchEvent(new Event("open-register"))}
            className={[
              "gap-2 hover:opacity-90 text-lg rounded-full p-3",
              dimmed
                ? "bg-white text-slate-900"
                : "bg-black text-white",
            ].join(" ")}
          >
            INSCRIBITE
          </Button>
        </div>

        {/* Botón hamburguesa (mobile) */}
        <div className="md:hidden">
          <button
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={[
              "inline-flex items-center justify-center rounded-md p-2 outline-none focus-visible:ring-2",
              dimmed
                ? "text-white focus-visible:ring-white/70"
                : "text-black focus-visible:ring-[var(--brand,#050057)]/70",
            ].join(" ")}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Panel mobile */}
      <div
        data-state={open ? "open" : "closed"}
        className={[
          "md:hidden overflow-hidden border-b",
          dimmed ? "border-white/20" : "border-slate-200",
          "transition-[max-height,opacity] duration-700 ease-in-out",
          "max-h-0 opacity-0",
          "data-[state=open]:max-h-[80vh] data-[state=open]:opacity-100",
        ].join(" ")}
      >
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
                    dimmed
                      ? "text-white/90 hover:bg-white/5 focus-visible:ring-white/60"
                      : "text-black/90 hover:bg-black/[0.04] focus-visible:ring-[var(--brand,#050057)]/60",
                    isActive(l.href)
                      ? dimmed
                        ? "bg-white/5 text-white"
                        : "bg-black/[0.06] text-black"
                      : "",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => {
                closeMenu();
                document.dispatchEvent(new Event("open-register"));
              }}
              className={[
                "w-full max-w-xs gap-2 hover:opacity-90",
                dimmed
                  ? "bg-white text-slate-900"
                  : "bg-[var(--brand,#050057)] text-white",
              ].join(" ")}
            >
              INSCRIBITE
            </Button>
          </div>
        </div>
      </div>
    </header >
  );
}
