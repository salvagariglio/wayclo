"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function Scanner() {
    const videoRef = useRef(null);
    const [validation, setValidation] = useState(null);

    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();
        let stream = null;

        const start = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                });

                videoRef.current.srcObject = stream;

                await codeReader.decodeFromVideoDevice(
                    undefined,
                    videoRef.current,
                    async (output) => {
                        if (!output) return;

                        const raw = output.getText();

                        // El QR se arma así:
                        // https://cybercloud.ar/validate?id=XXX&token=YYY
                        const url = new URL(raw);
                        const id = url.searchParams.get("id");
                        const token = url.searchParams.get("token");

                        // Enviar a backend
                        const resp = await fetch("/api/admin/validations/check", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id, token }),
                        });

                        const json = await resp.json();
                        setValidation(json);

                        // Detener escaneo temporalmente
                        codeReader.stopContinuousDecode();

                        setTimeout(() => {
                            setValidation(null);
                            codeReader.decodeFromVideoDevice(
                                undefined,
                                videoRef.current,
                                () => { }
                            );
                        }, 2500);
                    }
                );
            } catch (e) {
                console.error("Scanner error:", e);
            }
        };

        start();

        return () => {
            try {
                codeReader.stopContinuousDecode();
            } catch { }
            try {
                stream?.getTracks()?.forEach((t) => t.stop());
            } catch { }
        };
    }, []);

    return (
        <div className="flex flex-col items-center gap-4">
            <video
                ref={videoRef}
                className="w-full max-w-sm rounded-lg shadow-md"
                autoPlay
                muted
                playsInline
            />

            {validation && (
                <div
                    className={`p-4 rounded-lg text-lg font-semibold ${validation.ok ? "bg-green-600" : "bg-red-600"
                        }`}
                >
                    {validation.ok
                        ? `✔ Acceso permitido: ${validation.fullName}`
                        : `❌ ${validation.error}`}
                </div>
            )}
        </div>
    );
}
