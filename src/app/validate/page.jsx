"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ValidatePage() {
    const params = useSearchParams();
    const id = params.get("id");
    const token = params.get("token");

    const [status, setStatus] = useState("validando...");

    useEffect(() => {
        async function run() {
            const res = await fetch(`/api/validate?id=${id}&token=${token}`);
            const data = await res.json();
            if (data.ok) setStatus(`✔ Acceso válido para ${data.fullName}`);
            else setStatus("❌ QR inválido");
        }
        run();
    }, [id, token]);

    return (
        <div style={{ padding: 40 }}>
            <h1>Validación de QR</h1>
            <p>{status}</p>
        </div>
    );
}
