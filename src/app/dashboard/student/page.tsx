"use client";

import { useStudentData } from "@/hooks/useStudentData";
import { usePredictions } from "@/hooks/usePredictions";
import { getTimeGreeting } from "@/lib/utils";
import { getInterventions } from "@/lib/firestore";
import MetricCard from "@/components/dashboard/MetricCard";
import LineChart from "@/components/dashboard/LineChart";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/dashboard/EmptyState";
import Link from "next/link";
import { Activity, Brain, TrendingUp, BarChart3, BookOpen, MessageSquare, Phone, Calendar, UserCheck, Users, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Intervention, MentorActionType } from "@/lib/types";
import { MENTOR_ACTION_LABELS } from "@/lib/types";

const MOOD_LABELS = ["", "Very Bad", "Bad", "Neutral", "Good", "Great"];

const ACTION_ICONS: Record<string, any> = {
    called_student: Phone,
    scheduled_meeting: Calendar,
    referred_counselor: UserCheck,
    contacted_parent: Users,
    academic_support: BookOpen,
    peer_mentoring: Users,
    sent_encouragement: Heart,
    custom: MessageSquare,
};

const ACTION_COLORS: Record<string, string> = {
    called_student: "text-blue-400 bg-blue-400/10",
    scheduled_meeting: "text-purple-400 bg-purple-400/10",
    referred_counselor: "text-orange-400 bg-orange-400/10",
    contacted_parent: "text-cyan-400 bg-cyan-400/10",
    academic_support: "text-emerald-400 bg-emerald-400/10",
    peer_mentoring: "text-indigo-400 bg-indigo-400/10",
    sent_encouragement: "text-pink-400 bg-pink-400/10",
    custom: "text-text-muted bg-bg-hover",
};

export default function StudentDashboard() {
    const { profile, academic, metrics, recentLogs, loading: dataLoading } = useStudentData();
    const { latestPrediction, history, loading: predLoading } = usePredictions();
    const { user } = useAuth();
    const greeting = getTimeGreeting();

    const [mentorActions, setMentorActions] = useState<Intervention[]>([]);

    useEffect(() => {
        if (user?.uid) {
            getInterventions(user.uid).then(setMentorActions).catch(() => { });
        }
    }, [user?.uid]);

    const loading = dataLoading || predLoading;

    const stressTrendData = history
        .map((p) => ({
            date: p.timestamp?.toDate?.()?.toLocaleDateString("en-US", { month: "short", day: "numeric" }) ?? "",
            stress: Math.round((p.predictionData?.stressLevel ?? p.riskScore ?? 0) * 100),
        }))
        .reverse();

    const recentEntries = [...recentLogs].reverse().slice(0, 5);

    if (loading) {
        return (
            <div className="flex flex-col gap-8 pb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-5 w-96" />
                    </div>
                    <Skeleton className="h-10 w-40" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-80 rounded-xl" />
                    <Skeleton className="h-96 rounded-xl" />
                </div>
            </div>
        );
    }

    const stressPercent = metrics ? Math.round(metrics.currentStressLevel * 100) : null;
    const riskLevel = metrics?.riskLevel ?? null;
    const failureProb = latestPrediction?.predictionData?.failureProbability
        ? Math.round(latestPrediction.predictionData.failureProbability * 100)
        : null;

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-1">
                        {greeting}, {profile?.name?.split(" ")[0] || "Student"}
                    </h1>
                    <p className="text-text-secondary">
                        Here&apos;s your academic wellness overview for today.
                    </p>
                </div>
                <Link href="/dashboard/student/log">
                    <Button variant="primary" className="flex items-center gap-2">
                        <Activity size={18} />
                        <span>Log Today&apos;s Data</span>
                    </Button>
                </Link>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Stress Level"
                    value={stressPercent !== null ? `${stressPercent}%` : "—"}
                    icon={<Brain size={20} />}
                    trend={stressTrendData.length >= 2
                        ? stressTrendData[stressTrendData.length - 1].stress - stressTrendData[stressTrendData.length - 2].stress
                        : 0}
                    trendLabel="vs previous"
                    invertColors
                />
                <MetricCard
                    title="Risk Level"
                    value={riskLevel ?? "—"}
                    icon={<TrendingUp size={20}
                        className={riskLevel === "High" ? "text-red-500" : riskLevel === "Moderate" ? "text-orange-500" : "text-green-500"} />}
                    trend={0}
                    trendLabel=""
                />
                <MetricCard
                    title="Failure Probability"
                    value={failureProb !== null ? `${failureProb}%` : "—"}
                    icon={<BarChart3 size={20} />}
                    trend={0}
                    trendLabel=""
                    invertColors
                />
                <MetricCard
                    title="Logs Submitted"
                    value={recentLogs.length}
                    icon={<BookOpen size={20} />}
                    trend={recentLogs.length > 0 ? recentLogs.length : 0}
                    trendLabel="last 30 days"
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
                        <h3 className="font-semibold text-text-primary mb-4">Stress Trend (30 Days)</h3>
                        {stressTrendData.length > 1 ? (
                            <LineChart data={stressTrendData} xKey="date" yKey="stress" height={260} />
                        ) : (
                            <EmptyState title="Not enough data" description="Submit daily logs to see your stress trend over time." />
                        )}
                    </div>

                    <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-text-primary">Recent Logs</h3>
                            <Link href="/dashboard/student/history" className="text-xs text-accent hover:underline">View all &rarr;</Link>
                        </div>
                        {recentEntries.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-xs uppercase text-text-muted border-b border-border-primary">
                                        <tr>
                                            <th className="py-2 pr-4">Date</th>
                                            <th className="py-2 pr-4">Sleep</th>
                                            <th className="py-2 pr-4">Screen</th>
                                            <th className="py-2 pr-4">Mood</th>
                                            <th className="py-2">Study</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentEntries.map((log, i) => (
                                            <tr key={i} className="border-b border-border-primary/50 last:border-0">
                                                <td className="py-2.5 pr-4 text-text-primary font-medium">{log.date}</td>
                                                <td className="py-2.5 pr-4 text-text-secondary">{log.sleepHours}h</td>
                                                <td className="py-2.5 pr-4 text-text-secondary">{log.screenTimeHours}h</td>
                                                <td className="py-2.5 pr-4 text-text-secondary">{MOOD_LABELS[log.mood]}</td>
                                                <td className="py-2.5 text-text-secondary">{log.studyHours}h</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState title="No logs yet" description="Start logging daily to track your patterns." />
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6">
                    {/* AI Insights */}
                    <div className="bg-bg-secondary border border-accent/30 rounded-xl relative overflow-hidden flex flex-col p-6">
                        <div className="absolute inset-0 bg-accent opacity-[0.02]" />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <h3 className="font-semibold text-text-primary">AI Insights</h3>
                            <Link href="/dashboard/student/suggestions" className="text-xs text-accent hover:underline">View all &rarr;</Link>
                        </div>
                        <div className="flex-1 relative z-10">
                            {latestPrediction?.suggestions && latestPrediction.suggestions.length > 0 ? (
                                <ul className="space-y-3">
                                    {latestPrediction.suggestions.slice(0, 3).map((s, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary leading-relaxed">
                                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex items-center justify-center py-12 text-sm text-text-muted">
                                    No AI suggestions yet. Submit a daily log to get started.
                                </div>
                            )}
                        </div>
                        {latestPrediction?.explanation && (
                            <p className="mt-4 pt-4 border-t border-border-primary text-xs text-text-muted relative z-10 leading-relaxed">
                                {latestPrediction.explanation}
                            </p>
                        )}
                    </div>

                    {/* Academic Overview */}
                    <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
                        <h3 className="font-semibold text-text-primary mb-4">Academic Overview</h3>
                        {academic ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-text-muted">CIA Average</span>
                                    <span className="text-sm font-mono font-semibold text-text-primary">
                                        {academic.ciaMarks && academic.ciaMarks.length > 0
                                            ? Math.round(academic.ciaMarks.reduce((a, b) => a + b, 0) / academic.ciaMarks.length)
                                            : "—"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-text-muted">Attendance</span>
                                    <span className={`text-sm font-mono font-semibold ${academic.attendancePercentage >= 75 ? "text-green-500" : academic.attendancePercentage >= 60 ? "text-orange-500" : "text-red-500"}`}>
                                        {academic.attendancePercentage}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-text-muted">Faculty Feedback</span>
                                    <span className="text-sm font-mono font-semibold text-text-primary">{academic.facultyFeedbackScore}/5</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-8 text-sm text-text-muted">
                                Academic data not yet entered by your faculty.
                            </div>
                        )}
                        <Link href="/dashboard/student/academic" className="block mt-4 text-xs text-accent hover:underline text-center">
                            View full profile &rarr;
                        </Link>
                    </div>

                    {/* Mentor Actions */}
                    <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MessageSquare size={16} className="text-[#A3E635]" />
                            <h3 className="font-semibold text-text-primary">Mentor Actions</h3>
                        </div>
                        {mentorActions.length > 0 ? (
                            <div className="space-y-3">
                                {mentorActions.slice(0, 4).map((action) => {
                                    const Icon = ACTION_ICONS[action.actionType || "custom"] || MessageSquare;
                                    const colorClass = ACTION_COLORS[action.actionType || "custom"] || ACTION_COLORS.custom;
                                    return (
                                        <div key={action.id} className="flex items-start gap-3 p-3 bg-bg-primary border border-border-primary rounded-lg">
                                            <div className={`mt-0.5 p-1.5 rounded-md ${colorClass}`}>
                                                <Icon size={12} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-text-primary">
                                                        {action.actionType ? MENTOR_ACTION_LABELS[action.actionType] : action.actionTaken || "Note"}
                                                    </span>
                                                    <span className="text-[10px] text-text-muted">{formatDate(action.date)}</span>
                                                </div>
                                                <p className="text-xs text-text-secondary mt-1 line-clamp-2">{action.notes}</p>
                                                <p className="text-[10px] text-text-muted mt-1">By: {action.teacherName}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-8 text-sm text-text-muted">
                                No mentor actions yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
