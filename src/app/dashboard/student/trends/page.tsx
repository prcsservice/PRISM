"use client";

import { useState, useMemo } from "react";
import { useStudentData } from "@/hooks/useStudentData";
import { usePredictions } from "@/hooks/usePredictions";
import LineChart from "@/components/dashboard/LineChart";
import PeriodSelector from "@/components/dashboard/PeriodSelector";
import EmptyState from "@/components/dashboard/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

export default function StudentTrendsPage() {
    const { recentLogs, loading: dataLoading } = useStudentData();
    const { history, loading: predLoading } = usePredictions();
    const [period, setPeriod] = useState(30);

    const loading = dataLoading || predLoading;

    // Filter logs by selected period
    const filteredLogs = useMemo(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - period);
        return recentLogs.filter((log) => {
            const logDate = new Date(log.date);
            return logDate >= cutoff;
        });
    }, [recentLogs, period]);

    // Build chart data from daily logs
    const logChartData = useMemo(() =>
        filteredLogs.map((log) => ({
            date: new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            sleep: log.sleepHours,
            screenTime: log.screenTimeHours,
            mood: log.mood,
            study: log.studyHours,
            social: log.socialInteraction,
        })),
        [filteredLogs]
    );

    // Build stress trend from predictions
    const stressTrendData = useMemo(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - period);
        return history
            .filter((p) => {
                const date = p.timestamp?.toDate?.();
                return date && date >= cutoff;
            })
            .map((p) => ({
                date: p.timestamp?.toDate?.()?.toLocaleDateString("en-US", { month: "short", day: "numeric" }) ?? "",
                stress: Math.round((p.predictionData?.stressLevel ?? p.riskScore ?? 0) * 100),
            }))
            .reverse();
    }, [history, period]);

    if (loading) {
        return (
            <div className="flex flex-col gap-8 pb-10">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-80" />
                </div>
                <Skeleton className="h-80 rounded-xl" />
                <Skeleton className="h-80 rounded-xl" />
            </div>
        );
    }

    const hasData = logChartData.length > 1;

    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">Wellness Trends</h1>
                    <p className="text-text-secondary">Historical visualization of your stress levels, mood, and sleep patterns.</p>
                </div>
                <PeriodSelector selected={period} onChange={setPeriod} />
            </div>

            {!hasData ? (
                <EmptyState
                    title="Not enough data yet"
                    description="Submit at least 2 daily logs to start seeing your trends. Keep logging consistently for the best insights!"
                />
            ) : (
                <>
                    {/* Stress Trend */}
                    <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
                        <h3 className="font-semibold text-text-primary mb-4">Stress Score Trend</h3>
                        {stressTrendData.length > 1 ? (
                            <LineChart data={stressTrendData} xKey="date" yKey="stress" height={280} />
                        ) : (
                            <div className="h-64 flex items-center justify-center text-text-muted text-sm">
                                Not enough prediction data for this period.
                            </div>
                        )}
                    </div>

                    {/* Sleep & Mood */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
                            <h3 className="font-semibold text-text-primary mb-4">Sleep Hours</h3>
                            <LineChart data={logChartData} xKey="date" yKey="sleep" height={240} />
                        </div>
                        <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
                            <h3 className="font-semibold text-text-primary mb-4">Mood (1-5)</h3>
                            <LineChart data={logChartData} xKey="date" yKey="mood" height={240} />
                        </div>
                    </div>

                    {/* Screen Time vs Study Hours */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
                            <h3 className="font-semibold text-text-primary mb-4">Screen Time (hrs)</h3>
                            <LineChart data={logChartData} xKey="date" yKey="screenTime" height={240} />
                        </div>
                        <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
                            <h3 className="font-semibold text-text-primary mb-4">Study Hours</h3>
                            <LineChart data={logChartData} xKey="date" yKey="study" height={240} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
