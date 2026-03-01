import { Home, Edit, TrendingUp, Lightbulb, BookOpen, Clock, Settings, Users, Bell, BarChart3 } from "lucide-react";

// ===== Navigation Items =====
export const STUDENT_NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard/student", icon: Home },
    { label: "Daily Log", href: "/dashboard/student/log", icon: Edit },
    { label: "Trends", href: "/dashboard/student/trends", icon: TrendingUp },
    { label: "Suggestions", href: "/dashboard/student/suggestions", icon: Lightbulb },
    { label: "Academic", href: "/dashboard/student/academic", icon: BookOpen },
    { label: "History", href: "/dashboard/student/history", icon: Clock },
    { label: "Settings", href: "/dashboard/student/settings", icon: Settings },
] as const;

export const TEACHER_NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard/teacher", icon: Home },
    { label: "Students", href: "/dashboard/teacher/students", icon: Users },
    { label: "Alerts", href: "/dashboard/teacher/alerts", icon: Bell },
    { label: "Analytics", href: "/dashboard/teacher/analytics", icon: BarChart3 },
    { label: "Settings", href: "/dashboard/teacher/settings", icon: Settings },
] as const;

// ===== Risk Level Config =====
export const RISK_LEVELS = {
    Low: { color: "var(--color-risk-low)", bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.2)" },
    Moderate: { color: "var(--accent)", bg: "var(--accent-muted)", border: "rgba(254, 204, 45, 0.2)" },
    High: { color: "var(--color-risk-high)", bg: "rgba(239, 68, 68, 0.1)", border: "rgba(239, 68, 68, 0.2)" },
} as const;

// ===== Landing Page Stats =====
export const PROBLEM_STATS = [
    { value: "65%", label: "of at-risk students go unnoticed" },
    { value: "3x", label: "more likely to drop out without intervention" },
    { value: "40%", label: "show warning signs weeks before failure" },
    { value: "82%", label: "could be helped with early detection" },
] as const;

// ===== FAQ Data =====
export const FAQ_ITEMS = [
    {
        question: "What data does PRISM collect?",
        answer: "PRISM collects daily self-reported logs (sleep hours, screen time, mood, study hours, social interaction) and academic data (CIA marks, attendance, faculty feedback). All data collection requires explicit consent.",
    },
    {
        question: "Who can see my data?",
        answer: "Students can only see their own data. Teachers can view data of students in their department for mentoring purposes. No data is shared with third parties.",
    },
    {
        question: "Is PRISM a medical diagnostic tool?",
        answer: "No. PRISM is strictly an academic support tool. It predicts academic risk indicators like stress levels and failure probability. It does not diagnose any medical or psychological conditions.",
    },
    {
        question: "How are predictions made?",
        answer: "PRISM uses Google Gemini 2.0 Flash AI to analyze normalized behavioral and academic data. The AI generates stress scores, failure probability, attendance predictions, and personalized suggestions.",
    },
    {
        question: "Can I delete my data?",
        answer: "Yes. Students can request data deletion through their Settings page. Upon request, all personal data, daily logs, and predictions will be permanently removed.",
    },
] as const;

// ===== How It Works Steps =====
export const HOW_IT_WORKS_STEPS = [
    {
        number: "01",
        title: "Data Collection",
        description: "Students submit daily behavioral logs including sleep, screen time, mood, and study patterns.",
    },
    {
        number: "02",
        title: "AI Analysis",
        description: "Gemini 2.0 Flash processes normalized data to identify risk patterns and predict outcomes.",
    },
    {
        number: "03",
        title: "Risk Classification",
        description: "Students are classified into Low, Moderate, or High risk levels with explainable reasoning.",
    },
    {
        number: "04",
        title: "Teacher Alerts",
        description: "Faculty receive prioritized alerts with intervention suggestions for at-risk students.",
    },
] as const;

// ===== Thresholds =====
export const ALERT_THRESHOLDS = {
    warning: { stress: 0.75, failure: 0.65 },
    critical: { stress: 0.85, failure: 0.75 },
} as const;

export const RISK_THRESHOLDS = {
    low: 0.4,
    moderate: 0.7,
} as const;
