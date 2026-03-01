"use client";

import { Download } from "lucide-react";

interface ExportButtonProps {
    data: Record<string, any>[];
    filename?: string;
    label?: string;
}

export default function ExportButton({ data, filename = "export", label = "Export CSV" }: ExportButtonProps) {
    const handleExport = () => {
        if (data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(","),
            ...data.map((row) =>
                headers.map((h) => {
                    let val = row[h] ?? "";
                    // Handle values with commas or quotes
                    if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
                        val = `"${val.replace(/"/g, '""')}"`;
                    }
                    return val;
                }).join(",")
            ),
        ];

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    return (
        <button
            onClick={handleExport}
            disabled={data.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-bg-secondary border border-border-primary text-text-primary text-sm font-medium rounded-lg hover:bg-bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Download size={16} />
            {label}
        </button>
    );
}
