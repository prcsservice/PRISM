"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import {
    LayoutDashboard,
    Activity,
    TrendingUp,
    Lightbulb,
    GraduationCap,
    History,
    Settings,
    Users,
    AlertTriangle,
    BarChart3,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

const STUDENT_NAV = [
    { name: "Overview", href: "/dashboard/student", icon: LayoutDashboard },
    { name: "Daily Log", href: "/dashboard/student/log", icon: Activity },
    { name: "Trends", href: "/dashboard/student/trends", icon: TrendingUp },
    { name: "AI Suggestions", href: "/dashboard/student/suggestions", icon: Lightbulb },
    { name: "Academic Profile", href: "/dashboard/student/academic", icon: GraduationCap },
    { name: "History", href: "/dashboard/student/history", icon: History },
    { name: "Settings", href: "/dashboard/student/settings", icon: Settings },
];

const TEACHER_NAV = [
    { name: "Dashboard", href: "/dashboard/teacher", icon: LayoutDashboard },
    { name: "Students", href: "/dashboard/teacher/students", icon: Users },
    { name: "Alerts", href: "/dashboard/teacher/alerts", icon: AlertTriangle },
    { name: "Analytics", href: "/dashboard/teacher/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/teacher/settings", icon: Settings },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const { role } = useAuth();

    const navItems = role === "teacher" ? TEACHER_NAV : STUDENT_NAV;
    const accentHsl = role === "teacher" ? "#A3E635" : "var(--accent)"; // Lime vs Yellow

    return (
        <motion.aside
            initial={{ width: 260 }}
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="hidden md:flex flex-col h-screen bg-bg-primary border-r border-border-primary sticky top-0"
        >
            {/* Brand Header */}
            <div className="h-16 flex items-center px-4 border-b border-border-primary">
                <Link href="/" className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                    <div className="min-w-8 w-8 h-8 border-2 rotate-45 flex items-center justify-center ml-1" style={{ borderColor: accentHsl }}>
                        <div className="w-2 h-2 rotate-0" style={{ backgroundColor: accentHsl }} />
                    </div>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl font-extrabold text-text-primary tracking-tight ml-2"
                        >
                            PRISM
                        </motion.span>
                    )}
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 py-6 px-3 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard/student" && item.href !== "/dashboard/teacher" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative ${isActive
                                ? "bg-bg-tertiary text-text-primary"
                                : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                                }`}
                        >
                            <item.icon
                                size={20}
                                className={`min-w-5 transition-colors ${isActive ? "" : "group-hover:text-text-primary"}`}
                                style={{ color: isActive ? accentHsl : undefined }}
                            />
                            {!collapsed && (
                                <span className="font-medium whitespace-nowrap">{item.name}</span>
                            )}

                            {/* Tooltip for collapsed mode */}
                            {collapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-bg-tertiary text-text-primary text-xs font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Toggle */}
            <div className="p-3 border-t border-border-primary">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center p-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>
        </motion.aside>
    );
}
