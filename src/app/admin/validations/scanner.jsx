"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

export default function Scanner() {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const [scanResult, setScanResult] = useState(null);
    const [confirmData, setConfirmData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        async function start() {
            try {
                const devices = await reader.listVideoInputDevices();

                if (!devices.length) {
                    console.error("No cameras detected");
                    return;
                }

                const deviceId = devices[0].deviceId;

                await reader.decodeFromVideoDevice(
                    deviceId,
                    videoRef.current,
                    (result) => {
                        if (result) {
                            reader.reset();
                            handleDetected(result.getText());
                        }
                    }
                );
            } catch (err) {
                console.error("Scanner error:", err);
            }
        }

        start();

        return () => {
            try {
                readerRef.current?.reset?.();
            } catch (e) {
                console.warn("Cleanup scanner failed:", e);
            }
        };
    }, []);

    // cuando detecta un QR
    async function handleDetected(text) {
        try {
            const url = new URL(text);
            const token = url.searchParams.get("token");

            if (!token) {
                setScanResult({ ok: false, error: "QR inválido" });
                return;
            }

            // mostrar datos para confirmar
            const res = await fetch("/api/admin/validate-qr", {
                method: "POST",
                body: JSON.stringify({ qr_token: token }),
            });

            const json = await res.json();
            setConfirmData(json);
        } catch (e) {
            console.error(e);
            setScanResult({ ok: false, error: "Error procesando QR" });
        }
    }

    // confirmar entrada manualmente
    async function confirmarIngreso() {
        setLoading(true);

        const res = await fetch("/api/admin/validate-qr", {
            method: "POST",
            body: JSON.stringify({ qr_token: confirmData.qr_token }),
        });

        const json = await res.json();
        setScanResult(json);
        setConfirmData(null);
        setLoading(false);
    }

    return (
        <div className="text-white">

            {/* Cámara */}
            <div className="flex justify-center mb-4">
                <video
                    ref={videoRef}
                    style={{
                        width: "320px",
                        height: "auto",
                        borderRadius: "12px",
                        border: "2px solid #0ea5e9",
                    }}
                />
            </div>

            {/* Modal de confirmación */}
            {confirmData && confirmData.ok && (
                <div className="bg-slate-800 p-4 rounded mt-4">
                    <h2 className="text-xl mb-2 font-bold text-cyan-400">
                        Confirmar Ingreso
                    </h2>

                    <p><strong>Nombre:</strong> {confirmData.name}</p>
                    <p><strong>Empresa:</strong> {confirmData.company}</p>

                    <button
                        onClick={confirmarIngreso}
                        disabled={loading}
                        className="mt-4 w-full py-2 bg-green-600 rounded font-bold hover:bg-green-700"
                    >
                        {loading ? "Validando..." : "Confirmar ingreso"}
                    </button>
                </div>
            )}

            {/* Resultado final */}
            {scanResult && (
                <div
                    className={`mt-4 p-4 rounded ${scanResult.ok ? "bg-green-700" : "bg-red-700"
                        }`}
                >
                    {scanResult.ok ? (
                        <>
                            <h2 className="text-xl font-bold">✔ Ingreso validado</h2>
                            <p>{scanResult.name}</p>
                            <p>{scanResult.company}</p>
                        </>
                    ) : (
                        <p className="font-bold">{scanResult.error}</p>
                    )}
                </div>
            )}
        </div>
    );
}
