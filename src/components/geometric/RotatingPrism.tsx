"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface RotatingPrismProps {
    className?: string;
    size?: number;
}

export default function RotatingPrism({ className, size = 300 }: RotatingPrismProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = size;
        canvas.height = size;

        let angle = 0;
        let animId: number;

        const vertices3D = [
            // Top triangle
            [0, -1, -0.577],
            [-0.5, -1, 0.289],
            [0.5, -1, 0.289],
            // Bottom triangle
            [0, 1, -0.577],
            [-0.5, 1, 0.289],
            [0.5, 1, 0.289],
        ];

        const edges = [
            // Top face
            [0, 1], [1, 2], [2, 0],
            // Bottom face
            [3, 4], [4, 5], [5, 3],
            // Connecting edges
            [0, 3], [1, 4], [2, 5],
        ];

        function project(x: number, y: number, z: number): [number, number] {
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            const rotX = x * cosA - z * sinA;
            const rotZ = x * sinA + z * cosA;
            const scale = 2 / (3 + rotZ);
            const px = rotX * scale * size * 0.35 + size / 2;
            const py = y * scale * size * 0.35 + size / 2;
            return [px, py];
        }

        function draw() {
            ctx!.clearRect(0, 0, size, size);

            // Draw edges
            edges.forEach(([a, b]) => {
                const [x1, y1] = project(vertices3D[a][0], vertices3D[a][1], vertices3D[a][2]);
                const [x2, y2] = project(vertices3D[b][0], vertices3D[b][1], vertices3D[b][2]);

                ctx!.beginPath();
                ctx!.moveTo(x1, y1);
                ctx!.lineTo(x2, y2);
                ctx!.strokeStyle = "#FECC2D";
                ctx!.lineWidth = 1.5;
                ctx!.globalAlpha = 0.7;
                ctx!.stroke();
            });

            // Draw vertices
            vertices3D.forEach((v) => {
                const [px, py] = project(v[0], v[1], v[2]);
                ctx!.beginPath();
                ctx!.arc(px, py, 3, 0, Math.PI * 2);
                ctx!.fillStyle = "#FECC2D";
                ctx!.globalAlpha = 0.9;
                ctx!.fill();
            });

            ctx!.globalAlpha = 1;
            angle += 0.008;
            animId = requestAnimationFrame(draw);
        }

        draw();
        return () => cancelAnimationFrame(animId);
    }, [size]);

    return (
        <canvas
            ref={canvasRef}
            className={cn("pointer-events-none", className)}
            style={{ width: size, height: size }}
        />
    );
}
