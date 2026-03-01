"use client";

import { useAuth } from "@/hooks/useAuth";
import { getTimeGreeting } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Activity } from "lucide-react";

export default function StudentDashboard() {
    const { userData } = useAuth();
    const greeting = getTimeGreeting();

    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-1">
                        {greeting}, {userData?.name?.split(" ")[0] || "Student"}
                    </h1>
                    <p className="text-text-secondary">
                        Here's your academic wellness overview for today.
                    </p>
                </div>

                <Link href="/dashboard/student/log">
                    <Button variant="primary" className="flex items-center gap-2">
                        <Activity size={18} />
                        <span>Log Today's Data</span>
                    </Button>
                </Link>
            </div>

            {/* Placeholder for Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-bg-secondary border border-border-primary rounded-xl flex items-center justify-center">
                        <span className="text-sm text-[#333333]">Metric Card Placeholder</span>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Charts & Alerts */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="h-80 bg-bg-secondary border border-border-primary rounded-xl flex items-center justify-center p-6">
                        <span className="text-sm text-[#333333]">Stress Trend Chart Placeholder</span>
                    </div>

                    <div className="h-64 bg-bg-secondary border border-border-primary rounded-xl flex items-center justify-center p-6">
                        <span className="text-sm text-[#333333]">Recent History Placeholder</span>
                    </div>
                </div>

                {/* Right Column - AI Suggestions & Profile */}
                <div className="flex flex-col gap-6">
                    <div className="h-96 bg-bg-secondary border border-accent border-opacity-30 rounded-xl relative overflow-hidden flex flex-col p-6">
                        <div className="absolute inset-0 bg-accent opacity-[0.02]" />
                        <h3 className="font-semibold text-text-primary mb-4 relative z-10">AI Insights</h3>
                        <div className="flex-1 flex items-center justify-center border border-dashed border-border-primary rounded-lg relative z-10">
                            <span className="text-sm text-[#333333]">Suggestions Placeholder</span>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[200px] bg-bg-secondary border border-border-primary rounded-xl flex items-center justify-center p-6">
                        <span className="text-sm text-[#333333]">Academic Mini-Profile Placeholder</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
