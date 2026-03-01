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
}
