"use client";

import { useState, useEffect } from "react";
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
import type { StudentProfile, StudentAcademic, StudentMetrics, Prediction, DailyLog, Intervention } from "@/lib/types";

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
    const [editCia, setEditCia] = useState("");
    const [editAttendance, setEditAttendance] = useState("");
    const [editFeedback, setEditFeedback] = useState("");
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

            // Build stress history from predictions
            const history = preds.map((pr) => ({
                date: pr.timestamp?.toDate?.().toLocaleDateString("en-US", { month: "short", day: "numeric" }) ?? "",
                stress: Math.round((pr.predictionData?.stressLevel ?? 0) * 100),
            })).reverse();
            setStressHistory(history);

            if (a) {
                setEditCia(a.ciaMarks?.join(", ") ?? "");
                setEditAttendance(String(a.attendancePercentage ?? ""));
                setEditFeedback(String(a.facultyFeedbackScore ?? ""));
            }
        } catch (err) {
            console.error("Error loading student data:", err);
        }
        setLoading(false);
    };

    const handleSaveAcademic = async () => {
        setSaving(true);
        try {
            const ciaMarks = editCia.split(",").map((s) => Number(s.trim())).filter((n) => !isNaN(n));
            await updateAcademicData(studentId, {
                ciaMarks,
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
                        <div>
                            <label className="text-xs text-text-muted">CIA Marks (comma separated)</label>
                            <input
                                type="text"
                                value={editCia}
                                onChange={(e) => setEditCia(e.target.value)}
                                className="w-full mt-1 bg-bg-secondary border border-border-primary rounded-lg p-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                                placeholder="85, 78, 92"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-text-muted">Attendance %</label>
                            <input
                                type="number"
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
