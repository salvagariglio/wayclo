"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function Scanner() {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const [guest, setGuest] = useState(null);
    const [error, setError] = useState(null);
    const [scannerRunning, setScannerRunning] = useState(false);

    useEffect(() => {
        let stream;
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" }
                });

                const video = videoRef.current;
                video.srcObject = stream;

                await new Promise((resolve) => {
                    video.onloadedmetadata = resolve;
                });

                await video.play();
            } catch (e) {
                console.error(e);
                setError("No se pudo iniciar la cámara");
            }
        };

        const startScanner = async () => {
            if (!videoRef.current) return;

            setScannerRunning(true);

            reader.decodeFromVideoDevice(
                null,
                videoRef.current,
                async (result, err) => {
                    if (!scannerRunning || guest) return;
                    if (!result) return;

                    try {
                        const raw = result.getText();
                        const url = new URL(raw.trim());
                        const id = url.searchParams.get("id");
                        const token = url.searchParams.get("token");

                        if (!id || !token) {
                            setError("QR inválido");
                            return;
                        }

                        // PAUSAR ESCANEO
                        reader.reset();
                        setScannerRunning(false);

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

                        setGuest(json.guest);
                        setError(null);

                    } catch (e) {
                        console.error(e);
                        setError("QR inválido");
                    }
                }
            );
        };

        const init = async () => {
            await startCamera();
            startScanner();
        };

        init();

        return () => {
            try { reader.reset(); } catch { }
            try { stream?.getTracks()?.forEach((t) => t.stop()); } catch { }
        };
    }, [scannerRunning, guest]);

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

    const continuar = () => {
        setGuest(null);
        setError(null);
        setScannerRunning(true);

        // Reanudar escaneo
        try {
            readerRef.current.decodeFromVideoDevice(
                null,
                videoRef.current,
                () => { }
            );
        } catch { }
    };

    return (
        <div className="relative flex flex-col items-center">

            <video
                ref={videoRef}
                className="w-full max-w-sm rounded-md bg-black"
                autoPlay
                playsInline
                muted
            />

            {!guest && error && (
                <p className="text-red-400 mt-4">{error}</p>
            )}

            {guest && (
                <div className="
                    fixed inset-0 bg-black/60 backdrop-blur-sm
                    flex items-center justify-center z-50
                ">
                    <div className="bg-white text-black p-6 rounded-xl w-full max-w-sm shadow-xl">

                        <h3 className="text-xl font-bold">{guest.fullName}</h3>
                        <p className="opacity-70">{guest.company}</p>
                        <p className="opacity-70">{guest.role}</p>

                        {guest.alreadyChecked && (
                            <p className="mt-3 text-red-600">
                                ⚠ Ya había ingresado antes
                            </p>
                        )}

                        {!guest.checkin && (
                            <button
                                onClick={confirmarIngreso}
                                className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg"
                            >
                                Registrar ingreso
                            </button>
                        )}

                        {guest.checkin && (
                            <button
                                onClick={continuar}
                                className="mt-6 w-full bg-cyan-600 text-white py-2 rounded-lg"
                            >
                                Continuar escaneando
                            </button>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
