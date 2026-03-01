"use client";

import { FileX } from "lucide-react";

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
}

export default function EmptyState({
    title = "No data yet",
    description = "Data will appear here once available.",
    icon,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-text-muted mb-4">
                {icon || <FileX size={48} strokeWidth={1} />}
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
            <p className="text-sm text-text-secondary max-w-sm">{description}</p>
        </div>
    );
}
