"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ValidatePage() {
    const params = useSearchParams();
    const id = params.get("id");
    const token = params.get("token");

    const [status, setStatus] = useState("Validando…");

    useEffect(() => {
        async function check() {
            if (!id || !token) {
                setStatus("❌ QR inválido");
                return;
            }

            const res = await fetch(`/api/validate?id=${id}&token=${token}`);
            const data = await res.json();

            if (data.ok) {
                setStatus(`✔ Pase válido para ${data.fullName}`);
            } else {
                setStatus("❌ Pase inválido");
            }
        }

        check();
    }, [id, token]);

    return (
        <div style={{ padding: 40 }}>
            <h1>Validación de acceso</h1>
            <p>{status}</p>
        </div>
    );
}
