"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
    lines?: number;
}

export default function Skeleton({ className, lines = 1 }: SkeletonProps) {
    return (
        <div className={cn("space-y-3", className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 bg-bg-tertiary rounded-[6px] animate-pulse"
                    style={{ width: i === lines - 1 && lines > 1 ? "60%" : "100%" }}
                />
            ))}
        </div>
    );
}
