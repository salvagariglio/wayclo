"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import LogoChat from "../../public/logo-chat.png";
import "./ChatBubble.css";

const CYAN = "#00E0FF";

export default function ChatBubble() {
    const pathname = usePathname();

    // ❌ Si estamos en /admin o cualquier subruta
    if (pathname.startsWith("/admin")) {
        return null;
    }

    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);
    const panelRef = useRef(null);

    // Close logic
    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Escape") setOpen(false);

            if (
                open &&
                panelRef.current &&
                btnRef.current &&
                !panelRef.current.contains(e.target) &&
                !btnRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("keydown", handler);
        document.addEventListener("mousedown", handler);

        return () => {
            document.removeEventListener("keydown", handler);
            document.removeEventListener("mousedown", handler);
        };
    }, [open]);

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {/* ⭐ BOTÓN DEL CHAT */}
            <button
                ref={btnRef}
                onClick={() => setOpen(!open)}
                aria-label="Chat"
                className="relative flex items-center justify-center rounded-full overflow-hidden transition-all duration-200 hover:scale-[1.05] active:scale-95 chat-size spinning-orbit"
                style={{
                    border: "1.2px solid rgba(0,224,255,0.85)",
                    background: "rgba(13,26,38,0.45)",
                    backdropFilter: "blur(4px)",
                }}
            >
                <div className="absolute inset-0 orbit-layer"></div>

                <img
                    src={LogoChat.src}
                    alt="Chat"
                    className="relative z-10 object-contain chat-icon"
                    style={{ filter: "brightness(0) invert(1)" }}
                />
            </button>

            {/* PANEL */}
            <div
                className={`transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
            >
                <div
                    ref={panelRef}
                    className="absolute bottom-24 right-0 w-[22rem] sm:w-[24rem] max-w-[calc(100vw-2rem)] rounded-3xl overflow-hidden shadow-[0_18px_45px_rgba(0,0,0,0.6)] transition-all duration-300"
                    style={{
                        background:
                            "radial-gradient(circle at top left, rgba(0,224,255,0.18), transparent 55%), linear-gradient(145deg, rgba(2,10,19,0.98), rgba(1,5,12,0.96))",
                        backdropFilter: "blur(18px)",
                        transform: open
                            ? "translateY(0) scale(1)"
                            : "translateY(6px) scale(0.95)",
                    }}
                >
                    <ChatPanel />
                </div>
            </div>
        </div>
    );
}


/* ===================================================
   =============   CHAT PANEL COMPLETO   ===============
   =================================================== */

function ChatPanel() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "¡Hola! 😊 ¿Qué te gustaría saber sobre CyberCloud Río Cuarto 2025?",
        },
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);

    useEffect(() => {
        if (!endRef.current) return;

        // Mientras está "escribiendo", que el scroll sea instantáneo
        // (sin animación loca todo el tiempo)
        endRef.current.scrollIntoView({
            behavior: loading ? "auto" : "smooth",
            block: "end",
        });
    }, [messages, loading]);


    async function sendMessage(e) {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: "user", content: input.trim() };
        const history = [...messages, userMsg];

        // Crear mensaje vacío del asistente
        setMessages([...history, { role: "assistant", content: "" }]);

        const assistantIndex = history.length;
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/admin/ia/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: history }),
            });

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);

                // ✨ ESCRITURA LENTA REAL — carácter por carácter
                for (const char of chunk) {
                    // Delay ajustable (más alto = más lento)
                    await new Promise((res) => setTimeout(res, 35));

                    setMessages((prev) => {
                        const updated = [...prev];
                        const currentContent = updated[assistantIndex]?.content || "";
                        updated[assistantIndex] = {
                            role: "assistant",
                            content: currentContent + char,
                        };
                        return updated;
                    });
                }
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="text-white">

            {/* HEADER */}
            <div
                className="px-6 py-3 flex items-center gap-3"
                style={{
                    background:
                        "linear-gradient(120deg, rgba(0,224,255,0.2), rgba(7,19,32,0.95))",
                }}
            >
                <img src="/logo-chat-2.png" className="h-10 w-10 opacity-90" alt="icon" />
                <div>
                    <h3 className="font-semibold leading-none text-sm">
                        CyberCloud — Asistente
                    </h3>
                    <p className="text-xs text-cyan-200/80">Información del evento</p>
                </div>
            </div>

            {/* MENSAJES */}
            <div
                className="max-h-80 min-h-80 overflow-y-auto p-3 space-y-3 cyber-scroll"
                style={{
                    background:
                        "radial-gradient(circle at bottom right, rgba(0,224,255,0.10), rgba(3,10,20,0.95))",
                }}
            >
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex ${m.role === "user" ? "justify-end" : "justify-start"
                            }`}
                    >
                        <div
                            className="chat-bubble max-w-[80%] rounded-2xl px-3 py-2 whitespace-pre-wrap shadow-sm text-sm"
                            style={{
                                background:
                                    m.role === "user"
                                        ? CYAN
                                        : "linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))",
                                color: m.role === "user" ? "#021728" : "white",
                            }}
                        >
                            {m.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="text-xs text-cyan-300/80 animate-pulse">
                        escribiendo…
                    </div>
                )}

                <div ref={endRef} />
            </div>

            {/* FOOTER / INPUT */}
            <form
                onSubmit={sendMessage}
                className="p-3 pt-2"
                style={{
                    background:
                        "linear-gradient(145deg, rgba(0,224,255,0.12), rgba(3,10,20,0.98))",
                    borderTop: "1px solid rgba(0,224,255,0.16)",
                }}
            >
                <div className="flex gap-2 items-center">
                    <div
                        className="
                            flex-1 flex items-center gap-2
                            rounded-2xl px-3 py-1.5
                            bg-black/20
                            border border-white/10
                            backdrop-blur-sm
                        "
                    >
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Preguntame sobre CyberCloud…"
                            className="
                                flex-1 text-sm
                                bg-transparent
                                text-white
                                placeholder:text-white/35
                                outline-none focus:outline-none
                                border-none
                            "
                        />
                    </div>

                    <button
                        disabled={!input.trim() || loading}
                        className="
                            rounded-xl px-3.5 py-2 text-xs font-medium
                            bg-gradient-to-r from-cyan-400 to-cyan-300
                            text-black shadow-md shadow-cyan-500/25
                            disabled:opacity-60 disabled:cursor-not-allowed
                            transition-transform duration-150
                            hover:scale-[1.02] active:scale-95
                        "
                    >
                        Enviar
                    </button>
                </div>
            </form>
        </div>
    );
}

