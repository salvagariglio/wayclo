"use client";

import { useEffect, useRef, useState } from "react";
import WordCloud from "wordcloud";

export default function LiveWordCloud({ wordsData }) {
    const canvasRef = useRef(null);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (!canvasRef.current) return;

        const list = wordsData.map((w) => [w.text, w.value]);

        WordCloud(canvasRef.current, {
            list,
            gridSize: 10,
            weightFactor: (size) => size * 3,
            color: () => {
                const colors = [
                    "rgba(0,106,174,0.9)",
                    "rgba(2,23,40,0.9)",
                    "rgba(100,180,255,0.9)",
                    "rgba(0,150,255,0.7)",
                ];
                return colors[Math.floor(Math.random() * colors.length)];
            },
            rotateRatio: 0.3,
            rotationSteps: 2,
            backgroundColor: "transparent",
            shape: "circle",
        });
    }, [wordsData, tick]);

    // 🌟 Animación automática cada 4 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            setTick((t) => t + 1);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full flex justify-center py-6">
            <canvas
                ref={canvasRef}
                width={700}
                height={400}
                className="max-w-full"
            />
        </div>
    );
}
