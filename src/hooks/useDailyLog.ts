"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { addDailyLog, hasLoggedToday, getTodayLog } from "@/lib/firestore";
import type { DailyLog, Mood, Social } from "@/lib/types";

export function useDailyLog() {
    const { user, userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitLog = async (logData: {
        sleepHours: number;
        screenTimeHours: number;
        mood: Mood;
        studyHours: number;
        socialInteraction: Social;
    }) => {
        if (!user || userData?.role !== "student") {
            throw new Error("Only students can submit daily logs.");
        }

        try {
            setLoading(true);
            setError(null);

            // Check if already logged today
            const alreadyLogged = await hasLoggedToday(user.uid);
            if (alreadyLogged) {
                setError("You have already submitted a log for today.");
                return false;
            }

            const todayString = new Date().toISOString().split("T")[0];

            await addDailyLog(user.uid, {
                date: todayString,
                ...logData,
            });

            return true;
        } catch (err: any) {
            console.error("Error submitting log:", err);
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const checkTodayLog = async () => {
        if (!user) return null;
        return getTodayLog(user.uid);
    };

    return { submitLog, checkTodayLog, loading, error };
}
