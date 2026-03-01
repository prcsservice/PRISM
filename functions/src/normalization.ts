// Server-side normalization formulas
// All outputs clamped to [0, 1]

function clamp01(v: number): number {
    return Math.max(0, Math.min(1, v));
}

export function normSleep(sleepHours: number): number {
    return clamp01(1 - sleepHours / 8);
}

export function normScreenTime(screenTimeHours: number): number {
    return clamp01(screenTimeHours / 10);
}

export function normMood(mood: number): number {
    return clamp01(1 - (mood - 1) / 4);
}

export function normStudyHours(studyHours: number): number {
    return clamp01(1 - studyHours / 6);
}

export function normSocial(social: number): number {
    return clamp01(1 - (social - 1) / 4);
}

export function normMarks(ciaAverage: number, maxMarks: number = 100): number {
    return clamp01(1 - ciaAverage / maxMarks);
}

export function normAttendance(attendancePercentage: number): number {
    return clamp01(1 - attendancePercentage / 100);
}

export function normFeedback(feedbackScore: number): number {
    return clamp01(1 - (feedbackScore - 1) / 4);
}

export interface NormalizedFeatures {
    sleepNorm: number;
    screenTimeNorm: number;
    moodNorm: number;
    studyNorm: number;
    socialNorm: number;
    marksNorm: number;
    attendanceNorm: number;
    feedbackNorm: number;
}

export function normalizeAll(input: {
    sleepHours: number;
    screenTimeHours: number;
    mood: number;
    studyHours: number;
    socialInteraction: number;
    ciaAverage: number;
    attendancePercentage: number;
    facultyFeedbackScore: number;
}): NormalizedFeatures {
    return {
        sleepNorm: normSleep(input.sleepHours),
        screenTimeNorm: normScreenTime(input.screenTimeHours),
        moodNorm: normMood(input.mood),
        studyNorm: normStudyHours(input.studyHours),
        socialNorm: normSocial(input.socialInteraction),
        marksNorm: normMarks(input.ciaAverage),
        attendanceNorm: normAttendance(input.attendancePercentage),
        feedbackNorm: normFeedback(input.facultyFeedbackScore),
    };
}

// === Weighted Scoring Model ===

const WEIGHTS = {
    stress: {
        sleepNorm: 0.20, screenTimeNorm: 0.15, moodNorm: 0.25,
        studyNorm: 0.10, socialNorm: 0.10, marksNorm: 0.05,
        attendanceNorm: 0.10, feedbackNorm: 0.05,
    },
    failure: {
        sleepNorm: 0.10, screenTimeNorm: 0.10, moodNorm: 0.15,
        studyNorm: 0.15, socialNorm: 0.05, marksNorm: 0.25,
        attendanceNorm: 0.15, feedbackNorm: 0.05,
    },
    attendanceDecline: {
        sleepNorm: 0.15, screenTimeNorm: 0.20, moodNorm: 0.20,
        studyNorm: 0.10, socialNorm: 0.10, marksNorm: 0.05,
        attendanceNorm: 0.15, feedbackNorm: 0.05,
    },
};

function weightedSum(features: NormalizedFeatures, weights: Record<string, number>): number {
    let sum = 0;
    for (const [key, weight] of Object.entries(weights)) {
        sum += ((features as any)[key] ?? 0) * weight;
    }
    return clamp01(sum);
}

export type RiskLevel = "Low" | "Moderate" | "High";

export interface PredictionResult {
    stressLevel: number;
    failureProbability: number;
    attendanceDecline: number;
    riskScore: number;
    riskLevel: RiskLevel;
}

export function computeScores(features: NormalizedFeatures): PredictionResult {
    const stressLevel = weightedSum(features, WEIGHTS.stress);
    const failureProbability = weightedSum(features, WEIGHTS.failure);
    const attendanceDecline = weightedSum(features, WEIGHTS.attendanceDecline);
    const riskScore = clamp01(stressLevel * 0.4 + failureProbability * 0.4 + attendanceDecline * 0.2);

    let riskLevel: RiskLevel = "Low";
    if (riskScore >= 0.7) riskLevel = "High";
    else if (riskScore >= 0.4) riskLevel = "Moderate";

    return { stressLevel, failureProbability, attendanceDecline, riskScore, riskLevel };
}
