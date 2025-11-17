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

// safelist tailwind
const _safeAdminShadow = "shadow-[0_0_22px_rgba(255,255,255,0.22)]";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setOpen(false);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // 👉 sombra de la navbar: se desactiva cuando el menú mobile está abierto
  const shadowClass = isAdmin
    ? open
      ? "shadow-none"
      : "shadow-[0_0_22px_rgba(255,255,255,0.22)]"
    : scrolled && !open
      ? "shadow-[0_2px_10px_rgba(15,23,42,0.12)]"
      : "shadow-none";

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-[50]",
        isAdmin ? "bg-[#021728] text-white" : "bg-white text-slate-900",
        "transition-shadow",
        shadowClass,
      ].join(" ")}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={Logo}
            width={180}
            height={180}
            alt="Wayclo logo"
            priority
            className="object-contain"
          />
        </Link>

        {/* LINKS DESKTOP */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="hidden md:flex items-center gap-6 text-sm">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={[
                    "uppercase tracking-[0.18em] text-lg transition leading-none",
                    isAdmin
                      ? "text-white hover:text-white/90"
                      : "text-slate-700 hover:text-slate-900",
                    isActive(l.href) ? "font-extrabold" : "",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA desktop — no aparece en admin */}
          {!isAdmin && (
            <Button
              onClick={() => document.dispatchEvent(new Event("open-register"))}
              className="gap-2 text-lg rounded-full px-5 py-3 transition bg-black font-bold text-white hover:opacity-90"
            >
              INSCRIBITE
            </Button>
          )}
        </div>

        {/* BOTÓN MOBILE */}
        <div className="md:hidden">
          <button
            onClick={() => setOpen((v) => !v)}
            className={[
              "p-2 rounded-md outline-none focus-visible:ring-2",
              isAdmin
                ? "text-white focus-visible:ring-white/70"
                : "text-slate-900 focus-visible:ring-[var(--brand,#050057)]/70",
            ].join(" ")}
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* OVERLAY (fondo ligeramente oscuro y casi sin blur, debajo de la navbar) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="
            fixed left-0 right-0 bottom-0
            top-24
            bg-black/10
            backdrop-blur-[1px]
            transition-opacity
            md:hidden
            z-[40]
          "
        />
      )}

      {/* PANEL MOBILE */}
      <div
        data-state={open ? "open" : "closed"}
        className={[
          "md:hidden overflow-hidden transition-[max-height,opacity] duration-700 ease-in-out",
          "max-h-0 opacity-0",
          "data-[state=open]:max-h-[80vh] data-[state=open]:opacity-100",
          isAdmin
            ? "bg-[#021728] shadow-none border-none"
            : "bg-white shadow-none border-none",
          "relative z-[50]",
        ].join(" ")}
      >
        <div className="px-6 pb-8 pt-4 flex flex-col items-center gap-3">
          {/* LINKS MOBILE — CENTRADOS */}
          <ul className="flex flex-col items-center gap-3 w-full">
            {LINKS.map((l) => (
              <li key={l.href} className="w-full flex justify-center">
                <Link
                  href={l.href}
                  onClick={closeMenu}
                  className={[
                    "w-full max-w-xs text-center rounded-full px-5 py-3 text-base font-medium transition",
                    isAdmin
                      ? "text-white hover:bg-white/10"
                      : "text-slate-900 hover:bg-black/[0.04]",
                    isActive(l.href)
                      ? isAdmin
                        ? "bg-white/10 border border-white/20"
                        : "bg-black/[0.06] border border-slate-200"
                      : "border border-transparent",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA MOBILE — NO aparece en admin */}
          {!isAdmin && (
            <Button
              onClick={() => {
                closeMenu();
                document.dispatchEvent(new Event("open-register"));
              }}
              className="w-full max-w-xs mt-2 rounded-full bg-black font-bold text-white"
            >
              INSCRIBITE
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
