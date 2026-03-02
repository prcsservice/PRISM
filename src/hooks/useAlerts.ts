"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { resolveAlert as resolveAlertFn, updateAlertStatus as updateAlertStatusFn, onAlertsChange } from "@/lib/firestore";
import type { Alert } from "@/lib/types";

export function useAlerts() {
    const { user, userData } = useAuth();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user || userData?.role !== "teacher") {
            setLoading(false);
            return;
        }

        setLoading(true);

        // Use real-time listener for alerts
        const unsubscribe = onAlertsChange((alertsData) => {
            setAlerts(alertsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, userData]);

    const resolveAlertAction = useCallback(async (alertId: string, notes: string = "") => {
        if (!user) return false;
        try {
            await resolveAlertFn(alertId, user.uid, notes);
            return true;
        } catch (err: any) {
            console.error("Error resolving alert:", err);
            setError(err.message);
            return false;
        }
    }, [user]);

    const updateAlertStatus = useCallback(async (alertId: string, status: string, notes?: string) => {
        if (!user) return false;
        try {
            if (status === "resolved") {
                return resolveAlertAction(alertId, notes);
            }
            await updateAlertStatusFn(alertId, status, notes);
            return true;
        } catch (err: any) {
            console.error("Error updating alert status:", err);
            setError(err.message);
            return false;
        }
    }, [user, resolveAlertAction]);

    return { alerts, loading, error, resolveAlert: resolveAlertAction, updateAlertStatus };
}

