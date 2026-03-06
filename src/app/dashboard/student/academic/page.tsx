"use client";

import { useState, useMemo } from "react";
import { useStudentData } from "@/hooks/useStudentData";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/dashboard/EmptyState";
import { BookOpen, Users, Star, Clock, ChevronRight } from "lucide-react";
import type { SemesterRecord, SubjectMark } from "@/lib/types";

export default function StudentAcademicPage() {
    const { academic, profile, loading } = useStudentData();
    const [activeSemester, setActiveSemester] = useState<number | null>(null);

    // Determine semesters and set active
    const { semesters, currentSemester, hasNewFormat } = useMemo(() => {
        if (!academic) return { semesters: [], currentSemester: 1, hasNewFormat: false };
        const hasNew = !!(academic.semesters && academic.semesters.length > 0);
        const current = academic.currentSemester || (profile?.year ? profile.year * 2 : 1);
        return {
            semesters: hasNew ? academic.semesters.sort((a, b) => a.semester - b.semester) : [],
            currentSemester: current,
            hasNewFormat: hasNew,
        };
    }, [academic, profile]);

    // Default to current semester
    const displaySemester = activeSemester ?? currentSemester;

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

    // Compute CIA average for display
    const computeAverage = (subjects: SubjectMark[]): number | null => {
        const marks: number[] = [];
        for (const s of subjects) {
            if (s.cia1 != null) marks.push(s.cia1);
            if (s.cia2 != null) marks.push(s.cia2);
            if (s.cia3 != null) marks.push(s.cia3);
        }
        return marks.length > 0 ? Math.round(marks.reduce((a, b) => a + b, 0) / marks.length) : null;
    };

    // Legacy flat marks support
    const legacyCiaAverage = academic.ciaMarks && academic.ciaMarks.length > 0
        ? Math.round(academic.ciaMarks.reduce((a, b) => a + b, 0) / academic.ciaMarks.length)
        : null;

    // Active semester data
    const activeSemData = semesters.find(s => s.semester === displaySemester);
    const activeAverage = activeSemData ? computeAverage(activeSemData.subjects) : legacyCiaAverage;

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

    const getMarkColor = (mark: number) =>
        mark >= 70 ? "text-green-400" : mark >= 50 ? "text-orange-400" : "text-red-400";

    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">Academic Profile</h1>
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
                        {activeAverage !== null ? activeAverage : "—"}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                        {hasNewFormat
                            ? `Semester ${displaySemester} · ${activeSemData?.subjects.length ?? 0} subjects`
                            : `Across ${academic.ciaMarks?.length ?? 0} assessments`
                        }
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

            {/* SGPA History (if previous semesters exist) */}
            {hasNewFormat && semesters.filter(s => s.sgpa != null && s.semester < currentSemester).length > 0 && (
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
                    <h3 className="font-semibold text-text-primary mb-4">Previous Semester SGPA</h3>
                    <div className="flex gap-3 overflow-x-auto">
                        {semesters
                            .filter(s => s.sgpa != null && s.semester < currentSemester)
                            .map(s => (
                                <div key={s.semester} className="bg-bg-primary border border-border-primary rounded-lg p-4 text-center min-w-[80px]">
                                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Sem {s.semester}</p>
                                    <p className={`text-xl font-bold font-mono ${(s.sgpa ?? 0) >= 7 ? "text-green-400" : (s.sgpa ?? 0) >= 5 ? "text-orange-400" : "text-red-400"}`}>
                                        {s.sgpa?.toFixed(1)}
                                    </p>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}

            {/* Semester Tabs + Subject-wise CIA */}
            {hasNewFormat ? (
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-text-primary">CIA Marks — Subject Wise</h3>
                    </div>

                    {/* Semester Tabs */}
                    <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
                        {semesters.map(s => (
                            <button
                                key={s.semester}
                                onClick={() => setActiveSemester(s.semester)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${displaySemester === s.semester
                                    ? "bg-accent text-black"
                                    : "bg-bg-primary text-text-secondary hover:bg-bg-hover"
                                    }`}
                            >
                                Sem {s.semester}
                                {s.semester === currentSemester && <span className="ml-1 opacity-70">(Current)</span>}
                            </button>
                        ))}
                    </div>

                    {/* Subject Table */}
                    {activeSemData && activeSemData.subjects.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-primary">
                                        <th className="text-left py-2 pr-4 text-xs text-text-muted font-medium">Subject</th>
                                        <th className="text-center py-2 px-2 text-xs text-text-muted font-medium w-20">CIA 1</th>
                                        <th className="text-center py-2 px-2 text-xs text-text-muted font-medium w-20">CIA 2</th>
                                        <th className="text-center py-2 px-2 text-xs text-text-muted font-medium w-20">CIA 3</th>
                                        <th className="text-center py-2 pl-2 text-xs text-text-muted font-medium w-20">Avg</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeSemData.subjects.map((sub, i) => {
                                        const marks = [sub.cia1, sub.cia2, sub.cia3].filter((m): m is number => m != null);
                                        const avg = marks.length > 0 ? Math.round(marks.reduce((a, b) => a + b, 0) / marks.length) : null;
                                        return (
                                            <tr key={i} className="border-b border-border-primary/50 last:border-0">
                                                <td className="py-3 pr-4">
                                                    <span className="text-text-primary font-medium">{sub.subjectName}</span>
                                                    <span className="text-[10px] text-text-muted ml-2">{sub.subjectCode}</span>
                                                </td>
                                                <td className="text-center py-3 px-2">
                                                    {sub.cia1 != null ? (
                                                        <span className={`font-mono font-bold ${getMarkColor(sub.cia1)}`}>{sub.cia1}</span>
                                                    ) : (
                                                        <span className="text-text-muted">—</span>
                                                    )}
                                                </td>
                                                <td className="text-center py-3 px-2">
                                                    {sub.cia2 != null ? (
                                                        <span className={`font-mono font-bold ${getMarkColor(sub.cia2)}`}>{sub.cia2}</span>
                                                    ) : (
                                                        <span className="text-text-muted">—</span>
                                                    )}
                                                </td>
                                                <td className="text-center py-3 px-2">
                                                    {sub.cia3 != null ? (
                                                        <span className={`font-mono font-bold ${getMarkColor(sub.cia3)}`}>{sub.cia3}</span>
                                                    ) : (
                                                        <span className="text-text-muted">—</span>
                                                    )}
                                                </td>
                                                <td className="text-center py-3 pl-2">
                                                    {avg !== null ? (
                                                        <span className={`font-mono font-bold ${getMarkColor(avg)}`}>{avg}</span>
                                                    ) : (
                                                        <span className="text-text-muted">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-text-muted py-4 text-center">No subjects recorded for this semester.</p>
                    )}
                </div>
            ) : (
                /* Legacy flat CIA marks view */
                academic.ciaMarks && academic.ciaMarks.length > 0 && (
                    <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
                        <h3 className="font-semibold text-text-primary mb-4">CIA Marks Breakdown</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {academic.ciaMarks.map((mark, i) => (
                                <div key={i} className="bg-bg-primary border border-border-primary rounded-lg p-3 text-center">
                                    <p className="text-xs text-text-muted mb-1">CIA {i + 1}</p>
                                    <p className={`text-xl font-bold font-mono ${getMarkColor(mark)}`}>
                                        {mark}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )
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
