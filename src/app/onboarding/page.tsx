"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

export default function OnboardingPage() {
    const { user, loading, onboardingCompleted, role } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If auth state has loaded but there's no user, kick to home
        if (!loading && !user) {
            router.push("/");
        }

        // If onboarding is already done, kick to dashboard
        if (!loading && user && onboardingCompleted) {
            router.push(role === "student" ? "/dashboard/student" : "/dashboard/teacher");
        }
    }, [user, loading, onboardingCompleted, role, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent rotate-45 flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 bg-accent" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 md:px-6 py-12 relative">
            {/* Background grain/texture to make it feel premium */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }} />

            <OnboardingForm />
        </div>
    );
}
