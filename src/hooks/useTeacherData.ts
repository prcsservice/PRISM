"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
    getTeacherProfile, getAllStudentsWithMetrics
} from "@/lib/firestore";
import type { Teacher, StudentProfile, StudentMetrics } from "@/lib/types";

export function useTeacherData() {
    const { user, userData } = useAuth();
    const [profile, setProfile] = useState<Teacher | null>(null);
    const [students, setStudents] = useState<Array<StudentProfile & { metrics?: StudentMetrics }>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            if (!user || userData?.role !== "teacher") {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const teacherProfile = await getTeacherProfile(user.uid);
                setProfile(teacherProfile);

                if (teacherProfile?.department) {
                    const studentsData = await getAllStudentsWithMetrics(teacherProfile.department);
                    setStudents(studentsData);
                }
            } catch (err: any) {
                console.error("Error fetching teacher data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user, userData]);

    return { profile, students, loading, error };
}
