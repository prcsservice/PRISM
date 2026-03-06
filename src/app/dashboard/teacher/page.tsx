"use client";

import { useTeacherData } from "@/hooks/useTeacherData";
import { useAlerts } from "@/hooks/useAlerts";
import { getTimeGreeting } from "@/lib/utils";
import MetricCard from "@/components/dashboard/MetricCard";
import DataTable from "@/components/dashboard/DataTable";
import Skeleton from "@/components/ui/Skeleton";
import { RiskBadge } from "@/components/ui/RiskBadge";
import Link from "next/link";
import { Users, AlertTriangle, Activity, TrendingUp } from "lucide-react";

export default function TeacherDashboard() {
    const { profile, students, loading: teacherLoading } = useTeacherData();
    const { alerts, loading: alertsLoading } = useAlerts();

    const loading = teacherLoading || alertsLoading;
    const greeting = getTimeGreeting();

    if (loading) {
        return (
            <div className="flex flex-col gap-8 pb-10">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <Skeleton className="xl:col-span-2 h-80 rounded-xl" />
                    <Skeleton className="h-80 rounded-xl" />
                </div>
            </div>
        );
    }

    // Calculate Metrics
    const totalStudents = students.length;
    const criticalStudents = students.filter(s => s.metrics?.riskLevel === "High").length;
    const activeAlerts = alerts.filter(a => !a.resolved).length;

    // Example computed trends (0 = no historical comparison available yet)
    const stressTrend = 0;

    // Students at risk table configuration
    const atRiskStudents = students
        .filter(s => s.metrics?.riskLevel === "High" || s.metrics?.riskLevel === "Moderate")
        .sort((a, b) => {
            if (a.metrics?.riskLevel === "High" && b.metrics?.riskLevel !== "High") return -1;
            if (b.metrics?.riskLevel === "High" && a.metrics?.riskLevel !== "High") return 1;
            return 0;
        })
        .slice(0, 5);

    const columns = [
        { header: "Name", accessorKey: "name" as any },
        { header: "Roll Number", accessorKey: "rollNo" as any },
        {
            header: "Current Risk",
            accessorKey: "metrics" as any,
            cell: (item: any) => (
                <RiskBadge variant={(item.metrics?.riskLevel || "default").toLowerCase()} className="capitalize">
                    {item.metrics?.riskLevel || "Unknown"}
                </RiskBadge>
            )
        },
        {
            header: "Risk Score",
            accessorKey: "metrics" as any,
            cell: (item: any) => item.metrics ? `${Math.round(item.metrics.riskScore * 100)}%` : "N/A"
        },
    ];

    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
                        {greeting}, {profile?.name.split(" ")[0]}
                    </h1>
                    <span className="px-2.5 py-1 text-xs font-semibold bg-[#A3E635]/10 text-[#A3E635] border border-[#A3E635]/20 rounded">
                        {profile?.department || "Department"}
                    </span>
                </div>
                <p className="text-text-secondary">Faculty overview and early-warning alerts for your assigned students.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <MetricCard
                    title="Monitored Students"
                    value={totalStudents}
                    trend={0}
                    trendLabel="current semester"
                    icon={<Users size={20} />}
                />
                <MetricCard
                    title="Active Alerts"
                    value={activeAlerts}
                    trend={0}
                    trendLabel="unresolved"
                    icon={<AlertTriangle size={20} className="text-orange-500" />}
                    invertColors
                />
                <MetricCard
                    title="Critical Risk Students"
                    value={criticalStudents}
                    trend={0}
                    trendLabel="currently at risk"
                    icon={<Activity size={20} className="text-red-500" />}
                    invertColors
                />
                <MetricCard
                    title="Avg Dept Stress"
                    value={(() => {
                        const withMetrics = students.filter(s => s.metrics?.currentStressLevel != null);
                        if (withMetrics.length === 0) return "—";
                        const avg = Math.round(withMetrics.reduce((sum, s) => sum + (s.metrics!.currentStressLevel * 100), 0) / withMetrics.length);
                        return `${avg}/100`;
                    })()}
                    trend={stressTrend}
                    trendLabel={stressTrend === 0 ? "no previous data" : "vs last week"}
                    icon={<TrendingUp size={20} />}
                    invertColors
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 flex flex-col gap-4">
                    <h3 className="font-semibold text-text-primary">High Priority Students</h3>
                    <DataTable
                        data={atRiskStudents}
                        columns={columns}
                        rowHref={(s) => `/dashboard/teacher/student/${s.studentId}`}
                        emptyMessage="No high-risk students currently identified."
                    />
                </div>

                <div className="flex flex-col gap-4">
                    <h3 className="font-semibold text-text-primary">Recent Alerts Feed</h3>
                    <div className="flex-1 bg-bg-secondary border border-border-primary rounded-xl flex flex-col p-4 gap-3 overflow-hidden">
                        {alerts.filter(a => !a.resolved).slice(0, 4).map((alert, index) => {
                            const student = students.find(s => s.studentId === alert.studentId);
                            return (
                                <div key={alert.id || index} className="p-3 border border-border-primary hover:border-border-hover transition-colors rounded-lg bg-bg-tertiary">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-medium text-text-primary">{student?.name || "Unknown Student"}</span>
                                        <RiskBadge variant={(alert.riskLevel || "default").toLowerCase() as any} className="capitalize text-[10px] px-1.5 py-0">{alert.riskLevel}</RiskBadge>
                                    </div>
                                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{alert.reason}</p>
                                </div>
                            );
                        })}

                        {alerts.length === 0 && (
                            <div className="flex-1 flex items-center justify-center p-6 text-text-muted text-sm text-center">
                                All clear. No active alerts at this time.
                            </div>
                        )}

                        {alerts.length > 4 && (
                            <div className="pt-2 text-center">
                                <Link href="/dashboard/teacher/alerts" className="text-xs text-[#A3E635] hover:underline">View all alerts &rarr;</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
