"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function Scanner() {
    const videoRef = useRef(null);
    const [result, setResult] = useState(null);

    useEffect(() => {
        let codeReader = new BrowserMultiFormatReader();
        let stream;

        const startScanner = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                });

                videoRef.current.srcObject = stream;

                await codeReader.decodeFromVideoDevice(
                    null,
                    videoRef.current,
                    (res, err) => {
                        if (res) {
                            setResult(res.getText());
                        }
                    }
                );
            } catch (e) {
                console.error("Scanner error:", e);
            }
        };

        startScanner();

        return () => {
            try {
                codeReader?.stopContinuousDecode();
            } catch (e) {
                console.warn("No se pudo detener decode:", e);
            }

            try {
                if (stream) {
                    stream.getTracks().forEach((t) => t.stop());
                }
            } catch (e) {
                console.warn("No se pudo detener cámara:", e);
            }
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

            {result && (
                <div className="text-lg font-semibold text-green-600">
                    📲 Código detectado: {result}
                </div>
            )}
        </div>
    );
}
