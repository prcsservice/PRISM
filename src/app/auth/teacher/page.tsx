"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { signInWithGoogle } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";

export default function TeacherLoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { user, userData, loading: authLoading } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && user && userData) {
            if (userData.role === "teacher") {
                router.push(userData.onboardingCompleted ? "/dashboard/teacher" : "/onboarding");
            } else {
                router.push("/dashboard/student");
            }
        }
    }, [user, userData, authLoading, router]);

    const handleSignIn = async () => {
        try {
            setLoading(true);
            setError("");
            const result = await signInWithGoogle("teacher");

            if (result.isNewUser) {
                router.push("/onboarding");
            } else {
                router.push("/dashboard/teacher");
            }
        } catch (err: any) {
            setError(err.message || "Failed to sign in");
            setLoading(false);
        }
    };

    return (
        <AuthCard
            title="Faculty Portal"
            subtitle="Sign in to monitor student wellness, receive early warning alerts, and track academic interventions."
            roleText="Are you a student?"
            roleLink="/auth/student"
            roleLinkText="Log in as Student"
            accentColor="lime"
        >
            <div className="flex flex-col gap-4">
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md">
                        <p className="text-sm text-red-500">{error}</p>
                        {error.includes("approved faculty list") && (
                            <p className="text-xs text-text-secondary mt-2">
                                If you believe this is an error, please contact the system administrator to verify your email address is whitelisted.
                            </p>
                        )}
                    </div>
                )}

                <GoogleSignInButton
                    onClick={handleSignIn}
                    isLoading={loading}
                />

                <p className="text-xs text-text-muted text-center mt-4">
                    Faculty access is strictly limited to authorized academic and mentoring staff.
                    All access is logged and monitored.
                </p>
            </div>
        </AuthCard>
    );
}
