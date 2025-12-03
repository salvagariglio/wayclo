"use client";

import { useEffect, useRef, useState } from "react";
import LogoChat from "../../public/logo-chat.png";
import "./ChatBubble.css";

const CYAN = "#00E0FF";

export default function ChatBubble() {
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

            {/* ⭐ BOTÓN DEL CHAT — FIX DE HYDRATION: className ahora es UNA SOLA LÍNEA */}
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
                {/* ORBITA ANIMADA */}
                <div className="absolute inset-0 orbit-layer"></div>

                {/* LOGO */}
                <img
                    src={LogoChat.src}
                    alt="Chat"
                    className="relative z-10 object-contain chat-icon"
                    style={{ filter: "brightness(0) invert(1)" }}
                />
            </button>

            {/* PANEL */}
            <div className={`transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                <div
                    ref={panelRef}
                    className="absolute bottom-24 right-0 w-[22rem] sm:w-[24rem] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden border shadow-2xl transition-all duration-300"
                    style={{
                        background: "rgba(5, 20, 35, 0.75)",
                        backdropFilter: "blur(14px)",
                        borderColor: "rgba(0,224,255,0.15)",
                        transform: open ? "translateY(0) scale(1)" : "translateY(6px) scale(0.95)",
                    }}
                >
                    <ChatPanel />
                </div>
            </div>
        </div>
    );
}

/* ===================================================
   =============   CHAT PANEL LIMPIO   ===============
   =================================================== */

function ChatPanel() {
    const [messages, setMessages] = useState(() => [
        {
            role: "assistant",
            content: "¡Hola! 😊 ¿Qué te gustaría saber sobre CyberCloud Río Cuarto 2025?",
        },
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function sendMessage(e) {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: "user", content: input.trim() };
        const history = [...messages, userMsg];

        // Mensaje vacío del assistant
        setMessages([...history, { role: "assistant", content: "" }]);

        const assistantIndex = history.length;

        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
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

                setMessages((prev) => {
                    const updated = [...prev];
                    updated[assistantIndex] = {
                        role: "assistant",
                        content: (updated[assistantIndex].content || "") + chunk
                    };

                    return updated;
                });

            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="text-white">

            {/* HEADER */}
            <div className="px-6 py-3 flex items-center gap-3 border-b border-white/10 bg-black/20">
                <img src="/logo-chat.png" className="h-6 w-10 opacity-90" alt="icon" />
                <div>
                    <h3 className="font-semibold leading-none">CyberCloud — Asistente</h3>
                    <p className="text-xs text-cyan-300/70">Información del evento</p>
                </div>
            </div>

            {/* MENSAJES */}
            <div className="max-h-80 min-h-80 overflow-y-auto p-3 space-y-3">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                            className="max-w-[80%] rounded-2xl px-3 py-2 whitespace-pre-wrap shadow"
                            style={{
                                background: m.role === "user" ? CYAN : "rgba(255,255,255,0.06)",
                                color: m.role === "user" ? "#021728" : "white",
                            }}
                        >
                            {m.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="text-xs text-cyan-300 animate-pulse">
                        escribiendo…
                    </div>
                )}

                <div ref={endRef} />
            </div>

            {/* INPUT */}
            <form onSubmit={sendMessage} className="p-3 border-t border-white/10">
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Preguntame sobre CyberCloud…"
                        className="flex-1 rounded-xl px-3 py-2 bg-black/40 border border-cyan-400/20 text-sm"
                    />
                    <button
                        disabled={!input.trim() || loading}
                        className="rounded-xl px-3 py-2 bg-cyan-400 text-black disabled:opacity-70 text-sm"
                    >
                        Enviar
                    </button>
                </div>
            </form>

        </div>
    );
}
