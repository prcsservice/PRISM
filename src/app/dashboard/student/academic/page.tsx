"use client";

import { useStudentData } from "@/hooks/useStudentData";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/dashboard/EmptyState";
import { BookOpen, Users, Star, Clock } from "lucide-react";

export default function StudentAcademicPage() {
    const { academic, profile, loading } = useStudentData();

    if (loading) {
        return (
            <div className="flex flex-col gap-8 pb-10">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-52" />
                    <Skeleton className="h-5 w-80" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
                </div>
                <Skeleton className="h-48 rounded-xl" />
            </div>
        );
    }

    if (!academic) {
        return (
            <div className="flex flex-col gap-8 pb-10">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight">Academic Profile</h1>
                    <p className="text-text-secondary">Your current academic standing as recorded by the institution. (Read-only)</p>
                </div>
                <EmptyState
                    title="No academic data yet"
                    description="Your faculty has not entered academic data for your profile yet. Once they do, your CIA marks, attendance, and feedback will appear here."
                />
            </div>
        );
    }

    const ciaAverage = academic.ciaMarks && academic.ciaMarks.length > 0
        ? Math.round(academic.ciaMarks.reduce((a, b) => a + b, 0) / academic.ciaMarks.length)
        : null;

    const attendanceColor = academic.attendancePercentage >= 75
        ? "text-green-400"
        : academic.attendancePercentage >= 60
            ? "text-orange-400"
            : "text-red-400";

    const attendanceBg = academic.attendancePercentage >= 75
        ? "bg-green-500/10 border-green-500/20"
        : academic.attendancePercentage >= 60
            ? "bg-orange-500/10 border-orange-500/20"
            : "bg-red-500/10 border-red-500/20";

    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-text-primary tracking-tight">Academic Profile</h1>
                <p className="text-text-secondary">Your current academic standing as recorded by the institution. (Read-only)</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`border rounded-xl p-5 ${attendanceBg}`}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${attendanceColor} bg-white/5`}>
                            <Users size={18} />
                        </div>
                        <span className="text-sm text-text-muted">Attendance</span>
                    </div>
                    <p className={`text-3xl font-bold font-mono ${attendanceColor}`}>
                        {academic.attendancePercentage}%
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                        {academic.attendancePercentage >= 75 ? "Above minimum required" : "Below minimum threshold (75%)"}
                    </p>
                </div>

                <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                            <BookOpen size={18} />
                        </div>
                        <span className="text-sm text-text-muted">CIA Average</span>
                    </div>
                    <p className="text-3xl font-bold font-mono text-text-primary">
                        {ciaAverage !== null ? ciaAverage : "—"}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                        Across {academic.ciaMarks?.length ?? 0} assessments
                    </p>
                </div>

                <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                            <Star size={18} />
                        </div>
                        <span className="text-sm text-text-muted">Faculty Feedback</span>
                    </div>
                    <div className="flex items-end gap-1">
                        <p className="text-3xl font-bold font-mono text-text-primary">
                            {academic.facultyFeedbackScore}
                        </p>
                        <span className="text-text-muted text-lg mb-0.5">/5</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map(n => (
                            <div
                                key={n}
                                className={`h-1.5 flex-1 rounded-full ${n <= academic.facultyFeedbackScore ? "bg-accent" : "bg-border-primary"}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* CIA Marks Breakdown */}
            {academic.ciaMarks && academic.ciaMarks.length > 0 && (
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
                    <h3 className="font-semibold text-text-primary mb-4">CIA Marks Breakdown</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {academic.ciaMarks.map((mark, i) => (
                            <div key={i} className="bg-bg-primary border border-border-primary rounded-lg p-3 text-center">
                                <p className="text-xs text-text-muted mb-1">CIA {i + 1}</p>
                                <p className={`text-xl font-bold font-mono ${mark >= 70 ? "text-green-400" : mark >= 50 ? "text-orange-400" : "text-red-400"}`}>
                                    {mark}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Profile Info */}
            <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Clock size={16} className="text-text-muted" />
                    <h3 className="font-semibold text-text-primary">Student Info</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-text-muted mb-0.5">Name</p>
                        <p className="text-text-primary font-medium">{profile?.name ?? "—"}</p>
                    </div>
                    <div>
                        <p className="text-text-muted mb-0.5">Roll No</p>
                        <p className="text-text-primary font-medium">{profile?.rollNo ?? "—"}</p>
                    </div>
                    <div>
                        <p className="text-text-muted mb-0.5">Department</p>
                        <p className="text-text-primary font-medium">{profile?.department ?? "—"}</p>
                    </div>
                    <div>
                        <p className="text-text-muted mb-0.5">Section</p>
                        <p className="text-text-primary font-medium">{profile?.section ?? "—"} · Year {profile?.year ?? "—"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
