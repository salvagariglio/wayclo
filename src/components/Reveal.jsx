"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Props:
 * - threshold: 0..1 (porción visible para “entrar/salir”), default 0.2
 * - rootMargin: ej. "0px 0px -10% 0px" para anticipar la entrada/salida
 * - duration: duración de la animación (ms), default 450
 * - offset: distancia vertical en px para el slide-in/out, default 24
 * - keepMounted: si true, no desmonta al salir; solo oculta/animación
 */
export default function Reveal({
    children,
    className = "",
    threshold = 0.2,
    rootMargin = "0px",
    duration = 450,
    offset = 24,
    keepMounted = false,
}) {
    const hostRef = useRef(null);
    const [inView, setInView] = useState(false);
    const [render, setRender] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
        const el = hostRef.current;
        if (!el) return;

        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // entra: asegurar montado + animación de entrada
                    if (!render) setRender(true);
                    setInView(true);
                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                        timeoutRef.current = null;
                    }
                } else {
                    // sale: animar salida y luego desmontar (si keepMounted=false)
                    setInView(false);
                    if (!keepMounted) {
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                        timeoutRef.current = setTimeout(() => setRender(false), duration + 50);
                    }
                }
            },
            { threshold, rootMargin }
        );

        io.observe(el);
        return () => {
            io.disconnect();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [threshold, rootMargin, duration, keepMounted, render]);

    return (
        <section ref={hostRef} className={className}>
            {render ? (
                <div className={`reveal ${inView ? "in" : "out"}`}>
                    {children}
                </div>
            ) : null}

            <style jsx>{`
        .reveal {
          will-change: opacity, transform;
          transition:
            opacity ${duration}ms cubic-bezier(.22,1,.36,1),
            transform ${duration}ms cubic-bezier(.22,1,.36,1);
        }
        .reveal.out {
          opacity: 0;
          transform: translateY(${offset}px);
          pointer-events: none;
        }
        .reveal.in {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal { transition: none !important; }
        }
      `}</style>
        </section>
    );
}
