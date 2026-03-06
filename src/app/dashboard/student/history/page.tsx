"use client";

import { useStudentData } from "@/hooks/useStudentData";
import EmptyState from "@/components/dashboard/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

const MOOD_LABELS = ["", "Very Bad", "Bad", "Neutral", "Good", "Great"];
const SOCIAL_LABELS = ["", "Isolated", "Low", "Average", "Active", "Very Active"];

export default function StudentHistoryPage() {
    const { recentLogs, loading } = useStudentData();

    // Reverse to show newest first
    const logs = [...recentLogs].reverse();

    if (loading) {
        return (
            <div className="flex flex-col gap-8 pb-10">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-5 w-72" />
                </div>
                <Skeleton className="h-96 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">History Log</h1>
                <p className="text-text-secondary">List of all your previously submitted daily wellness logs.</p>
            </div>

            {logs.length === 0 ? (
                <EmptyState
                    title="No logs yet"
                    description="Start submitting daily logs to build your history. Your wellness journey begins with the first entry."
                />
            ) : (
                <div className="w-full bg-bg-secondary border border-border-primary rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-text-secondary">
                            <thead className="text-xs uppercase bg-bg-hover text-text-muted">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Date</th>
                                    <th scope="col" className="px-6 py-4">Sleep (hrs)</th>
                                    <th scope="col" className="px-6 py-4">Screen Time (hrs)</th>
                                    <th scope="col" className="px-6 py-4">Mood</th>
                                    <th scope="col" className="px-6 py-4">Study (hrs)</th>
                                    <th scope="col" className="px-6 py-4">Social</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, i) => (
                                    <tr
                                        key={log.id || i}
                                        className="border-b border-border-primary hover:bg-bg-hover transition-colors last:border-0"
                                    >
                                        <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">
                                            {new Date(log.date).toLocaleDateString("en-US", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={log.sleepHours < 6 ? "text-red-400" : log.sleepHours >= 7 ? "text-green-400" : "text-orange-400"}>
                                                {log.sleepHours}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={log.screenTimeHours > 6 ? "text-red-400" : log.screenTimeHours <= 3 ? "text-green-400" : "text-orange-400"}>
                                                {log.screenTimeHours}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${log.mood >= 4
                                                ? "bg-green-500/10 text-green-400"
                                                : log.mood === 3
                                                    ? "bg-yellow-500/10 text-yellow-400"
                                                    : "bg-red-500/10 text-red-400"
                                                }`}>
                                                {MOOD_LABELS[log.mood]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{log.studyHours}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-text-muted">
                                                {SOCIAL_LABELS[log.socialInteraction]}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-3 bg-bg-hover text-xs text-text-muted">
                        Showing {logs.length} {logs.length === 1 ? "entry" : "entries"} from the last 30 days
                    </div>
                </div>
            )}
        </div>
    );
}
