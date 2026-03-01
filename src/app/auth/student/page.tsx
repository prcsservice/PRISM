"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { signInWithGoogle } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";

export default function StudentLoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { user, userData, loading: authLoading } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && user && userData) {
            if (userData.role === "student") {
                router.push(userData.onboardingCompleted ? "/dashboard/student" : "/onboarding");
            } else {
                router.push("/dashboard/teacher");
            }
        }
    }, [user, userData, authLoading, router]);

    const handleSignIn = async () => {
        try {
            setLoading(true);
            setError("");
            const result = await signInWithGoogle("student");

            if (result.isNewUser) {
                router.push("/onboarding");
            } else {
                router.push("/dashboard/student");
            }
        } catch (err: any) {
            setError(err.message || "Failed to sign in");
            setLoading(false);
        }
    };

    return (
        <AuthCard
            title="Student Portal"
            subtitle="Sign in to view your academic wellness insights, log daily activities, and access AI-driven suggestions."
            roleText="Are you a faculty member?"
            roleLink="/auth/teacher"
            roleLinkText="Log in as Teacher"
            accentColor="yellow"
        >
            <div className="flex flex-col gap-4">
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md">
                        <p className="text-sm text-red-500">{error}</p>
                    </div>
                )}

                <GoogleSignInButton
                    onClick={handleSignIn}
                    isLoading={loading}
                />

                <p className="text-xs text-text-muted text-center mt-4">
                    By signing in, you agree to PRISM's Terms of Service and Privacy Policy.
                    Data is collected entirely via opt-in consent.
                </p>
            </div>
        </AuthCard>
    );
}
