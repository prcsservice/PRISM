import {
    doc, setDoc, getDoc, updateDoc, deleteDoc,
    collection, query, where, orderBy, limit, getDocs,
    addDoc, Timestamp, onSnapshot, startAfter, DocumentSnapshot
} from "firebase/firestore";
import { db } from "./firebase";
import type {
    UserDoc, StudentProfile, StudentAcademic, DailyLog,
    Prediction, StudentMetrics, Teacher, Alert, Intervention, Role,
    AppNotification
} from "./types";

// ===== Users =====

export async function createUser(uid: string, data: Omit<UserDoc, "createdAt">) {
    await setDoc(doc(db, "users", uid), {
        ...data,
        createdAt: Timestamp.now(),
    });
}

export async function getUser(uid: string): Promise<UserDoc | null> {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? (snap.data() as UserDoc) : null;
}

export async function updateUser(uid: string, data: Partial<UserDoc>) {
    await updateDoc(doc(db, "users", uid), data);
}

// ===== Student Profile =====

export async function createStudentProfile(uid: string, data: Omit<StudentProfile, "createdAt" | "updatedAt">) {
    await setDoc(doc(db, "students", uid, "profile", "main"), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
}

export async function getStudentProfile(uid: string): Promise<StudentProfile | null> {
    const mainSnap = await getDoc(doc(db, "students", uid, "profile", "main"));
    if (mainSnap.exists()) return mainSnap.data() as StudentProfile;

    // Fallback: check legacy path (profile/data) and auto-migrate
    const legacySnap = await getDoc(doc(db, "students", uid, "profile", "data"));
    if (legacySnap.exists()) {
        const data = legacySnap.data() as StudentProfile;
        // Migrate to correct path
        try {
            await setDoc(doc(db, "students", uid, "profile", "main"), data);
        } catch {
            // If migration fails (permissions), still return data
        }
        return data;
    }

    return null;
}

export async function updateStudentProfile(uid: string, data: Partial<StudentProfile>) {
    await updateDoc(doc(db, "students", uid, "profile", "main"), {
        ...data,
        updatedAt: Timestamp.now(),
    });
}

// ===== Student Academic =====

export async function getStudentAcademic(uid: string): Promise<StudentAcademic | null> {
    const snap = await getDoc(doc(db, "students", uid, "academic", "data"));
    return snap.exists() ? (snap.data() as StudentAcademic) : null;
}

export async function updateAcademicData(uid: string, data: Partial<StudentAcademic>) {
    await setDoc(doc(db, "students", uid, "academic", "data"), {
        ...data,
        updatedAt: Timestamp.now(),
    }, { merge: true });
}

// ===== Daily Logs =====

export async function addDailyLog(studentId: string, data: Omit<DailyLog, "id" | "timestamp">) {
    const ref = await addDoc(collection(db, "students", studentId, "dailyLogs"), {
        ...data,
        timestamp: Timestamp.now(),
    });
    return ref.id;
}

export async function getDailyLogs(studentId: string, days: number = 30): Promise<DailyLog[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const q = query(
        collection(db, "students", studentId, "dailyLogs"),
        where("timestamp", ">=", Timestamp.fromDate(cutoff)),
        orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as DailyLog));
}

export async function hasLoggedToday(studentId: string): Promise<boolean> {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const q = query(
        collection(db, "students", studentId, "dailyLogs"),
        where("date", "==", today),
        limit(1)
    );
    const snap = await getDocs(q);
    return !snap.empty;
}

export async function getTodayLog(studentId: string): Promise<DailyLog | null> {
    const today = new Date().toISOString().split("T")[0];
    const q = query(
        collection(db, "students", studentId, "dailyLogs"),
        where("date", "==", today),
        limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as DailyLog;
}

// ===== Predictions =====

export async function getLatestPrediction(studentId: string): Promise<Prediction | null> {
    const q = query(
        collection(db, "students", studentId, "predictions"),
        orderBy("timestamp", "desc"),
        limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Prediction;
}

export async function getPredictionHistory(studentId: string, days: number = 30): Promise<Prediction[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const q = query(
        collection(db, "students", studentId, "predictions"),
        where("timestamp", ">=", Timestamp.fromDate(cutoff)),
        orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Prediction));
}

// ===== Student Metrics =====

export async function getStudentMetrics(studentId: string): Promise<StudentMetrics | null> {
    const snap = await getDoc(doc(db, "students", studentId, "metrics", "current"));
    return snap.exists() ? (snap.data() as StudentMetrics) : null;
}

export async function updateStudentMetrics(studentId: string, data: Partial<StudentMetrics>) {
    await setDoc(doc(db, "students", studentId, "metrics", "current"), {
        ...data,
        lastCalculated: Timestamp.now(),
    }, { merge: true });
}

// ===== Teacher =====

export async function createTeacherProfile(uid: string, data: Omit<Teacher, "createdAt">) {
    await setDoc(doc(db, "teachers", uid), {
        ...data,
        createdAt: Timestamp.now(),
    });
}

export async function getTeacherProfile(uid: string): Promise<Teacher | null> {
    const snap = await getDoc(doc(db, "teachers", uid));
    return snap.exists() ? (snap.data() as Teacher) : null;
}

export async function updateTeacherProfile(uid: string, data: Partial<Teacher>) {
    await updateDoc(doc(db, "teachers", uid), data);
}

// ===== Data Deletion =====

export async function requestDataDeletion(uid: string) {
    await updateDoc(doc(db, "users", uid), {
        deletionRequested: true,
        deletionRequestedAt: Timestamp.now(),
    });
}

// ===== Alerts =====

export async function getAlerts(filters?: {
    priority?: "Warning" | "Critical";
    resolved?: boolean;
    department?: string;
}): Promise<Alert[]> {
    let q = query(collection(db, "alerts"), orderBy("timestamp", "desc"));

    // Client-side filtering since Firestore composite queries need indexes
    const snap = await getDocs(q);
    let alerts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Alert));

    if (filters?.priority) {
        alerts = alerts.filter(a => a.priority === filters.priority);
    }
    if (filters?.resolved !== undefined) {
        alerts = alerts.filter(a => a.resolved === filters.resolved);
    }

    return alerts;
}

export async function resolveAlert(
    alertId: string,
    teacherId: string,
    notes: string
) {
    await updateDoc(doc(db, "alerts", alertId), {
        resolved: true,
        resolvedBy: teacherId,
        resolvedAt: Timestamp.now(),
        resolutionNotes: notes,
        status: "resolved",
    });
}

export async function createAlert(data: Omit<Alert, "id" | "alertId">) {
    const ref = await addDoc(collection(db, "alerts"), {
        ...data,
        timestamp: Timestamp.now(),
    });
    return ref.id;
}

// ===== Interventions =====

export async function addIntervention(data: Omit<Intervention, "id">) {
    const ref = await addDoc(collection(db, "interventions"), {
        ...data,
        date: Timestamp.now(),
    });
    return ref.id;
}

export async function getInterventions(studentId: string): Promise<Intervention[]> {
    const q = query(
        collection(db, "interventions"),
        where("studentId", "==", studentId),
        orderBy("date", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Intervention));
}

// ===== Teacher: Get Students =====

export async function getStudentsByDepartment(department: string): Promise<StudentProfile[]> {
    const studentsRef = collection(db, "students");
    const snap = await getDocs(studentsRef);

    const profiles: StudentProfile[] = [];
    for (const studentDoc of snap.docs) {
        const profileSnap = await getDoc(doc(db, "students", studentDoc.id, "profile", "main"));
        if (profileSnap.exists()) {
            const profile = profileSnap.data() as StudentProfile;
            if (profile.department === department) {
                profiles.push(profile);
            }
        }
    }
    return profiles;
}

export async function getAllStudentsWithMetrics(department?: string): Promise<
    Array<StudentProfile & { metrics?: StudentMetrics }>
> {
    const usersQ = query(collection(db, "users"), where("role", "==", "student"));
    const usersSnap = await getDocs(usersQ);

    const results: Array<StudentProfile & { metrics?: StudentMetrics }> = [];

    for (const userDoc of usersSnap.docs) {
        const profileSnap = await getDoc(doc(db, "students", userDoc.id, "profile", "main"));
        if (!profileSnap.exists()) continue;

        const profile = profileSnap.data() as StudentProfile;
        if (department && profile.department !== department) continue;

        const metricsSnap = await getDoc(doc(db, "students", userDoc.id, "metrics", "current"));
        const metrics = metricsSnap.exists() ? (metricsSnap.data() as StudentMetrics) : undefined;

        results.push({ ...profile, studentId: userDoc.id, metrics });
    }

    return results;
}

// ===== Approved Teachers =====

export async function checkApprovedTeacher(email: string): Promise<boolean> {
    const q = query(
        collection(db, "approvedTeachers"),
        where("email", "==", email),
        limit(1)
    );
    const snap = await getDocs(q);
    return !snap.empty;
}

// ===== Real-time Listeners =====

export function onStudentMetricsChange(
    studentId: string,
    callback: (metrics: StudentMetrics | null) => void
) {
    return onSnapshot(doc(db, "students", studentId, "metrics", "current"), (snap) => {
        callback(snap.exists() ? (snap.data() as StudentMetrics) : null);
    });
}

export function onAlertsChange(
    callback: (alerts: Alert[]) => void
) {
    const q = query(collection(db, "alerts"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Alert)));
    });
}

// ===== Notifications =====

export function onNotificationsChange(
    userId: string,
    callback: (notifications: AppNotification[]) => void
) {
    const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(50)
    );
    return onSnapshot(
        q,
        (snap) => {
            callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification)));
        },
        (error) => {
            console.error("Notification listener error:", error.message);
            // If there's a FAILED_PRECONDITION error, it means a composite index is needed
            // The error message will contain a link to create the index
            if (error.message.includes("index")) {
                console.error("You need to create a composite index. Check the error link above.");
            }
            // Return empty to avoid crashing
            callback([]);
        }
    );
}

export async function markNotificationRead(notificationId: string) {
    try {
        await updateDoc(doc(db, "notifications", notificationId), { read: true });
    } catch (error) {
        console.error("Failed to mark notification read:", error);
    }
}

export async function markAllNotificationsRead(userId: string) {
    try {
        // Use same query as the listener (only userId filter, no read filter to avoid index issues)
        const q = query(
            collection(db, "notifications"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
            limit(50)
        );
        const snap = await getDocs(q);
        const unread = snap.docs.filter(d => d.data().read === false);
        const promises = unread.map(d => updateDoc(d.ref, { read: true }));
        await Promise.all(promises);
    } catch (error) {
        console.error("Failed to mark all notifications read:", error);
    }
}
