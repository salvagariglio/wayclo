"use client";

import { useEffect, useRef, useState } from "react";

// ---------- CONFIGURACIÓN DE SLOTS FIJOS (DIAMANTE PERFECTO) ----------
const SLOTS = [
    { x: 600, y: 70, size: 58, rotate: 0 }, // 01 (TOP)
    { x: 450, y: 120, size: 42, rotate: 0 },
    { x: 600, y: 120, size: 48, rotate: 0 }, // top-center big
    { x: 750, y: 120, size: 42, rotate: 0 },

    // fila ancha del medio
    { x: 350, y: 190, size: 36, rotate: 0 },
    { x: 450, y: 190, size: 36, rotate: Math.PI / 2 },
    { x: 550, y: 190, size: 48, rotate: 0 }, // big #2
    { x: 650, y: 190, size: 36, rotate: Math.PI / 2 },
    { x: 750, y: 190, size: 36, rotate: 0 },
    { x: 850, y: 190, size: 36, rotate: 0 },

    // mini fila interna
    { x: 480, y: 260, size: 32, rotate: Math.PI / 2 },
    { x: 600, y: 260, size: 52, rotate: 0 }, // big #3
    { x: 720, y: 260, size: 32, rotate: Math.PI / 2 },

    // fila ancha inferior
    { x: 350, y: 330, size: 34, rotate: 0 },
    { x: 450, y: 330, size: 34, rotate: Math.PI / 2 },
    { x: 550, y: 330, size: 34, rotate: 0 },
    { x: 650, y: 330, size: 34, rotate: Math.PI / 2 },
    { x: 750, y: 330, size: 34, rotate: 0 },
    { x: 850, y: 330, size: 34, rotate: 0 },

    // BOTTOM
    { x: 600, y: 400, size: 38, rotate: 0 },
];

// ---------- PALABRAS INICIALES ----------
const INITIAL_WORDS = [
    "ciberseguridad", "firewall", "redes", "conectividad", "internet", "routers",
    "switching", "endpoint", "tecnología", "protección",
    "cloud", "backups", "infraestructura", "data",
    "seguridad", "monitoring", "servicios", "detección",
    "operaciones", "servicio técnico"
];

export default function AnimatedWordCloud() {
    const canvasRef = useRef(null);

    // ---- palabras con su "score" ----
    const [words, setWords] = useState(
        INITIAL_WORDS.slice(0, 20).map((w, i) => ({
            text: w,
            score: 20 - i, // ranking inicial decreciente
        }))
    );

    // para animación suave
    const positionsRef = useRef([]);

    // ---- Agregar palabra desde el input ----
    function addWord(text) {
        setWords((prev) => {
            const existing = prev.find((w) => w.text === text);

            if (existing) {
                // incrementa score → sube ranking
                return prev
                    .map((w) =>
                        w.text === text ? { ...w, score: w.score + 4 } : w
                    );
            }

            // palabra nueva → reemplaza a la de menor score
            const updated = [...prev];
            updated.sort((a, b) => a.score - b.score); // la menor primero
            updated[0] = { text, score: updated[1].score - 2 }; // entra con score bajo
            return updated;
        });
    }

    // ---- RENDER ----
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // ordenar por score DESC
            const sorted = [...words].sort((a, b) => b.score - a.score);

            // dibujar cada palabra en su slot
            sorted.forEach((w, i) => {
                const slot = SLOTS[i];

                // lerp para animación suave
                const prev = positionsRef.current[i] || slot;
                const lerpX = prev.x + (slot.x - prev.x) * 0.1;
                const lerpY = prev.y + (slot.y - prev.y) * 0.1;

                positionsRef.current[i] = { x: lerpX, y: lerpY };

                ctx.save();
                ctx.translate(lerpX, lerpY);
                ctx.rotate(slot.rotate);

                const intensity = 0.4 + (0.6 * (sorted.length - i)) / sorted.length;
                ctx.fillStyle = `rgba(0,180,255,${intensity})`;

                ctx.font = `${slot.size}px Inter`;
                ctx.textAlign = "center";
                ctx.fillText(w.text, 0, 0);
                ctx.restore();
            });

            requestAnimationFrame(draw);
        }

        draw();
    }, [words]);

    return (
        <div className="flex flex-col items-center gap-6 py-10">
            <canvas
                ref={canvasRef}
                width={1200}
                height={500}
                className="w-full bg-transparent"
            />

            <form
                className="flex gap-3"
                onSubmit={(e) => {
                    e.preventDefault();
                    const value = e.target.word.value.trim();
                    if (value) addWord(value);
                    e.target.reset();
                }}
            >
                <input
                    name="word"
                    placeholder="Agregar palabra"
                    className="px-4 py-2 border rounded-lg"
                />
                <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg">
                    Agregar
                </button>
            </form>
        </div>
    );
}
