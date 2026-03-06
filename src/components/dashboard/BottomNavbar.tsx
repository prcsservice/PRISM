"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
    LayoutDashboard,
    Activity,
    TrendingUp,
    Lightbulb,
    Settings,
    Users,
    AlertTriangle,
    BarChart3,
} from "lucide-react";

const STUDENT_NAV = [
    { name: "Home", href: "/dashboard/student", icon: LayoutDashboard },
    { name: "Log", href: "/dashboard/student/log", icon: Activity },
    { name: "Trends", href: "/dashboard/student/trends", icon: TrendingUp },
    { name: "AI", href: "/dashboard/student/suggestions", icon: Lightbulb },
    { name: "Settings", href: "/dashboard/student/settings", icon: Settings },
];

const TEACHER_NAV = [
    { name: "Home", href: "/dashboard/teacher", icon: LayoutDashboard },
    { name: "Students", href: "/dashboard/teacher/students", icon: Users },
    { name: "Alerts", href: "/dashboard/teacher/alerts", icon: AlertTriangle },
    { name: "Analytics", href: "/dashboard/teacher/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/teacher/settings", icon: Settings },
];

export default function BottomNavbar() {
    const pathname = usePathname();
    const { role } = useAuth();

    const navItems = role === "teacher" ? TEACHER_NAV : STUDENT_NAV;
    const accentColor = role === "teacher" ? "#A3E635" : "var(--accent)";

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Frosted glass container */}
            <div className="mx-3 mb-3 bg-bg-primary/80 backdrop-blur-xl border border-border-primary rounded-2xl shadow-[0_-4px_30px_rgba(0,0,0,0.15)] px-2 py-1.5">
                <div className="flex items-center justify-around">
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/dashboard/student" &&
                                item.href !== "/dashboard/teacher" &&
                                pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-0 ${isActive
                                        ? "scale-105"
                                        : "text-text-muted hover:text-text-secondary"
                                    }`}
                            >
                                <div
                                    className={`p-1.5 rounded-lg transition-colors ${isActive ? "bg-bg-tertiary" : ""
                                        }`}
                                >
                                    <item.icon
                                        size={20}
                                        strokeWidth={isActive ? 2.5 : 1.5}
                                        style={{
                                            color: isActive ? accentColor : undefined,
                                        }}
                                    />
                                </div>
                                <span
                                    className={`text-[10px] font-medium leading-none ${isActive ? "text-text-primary" : ""
                                        }`}
                                >
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
