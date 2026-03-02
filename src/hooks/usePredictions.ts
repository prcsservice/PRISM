"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getLatestPrediction, getPredictionHistory } from "@/lib/firestore";
import type { Prediction } from "@/lib/types";

export function usePredictions() {
    const { user, userData } = useAuth();
    const [latestPrediction, setLatestPrediction] = useState<Prediction | null>(null);
    const [history, setHistory] = useState<Prediction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPredictions = useCallback(async () => {
        if (!user || userData?.role !== "student") {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const [latest, hist] = await Promise.all([
                getLatestPrediction(user.uid),
                getPredictionHistory(user.uid, 30),
            ]);

            setLatestPrediction(latest);
            setHistory(hist);
        } catch (err: any) {
            console.error("Error fetching predictions:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user, userData]);

    useEffect(() => {
        fetchPredictions();
    }, [fetchPredictions]);

    return { latestPrediction, history, loading, error, refetch: fetchPredictions };
}
