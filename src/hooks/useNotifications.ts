"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { onNotificationsChange, markNotificationRead, markAllNotificationsRead } from "@/lib/firestore";
import type { AppNotification } from "@/lib/types";

export function useNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        const unsubscribe = onNotificationsChange(user.uid, (notifs) => {
            setNotifications(notifs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markRead = async (id: string) => {
        await markNotificationRead(id);
    };

    const markAllRead = async () => {
        if (!user) return;
        await markAllNotificationsRead(user.uid);
    };

    return { notifications, unreadCount, loading, markRead, markAllRead };
}
