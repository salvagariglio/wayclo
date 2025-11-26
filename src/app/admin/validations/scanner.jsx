"use client";

import { useEffect, useState, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function Scanner() {
    const videoRef = useRef(null);
    const [guest, setGuest] = useState(null);
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const readerRef = useRef(null);

    useEffect(() => {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        let stream;

        const startScanner = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                reader.decodeFromVideoDevice(null, videoRef.current, async (result, err) => {
                    if (!result || isProcessing) return;

                    setIsProcessing(true);

                    try {
                        const text = result.getText();

                        let url;
                        try {
                            url = new URL(text.trim());
                        } catch {
                            setError("QR inválido.");
                            resetScanner(reader);
                            return;
                        }

                        const id = url.searchParams.get("id");
                        const token = url.searchParams.get("token");

                        if (!id || !token) {
                            setError("QR no contiene datos válidos.");
                            resetScanner(reader);
                            return;
                        }

                        const resp = await fetch("/api/admin/validations/check", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id, token }),
                        });

                        const json = await resp.json();

                        if (json.ok) {
                            setGuest(json.guest);
                        } else {
                            setError(json.error);
                        }

                        reader.reset();

                        setTimeout(() => {
                            setGuest(null);
                            setError(null);
                            setIsProcessing(false);
                            reader.decodeFromVideoDevice(null, videoRef.current, () => { });
                        }, 2200);

                    } catch (fatal) {
                        console.error("FATAL QR ERROR:", fatal);
                        setError("Error procesando el QR.");
                        resetScanner(reader);
                    }
                });

            } catch (e) {
                console.error("Camera error:", e);
                setError("No se pudo iniciar la cámara.");
            }
        };

        startScanner();

        return () => {
            try {
                reader.reset();
            } catch { }
            try {
                stream?.getTracks().forEach((t) => t.stop());
            } catch { }
        };
    }, []);

    function resetScanner(reader) {
        reader.reset();
        setTimeout(() => {
            setError(null);
            setIsProcessing(false);
            reader.decodeFromVideoDevice(null, videoRef.current, () => { });
        }, 2000);
    }

    return (
        <div className="p-4 max-w-xl mx-auto text-center">

            <video
                ref={videoRef}
                className="w-full max-w-md rounded-lg shadow-md"
                autoPlay
                muted
                playsInline
            />

            {error && (
                <div className="mt-4 bg-red-600 text-white p-3 rounded-lg">
                    {error}
                </div>
            )}

            {guest && (
                <div className="mt-4 bg-green-600 text-white p-4 rounded-lg">
                    <h3 className="text-lg font-bold">{guest.fullName}</h3>
                    <p>{guest.company}</p>
                    <p className="opacity-80">{guest.role}</p>
                    {guest.alreadyChecked && (
                        <p className="mt-2 text-black font-bold">⚠ Ya ingresó antes</p>
                    )}
                </div>
            )}
        </div>
    );
}