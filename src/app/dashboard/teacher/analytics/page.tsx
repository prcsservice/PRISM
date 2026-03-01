"use client";

import { useTeacherData } from "@/hooks/useTeacherData";
import BarChart from "@/components/dashboard/BarChart";
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

    // Dummy monthly trend data referencing the PRD analytics concept
    const monthlyTrendData = [
        { month: "Jan", avgRiskScore: 32, newAlerts: 12 },
        { month: "Feb", avgRiskScore: 45, newAlerts: 24 },
        { month: "Mar", avgRiskScore: 50, newAlerts: 31 },
        { month: "Apr", avgRiskScore: 42, newAlerts: 18 },
        { month: "May", avgRiskScore: 68, newAlerts: 45 }, // Finals prep peak
        { month: "Jun", avgRiskScore: 20, newAlerts: 4 },
    ];

    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight">Department Analytics</h1>
                    <p className="text-text-secondary">Aggregate insights and risk distribution for {profile?.department || "your department"}.</p>
                </div>

                <button className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded hover:bg-gray-100 transition-colors hidden sm:block">
                    Export Report (.CSV)
                </button>
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
                    <h3 className="font-semibold text-text-primary mb-6">Monthly Risk Trend</h3>
                    <div className="flex-1 min-h-0 w-full relative">
                        <BarChart
                            data={monthlyTrendData}
                            xKey="month"
                            yKey="avgRiskScore"
                            color="#3B82F6" // Blue for trend
                            highlightThreshold={60} // Highlight May peak returning red
                            height={280}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
