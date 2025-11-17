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

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Detect page admin
  const isAdminLogin = pathname === "/admin/login";

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

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-[50]",
        isAdminLogin ? "bg-[#021728] text-white" : "bg-white text-slate-900",
        "transition-shadow",

        // SOMBRA MÁS GRANDE SOLO EN ADMIN
        isAdminLogin
          ? "shadow-[0_0_22px_rgba(255,255,255,0.22)]"
          : scrolled
            ? "shadow-[0_2px_10px_rgba(15,23,42,0.12)]"
            : "shadow-none",
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
                    isAdminLogin
                      ? "text-white hover:text-white/90"
                      : "text-slate-700 hover:text-slate-900",
                    isActive(l.href)
                      ? "font-extrabold"
                      : "",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA (botón blanco en admin) */}
          <Button
            onClick={() => document.dispatchEvent(new Event("open-register"))}
            className={[
              "gap-2 text-lg rounded-full px-5 py-3 transition",
              isAdminLogin
                ? "bg-white text-[#021728] hover:bg-white/90"
                : "bg-black text-white hover:opacity-90",
            ].join(" ")}
          >
            INSCRIBITE
          </Button>
        </div>

        {/* BOTÓN MOBILE */}
        <div className="md:hidden">
          <button
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={[
              "p-2 rounded-md outline-none focus-visible:ring-2",
              isAdminLogin
                ? "text-white focus-visible:ring-white/70"
                : "text-slate-900 focus-visible:ring-[var(--brand,#050057)]/70",
            ].join(" ")}
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* PANEL MOBILE */}
      <div
        data-state={open ? "open" : "closed"}
        className={[
          "md:hidden overflow-hidden transition-[max-height,opacity] duration-700 ease-in-out",
          "max-h-0 opacity-0",
          "data-[state=open]:max-h-[80vh] data-[state=open]:opacity-100",
          isAdminLogin
            ? "bg-[#021728] border-b border-[#021728]"
            : "bg-white border-b border-slate-200",
        ].join(" ")}
      >
        <div className="px-4 sm:px-6 pb-6">
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={closeMenu}
                  className={[
                    "w-full rounded-md px-3 py-3 text-base text-center transition",
                    isAdminLogin
                      ? "text-white hover:bg-white/10"
                      : "text-slate-900 hover:bg-black/[0.04]",
                    isActive(l.href)
                      ? isAdminLogin
                        ? "bg-white/10 font-semibold"
                        : "bg-black/[0.06] font-semibold"
                      : "",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA MOBILE */}
          <Button
            onClick={() => {
              closeMenu();
              document.dispatchEvent(new Event("open-register"));
            }}
            className={[
              "w-full max-w-xs mx-auto mt-4",
              isAdminLogin
                ? "bg-white text-[#021728] hover:bg-white/90"
                : "bg-[var(--brand,#050057)] text-white",
            ].join(" ")}
          >
            INSCRIBITE
          </Button>
        </div>
      </div>
    </header>
  );
}
