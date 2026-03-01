"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DailyLogForm from "@/components/dashboard/DailyLogForm";
import { useDailyLog } from "@/hooks/useDailyLog";
import { useAuth } from "@/hooks/useAuth";
import type { DailyLog } from "@/lib/types";
import { CheckCircle } from "lucide-react";

export default function StudentLogPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { submitLog, checkTodayLog, loading: submitting, error } = useDailyLog();
    const [todayLog, setTodayLog] = useState<DailyLog | null | undefined>(undefined);
    const [checkingLog, setCheckingLog] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        async function check() {
            if (!user) return;
            setCheckingLog(true);
            const log = await checkTodayLog();
            setTodayLog(log ?? null);
            setCheckingLog(false);
        }
        check();
    }, [user]);

    const handleSubmit = async (data: {
        sleepHours: number;
        screenTimeHours: number;
        mood: 1 | 2 | 3 | 4 | 5;
        studyHours: number;
        socialInteraction: 1 | 2 | 3 | 4 | 5;
    }) => {
        const success = await submitLog(data);
        if (success) {
            setSubmitted(true);
            setTimeout(() => router.push("/dashboard/student"), 2000);
        }
    };

    if (checkingLog) {
        return (
            <div className="flex flex-col gap-8 pb-10">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight">Daily Log</h1>
                    <p className="text-text-secondary">Record your wellness indicators to receive accurate AI predictions.</p>
                </div>
                <div className="max-w-2xl bg-bg-secondary border border-border-primary rounded-xl p-6 md:p-8 flex justify-center py-20">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="flex flex-col gap-8 pb-10">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight">Daily Log</h1>
                    <p className="text-text-secondary">Record your wellness indicators to receive accurate AI predictions.</p>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl bg-bg-secondary border border-accent/30 rounded-xl p-8 md:p-10 flex flex-col items-center gap-4 text-center"
                >
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                        <CheckCircle size={32} className="text-accent" />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary">Log Submitted Successfully!</h2>
                    <p className="text-text-secondary text-sm">
                        Your daily wellness data has been recorded. PRISM&apos;s AI will process your data and generate predictions shortly.
                    </p>
                    <p className="text-xs text-text-muted">Redirecting to dashboard...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-text-primary tracking-tight">Daily Log</h1>
                <p className="text-text-secondary">
                    {todayLog
                        ? "You have already submitted your daily log for today."
                        : "Record your wellness indicators to receive accurate AI predictions."
                    }
                </p>
            </div>

            <div className="max-w-2xl bg-bg-secondary border border-border-primary rounded-xl p-6 md:p-8">
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                        {error}
                    </div>
                )}

                <DailyLogForm
                    onSubmit={handleSubmit}
                    disabled={submitting}
                    existingLog={todayLog ? {
                        sleepHours: todayLog.sleepHours,
                        screenTimeHours: todayLog.screenTimeHours,
                        mood: todayLog.mood,
                        studyHours: todayLog.studyHours,
                        socialInteraction: todayLog.socialInteraction,
                    } : null}
                />
            </div>
        </div>
    );
}
