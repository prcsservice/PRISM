"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getAlerts, resolveAlert as resolveAlertFn, onAlertsChange } from "@/lib/firestore";
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

    const updateAlertStatus = useCallback(async (alertId: string, status: string, actionTaken?: string) => {
        // For backwards compatibility with existing page usage
        if (status === "resolved") {
            return resolveAlertAction(alertId, actionTaken);
        }
        return false;
    }, [resolveAlertAction]);

    return { alerts, loading, error, resolveAlert: resolveAlertAction, updateAlertStatus };
}
