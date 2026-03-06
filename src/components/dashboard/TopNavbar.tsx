"use client";

import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { Search, Sun, Moon, LogOut } from "lucide-react";
import NotificationPanel from "@/components/dashboard/NotificationPanel";
import Link from "next/link";

export default function TopNavbar() {
    const { theme, toggleTheme } = useTheme();
    const { userData, role } = useAuth();

    const accentHsl = role === "teacher" ? "#A3E635" : "var(--accent)";

    return (
        <header className="h-14 md:h-16 border-b border-border-primary bg-bg-primary/80 backdrop-blur-md sticky top-0 z-40 px-3 md:px-8 flex items-center justify-between">
            {/* Mobile: PRISM Logo — Left */}
            <div className="flex items-center md:hidden">
                <Link href="/" className="flex items-center gap-1.5">
                    <div className="w-6 h-6 border-2 rotate-45 flex items-center justify-center" style={{ borderColor: accentHsl }}>
                        <div className="w-1.5 h-1.5 rotate-0" style={{ backgroundColor: accentHsl }} />
                    </div>
                    <span className="text-base font-extrabold text-text-primary tracking-tight">PRISM</span>
                </Link>
            </div>

            {/* Desktop: Context indicator — Left */}
            <div className="hidden md:flex items-center">
                <span className="text-sm font-medium text-text-secondary label-uppercase tracking-wider">
                    {role === "student" ? "Welcome Back" : "Faculty Command Center"}
                </span>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-3 md:gap-4">
                {/* Search */}
                <div className="hidden md:flex relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="h-9 bg-bg-hover border border-border-secondary rounded-md pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors w-48 lg:w-64"
                    />
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
                    title="Toggle theme"
                >
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Notifications - Live */}
                <NotificationPanel />

                <div className="w-px h-6 bg-border-secondary mx-1 hidden sm:block" />

                {/* User Menu Trigger (Simplified for now, just shows avatar + logout) */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-medium text-text-primary line-clamp-1">{userData?.name || "User"}</p>
                        <p className="text-xs text-text-secondary capitalize">{role || "Loading..."}</p>
                    </div>

                    <button
                        onClick={() => signOut()}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-bg-hover border border-border-secondary text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                        title="Sign out"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </header>
    );
}
