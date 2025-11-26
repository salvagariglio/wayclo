"use client";
import { useState, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function Scanner() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [confirmData, setConfirmData] = useState(null);

    useEffect(() => {
        const reader = new BrowserMultiFormatReader();

        const start = async () => {
            try {
                const devices = await reader.listVideoInputDevices();
                if (devices.length === 0) {
                    setError("No se encontró cámara");
                    return;
                }

                reader.decodeFromVideoDevice(
                    devices[0].deviceId,
                    "video",
                    async (decoded, err) => {
                        if (decoded) {
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
                                } else {
                                    setError(json.error);
                                }
                            } catch {
                                setError("QR inválido");
                            }
                        }
                    }
                );
            } catch (e) {
                console.error(e);
                setError("No se pudo iniciar la cámara");
            }
        };

        start();

        return () => reader.reset();
    }, []);

    const confirmarIngreso = async () => {
        const res = await fetch("/api/admin/validations/checkin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: confirmData.id }),
        });

        const json = await res.json();

        if (json.ok) {
            setResult("Ingreso registrado ✔");
            setConfirmData(null);
        } else {
            setError(json.error);
        }
    };

    return (
        <div className="p-4 max-w-xl mx-auto text-center">

            <video id="video" className="w-full max-w-md rounded-lg" />

            {error && (
                <p className="mt-4 text-red-500 text-sm">{error}</p>
            )}

            {confirmData && (
                <div className="mt-6 bg-white p-4 rounded-lg shadow text-black">
                    <h3 className="text-lg font-bold">{confirmData.fullName}</h3>
                    <p>{confirmData.company}</p>
                    <p className="opacity-70">{confirmData.role}</p>
                    {confirmData.alreadyChecked && (
                        <p className="text-red-500 mt-2">⚠ Ya había ingresado antes</p>
                    )}

                    <button
                        onClick={confirmIngreso}
                        className="mt-4 px-6 py-2 rounded bg-green-600 text-white"
                    >
                        Registrar ingreso
                    </button>
                </div>
            )}
        </div>
    );
}
