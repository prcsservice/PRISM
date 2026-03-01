"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
    level: "Low" | "Moderate" | "High";
    className?: string;
}

const BADGE_STYLES = {
    Low: "bg-[rgba(34,197,94,0.1)] text-[#22C55E] border-[rgba(34,197,94,0.2)]",
    Moderate: "bg-(--accent-muted) text-(--accent) border-[rgba(254,204,45,0.2)]",
    High: "bg-[rgba(239,68,68,0.1)] text-[#EF4444] border-[rgba(239,68,68,0.2)]",
};

export default function Badge({ level, className }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-[0.05em] border rounded-[6px]",
                BADGE_STYLES[level],
                className
            )}
        >
            {level}
        </span>
    );
}
