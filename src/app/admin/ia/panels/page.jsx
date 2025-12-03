"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    RotateCcw,
    LockKeyhole,
    Download,
    Edit,
    Volume2,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ──────────────────────────────
   MODAL ESTILIZADO + FUNCIONAL
────────────────────────────── */
function Modal({ open, onClose, title, children, onSave }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Contenido */}
            <div
                className="
          relative bg-[#0a1a2a]/95 text-white 
          border border-white/10 rounded-2xl 
          w-full max-w-3xl p-6 shadow-2xl 
          max-h-[90vh] overflow-y-auto
          animate-[scaleIn_.25s_ease-out]
        "
            >
                <h2 className="text-2xl font-bold text-cyan-300 mb-4">{title}</h2>

                <div className="space-y-4">{children}</div>

                {/* Footer */}
                <div
                    className="
            flex justify-end gap-3 mt-6 
            border-t border-white/10 pt-4
            sticky bottom-0 bg-[#0a1a2a]/95
          "
                >
                    <button
                        onClick={onClose}
                        className="
              px-5 py-2 rounded-lg bg-white/10 
              border border-white/20 hover:bg-white/20 transition
            "
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={onSave}
                        className="
              px-5 py-2 rounded-lg bg-cyan-400 text-black font-bold 
              hover:bg-cyan-300 transition
            "
                    >
                        Guardar cambios
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminPanelsPage() {
    const [auth, setAuth] = useState("checking");
    const [file, setFile] = useState(null);
    const [panelName, setPanelName] = useState("");
    const [loading, setLoading] = useState(false);
    const [panels, setPanels] = useState([]);

    const router = useRouter();

    /* ──────────────────────────────
       🔐 Verificar sesión
    ─────────────────────────────── */
    useEffect(() => {
        (async () => {
            const res = await fetch("/api/admin/session");
            if (!res.ok) setAuth("unauth");
            else setAuth("ok");
        })();
    }, []);

    useEffect(() => {
        if (auth === "unauth") router.push("/admin/login");
    }, [auth, router]);

    /* ──────────────────────────────
       🔄 Cargar paneles
    ─────────────────────────────── */
    async function fetchPanels() {
        const res = await fetch("/api/admin/ia/panels/list", { cache: "no-store" });
        const data = await res.json();
        if (data.success) setPanels(data.panels);
    }

    useEffect(() => {
        if (auth === "ok") fetchPanels();
    }, [auth]);

    /* ──────────────────────────────
       🟦 Subida y procesamiento
    ─────────────────────────────── */
    async function handleUpload() {
        if (!file) return alert("Subí un archivo MP3/MP4/OGG");
        if (!panelName.trim()) return alert("Ingresá un nombre");

        setLoading(true);
        const fd = new FormData();
        fd.append("audio", file);
        fd.append("panelName", panelName);

        const res = await fetch("/api/admin/ia/panels/process", {
            method: "POST",
            body: fd,
        });

        const data = await res.json();
        setLoading(false);

        if (!data.success) return alert("Error: " + data.error);

        alert("Panel procesado!");
        setFile(null);
        setPanelName("");
        fetchPanels();
    }

    /* ──────────────────────────────
       LOADING DE AUTH
    ─────────────────────────────── */
    if (auth === "checking") {
        return (
            <div className="min-h-[40vh] flex items-center justify-center text-white/80">
                <RotateCcw className="animate-spin mr-2" size={20} />
                Verificando...
            </div>
        );
    }

    return (
        <>
            {/* HEADER original de Panels */}
            <section className="mb-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-5 flex items-center gap-4">
                    <LockKeyhole size={22} className="text-cyan-400" />
                    <div>
                        <h1 className="text-2xl font-semibold">Procesador de Charlas</h1>
                        <p className="text-white/60 text-sm">
                            Subí audios y generá reportes automáticos.
                        </p>
                    </div>
                </div>
            </section>

            {/* FORM */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-xl mb-12">
                <h2 className="text-xl font-semibold mb-4">Subir audio del panel</h2>

                <input
                    type="text"
                    value={panelName}
                    placeholder="Nombre del panel"
                    onChange={(e) => setPanelName(e.target.value)}
                    className="w-full p-3 rounded-md text-black mb-3"
                />

                <input
                    type="file"
                    accept="audio/*,video/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full mb-4"
                />

                <Button
                    onClick={handleUpload}
                    disabled={loading}
                    className="bg-white text-black font-bold px-5 py-3 rounded-lg"
                >
                    {loading ? "Procesando..." : "Subir y procesar"}
                </Button>
            </div>

            {/* LISTADO */}
            <h2 className="text-2xl font-bold mb-4">Charlas procesadas</h2>

            {panels.length === 0 && (
                <p className="text-white/60">Todavía no se procesaron charlas.</p>
            )}

            <div className="flex flex-col gap-10">
                {panels.map((panel) => (
                    <PanelCard key={panel.id} panel={panel} refresh={fetchPanels} />
                ))}
            </div>
        </>
    );
}

/* ───────────────────────────────────────────
   TARJETA DE PANEL + acordiones + modales
──────────────────────────────────────────── */
function PanelCard({ panel, refresh }) {
    const [openSections, setOpenSections] = useState({
        summary: false,
        transcript: false,
        audio: false,
    });

    const toggle = (key) => {
        setOpenSections((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const [editTranscriptOpen, setEditTranscriptOpen] = useState(false);
    const [editSummaryOpen, setEditSummaryOpen] = useState(false);

    const [editTranscript, setEditTranscript] = useState(panel.transcript_clean);
    const [editSummary, setEditSummary] = useState(panel.summary);

    async function saveTranscript() {
        await fetch("/api/admin/ia/panels/update", {
            method: "POST",
            body: JSON.stringify({
                id: panel.id,
                transcript_clean: editTranscript,
            }),
        });
        await refresh();
        setEditTranscriptOpen(false);
    }

    async function saveSummary() {
        await fetch("/api/admin/ia/panels/update", {
            method: "POST",
            body: JSON.stringify({
                id: panel.id,
                summary: editSummary,
            }),
        });
        await refresh();
        setEditSummaryOpen(false);
    }

    return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-1">{panel.panel_name}</h3>
            <p className="text-white/50 text-sm mb-6">
                {new Date(panel.created_at).toLocaleString()}
            </p>

            {/* BOTONES DE DESCARGA */}
            <div className="flex flex-wrap gap-3 mb-4">
                <DownloadBtn path={panel.docx_full_path} label="Reporte Completo" />
                <DownloadBtn path={panel.txt_transcript_path} label="Transcripción" />
                <DownloadBtn path={panel.txt_summary_path} label="Resumen" />
            </div>

            {/* ACCIONES */}
            <div className="flex flex-wrap gap-3 mb-6">
                <button
                    onClick={() => toggle("audio")}
                    className="bg-white/10 border border-white/20 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/20"
                >
                    <Volume2 size={18} /> Escuchar audio
                </button>

                <button
                    onClick={() => setEditTranscriptOpen(true)}
                    className="bg-white/10 border border-white/20 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/20"
                >
                    <Edit size={18} /> Editar transcripción
                </button>

                <button
                    onClick={() => setEditSummaryOpen(true)}
                    className="bg-white/10 border border-white/20 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/20"
                >
                    <Edit size={18} /> Editar contenido IA
                </button>
            </div>

            {/* ACORDEONES */}
            <Accordion
                title="Resumen del panel"
                open={openSections.summary}
                onToggle={() => toggle("summary")}
            >
                <p className="whitespace-pre-line text-white/90">{panel.summary}</p>
            </Accordion>

            <Accordion
                title="Transcripción completa"
                open={openSections.transcript}
                onToggle={() => toggle("transcript")}
            >
                <div className="max-h-[300px] overflow-y-auto whitespace-pre-line bg-black/20 p-4 rounded-md border border-white/10 text-white/80">
                    {panel.transcript_clean}
                </div>
            </Accordion>

            <Accordion
                title="Audio original"
                open={openSections.audio}
                onToggle={() => toggle("audio")}
            >
                <audio controls className="w-full mt-3">
                    <source src={panel.audio_url} />
                </audio>
            </Accordion>

            {/* MODALES */}
            <Modal
                open={editTranscriptOpen}
                onClose={() => setEditTranscriptOpen(false)}
                title="Editar transcripción"
                onSave={saveTranscript}
            >
                <textarea
                    value={editTranscript}
                    onChange={(e) => setEditTranscript(e.target.value)}
                    className="w-full h-80 p-3 border rounded-md text-black"
                />
            </Modal>

            <Modal
                open={editSummaryOpen}
                onClose={() => setEditSummaryOpen(false)}
                title="Editar resumen / highlights / insights"
                onSave={saveSummary}
            >
                <textarea
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    className="w-full h-80 p-3 border rounded-md text-black"
                />
            </Modal>
        </div>
    );
}

/* ──────────────────────────────
   BOTÓN DE DESCARGA
────────────────────────────── */
function DownloadBtn({ path, label }) {
    if (!path) return null;

    return (
        <a
            href={`/api/admin/ia/panels/download?path=${path}`}
            className="bg-white text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/90 transition"
        >
            <Download size={18} />
            {label}
        </a>
    );
}

/* ──────────────────────────────
   ACORDEÓN
────────────────────────────── */
function Accordion({ title, open, onToggle, children }) {
    return (
        <div className="mb-4 bg-white/5 border border-white/10 rounded-lg p-4">
            <button
                className="w-full flex items-center justify-between text-left"
                onClick={onToggle}
            >
                <h4 className="text-lg font-semibold">{title}</h4>
                {open ? <ChevronUp /> : <ChevronDown />}
            </button>

            {open && <div className="mt-3">{children}</div>}
        </div>
    );
}
