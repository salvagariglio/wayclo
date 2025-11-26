"use client";

import { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function Scanner() {
    const videoRef = useRef(null);
    const [reader, setReader] = useState(null);
    const [stream, setStream] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [guest, setGuest] = useState(null);
    const [error, setError] = useState(null);

    // Inicializar scanner
    useEffect(() => {
        const r = new BrowserMultiFormatReader();
        setReader(r);
        startScanner(r);

        return () => {
            stopScanner(r);
        };
    }, []);

    const stopScanner = async (r = reader) => {
        try {
            r?.reset();
        } catch { }
        try {
            stream?.getTracks()?.forEach((t) => t.stop());
        } catch { }
    };

    const startScanner = async (r = reader) => {
        if (!r) return;

        try {
            // Solicitar cámara
            const s = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });

            setStream(s);
            videoRef.current.srcObject = s;

            // Comenzar decodificación
            await r.decodeFromVideoDevice(
                null,
                videoRef.current,
                async (result, err) => {
                    if (!result || isProcessing) return;

                    setIsProcessing(true);

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

                        if (json.ok) {
                            setGuest(json.guest);
                            setError(null);
                        } else {
                            setGuest(null);
                            setError(json.error);
                        }

                        // Pausar el scanner TEMPORALMENTE
                        stopScanner(r);

                        // Reiniciar luego de mostrar datos
                        setTimeout(() => {
                            setGuest(null);
                            setError(null);
                            setIsProcessing(false);
                            startScanner(r);
                        }, 2000);
                    } catch (e) {
                        setError("QR inválido");
                        setIsProcessing(false);
                    }
                }
            );
        } catch (e) {
            setError("No se pudo iniciar la cámara");
        }
    };

    const confirmarIngreso = async () => {
        const res = await fetch("/api/admin/validations/checkin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: guest.id }),
        });

        const json = await res.json();

        if (json.ok) {
            setError(null);
            setGuest({
                ...guest,
                alreadyChecked: true,
                checkInTime: json.check_in_at,
            });
        } else {
            setError(json.error);
        }
    };

    return (
        <div className="p-4 max-w-lg mx-auto text-center">
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full max-w-md rounded-lg shadow"
            />

            {error && (
                <p className="mt-4 text-red-500 font-semibold">{error}</p>
            )}

            {guest && (
                <div className="mt-5 bg-white text-black p-4 rounded-lg shadow">
                    <h3 className="text-lg font-bold">{guest.fullName}</h3>
                    <p>{guest.company}</p>
                    <p className="opacity-70">{guest.role}</p>

                    {guest.alreadyChecked && (
                        <p className="text-red-600 mt-2">
                            ⚠ Ya había ingresado antes
                        </p>
                    )}

                    <button
                        onClick={confirmIngreso}
                        className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md"
                    >
                        Registrar ingreso
                    </button>
                </div>
            )}
        </div>
    );
}
