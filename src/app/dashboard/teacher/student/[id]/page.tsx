"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import StudentHeader from "@/components/dashboard/StudentHeader";
import InterventionNotes from "@/components/dashboard/InterventionNotes";
import LineChart from "@/components/dashboard/LineChart";
import EmptyState from "@/components/dashboard/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import {
    getStudentProfile, getStudentAcademic, getStudentMetrics,
    getLatestPrediction, getPredictionHistory, getDailyLogs,
    getInterventions, addIntervention, updateAcademicData
} from "@/lib/firestore";
import { getSubjectsForSemester } from "@/lib/subjects";
import type { StudentProfile, StudentAcademic, StudentMetrics, Prediction, Intervention, SubjectMark, SemesterRecord } from "@/lib/types";

export default function StudentDetailPage() {
    const params = useParams();
    const studentId = params.id as string;
    const { user, userData } = useAuth();

    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [academic, setAcademic] = useState<StudentAcademic | null>(null);
    const [metrics, setMetrics] = useState<StudentMetrics | null>(null);
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [stressHistory, setStressHistory] = useState<any[]>([]);
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [loading, setLoading] = useState(true);

    // Academic edit state
    const [editAttendance, setEditAttendance] = useState("");
    const [editFeedback, setEditFeedback] = useState("");
    const [activeSemester, setActiveSemester] = useState(1);
    const [semesterData, setSemesterData] = useState<Record<number, { subjects: SubjectMark[]; sgpa: string }>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!studentId) return;
        loadData();
    }, [studentId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [p, a, m, pred, preds, logs, notes] = await Promise.all([
                getStudentProfile(studentId),
                getStudentAcademic(studentId),
                getStudentMetrics(studentId),
                getLatestPrediction(studentId),
                getPredictionHistory(studentId, 30),
                getDailyLogs(studentId, 30),
                getInterventions(studentId),
            ]);
            setProfile(p);
            setAcademic(a);
            setMetrics(m);
            setPrediction(pred);
            setInterventions(notes);

            const history = preds.map((pr) => ({
                date: pr.timestamp?.toDate?.().toLocaleDateString("en-US", { month: "short", day: "numeric" }) ?? "",
                stress: Math.round((pr.predictionData?.stressLevel ?? 0) * 100),
            })).reverse();
            setStressHistory(history);

            if (a) {
                setEditAttendance(String(a.attendancePercentage ?? ""));
                setEditFeedback(String(a.facultyFeedbackScore ?? ""));

                // Initialize semester data from saved data
                const semData: Record<number, { subjects: SubjectMark[]; sgpa: string }> = {};
                const currentSem = a.currentSemester || (p?.year ? p.year * 2 : 1);

                if (a.semesters && a.semesters.length > 0) {
                    for (const sem of a.semesters) {
                        semData[sem.semester] = {
                            subjects: sem.subjects,
                            sgpa: sem.sgpa != null ? String(sem.sgpa) : "",
                        };
                    }
                }

                // For any semester without saved data, init from template
                if (p) {
                    for (let s = 1; s <= currentSem; s++) {
                        if (!semData[s]) {
                            const templates = getSubjectsForSemester(p.department, s);
                            semData[s] = {
                                subjects: templates.map(t => ({
                                    subjectName: t.name,
                                    subjectCode: t.code,
                                })),
                                sgpa: "",
                            };
                        }
                    }
                }

                setSemesterData(semData);
                setActiveSemester(currentSem);
            }
        } catch (err) {
            console.error("Error loading student data:", err);
        }
        setLoading(false);
    };

    // Determine current semester from profile year
    const currentSemester = useMemo(() => {
        if (academic?.currentSemester) return academic.currentSemester;
        if (profile?.year) return profile.year * 2; // rough estimate
        return 1;
    }, [academic, profile]);

    const semesterTabs = useMemo(() => {
        const tabs: number[] = [];
        for (let i = 1; i <= currentSemester; i++) tabs.push(i);
        return tabs;
    }, [currentSemester]);

    const updateSubjectMark = (semester: number, subjectIndex: number, field: "cia1" | "cia2" | "cia3", value: string) => {
        setSemesterData(prev => {
            const copy = { ...prev };
            if (!copy[semester]) return copy;
            const subjects = [...copy[semester].subjects];
            subjects[subjectIndex] = {
                ...subjects[subjectIndex],
                [field]: value === "" ? undefined : Number(value),
            };
            copy[semester] = { ...copy[semester], subjects };
            return copy;
        });
    };

    const updateSgpa = (semester: number, value: string) => {
        setSemesterData(prev => ({
            ...prev,
            [semester]: { ...prev[semester], sgpa: value },
        }));
    };

    const handleSaveAcademic = async () => {
        setSaving(true);
        try {
            const semesters: SemesterRecord[] = Object.entries(semesterData).map(([sem, data]) => ({
                semester: Number(sem),
                year: "",
                subjects: data.subjects,
                sgpa: data.sgpa ? Number(data.sgpa) : undefined,
            }));

            await updateAcademicData(studentId, {
                currentSemester,
                semesters,
                attendancePercentage: Number(editAttendance),
                facultyFeedbackScore: Number(editFeedback),
            });
            await loadData();
        } catch (err) {
            console.error("Error saving academic data:", err);
        }
        setSaving(false);
    };

    const handleAddNote = async (notes: string, actionTaken: string) => {
        await addIntervention({
            studentId,
            teacherId: user?.uid || "",
            teacherName: userData?.name || "Teacher",
            notes,
            actionTaken,
            date: null as any,
        });
        await loadData();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-2 border-accent rotate-45 animate-pulse flex items-center justify-center">
                    <div className="w-2 h-2 bg-accent" />
                </div>
            </div>
        );
    }

    if (!profile) {
        return <EmptyState title="Student not found" description="This student profile could not be loaded." />;
    }

    const activeSemData = semesterData[activeSemester];

    return (
        <div className="space-y-6">
            {/* Header */}
            <StudentHeader
                name={profile.name}
                rollNo={profile.rollNo}
                department={profile.department}
                section={profile.section}
                year={profile.year}
                email={profile.email}
                riskLevel={metrics?.riskLevel}
            />

            {/* Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stress Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-bg-primary border border-border-primary rounded-[10px] p-6"
                >
                    <h3 className="text-sm font-medium text-text-secondary label-uppercase tracking-wider mb-4">
                        Stress Trend (30 Days)
                    </h3>
                    {stressHistory.length > 0 ? (
                        <LineChart data={stressHistory} xKey="date" yKey="stress" height={220} />
                    ) : (
                        <EmptyState title="No predictions yet" description="Predictions will appear after log submissions." />
                    )}
                </motion.div>

                {/* Academic Data (Editable) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-bg-primary border border-border-primary rounded-[10px] p-6"
                >
                    <h3 className="text-sm font-medium text-text-secondary label-uppercase tracking-wider mb-4">
                        Academic Data
                    </h3>
                    <div className="space-y-4">
                        {/* Semester Tabs */}
                        <div className="flex gap-1 overflow-x-auto pb-1">
                            {semesterTabs.map(sem => (
                                <button
                                    key={sem}
                                    onClick={() => setActiveSemester(sem)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${activeSemester === sem
                                            ? "bg-accent text-black"
                                            : "bg-bg-secondary text-text-secondary hover:bg-bg-hover"
                                        }`}
                                >
                                    Sem {sem}
                                    {sem === currentSemester && (
                                        <span className="ml-1 text-[10px] opacity-70">(Current)</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Subject-wise CIA marks */}
                        {activeSemData && activeSemData.subjects.length > 0 ? (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                {activeSemData.subjects.map((sub, i) => (
                                    <div key={i} className="bg-bg-secondary border border-border-primary rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <span className="text-xs font-medium text-text-primary">{sub.subjectName}</span>
                                                <span className="text-[10px] text-text-muted ml-2">{sub.subjectCode}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(["cia1", "cia2", "cia3"] as const).map((field, fi) => (
                                                <div key={field}>
                                                    <label className="text-[10px] text-text-muted block mb-0.5">CIA {fi + 1}</label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        value={sub[field] ?? ""}
                                                        onChange={(e) => updateSubjectMark(activeSemester, i, field, e.target.value)}
                                                        placeholder="—"
                                                        className="w-full bg-bg-primary border border-border-primary rounded-md px-2 py-1.5 text-sm text-text-primary text-center font-mono focus:outline-none focus:border-accent"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* SGPA for previous semesters */}
                                {activeSemester < currentSemester && (
                                    <div className="bg-bg-secondary border border-border-primary rounded-lg p-3">
                                        <label className="text-xs text-text-muted block mb-1">Semester SGPA</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={10}
                                            step={0.01}
                                            value={activeSemData.sgpa}
                                            onChange={(e) => updateSgpa(activeSemester, e.target.value)}
                                            placeholder="e.g. 8.5"
                                            className="w-full bg-bg-primary border border-border-primary rounded-md px-2 py-1.5 text-sm text-text-primary font-mono focus:outline-none focus:border-accent"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-text-muted py-2">No subjects defined for this semester.</p>
                        )}

                        {/* Attendance & Feedback */}
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border-primary">
                            <div>
                                <label className="text-xs text-text-muted">Attendance %</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={editAttendance}
                                    onChange={(e) => setEditAttendance(e.target.value)}
                                    className="w-full mt-1 bg-bg-secondary border border-border-primary rounded-lg p-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                                    placeholder="85"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">Faculty Feedback (1-5)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={5}
                                    value={editFeedback}
                                    onChange={(e) => setEditFeedback(e.target.value)}
                                    className="w-full mt-1 bg-bg-secondary border border-border-primary rounded-lg p-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                                    placeholder="4"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveAcademic}
                            disabled={saving}
                            className="px-4 py-2 bg-accent text-black text-sm font-medium rounded-lg hover:brightness-90 transition-all disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Update Academic Data"}
                        </button>
                    </div>
                </motion.div>

                {/* Latest Prediction */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-bg-primary border border-border-primary rounded-[10px] p-6"
                >
                    <h3 className="text-sm font-medium text-text-secondary label-uppercase tracking-wider mb-4">
                        Latest AI Prediction
                    </h3>
                    {prediction ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-bg-secondary rounded-lg p-3 text-center">
                                    <p className="text-xs text-text-muted">Stress</p>
                                    <p className="text-lg font-mono font-bold text-text-primary">
                                        {Math.round((prediction.predictionData?.stressLevel ?? 0) * 100)}%
                                    </p>
                                </div>
                                <div className="bg-bg-secondary rounded-lg p-3 text-center">
                                    <p className="text-xs text-text-muted">Failure Risk</p>
                                    <p className="text-lg font-mono font-bold text-text-primary">
                                        {Math.round((prediction.predictionData?.failureProbability ?? 0) * 100)}%
                                    </p>
                                </div>
                                <div className="bg-bg-secondary rounded-lg p-3 text-center">
                                    <p className="text-xs text-text-muted">Attendance Drop</p>
                                    <p className="text-lg font-mono font-bold text-text-primary">
                                        {Math.round((prediction.predictionData?.attendanceDecline ?? 0) * 100)}%
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-text-secondary">{prediction.explanation}</p>
                            {prediction.suggestions?.length > 0 && (
                                <ul className="space-y-1">
                                    {prediction.suggestions.map((s, i) => (
                                        <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                                            <span className="text-accent mt-1">-</span>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ) : (
                        <EmptyState title="No predictions" description="No AI predictions available for this student yet." />
                    )}
                </motion.div>

                {/* Intervention Notes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-bg-primary border border-border-primary rounded-[10px] p-6"
                >
                    <h3 className="text-sm font-medium text-text-secondary label-uppercase tracking-wider mb-4">
                        Intervention Notes
                    </h3>
                    <InterventionNotes interventions={interventions} onAddNote={handleAddNote} />
                </motion.div>
            </div>
        </div>
    );
}
