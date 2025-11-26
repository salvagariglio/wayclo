"use client";

import { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function Scanner() {
    const videoRef = useRef(null);
    const readerRef = useRef(null);

    const [error, setError] = useState(null);
    const [confirmData, setConfirmData] = useState(null);
    const [cooldown, setCooldown] = useState(false);

    useEffect(() => {
        let stream = null;
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        const startScanner = async () => {
            try {
                // 🔥 1) Pedir permisos explícitos ANTES de usar ZXing
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }

                // 🔥 2) Ahora listamos cámaras recién después del permiso
                const devices = await reader.listVideoInputDevices();

                if (!devices || devices.length === 0) {
                    setError("No se encontró cámara.");
                    return;
                }

                // 🔥 3) Decodificación continua
                reader.decodeFromVideoDevice(
                    devices[0].deviceId,
                    videoRef.current,
                    async (result) => {
                        if (!result || cooldown) return;

                        setCooldown(true);
                        setTimeout(() => setCooldown(false), 1500);

                        const text = result.getText();
                        let id, token;

                        try {
                            const url = new URL(text);
                            id = url.searchParams.get("id");
                            token = url.searchParams.get("token");
                        } catch {
                            setError("QR inválido");
                            return;
                        }

                        const res = await fetch("/api/admin/validations/check", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id, token }),
                        });

                        const json = await res.json();

                        if (json.ok) {
                            setConfirmData(json.guest);
                            setError(null);
                        } else {
                            setConfirmData(null);
                            setError(json.error);
                        }
                    }
                );
            } catch (err) {
                console.error("Scanner error:", err);
                setError("No se pudo iniciar el escáner");
            }
        };

        startScanner();

        return () => {
            try {
                readerRef.current?.stopContinuousDecode?.();
                readerRef.current?.reset?.();
                if (stream) stream.getTracks().forEach(t => t.stop());
            } catch { }
        };
    }, [cooldown]);

    const confirmarIngreso = async () => {
        const res = await fetch("/api/admin/validations/checkin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: confirmData.id }),
        });

        const json = await res.json();

        if (json.ok) {
            setConfirmData(null);
            setError(null);
        } else {
            setError(json.error);
        }
    };

    return (
        <div className="p-4 max-w-xl mx-auto text-center">

            <video
                ref={videoRef}
                className="w-full max-w-md rounded-lg shadow bg-black"
                muted
                playsInline
            />

            {error && <p className="mt-4 text-red-400">{error}</p>}

            {confirmData && (
                <div className="mt-6 bg-white p-4 rounded-lg shadow text-black">
                    <h3 className="text-lg font-bold">{confirmData.fullName}</h3>
                    <p>{confirmData.company}</p>
                    <p className="opacity-70">{confirmData.role}</p>

                    {confirmData.alreadyChecked && (
                        <p className="text-red-500 mt-2">
                            ⚠ Ya había ingresado antes
                        </p>
                    )}

                    <button
                        onClick={confirmIngreso}
                        className="mt-4 px-6 py-2 bg-green-600 text-white rounded"
                    >
                        Registrar ingreso
                    </button>
                </div>
            )}
        </div>
    );
}
