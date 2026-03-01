"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MorphingHexagonsProps {
    className?: string;
}

export default function MorphingHexagons({ className }: MorphingHexagonsProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        let time = 0;
        let animId: number;

        const hexagons = Array.from({ length: 6 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 30 + Math.random() * 50,
            speed: 0.2 + Math.random() * 0.5,
            phase: Math.random() * Math.PI * 2,
        }));

        function drawHexagon(x: number, y: number, size: number, rotation: number) {
            ctx!.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i + rotation;
                const px = x + size * Math.cos(angle);
                const py = y + size * Math.sin(angle);
                if (i === 0) ctx!.moveTo(px, py);
                else ctx!.lineTo(px, py);
            }
            ctx!.closePath();
        }

        function draw() {
            ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

            hexagons.forEach((hex) => {
                const morphedSize = hex.size + Math.sin(time * hex.speed + hex.phase) * 8;
                const rotation = time * 0.1 * hex.speed;
                const alpha = 0.04 + Math.sin(time * hex.speed * 0.5 + hex.phase) * 0.03;

                drawHexagon(hex.x, hex.y, morphedSize, rotation);
                ctx!.strokeStyle = `rgba(254, 204, 45, ${alpha + 0.02})`;
                ctx!.lineWidth = 1;
                ctx!.stroke();

                drawHexagon(hex.x, hex.y, morphedSize * 0.6, -rotation);
                ctx!.strokeStyle = `rgba(254, 204, 45, ${alpha})`;
                ctx!.lineWidth = 0.5;
                ctx!.stroke();
            });

            time += 0.02;
            animId = requestAnimationFrame(draw);
        }

        draw();
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}
        />
    );
}
