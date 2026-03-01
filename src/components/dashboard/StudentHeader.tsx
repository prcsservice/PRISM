"use client";

import { RiskBadge } from "@/components/ui/RiskBadge";
import type { RiskLevel } from "@/lib/types";

interface StudentHeaderProps {
    name: string;
    rollNo: string;
    department: string;
    section: string;
    year: number;
    riskLevel?: RiskLevel;
    email?: string;
}

export default function StudentHeader({ name, rollNo, department, section, year, riskLevel, email }: StudentHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-primary border border-border-primary rounded-[10px] p-6">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-bg-tertiary flex items-center justify-center text-xl font-bold text-text-primary">
                    {name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-text-primary">{name}</h2>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-sm text-text-secondary">{rollNo}</span>
                        <span className="text-text-muted">|</span>
                        <span className="text-sm text-text-secondary">{department}</span>
                        <span className="text-text-muted">|</span>
                        <span className="text-sm text-text-secondary">Section {section}</span>
                        <span className="text-text-muted">|</span>
                        <span className="text-sm text-text-secondary">Year {year}</span>
                    </div>
                    {email && <p className="text-xs text-text-muted mt-1">{email}</p>}
                </div>
            </div>
            {riskLevel && (
                <RiskBadge variant={riskLevel.toLowerCase() as any} className="capitalize">
                    {riskLevel}
                </RiskBadge>
            )}
        </div>
    );
}
