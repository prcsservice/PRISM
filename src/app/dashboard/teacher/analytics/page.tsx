"use client";

import { useTeacherData } from "@/hooks/useTeacherData";
import BarChart from "@/components/dashboard/BarChart";
import ExportButton from "@/components/dashboard/ExportButton";
import { Users, AlertTriangle, TrendingUp } from "lucide-react";
import MetricCard from "@/components/dashboard/MetricCard";

export default function TeacherAnalyticsPage() {
    const { profile, students, loading } = useTeacherData();

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#A3E635] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Generate aggregate dashboard data from available students
    const riskLevels = { low: 0, medium: 0, high: 0, critical: 0 };
    let totalStress = 0;
    let totalScore = 0;

    students.forEach((s) => {
        const risk = s.metrics?.riskLevel || "Low";
        const riskKey = risk === "High" ? "high" : risk === "Moderate" ? "medium" : "low";
        riskLevels[riskKey as keyof typeof riskLevels]++;

        // Compute stress from metrics
        const stressScore = s.metrics?.currentStressLevel ?? 0.4;
        totalStress += Math.round(stressScore * 100);
        totalScore += Math.round((s.metrics?.riskScore ?? 0.5) * 100);
    });

    const avgStress = students.length > 0 ? Math.round(totalStress / students.length) : 0;
    const avgScore = students.length > 0 ? Math.round(totalScore / students.length) : 0;

    // Chart Data prep
    const riskDistributionData = [
        { name: "Low", value: riskLevels.low },
        { name: "Medium", value: riskLevels.medium },
        { name: "High", value: riskLevels.high },
        { name: "Critical", value: riskLevels.critical },
    ];

    // Build risk score distribution per student
    const riskScoreData = students
        .filter(s => s.metrics)
        .map(s => ({
            name: s.name?.split(" ")[0] ?? "Student",
            score: Math.round((s.metrics?.riskScore ?? 0) * 100),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

    // CSV export data
    const exportData = students.map(s => ({
        Name: s.name,
        "Roll Number": s.rollNo,
        Department: s.department,
        Section: s.section,
        Year: s.year,
        "Risk Level": s.metrics?.riskLevel ?? "N/A",
        "Stress Level": s.metrics?.currentStressLevel ? Math.round(s.metrics.currentStressLevel * 100) + "%" : "N/A",
        "Risk Score": s.metrics?.riskScore ? Math.round(s.metrics.riskScore * 100) + "%" : "N/A",
    }));

    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">Department Analytics</h1>
                    <p className="text-text-secondary">Aggregate insights and risk distribution for {profile?.department || "your department"}.</p>
                </div>

                <div className="hidden sm:block">
                    <ExportButton data={exportData} filename="prism_analytics" label="Export Report (.CSV)" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricCard
                    title="Avg Department Stress"
                    value={`${avgStress}/100`}
                    trend={12}
                    trendLabel="over last month"
                    icon={<TrendingUp size={20} />}
                    invertColors
                />
                <MetricCard
                    title="Total Monitored"
                    value={students.length}
                    trend={0}
                    trendLabel="No change"
                    icon={<Users size={20} />}
                />
                <MetricCard
                    title="Predictive Confidence"
                    value={`${avgScore}%`}
                    trend={2}
                    trendLabel="Model improvement"
                    icon={<AlertTriangle size={20} />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-bg-secondary border border-border-primary rounded-xl flex flex-col p-6 h-96">
                    <h3 className="font-semibold text-text-primary mb-6">Risk Distribution</h3>
                    <div className="flex-1 min-h-0 w-full relative">
                        <BarChart
                            data={riskDistributionData}
                            xKey="name"
                            yKey="value"
                            color="#A3E635"
                            height={280}
                        />
                    </div>
                </div>

                <div className="bg-bg-secondary border border-border-primary rounded-xl flex flex-col p-6 h-96">
                    <h3 className="font-semibold text-text-primary mb-6">Top Risk Scores by Student</h3>
                    <div className="flex-1 min-h-0 w-full relative">
                        {riskScoreData.length > 0 ? (
                            <BarChart
                                data={riskScoreData}
                                xKey="name"
                                yKey="score"
                                color="#3B82F6"
                                highlightThreshold={60}
                                height={280}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-text-muted text-sm">No scored students available.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
