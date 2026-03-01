"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import Button from "@/components/ui/Button";

export default function AccessDeniedPage() {
    return (
        <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6">
            <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-2">
                    <ShieldAlert size={40} />
                </div>

                <h1 className="text-3xl font-bold text-text-primary tracking-tight">Access Denied</h1>

                <p className="text-base text-text-secondary leading-relaxed">
                    You do not have permission to view this page. This may be because you are trying to access a dashboard for a different role, or your session has expired.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
                    <Link href="/auth/student" className="flex-1">
                        <Button variant="secondary" className="w-full">Student Login</Button>
                    </Link>
                    <Link href="/auth/teacher" className="flex-1">
                        <Button variant="secondary" className="w-full">Teacher Login</Button>
                    </Link>
                </div>

                <Link href="/" className="text-sm text-text-muted hover:text-text-primary mt-4 transition-colors">
                    Return to Homepage
                </Link>
            </div>
        </div>
    );
}
