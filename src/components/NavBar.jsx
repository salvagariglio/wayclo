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
  { href: "/speakers", label: "SPEAKERS" },
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
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const closeMenu = () => setOpen(false);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const isEmpresas = pathname.startsWith("/empresas");
  const isDark = isEmpresas || dimmed;

  const baseBg = isEmpresas
    ? "bg-slate-950 text-white"
    : dimmed
      ? "bg-slate-900/90 text-white backdrop-blur"
      : "bg-white text-black";

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-[50]",
        baseBg,

        // 🔥 sombra visible en modo EMPRESAS (fondo oscuro)
        isEmpresas
          ? "shadow-[0_6px_25px_rgba(255,255,255,0.18)] backdrop-blur-[2px]"
          : scrolled
            ? "shadow-[0_2px_10px_rgba(255,255,255,0.08)]"
            : "shadow-none",
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
                    "uppercase tracking-[0.18em] text-lg transition leading-none",
                    isEmpresas
                      ? "text-white/70 hover:text-white"
                      : "text-black/70 hover:text-black",
                    isActive(l.href)
                      ? isEmpresas
                        ? "font-extrabold text-white"
                        : "font-extrabold text-black"
                      : "",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Button
            onClick={() => document.dispatchEvent(new Event("open-register"))}
            className={[
              "gap-2 hover:opacity-90 text-lg rounded-full p-3",
              isEmpresas
                ? "bg-white text-[#050057]"
                : dimmed
                  ? "bg-white text-slate-900"
                  : "bg-black text-white",
            ].join(" ")}
          >
            INSCRIBITE
          </Button>
        </div>

        {/* Mobile button */}
        <div className="md:hidden">
          <button
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={[
              "inline-flex items-center justify-center rounded-md p-2 outline-none focus-visible:ring-2",
              isDark
                ? "text-white focus-visible:ring-white/70"
                : "text-black focus-visible:ring-[var(--brand,#050057)]/70",
            ].join(" ")}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile panel */}
      <div
        data-state={open ? "open" : "closed"}
        className={[
          "md:hidden overflow-hidden border-b",
          isDark ? "border-white/20" : "border-slate-200",
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
                    isDark
                      ? "text-white/90 hover:bg-white/5 focus-visible:ring-white/60"
                      : "text-black/90 hover:bg-black/[0.04] focus-visible:ring-[var(--brand,#050057)]/60",
                    isActive(l.href)
                      ? isDark
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
                isEmpresas
                  ? "bg-white text-[#050057]"
                  : isDark
                    ? "bg-white text-slate-900"
                    : "bg-[var(--brand,#050057)] text-white",
              ].join(" ")}
            >
              INSCRIBITE
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
