"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Slider from "@/components/ui/Slider";
import Button from "@/components/ui/Button";
import type { Mood, Social } from "@/lib/types";

interface DailyLogFormProps {
    onSubmit: (data: {
        sleepHours: number;
        screenTimeHours: number;
        mood: Mood;
        studyHours: number;
        socialInteraction: Social;
    }) => Promise<void>;
    disabled?: boolean;
    existingLog?: {
        sleepHours: number;
        screenTimeHours: number;
        mood: Mood;
        studyHours: number;
        socialInteraction: Social;
    } | null;
}

const MOOD_LABELS = ["Very Bad", "Bad", "Neutral", "Good", "Great"];
const SOCIAL_LABELS = ["Isolated", "Low", "Average", "Active", "Very Active"];

export default function DailyLogForm({ onSubmit, disabled = false, existingLog }: DailyLogFormProps) {
    const [sleep, setSleep] = useState(existingLog?.sleepHours ?? 7);
    const [screenTime, setScreenTime] = useState(existingLog?.screenTimeHours ?? 3);
    const [mood, setMood] = useState<Mood>(existingLog?.mood ?? 3);
    const [studyHours, setStudyHours] = useState(existingLog?.studyHours ?? 3);
    const [social, setSocial] = useState<Social>(existingLog?.socialInteraction ?? 3);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onSubmit({ sleepHours: sleep, screenTimeHours: screenTime, mood, studyHours, socialInteraction: social });
        } finally {
            setLoading(false);
        }
    };

    const isReadOnly = disabled || !!existingLog;

    return (
        <div className="space-y-6">
            {existingLog && (
                <div className="text-sm text-text-muted bg-bg-secondary rounded-lg p-3 border border-border-primary">
                    You have already logged today. Here is your summary.
                </div>
            )}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Slider label="Sleep Hours" value={sleep} onChange={setSleep} min={0} max={12} step={0.5} unit="h" disabled={isReadOnly} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Slider label="Screen Time" value={screenTime} onChange={setScreenTime} min={0} max={16} step={0.5} unit="h" disabled={isReadOnly} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-text-primary">Mood</label>
                    <div className="flex gap-2">
                        {([1, 2, 3, 4, 5] as Mood[]).map((v) => (
                            <button
                                key={v}
                                onClick={() => !isReadOnly && setMood(v)}
                                disabled={isReadOnly}
                                className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all border ${mood === v
                                        ? "bg-accent text-black border-accent"
                                        : "bg-bg-secondary text-text-secondary border-border-primary hover:border-border-hover"
                                    } disabled:cursor-not-allowed`}
                            >
                                {MOOD_LABELS[v - 1]}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Slider label="Study Hours" value={studyHours} onChange={setStudyHours} min={0} max={12} step={0.5} unit="h" disabled={isReadOnly} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-text-primary">Social Interaction</label>
                    <div className="flex gap-2">
                        {([1, 2, 3, 4, 5] as Social[]).map((v) => (
                            <button
                                key={v}
                                onClick={() => !isReadOnly && setSocial(v)}
                                disabled={isReadOnly}
                                className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all border ${social === v
                                        ? "bg-accent text-black border-accent"
                                        : "bg-bg-secondary text-text-secondary border-border-primary hover:border-border-hover"
                                    } disabled:cursor-not-allowed`}
                            >
                                {SOCIAL_LABELS[v - 1]}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {!existingLog && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || disabled}
                        className="w-full"
                    >
                        {loading ? "Submitting..." : "Submit Daily Log"}
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
