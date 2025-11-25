"use client";

import { useState } from "react";

export default function WordForm({ onSend }) {
    const [text, setText] = useState("");

    const handle = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text.trim());
        setText("");
    };

    return (
        <form onSubmit={handle} className="flex gap-3 py-4">
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribí una palabra..."
                className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                Enviar
            </button>
        </form>
    );
}
