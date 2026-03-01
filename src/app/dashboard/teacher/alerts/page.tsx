"use client";

import { useState } from "react";
import { useAlerts } from "@/hooks/useAlerts";
import { useTeacherData } from "@/hooks/useTeacherData";
import { RiskBadge } from "@/components/ui/RiskBadge";
import Button from "@/components/ui/Button";

type FilterTab = "all" | "new" | "reviewed" | "resolved";

export default function TeacherAlertsPage() {
    const { alerts, loading: alertsLoading, updateAlertStatus } = useAlerts();
    const { students, loading: teacherLoading } = useTeacherData();
    const [activeTab, setActiveTab] = useState<FilterTab>("new");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

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
        await updateAlertStatus(alertId, newStatus, newStatus === "resolved" ? "Student contacted and issue resolved." : "Currently reviewing with academic advisor.");
        setUpdatingId(null);
    };

    return (
        <div className="flex flex-col gap-8 pb-10 max-w-4xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-text-primary tracking-tight">Active Alerts</h1>
                <p className="text-text-secondary">AI-generated early warning flags requiring faculty review.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-border-primary">
                <button
                    onClick={() => setActiveTab("new")}
                    className={`px-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'new' ? 'text-text-primary border-[#A3E635]' : 'text-text-secondary border-transparent hover:text-text-primary'}`}
                >
                    New Alerts
                </button>
                <button
                    onClick={() => setActiveTab("reviewed")}
                    className={`px-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'reviewed' ? 'text-text-primary border-[#A3E635]' : 'text-text-secondary border-transparent hover:text-text-primary'}`}
                >
                    In Review
                </button>
                <button
                    onClick={() => setActiveTab("resolved")}
                    className={`px-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'resolved' ? 'text-text-primary border-[#A3E635]' : 'text-text-secondary border-transparent hover:text-text-primary'}`}
                >
                    Resolved
                </button>
                <button
                    onClick={() => setActiveTab("all")}
                    className={`px-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'all' ? 'text-text-primary border-[#A3E635]' : 'text-text-secondary border-transparent hover:text-text-primary'}`}
                >
                    All
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {filteredAlerts.length === 0 ? (
                    <div className="w-full bg-bg-secondary border border-border-primary rounded-xl p-12 text-center text-text-muted">
                        No {activeTab !== "all" ? activeTab : ""} alerts found.
                    </div>
                ) : (
                    filteredAlerts.map((alert) => {
                        const student = students.find(s => s.studentId === alert.studentId);
                        const isUpdating = updatingId === alert.alertId;

                        return (
                            <div key={alert.alertId} className="w-full bg-bg-secondary border border-border-primary rounded-xl p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:border-border-hover transition-colors">
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-wrap items-center gap-3 mb-1">
                                        <span className="font-semibold text-text-primary text-lg">{student?.name || "Unknown Student"}</span>
                                        <RiskBadge variant={(alert.riskLevel?.toLowerCase() === 'moderate' ? 'medium' : alert.riskLevel?.toLowerCase()) as any || "default"} className="capitalize">{alert.riskLevel}</RiskBadge>
                                        <span className="px-2 py-0.5 text-xs font-medium bg-bg-hover text-text-secondary rounded uppercase border border-border-secondary">
                                            {alert.status}
                                        </span>
                                        <span className="text-xs text-text-muted">
                                            {new Date((alert.createdAt as any)?.seconds * 1000).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-secondary leading-relaxed">
                                        <strong className="text-text-primary font-medium">Flag Reason: </strong>{alert.reason}
                                    </p>

                                    {alert.actionTaken && (
                                        <p className="text-sm text-[#A3E635] mt-1 bg-[#A3E635]/10 px-3 py-2 rounded border border-[#A3E635]/20 max-w-fit">
                                            {alert.actionTaken}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    {alert.status === "new" && (
                                        <Button
                                            variant="secondary"
                                            className="flex-1 md:flex-none"
                                            disabled={isUpdating}
                                            onClick={() => handleStatusUpdate(alert.alertId!, "reviewed")}
                                        >
                                            {isUpdating ? "Updating..." : "Mark in Review"}
                                        </Button>
                                    )}
                                    {alert.status === "reviewed" && (
                                        <Button
                                            variant="primary"
                                            className="flex-1 md:flex-none border-[#A3E635] text-[#A3E635] hover:bg-[#A3E635]/10"
                                            disabled={isUpdating}
                                            onClick={() => handleStatusUpdate(alert.alertId!, "resolved")}
                                        >
                                            {isUpdating ? "Updating..." : "Resolve Case"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
