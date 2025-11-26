"use client";

import { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function Scanner() {
    const [error, setError] = useState(null);
    const [confirmData, setConfirmData] = useState(null);
    const [cooldown, setCooldown] = useState(false);

    const readerRef = useRef(null);

    useEffect(() => {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        const start = async () => {
            try {
                const devices = await reader.listVideoInputDevices();
                if (devices.length === 0) {
                    setError("No se encontró cámara disponible.");
                    return;
                }

                reader.decodeFromVideoDevice(
                    devices[0].deviceId,
                    "video",
                    async (decoded) => {
                        if (!decoded || cooldown) return;

                        setCooldown(true);
                        setTimeout(() => setCooldown(false), 1500);

                        const text = decoded.getText();

                        try {
                            const url = new URL(text);
                            const id = url.searchParams.get("id");
                            const token = url.searchParams.get("token");

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
                        } catch {
                            setError("QR inválido");
                        }
                    }
                );
            } catch (e) {
                console.error(e);
                setError("No se pudo iniciar el escáner");
            }
        };

        start();

        return () => {
            try {
                readerRef.current?.stopAsyncDecode?.();
                readerRef.current?.reset?.();
            } catch {
                // ignoramos porque algunas versiones no implementan reset()
            }
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

            <div className="w-full flex justify-center mb-4">
                <video
                    id="video"
                    className="w-full max-w-md rounded-lg shadow"
                    autoPlay
                    muted
                />
            </div>

            {error && (
                <p className="mt-3 text-red-400 font-medium">{error}</p>
            )}

            {confirmData && (
                <div className="mt-6 bg-white p-4 rounded-lg shadow text-black">
                    <h3 className="text-lg font-bold">{confirmData.fullName}</h3>
                    <p>{confirmData.company}</p>
                    <p className="opacity-70">{confirmData.role}</p>

                    {confirmData.alreadyChecked && (
                        <p className="text-red-500 font-semibold mt-2">
                            ⚠ Ya había ingresado antes
                        </p>
                    )}

                    <button
                        onClick={confirmIngreso}
                        className="mt-4 px-6 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                    >
                        Registrar ingreso
                    </button>
                </div>
            )}
        </div>
    );
}
