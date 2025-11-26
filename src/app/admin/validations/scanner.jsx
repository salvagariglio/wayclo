"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function Scanner() {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const [guest, setGuest] = useState(null);
    const [error, setError] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    // 👉 Iniciar cámara + reader
    useEffect(() => {
        const start = async () => {
            try {
                const reader = new BrowserMultiFormatReader();
                readerRef.current = reader;

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" }
                });

                const video = videoRef.current;
                video.srcObject = stream;

                await new Promise((resolve) => {
                    video.onloadedmetadata = resolve;
                });

                await video.play().catch(() => { });

                setIsScanning(true);

                reader.decodeFromVideoDevice(
                    undefined,
                    video,
                    async (result, err) => {
                        if (!result || !isScanning || guest) return;

                        try {
                            const text = result.getText();
                            const url = new URL(text);

                            const id = url.searchParams.get("id");
                            const token = url.searchParams.get("token");

                            if (!id || !token) {
                                setError("QR inválido");
                                return;
                            }

                            // 👉 Validar QR con backend
                            const resp = await fetch("/api/admin/validations/check", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id, token }),
                            });

                            const json = await resp.json();

                            if (!json.ok) {
                                setError(json.error);
                                return;
                            }

                            // Mostrar datos del invitado
                            setGuest(json.guest);
                            setError(null);

                            // Pausar escaneo para que no repita
                            try { reader.stopContinuousDecode(); } catch { }

                        } catch (e) {
                            setError("QR inválido");
                        }
                    }
                );
            } catch (e) {
                console.error(e);
                setError("No se pudo iniciar la cámara");
            }
        };

        start();

        return () => {
            try { readerRef.current?.stopContinuousDecode?.(); } catch { }
            try {
                videoRef.current?.srcObject?.getTracks()?.forEach((t) => t.stop());
            } catch { }
        };
    }, [isScanning, guest]);

    // 👉 Confirmar ingreso
    const confirmarIngreso = async () => {
        const resp = await fetch("/api/admin/validations/checkin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: guest.id }),
        });

        const json = await resp.json();

        if (json.ok) {
            setGuest({ ...guest, checkin: true });
        } else {
            setError(json.error);
        }
    };

    // 👉 Volver a escanear
    const continuar = async () => {
        setGuest(null);
        setError(null);
        setIsScanning(true);

        try {
            readerRef.current?.decodeFromVideoDevice(
                undefined,
                videoRef.current,
                () => { }
            );
        } catch { }
    };

    return (
        <div className="flex flex-col items-center gap-4">

            {/* VIDEO */}
            <video
                ref={videoRef}
                className="w-full max-w-sm rounded-md bg-black"
                autoPlay
                playsInline
                muted
            />

            {error && (
                <p className="text-red-400 text-center mt-2">{error}</p>
            )}

            {guest && (
                <div className="mt-4 bg-white text-black p-4 rounded-lg shadow-lg w-full max-w-sm">
                    <h3 className="text-xl font-bold">{guest.fullName}</h3>
                    <p className="opacity-70">{guest.company}</p>
                    <p className="opacity-70">{guest.role}</p>

                    {guest.alreadyChecked && (
                        <p className="mt-2 text-red-600">
                            ⚠ Ya había ingresado antes
                        </p>
                    )}

                    {!guest.checkin && (
                        <button
                            onClick={confirmarIngreso}
                            className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg"
                        >
                            Registrar ingreso
                        </button>
                    )}

                    {guest.checkin && (
                        <button
                            onClick={continuar}
                            className="mt-4 w-full bg-cyan-600 text-white py-2 rounded-lg"
                        >
                            Continuar escaneando
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
