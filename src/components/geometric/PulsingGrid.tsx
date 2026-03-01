"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface PulsingGridProps {
    className?: string;
    rows?: number;
    cols?: number;
}

export default function PulsingGrid({ className, rows = 8, cols = 8 }: PulsingGridProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const spacing = 30;
        const w = cols * spacing;
        const h = rows * spacing;
        canvas.width = w;
        canvas.height = h;

        let time = 0;
        let animId: number;

        function draw() {
            ctx!.clearRect(0, 0, w, h);

            const centerX = w / 2;
            const centerY = h / 2;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const x = c * spacing + spacing / 2;
                    const y = r * spacing + spacing / 2;

                    const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                    const maxDist = Math.sqrt(centerX ** 2 + centerY ** 2);
                    const wave = Math.sin(time * 2 - dist * 0.04);
                    const normalizedWave = (wave + 1) / 2;

                    const radius = 1.5 + normalizedWave * 1.5;
                    const alpha = 0.15 + normalizedWave * 0.6;

                    ctx!.beginPath();
                    ctx!.arc(x, y, radius, 0, Math.PI * 2);

                    if (normalizedWave > 0.6) {
                        ctx!.fillStyle = `rgba(254, 204, 45, ${alpha})`;
                    } else {
                        ctx!.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
                    }
                    ctx!.fill();
                }
            }

            time += 0.02;
            animId = requestAnimationFrame(draw);
        }

        draw();
        return () => cancelAnimationFrame(animId);
    }, [rows, cols]);

    return (
        <canvas
            ref={canvasRef}
            className={cn("pointer-events-none opacity-60", className)}
            style={{ width: cols * 30, height: rows * 30 }}
        />
    );
}
