"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
    getStudentProfile, getDailyLogs, getStudentMetrics, getStudentAcademic
} from "@/lib/firestore";
import type { StudentProfile, DailyLog, StudentMetrics, StudentAcademic } from "@/lib/types";

export function useStudentData() {
    const { user, userData } = useAuth();
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [academic, setAcademic] = useState<StudentAcademic | null>(null);
    const [metrics, setMetrics] = useState<StudentMetrics | null>(null);
    const [recentLogs, setRecentLogs] = useState<DailyLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            if (!user || userData?.role !== "student") {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const [p, a, m, logs] = await Promise.all([
                    getStudentProfile(user.uid),
                    getStudentAcademic(user.uid),
                    getStudentMetrics(user.uid),
                    getDailyLogs(user.uid, 30),
                ]);

                setProfile(p);
                setAcademic(a);
                setMetrics(m);
                // Reverse so chronological for charts (oldest to newest)
                setRecentLogs(logs.reverse());
            } catch (err: any) {
                console.error("Error fetching student data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user, userData]);

    return { profile, academic, metrics, recentLogs, loading, error };
}
