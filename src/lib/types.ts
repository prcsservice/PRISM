import { Timestamp } from "firebase/firestore";

// ===== Core User =====
export type Role = "student" | "teacher" | "admin";

export interface UserDoc {
    name: string;
    email: string;
    role: Role;
    photoURL?: string;
    onboardingCompleted: boolean;
    createdAt: Timestamp;
}

// ===== Student Schemas =====
export interface StudentProfile {
    studentId: string; // Document ID (UID)
    name: string;
    email: string;
    rollNo: string;
    department: string;
    section: string;
    year: number;
    consentGiven: boolean;
    consentDate: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface StudentAcademic {
    ciaMarks: number[];
    attendancePercentage: number;
    facultyFeedbackScore: number;
    updatedAt: Timestamp;
}

export type Mood = 1 | 2 | 3 | 4 | 5;
export type Social = 1 | 2 | 3 | 4 | 5;

export interface DailyLog {
    id?: string;
    date: string; // YYYY-MM-DD
    sleepHours: number;
    screenTimeHours: number;
    mood: Mood;
    studyHours: number;
    socialInteraction: Social;
    timestamp: Timestamp;
}

export type RiskLevel = "Low" | "Moderate" | "High";

export interface Prediction {
    id?: string;
    timestamp: Timestamp;
    riskScore: number; // 0-1
    predictionData: {
        stressLevel: number;
        failureProbability: number;
        attendanceDecline: number;
    };
    metrics: {
        avgSleep7d: number;
        avgScreenTime7d: number;
        avgMood7d: number;
        ciaAverage: number;
    };
    explanation: string;
    riskLevel: RiskLevel;
    suggestions: string[];
}

export interface StudentMetrics {
    currentStressLevel: number;
    riskScore: number;
    riskLevel: RiskLevel;
    lastCalculated: Timestamp;
}

// ===== Teacher Schemas =====
export interface Teacher {
    teacherId: string; // UID
    name: string;
    email: string;
    department: string;
    institution: string;
    subjectsFocus: string[];
    createdAt: Timestamp;
}

export type AlertPriority = "Warning" | "Critical";

export interface Alert {
    id?: string;
    alertId?: string;
    studentId: string;
    studentName: string; // Denormalized for quick querying
    priority: AlertPriority;
    reason: string;
    timestamp: Timestamp;
    resolved: boolean;
    resolvedBy?: string; // Teacher UID
    resolvedAt?: Timestamp;
    resolutionNotes?: string;
    status?: "new" | "reviewed" | "resolved";
    riskLevel?: RiskLevel;
    createdAt?: Timestamp;
    actionTaken?: string;
}

export interface Intervention {
    id?: string;
    studentId: string;
    teacherId: string;
    teacherName: string;
    date: Timestamp;
    notes: string;
    actionTaken: string;
    actionType?: MentorActionType;
    status?: "planned" | "in_progress" | "completed";
    followUpDate?: Timestamp;
    outcome?: "improved" | "no_change" | "worsened" | "pending";
}

// ===== Mentor Action System =====
export type MentorActionType =
    | "called_student"
    | "scheduled_meeting"
    | "referred_counselor"
    | "contacted_parent"
    | "academic_support"
    | "peer_mentoring"
    | "sent_encouragement"
    | "custom";

export const MENTOR_ACTION_LABELS: Record<MentorActionType, string> = {
    called_student: "Called Student",
    scheduled_meeting: "Scheduled Meeting",
    referred_counselor: "Referred to Counselor",
    contacted_parent: "Contacted Parent",
    academic_support: "Academic Support Plan",
    peer_mentoring: "Peer Mentoring Assigned",
    sent_encouragement: "Sent Encouragement",
    custom: "Other Action",
};

// ===== Notification System =====
export type NotificationType =
    | "risk_change"
    | "new_prediction"
    | "mentor_action"
    | "alert_created"
    | "log_reminder"
    | "stress_trend"
    | "ai_suggestion";

export interface AppNotification {
    id?: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    createdAt: Timestamp;
    link?: string; // Optional navigation link
    metadata?: Record<string, any>;
}
