"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function Scanner() {
    const videoRef = useRef(null);
    const [userData, setUserData] = useState(null);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        const reader = new BrowserMultiFormatReader();
        let stream;

        const startScan = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                });

                videoRef.current.srcObject = stream;
                videoRef.current.setAttribute("playsinline", true);
                videoRef.current.play();

                reader.decodeFromVideoDevice(undefined, videoRef.current, async (result) => {
                    if (!result) return;

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
                    setUserData(json);

                    reader.stopContinuousDecode();
                });
            } catch (err) {
                console.error(err);
            }
        };

        startScan();

        return () => {
            reader.stopContinuousDecode();
            stream?.getTracks()?.forEach((t) => t.stop());
        };
    }, []);

    const confirmEntry = async () => {
        setConfirming(true);

        const resp = await fetch("/api/admin/validations/checkin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: userData.id }),
        });

        const json = await resp.json();
        if (json.ok) {
            alert("✔ Ingreso registrado");
        }

        window.location.reload();
    };

    return (
        <div className="space-y-4">
            <video ref={videoRef} className="w-full rounded-lg" />

            {userData && (
                <div className="p-4 bg-white/10 rounded-lg border border-white/20">
                    <h2 className="text-lg font-bold">
                        {userData.first_name} {userData.last_name}
                    </h2>
                    <p className="text-white/70">{userData.company}</p>
                    <p className="text-white/70">{userData.role}</p>

                    {userData.alreadyUsed && (
                        <p className="mt-2 text-red-400 font-semibold">Este QR ya fue usado</p>
                    )}

                    {!userData.alreadyUsed && (
                        <button
                            onClick={confirmEntry}
                            disabled={confirming}
                            className="mt-4 w-full bg-green-600 py-3 rounded-md font-semibold"
                        >
                            Registrar Ingreso
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
