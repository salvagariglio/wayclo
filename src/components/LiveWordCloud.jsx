"use client";

import { useEffect, useRef } from "react";
import WordCloud from "wordcloud";

export default function LiveWordCloud({ words }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || words.length === 0) return;

        const list = words.map((w) => [w.word, w.value]);

        WordCloud(canvasRef.current, {
            list,
            gridSize: 10,
            weightFactor: (s) => Math.sqrt(s) * 12,
            color: () => {
                const colors = [
                    "rgba(0,106,174,0.9)",
                    "rgba(2,23,40,0.9)",
                    "rgba(100,180,255,0.7)",
                    "rgba(0,150,255,0.7)",
                ];
                return colors[Math.floor(Math.random() * colors.length)];
            },
            rotateRatio: 0.3,
            rotationSteps: 2,
            backgroundColor: "transparent",
            shrinkToFit: true,
            shape: "circle",
            drawOutOfBound: false,
        });
    }, [words]);

    return (
        <div className="w-full flex justify-center py-6">
            <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="max-w-full"
            />
        </div>
    );
}
