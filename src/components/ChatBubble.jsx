"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Requiere: /public/logo.png
 */

const PRIMARY = "#FC9C86";
const BG_DARK = "#0f0f10";
const BUBBLE_USER = "#FAA896";
const BUBBLE_BOT = "#1a1b1d";

// --- Helpers de validación ---

// Palabras comunes que NO deberían aparecer en un nombre (ES/EN)
const STOPWORDS = new Set([
    "como", "cómo", "que", "qué", "cuando", "cuándo", "donde", "dónde", "por", "porque", "porqué", "por que",
    "son", "las", "los", "de", "del", "la", "el", "una", "un", "sobre", "politica", "políticas", "politicas",
    "pregunta", "consulta", "registro", "alta", "cancelacion", "cancelaciones", "pago", "pagos",
    "how", "what", "when", "where", "why", "can", "do", "does", "is", "are", "please", "help"
]);
const PROFANITY = [
    "puta", "puto", "mierda", "cag", "hdp", "forro", "pelotudo", "boludo", "pajero", "carajo", "fuck", "shit", "asshole", "bitch"
];
// 2+ palabras con solo letras (y acentos), opcionalmente con guion o apóstrofe
const NAME_TOKEN_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[-'][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)?$/;

function isProfane(text = "") {
    const t = text.toLowerCase();
    return PROFANITY.some(p => t.includes(p));
}
// Validador NUEVO (mejor) de nombre y apellido
function isLikelyFullName(input = "") {
    if (!input) return false;
    const txt = input.trim();

    // Demasiado largo/corto para un nombre razonable
    if (txt.length < 5 || txt.length > 60) return false;

    // Si arranca como pregunta, no es un nombre
    const starts = txt.toLowerCase();
    const interrogativos = ["como", "cómo", "que", "qué", "cuando", "cuándo", "donde", "dónde", "por qué", "por que"];
    if (interrogativos.some(s => starts.startsWith(s))) return false;

    // Sin dígitos, @ o +
    if (/[0-9@+]/.test(txt)) return false;

    // 2–4 tokens “nombre” válidos
    const tokens = txt.split(/\s+/).filter(Boolean);
    if (tokens.length < 2 || tokens.length > 4) return false;

    // tokens con solo letras (permitimos guion/apóstrofe) y sin stopwords puras
    for (const t of tokens) {
        if (!NAME_TOKEN_RE.test(t)) return false;
        if (STOPWORDS.has(t.toLowerCase())) return false;
    }

    // Evitar cadenas “demasiado genéricas” de texto
    const joined = tokens.join(" ").toLowerCase();
    if (joined.includes("politica") || joined.includes("política")) return false;

    // (opcional) exigir al menos una mayúscula inicial en algún token
    // if (!tokens.some(w => /^[A-ZÁÉÍÓÚÜÑ]/.test(w))) return false;

    return true;
}
function normalizePhoneAR(input = "") {
    if (!input) return null;
    const cleaned = input.replace(/[^\d+]/g, "");
    if (!cleaned.startsWith("+54")) return null;
    const digits = cleaned.replace(/\D/g, "");
    if (digits.length < 12 || digits.length > 13) return null;
    return "+" + digits;
}

// Heurística para saber si la respuesta “correlaciona” con el campo pedido
function correlatesToField(field, text = "") {
    const t = text.trim();
    if (!t) return false;
    if (t.length > 160) return false; // demasiado largo para ser un dato corto

    switch (field) {
        case "name":
            // Debe parecer “Nombre Apellido”, solo letras y espacios, mínimo 2 tokens
            return NAME_TOKEN_RE.test(t) && !isProfane(t) && !/[0-9@+]/.test(t);

        case "venue_name":
            // Palabras de letras/espacios, no teléfono, no email, no profano
            if (isProfane(t)) return false;
            if (t.includes("@") || /\+?\d/.test(t)) return false;
            // 1–6 palabras, cada una >=2 letras
            const tokens = t.split(/\s+/);
            return tokens.length >= 1 && tokens.length <= 6 && tokens.every(w => /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ.]{2,}$/.test(w));

        case "phone":
            // Debe poder normalizarse a +54…
            return !!normalizePhoneAR(t);

        case "category":
            // Suele ser 1–3 palabras cortas. Si es texto largo, suena a consulta.
            if (t.length > 40) return false;
            const words = t.split(/\s+/);
            return words.length <= 4 && /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s/,&-]+$/.test(t);

        default:
            return true;
    }
}

// Extrae campos si el usuario los manda “todos juntos”
function extractFields(text) {
    const out = {};
    const nameMatch = text.match(/(?:^|\b)nombre\s*[:\-]\s*([^\n,]+)/i);
    if (nameMatch) out.name = nameMatch[1].trim();

    const venueMatch = text.match(/(?:local|negocio|sal[oó]n|spa)\s*[:\-]\s*([^\n,]+)/i);
    if (venueMatch) out.venue_name = venueMatch[1].trim();

    const phoneMatch = text.match(/(\+?\d[\d\s\-().]{6,})/);
    if (phoneMatch) out.phone = phoneMatch[1].trim();

    const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    if (emailMatch) out.email = emailMatch[0].trim();

    const catMatch = text.match(/(?:categor[ií]a|rubro)\s*[:\-]\s*([^\n,]+)/i);
    if (catMatch) out.category = catMatch[1].trim();

    if (!out.question) {
        const qMatch = text.match(/(?:consulta|pregunta)\s*[:\-]\s*([^\n]+)/i);
        if (qMatch) out.question = qMatch[1].trim();
    }
    return out;
}

function missingField(d) {
    if (!d.name) return "name";
    if (!d.venue_name) return "venue_name";
    if (!d.phone) return "phone";
    if (!d.category) return "category";
    return null;
}

function nextQuestion(field) {
    switch (field) {
        case "name": return "¡Genial! ¿Cuál es tu nombre y apellido? (ej: “Carla Gómez”)";
        case "venue_name": return "¿Cuál es el nombre del local?";
        case "phone": return "¿Me pasás un número con característica de Argentina? (ej: “+54 9 351 123 4567”)";
        case "category": return "¿En qué categoría encaja tu local? (Ej.: Estética, Spa, Peluquería…)";
        default: return "¿Querés dejar también un email y una consulta breve? (opcional)";
    }
}
function askFor(field) {
    return {
        name: "¡Genial! ¿Cuál es tu nombre y apellido? (ej: “Carla Gómez”)",
        venue_name: "¿Cuál es el nombre del local?",
        phone: "¿Me pasás un número con característica de Argentina? (ej: “+54 9 351 123 4567”)",
        category: "¿En qué categoría encaja tu local? (Ej.: Estética, Spa, Peluquería…)",
    }[field];
}


export default function ChatBubble() {
    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);
    const panelRef = useRef(null);

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        const onClick = (e) => {
            if (!open) return;
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target) &&
                btnRef.current &&
                !btnRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onClick);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onClick);
        };
    }, [open]);

    return (
        <div className="fixed bottom-5 right-5 z-50">
            <button
                ref={btnRef}
                aria-label={open ? "Cerrar chat" : "Abrir chat"}
                onClick={() => setOpen((v) => !v)}
                className="relative md:h-20 h-14 md:w-20 w-14 rounded-full shadow-xl border transition-transform hover:scale-105 focus:outline-none focus:ring-2"
                style={{
                    background: PRIMARY,
                    borderColor: "rgba(255,255,255,0.15)",
                    boxShadow:
                        "0 10px 30px rgba(244,125,109,0.35), inset 0 0 0 1px rgba(255,255,255,0.15)",
                }}
            >
                <img src="/logo.png" alt="Aesthetic" className="h-8 md:h-11 w-8 md:w-11 mx-auto" />
            </button>

            <div
                aria-hidden={!open}
                className={`pointer-events-none ${open ? "opacity-100" : "opacity-0"} transition-opacity duration-200`}
            >
                <div
                    ref={panelRef}
                    role="dialog"
                    aria-modal="true"
                    className={`pointer-events-auto absolute bottom-20 right-0 w-[24rem] max-w-[calc(100vw-2rem)]
                      overflow-hidden rounded-2xl border shadow-2xl transition-all duration-300
                      ${open ? "translate-y-0 scale-100" : "translate-y-2 scale-95"}`}
                    style={{
                        borderColor: "rgba(255,255,255,0.08)",
                        background:
                            "radial-gradient(120% 120% at 10% 0%, rgba(255,255,255,0.04), transparent 60%)",
                        backdropFilter: "blur(8px)",
                        backgroundColor: BG_DARK,
                    }}
                >
                    <ChatPanel />
                </div>
            </div>
        </div>
    );
}

function ChatPanel() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "¡Hola! Soy Aesthetic ✨ Te ayudo con registro de locales, pagos (Mercado Pago), políticas de cancelación y para agendar una llamada. ¿Qué necesitás?",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);

    const [leadMode, setLeadMode] = useState(false);
    const [currentField, setCurrentField] = useState(null); // "name" | "venue_name" | "phone" | "category"
    const [leadData, setLeadData] = useState({
        name: "", venue_name: "", phone: "", email: "", category: "", question: "", language: "es",
    });

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function submitLead(finalData) {
        const r = await fetch("/api/lead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(finalData),
        });
        const json = await r.json().catch(() => ({}));
        return json?.ok;
    }

    // Responde con /api/chat en streaming y NO toca leadData ni avanza de campo
    // Responde con /api/chat en streaming pasando "hint" del paso actual
    async function streamAnswerWithHint(userMessage, hint) {
        let assistantIndex = -1;
        setLoading(true);
        setMessages(prev => {
            const idx = prev.length;
            assistantIndex = idx;
            return [...prev, { role: "assistant", content: "" }];
        });

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMessage], hint }),
            });
            if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                setMessages(prev => {
                    const copy = [...prev];
                    const prevContent = copy[assistantIndex]?.content ?? "";
                    copy[assistantIndex] = { role: "assistant", content: prevContent + chunk };
                    return copy;
                });
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [
                ...prev,
                { role: "assistant", content: "Perdón, hubo un error al responder." },
            ]);
        } finally {
            setLoading(false);
        }
    }
    function buildLeadHint(field, answer, leadData) {
        const base = `Estás en un flujo de registro por pasos. Campo esperado ahora: ${field}.
Datos recolectados hasta ahora (JSON): ${JSON.stringify(leadData, null, 2)}
Entrada del usuario: "${answer}"

Instrucciones (ESTRICTAS):
1) Responde a lo que el usuario escribió (si es pregunta, respóndela claramente).
2) NO cambies de paso por tu cuenta. NO pidas campos distintos al actual.
3) Si la entrada NO cumple el campo esperado, tras responder repregunta el MISMO campo con un ejemplo concreto.
4) Si la entrada SÍ cumple el campo esperado, confirma en 1 línea y pide SOLO el SIGUIENTE campo (uno por vez).
5) Mantén 80–140 palabras y termina con 1 pregunta útil.`;

        let tips = "";
        if (field === "name") {
            tips = `
Validación esperada: "Nombre Apellido", solo letras y espacios, mínimo 2 palabras. No aceptar insultos.
Ejemplo correcto: "Carla Gómez".
No aceptes frases genéricas ni preguntas (ej.: "como son las politicas") como nombre.
Si es incorrecto: "Decime tu nombre y apellido (ej.: Carla Gómez)".`;
        } else if (field === "phone") {
            tips = `
Validación esperada: Teléfono argentino en formato +54... Acepta espacios/guiones pero normaliza a E.164.
Ejemplo correcto: "+54 9 351 123 4567".
Si es incorrecto: "Pasame un número con +54 (ej.: +54 9 351 123 4567)".`;
        } else if (field === "venue_name") {
            tips = `
Validación esperada: nombre de local (texto corto), sin insultos, no email/teléfono.
Ejemplos: "Spa Relax", "MK Estética".`;
        } else if (field === "category") {
            tips = `
Validación esperada: categoría breve (p.ej., Estética, Spa, Peluquería).`;
        }
        return base + "\n" + tips;
    }

    async function sendMessage(e) {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: "user", content: input.trim() };
        setMessages((prev) => [...prev, userMessage]);

        const lower = input.trim().toLowerCase();

        // ✅ INICIO REGISTRO
        if (!leadMode && (lower.includes("registrar") || lower.includes("registro") || lower.includes("alta"))) {
            setLeadMode(true);
            setInput("");
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "¡Perfecto! Te ayudo con el registro 😊" },
            ]);

            // Intentar extraer “todo junto”
            const found = extractFields(userMessage.content);
            const merged = { ...leadData, ...found };

            if (merged.name && !isLikelyFullName(merged.name)) {
                merged.name = "";
                setMessages((prev) => [...prev,
                { role: "assistant", content: "Necesito **nombre y apellido**, solo letras (ej: “Carla Gómez”). ¿Cómo te llamás?" }
                ]);
            }
            if (merged.venue_name && isProfane(merged.venue_name)) {
                merged.venue_name = "";
                setMessages((prev) => [...prev,
                { role: "assistant", content: "El nombre del local no parece válido. ¿Me pasás el nombre correcto?" }
                ]);
            }
            if (merged.phone) {
                const norm = normalizePhoneAR(merged.phone);
                if (!norm) {
                    merged.phone = "";
                    setMessages((prev) => [...prev,
                    { role: "assistant", content: "El teléfono debe ser de **Argentina** y empezar con **+54** (ej: “+54 9 351 123 4567”). ¿Me lo confirmás?" }
                    ]);
                } else {
                    merged.phone = norm;
                }
            }

            setLeadData(merged);
            const first = missingField(merged) || "name";
            setCurrentField(first);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: askFor(first) },
            ]);
            return;

        }

        // 🔄 MODO REGISTRO (SIEMPRE IA) con bloqueo por currentField
        if (leadMode) {
            // usamos el paso actual del estado (no recalcular con missingField)
            let field = currentField;
            if (!field) {
                field = missingField(leadData) || "name";
                setCurrentField(field);
            }

            const answer = input.trim();
            setInput("");

            // 1) Enviar SIEMPRE a la IA con hint del paso actual
            const hint = buildLeadHint(field, answer, leadData);
            await streamAnswerWithHint({ role: "user", content: answer }, hint);

            // 2) Validación local del CAMPO ACTUAL
            let updated = { ...leadData };
            let ok = false;

            if (field === "name") {
                if (isLikelyFullName(answer) && !isProfane(answer)) {
                    updated.name = answer;
                    ok = true;
                }
            } else if (field === "venue_name") {
                if (!isProfane(answer) && !answer.includes("@") && !/\+?\d/.test(answer)) {
                    updated.venue_name = answer;
                    ok = true;
                }
            } else if (field === "phone") {
                const norm = normalizePhoneAR(answer);
                if (norm) {
                    updated.phone = norm;
                    ok = true;
                }
            } else if (field === "category") {
                if (/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s/,&-]{2,40}$/.test(answer)) {
                    updated.category = answer.trim();
                    ok = true;
                }
            }

            // 3) Si NO valida, NO avanzamos. Repreguntamos el MISMO campo.
            if (!ok) {
                setMessages(prev => [...prev, { role: "assistant", content: askFor(field) }]);
                return;
            }

            // 4) Si valida, guardar y avanzar al siguiente campo del orden fijo
            setLeadData(updated);
            const order = ["name", "venue_name", "phone", "category"];
            const idx = order.indexOf(field);
            const next = order[idx + 1];

            if (next) {
                setCurrentField(next);
                setMessages(prev => [...prev, { role: "assistant", content: askFor(next) }]);
                return;
            }

            // 5) Si ya están los obligatorios, enviamos el lead
            const okSend = await submitLead(updated);
            if (okSend) {
                setMessages(prev => [
                    ...prev,
                    { role: "assistant", content: "¡Listo! 🙌 Registré tu solicitud. Te vamos a contactar a ese teléfono/email. ¿Querés agendar una llamada para mañana?" },
                ]);
            } else {
                setMessages(prev => [
                    ...prev,
                    { role: "assistant", content: "No pude enviar el registro ahora mismo. ¿Probamos de nuevo en un minuto o preferís que lo cargue manualmente?" },
                ]);
            }
            setLeadMode(false);
            setCurrentField(null);
            return;
        }



        // 🤖 MODO NORMAL (RAG/IA)
        setInput("");
        setLoading(true);

        let assistantIndex = -1;
        setMessages((prev) => {
            const idx = prev.length;
            assistantIndex = idx;
            return [...prev, { role: "assistant", content: "" }];
        });

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMessage] }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            if (!res.body) throw new Error("No stream body");

            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });

                setMessages((prev) => {
                    const copy = [...prev];
                    if (assistantIndex >= 0 && assistantIndex < copy.length) {
                        const prevContent = copy[assistantIndex]?.content ?? "";
                        copy[assistantIndex] = {
                            role: "assistant",
                            content: prevContent + chunk,
                        };
                    }
                    return copy;
                });
            }
        } catch (err) {
            console.error(err);
            setMessages((prev) => {
                const copy = [...prev];
                if (assistantIndex >= 0 && assistantIndex < copy.length) {
                    const prevContent = copy[assistantIndex]?.content ?? "";
                    copy[assistantIndex] = {
                        role: "assistant",
                        content: prevContent + "\n\nLo siento, hubo un error. Probá de nuevo 💛",
                    };
                } else {
                    copy.push({
                        role: "assistant",
                        content: "Lo siento, hubo un error. Probá de nuevo 💛",
                    });
                }
                return copy;
            });
        } finally {
            setLoading(false);
        }
    }

    const quicks = [
        "Quiero registrar mi local",
        "Agendar llamada",
    ];

    return (
        <>
            {/* Header */}
            <div
                className="px-4 py-3"
                style={{
                    background:
                        "linear-gradient(90deg, rgba(244,125,109,0.2), rgba(244,125,109,0.05) 45%, transparent)",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    color: "white",
                }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="h-8 w-8 rounded-xl flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                    >
                        <img src="/logo.png" alt="Aesthetic" className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold leading-none">Aesthetic — Asistente</h3>
                        <p className="text-xs text-white/70">Soporte y ventas • ES/EN</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="max-h-80 min-h-80 overflow-y-auto p-3 space-y-3 chat-scroll" style={{ color: "white" }}>
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                            className="max-w-[80%] rounded-2xl px-3 py-2 shadow-sm whitespace-pre-wrap"
                            style={{
                                backgroundColor: m.role === "user" ? BUBBLE_USER : BUBBLE_BOT,
                                color: m.role === "user" ? "white" : "rgba(255,255,255,0.92)",
                                border: "1px solid rgba(255,255,255,0.06)",
                            }}
                        >
                            {m.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-center gap-2 text-white/70 text-xs pl-1">
                        <span className="inline-flex gap-1">
                            <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:-0.2s]" />
                            <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                        </span>
                        escribiendo…
                    </div>
                )}
                <div ref={endRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="flex items-center gap-2">
                    <input
                        className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
                        placeholder="Charlemos…"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        style={{
                            backgroundColor: "#121315",
                            color: "white",
                            border: "1px solid rgba(255,255,255,0.10)",
                            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
                        }}
                    />
                    <button
                        disabled={!input.trim() || loading}
                        className="rounded-xl text-sm px-3 py-2 transition"
                        style={{
                            backgroundColor: PRIMARY,
                            color: "white",
                            opacity: !input.trim() || loading ? 0.6 : 1,
                        }}
                    >
                        Enviar
                    </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                    {quicks.map((q) => (
                        <button
                            type="button"
                            key={q}
                            onClick={() => setInput(q)}
                            className="text-[11px] px-2 py-1 rounded-full transition"
                            style={{
                                border: "1px solid rgba(255,255,255,0.10)",
                                color: "rgba(255,255,255,0.92)",
                                backgroundColor: "#121315",
                            }}
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </form>
        </>
    );
}
