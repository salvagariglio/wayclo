"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function Scanner() {
    const videoRef = useRef(null);
    const codeReaderRef = useRef(null);
    const streamRef = useRef(null);

    const [guest, setGuest] = useState(null);
    const [error, setError] = useState(null);
    const [info, setInfo] = useState(null);

    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();
        codeReaderRef.current = codeReader;

        let cancelled = false;

        const startScanner = async () => {
            try {
                // 1) Obtener cámara
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" }
                });

                streamRef.current = stream;

                const video = videoRef.current;
                if (!video) return;

                // 2) Asignar stream
                video.srcObject = stream;

                // 3) Esperar a que el video cargue ANTES de play()
                await new Promise((resolve) => {
                    video.onloadedmetadata = () => resolve();
                });

                await video.play().catch(() => { });

                // 4) Iniciar decodificación SOLO cuando video está listo
                codeReader.decodeFromVideoDevice(
                    undefined,
                    video,
                    async (result) => {
                        if (!result || cancelled) return;
                        if (guest) return;

                        try {
                            const text = result.getText();
                            const url = new URL(text);
                            const id = url.searchParams.get("id");
                            const token = url.searchParams.get("token");

                            const resp = await fetch("/api/admin/validations/check", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id, token }),
                            });

                            const json = await resp.json();

                            if (!json.ok) {
                                setError(json.error || "QR inválido");
                                setGuest(null);
                                setInfo(null);
                                return;
                            }

                            setGuest(json.guest);
                            setError(null);
                            setInfo(null);

                            try { codeReader.stopContinuousDecode(); } catch { }
                        } catch {
                            setError("QR inválido");
                        }
                    }
                );

            } catch (e) {
                console.error(e);
                setError("No se pudo iniciar la cámara");
            }
        };

        startScanner();

        // Limpieza
        return () => {
            cancelled = true;
            try { codeReader.stopContinuousDecode?.(); } catch { }
            try {
                streamRef.current?.getTracks()?.forEach((t) => t.stop());
            } catch { }
        };
    }, [guest]);

    return (
        <div className="flex flex-col items-center gap-4">
            <video
                ref={videoRef}
                className="w-full max-w-sm rounded-lg shadow-md bg-black"
                autoPlay
                muted
                playsInline
            />
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
}
