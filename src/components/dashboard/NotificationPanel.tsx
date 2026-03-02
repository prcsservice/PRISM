"use client";

import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell, Check, CheckCheck, AlertTriangle, TrendingUp, MessageSquare, Lightbulb, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import type { NotificationType } from "@/lib/types";

const NOTIFICATION_ICONS: Record<NotificationType, any> = {
    risk_change: AlertTriangle,
    new_prediction: TrendingUp,
    mentor_action: MessageSquare,
    alert_created: AlertTriangle,
    log_reminder: Clock,
    stress_trend: TrendingUp,
    ai_suggestion: Lightbulb,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
    risk_change: "text-orange-400",
    new_prediction: "text-blue-400",
    mentor_action: "text-[#A3E635]",
    alert_created: "text-red-400",
    log_reminder: "text-yellow-400",
    stress_trend: "text-orange-400",
    ai_suggestion: "text-purple-400",
};

export default function NotificationPanel() {
    const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleClick = (notif: any) => {
        if (!notif.read) markRead(notif.id);
        if (notif.link) {
            router.push(notif.link);
            setIsOpen(false);
        }
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp?.seconds) return "";
        const date = new Date(timestamp.seconds * 1000);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        const diffDays = Math.floor(diffHrs / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div ref={panelRef} className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-md hover:bg-bg-hover transition-colors"
                aria-label="Notifications"
            >
                <Bell size={20} className="text-text-secondary" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 top-12 w-96 max-h-[480px] bg-bg-secondary border border-border-primary rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
                        <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-[#A3E635] hover:underline flex items-center gap-1"
                            >
                                <CheckCheck size={12} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="flex-1 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                                <Bell size={32} className="mb-3 opacity-30" />
                                <p className="text-sm">No notifications yet</p>
                                <p className="text-xs mt-1">We&apos;ll notify you when something happens</p>
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                const IconComponent = NOTIFICATION_ICONS[notif.type] || Bell;
                                const colorClass = NOTIFICATION_COLORS[notif.type] || "text-text-secondary";

                                return (
                                    <button
                                        key={notif.id}
                                        onClick={() => handleClick(notif)}
                                        className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-bg-hover transition-colors border-b border-border-primary/50 ${!notif.read ? "bg-[#A3E635]/5" : ""}`}
                                    >
                                        <div className={`mt-0.5 shrink-0 ${colorClass}`}>
                                            <IconComponent size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm leading-snug ${!notif.read ? "font-semibold text-text-primary" : "text-text-secondary"}`}>
                                                    {notif.title}
                                                </p>
                                                {!notif.read && (
                                                    <span className="w-2 h-2 rounded-full bg-[#A3E635] shrink-0 mt-1.5" />
                                                )}
                                            </div>
                                            <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{notif.message}</p>
                                            <p className="text-[10px] text-text-muted mt-1">{formatTime(notif.createdAt)}</p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
