"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
    label?: string;
}

export default function ProgressBar({ currentStep, totalSteps, label }: ProgressBarProps) {
    const percentage = Math.max(0, Math.min(100, (currentStep / totalSteps) * 100));

    return (
        <div className="w-full flex justify-between gap-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className="h-1 flex-1 bg-[#1F1F1F] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-accent"
                        initial={{ width: 0 }}
                        animate={{ width: i < currentStep ? "100%" : "0%" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                </div>
            ))}
        </div>
    );
}
