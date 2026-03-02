"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, loading, userData } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Route Protection & Role Verification
    useEffect(() => {
        if (loading) return;

        if (!user || !userData) {
            router.push("/");
            return;
        }

        if (!userData.onboardingCompleted) {
            router.push("/onboarding");
            return;
        }

        // Role-based route guard: prevent cross-role access
        const isOnStudentRoute = pathname.startsWith("/dashboard/student");
        const isOnTeacherRoute = pathname.startsWith("/dashboard/teacher");

        if (userData.role === "student" && isOnTeacherRoute) {
            router.push("/dashboard/student");
            return;
        }
        if (userData.role === "teacher" && isOnStudentRoute) {
            router.push("/dashboard/teacher");
            return;
        }
    }, [user, loading, userData, router, pathname]);

    if (loading || !user || !userData || !userData.onboardingCompleted) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent rotate-45 flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 bg-accent" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary flex">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <TopNavbar />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-bg-secondary">
                    <div className="max-w-[1200px] mx-auto w-full">
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </div>
                </main>
            </div>
        </div>
    );
}
