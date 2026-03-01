"use client";

import { AlertTriangle, ShieldAlert, Clock, CheckCircle } from "lucide-react";
import type { Alert } from "@/lib/types";

interface AlertCardProps {
    alert: Alert;
    onResolve?: (alertId: string) => void;
}

export default function AlertCard({ alert, onResolve }: AlertCardProps) {
    const isCritical = alert.priority === "Critical";
    const isResolved = alert.resolved;

    const formatTime = (timestamp: any) => {
        if (!timestamp) return "Unknown";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return "Just now";
    };

    return (
        <div
            className={`border rounded-[10px] p-5 transition-all ${isResolved
                    ? "bg-bg-secondary border-border-primary opacity-60"
                    : isCritical
                        ? "bg-red-500/5 border-red-500/30"
                        : "bg-yellow-500/5 border-yellow-500/30"
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                    <div className={`mt-0.5 ${isCritical ? "text-red-500" : "text-yellow-500"}`}>
                        {isCritical ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-text-primary">{alert.studentName}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isCritical ? "bg-red-500/20 text-red-500" : "bg-yellow-500/20 text-yellow-500"
                                }`}>
                                {alert.priority}
                            </span>
                            {isResolved && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 flex items-center gap-1">
                                    <CheckCircle size={12} /> Resolved
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-text-secondary mt-1">{alert.reason}</p>
                        {alert.resolutionNotes && (
                            <p className="text-xs text-text-muted mt-2 italic">Note: {alert.resolutionNotes}</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs text-text-muted flex items-center gap-1">
                        <Clock size={12} /> {formatTime(alert.timestamp)}
                    </span>
                    {!isResolved && onResolve && (
                        <button
                            onClick={() => onResolve(alert.id!)}
                            className="text-xs font-medium text-accent hover:underline"
                        >
                            Resolve
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
