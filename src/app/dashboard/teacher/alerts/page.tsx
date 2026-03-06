"use client";

import { useState } from "react";
import { useAlerts } from "@/hooks/useAlerts";
import { useTeacherData } from "@/hooks/useTeacherData";
import { useAuth } from "@/hooks/useAuth";
import { addIntervention } from "@/lib/firestore";
import { RiskBadge } from "@/components/ui/RiskBadge";
import Button from "@/components/ui/Button";
import InterventionNotes from "@/components/dashboard/InterventionNotes";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import type { MentorActionType } from "@/lib/types";

type FilterTab = "all" | "new" | "reviewed" | "resolved";

export default function TeacherAlertsPage() {
    const { alerts, loading: alertsLoading, updateAlertStatus } = useAlerts();
    const { students, loading: teacherLoading } = useTeacherData();
    const { user, userData } = useAuth();
    const [activeTab, setActiveTab] = useState<FilterTab>("new");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const loading = alertsLoading || teacherLoading;

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#A3E635] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const filteredAlerts = alerts.filter(a => activeTab === "all" || a.status === activeTab);

    const handleStatusUpdate = async (alertId: string, newStatus: "reviewed" | "resolved") => {
        setUpdatingId(alertId);
        await updateAlertStatus(
            alertId,
            newStatus,
            newStatus === "resolved"
                ? "Student contacted and issue resolved."
                : "Currently reviewing with academic advisor."
        );
        setUpdatingId(null);
    };

    const handleAddIntervention = async (
        alertStudentId: string,
        notes: string,
        actionTaken: string,
        actionType?: MentorActionType,
        status?: string
    ) => {
        if (!user || !userData) return;
        await addIntervention({
            studentId: alertStudentId,
            teacherId: user.uid,
            teacherName: userData.name,
            notes,
            actionTaken,
            actionType,
            status: (status as any) || "completed",
            date: {} as any, // Overridden by Timestamp.now() in firestore helper
        });
    };

    const tabs: { key: FilterTab; label: string; count?: number }[] = [
        { key: "new", label: "New Alerts", count: alerts.filter(a => a.status === "new").length },
        { key: "reviewed", label: "In Review", count: alerts.filter(a => a.status === "reviewed").length },
        { key: "resolved", label: "Resolved" },
        { key: "all", label: "All" },
    ];

    return (
        <div className="flex flex-col gap-8 pb-10 max-w-4xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">Active Alerts</h1>
                <p className="text-text-secondary">AI-generated early warning flags requiring faculty review.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-border-primary">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-1 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === tab.key
                            ? "text-text-primary border-[#A3E635]"
                            : "text-text-secondary border-transparent hover:text-text-primary"
                            }`}
                    >
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className="w-5 h-5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full flex items-center justify-center">
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-4">
                {filteredAlerts.length === 0 ? (
                    <div className="w-full bg-bg-secondary border border-border-primary rounded-xl p-12 text-center text-text-muted">
                        No {activeTab !== "all" ? activeTab : ""} alerts found.
                    </div>
                ) : (
                    filteredAlerts.map((alert) => {
                        const student = students.find(s => s.studentId === alert.studentId);
                        const isUpdating = updatingId === alert.id;
                        const isExpanded = expandedId === alert.id;
                        const suggestedActions = (alert as any).suggestedActions as string[] | undefined;

                        return (
                            <div
                                key={alert.id}
                                className="w-full bg-bg-secondary border border-border-primary rounded-xl overflow-hidden hover:border-border-hover transition-colors"
                            >
                                {/* Alert Header */}
                                <div className="p-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                    <div className="flex flex-col gap-2 flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-1">
                                            <span className="font-semibold text-text-primary text-lg">
                                                {student?.name || "Unknown Student"}
                                            </span>
                                            <RiskBadge
                                                variant={(alert.riskLevel?.toLowerCase() === "moderate" ? "medium" : alert.riskLevel?.toLowerCase()) as any || "default"}
                                                className="capitalize"
                                            >
                                                {alert.riskLevel}
                                            </RiskBadge>
                                            <span className="px-2 py-0.5 text-xs font-medium bg-bg-hover text-text-secondary rounded uppercase border border-border-secondary">
                                                {alert.status}
                                            </span>
                                            <span className="text-xs text-text-muted">
                                                {new Date((alert.createdAt as any)?.seconds * 1000).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-secondary leading-relaxed">
                                            <strong className="text-text-primary font-medium">Flag Reason: </strong>
                                            {alert.reason}
                                        </p>

                                        {/* AI Suggestions Preview */}
                                        {suggestedActions && suggestedActions.length > 0 && !isExpanded && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <Sparkles size={12} className="text-[#A3E635]" />
                                                <span className="text-xs text-[#A3E635]">
                                                    {suggestedActions.length} AI-suggested action{suggestedActions.length > 1 ? "s" : ""} available
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        {alert.status === "new" && (
                                            <Button
                                                variant="secondary"
                                                className="flex-1 md:flex-none"
                                                disabled={isUpdating}
                                                onClick={() => handleStatusUpdate(alert.id!, "reviewed")}
                                            >
                                                {isUpdating ? "Updating..." : "Mark in Review"}
                                            </Button>
                                        )}
                                        {alert.status === "reviewed" && (
                                            <Button
                                                variant="primary"
                                                className="flex-1 md:flex-none border-[#A3E635] text-[#A3E635] hover:bg-[#A3E635]/10"
                                                disabled={isUpdating}
                                                onClick={() => handleStatusUpdate(alert.id!, "resolved")}
                                            >
                                                {isUpdating ? "Updating..." : "Resolve Case"}
                                            </Button>
                                        )}
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : alert.id!)}
                                            className="p-2 rounded-lg hover:bg-bg-hover transition-colors text-text-muted"
                                            title={isExpanded ? "Collapse" : "Take Action"}
                                        >
                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Action Panel */}
                                {isExpanded && (
                                    <div className="border-t border-border-primary px-6 py-5 bg-bg-primary/50">
                                        <h4 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                                            <Sparkles size={14} className="text-[#A3E635]" />
                                            Mentor Actions & Interventions
                                        </h4>
                                        <InterventionNotes
                                            interventions={[]}
                                            suggestedActions={suggestedActions}
                                            onAddNote={(notes, action, actionType, status) =>
                                                handleAddIntervention(alert.studentId, notes, action, actionType, status)
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
