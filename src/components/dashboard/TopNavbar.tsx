"use client";

import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { Bell, Search, Sun, Moon, LogOut, Menu, User } from "lucide-react";
import Button from "@/components/ui/Button";

export default function TopNavbar() {
    const { theme, toggleTheme } = useTheme();
    const { userData, role } = useAuth();

    return (
        <header className="h-16 border-b border-border-primary bg-bg-primary/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
            {/* Mobile Menu Button - Left */}
            <div className="flex items-center md:hidden">
                <button className="p-2 text-text-secondary hover:text-text-primary transition-colors">
                    <Menu size={20} />
                </button>
            </div>

            {/* Centered context indicator (optional) */}
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

                {/* Notifications */}
                <button className="w-9 h-9 relative flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors">
                    <Bell size={18} />
                    {/* Indicator dot */}
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-bg-primary" />
                </button>

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
