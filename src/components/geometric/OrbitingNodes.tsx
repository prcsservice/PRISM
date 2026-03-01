"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface OrbitingNodesProps {
    className?: string;
    size?: number;
}

export default function OrbitingNodes({ className, size = 250 }: OrbitingNodesProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = size;
        canvas.height = size;

        const cx = size / 2;
        const cy = size / 2;

        const orbits = [
            { radius: size * 0.18, speed: 0.015, offset: 0, nodeRadius: 4 },
            { radius: size * 0.28, speed: -0.01, offset: Math.PI * 0.7, nodeRadius: 3 },
            { radius: size * 0.36, speed: 0.008, offset: Math.PI * 1.4, nodeRadius: 5 },
            { radius: size * 0.22, speed: -0.02, offset: Math.PI * 0.3, nodeRadius: 3 },
        ];

        let time = 0;
        let animId: number;

        function draw() {
            ctx!.clearRect(0, 0, size, size);

            // Draw center dot
            ctx!.beginPath();
            ctx!.arc(cx, cy, 6, 0, Math.PI * 2);
            ctx!.fillStyle = "#FECC2D";
            ctx!.globalAlpha = 0.9;
            ctx!.fill();

            // Draw orbit paths
            orbits.forEach((orbit) => {
                ctx!.beginPath();
                ctx!.arc(cx, cy, orbit.radius, 0, Math.PI * 2);
                ctx!.strokeStyle = "rgba(255, 255, 255, 0.06)";
                ctx!.lineWidth = 1;
                ctx!.globalAlpha = 1;
                ctx!.stroke();
            });

            // Draw nodes and connections
            const nodePositions: [number, number][] = [];

            orbits.forEach((orbit) => {
                const angle = time * orbit.speed + orbit.offset;
                const nx = cx + Math.cos(angle) * orbit.radius;
                const ny = cy + Math.sin(angle) * orbit.radius;
                nodePositions.push([nx, ny]);

                // Draw connection line to center
                ctx!.beginPath();
                ctx!.moveTo(cx, cy);
                ctx!.lineTo(nx, ny);
                ctx!.strokeStyle = "rgba(254, 204, 45, 0.15)";
                ctx!.lineWidth = 1;
                ctx!.stroke();

                // Draw node
                ctx!.beginPath();
                ctx!.arc(nx, ny, orbit.nodeRadius, 0, Math.PI * 2);
                ctx!.fillStyle = "#FECC2D";
                ctx!.globalAlpha = 0.8;
                ctx!.fill();
            });

            // Draw connections between adjacent nodes
            for (let i = 0; i < nodePositions.length - 1; i++) {
                ctx!.beginPath();
                ctx!.moveTo(nodePositions[i][0], nodePositions[i][1]);
                ctx!.lineTo(nodePositions[i + 1][0], nodePositions[i + 1][1]);
                ctx!.strokeStyle = "rgba(254, 204, 45, 0.08)";
                ctx!.lineWidth = 0.5;
                ctx!.globalAlpha = 1;
                ctx!.stroke();
            }

            ctx!.globalAlpha = 1;
            time += 1;
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
