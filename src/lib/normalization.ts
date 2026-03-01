// Normalization formulas from PRD section 9.1
// All outputs clamped to [0, 1] range

export function clamp01(v: number): number {
    return Math.max(0, Math.min(1, v));
}

/** Sleep: lower sleep = higher risk. 8h is optimal. */
export function normSleep(sleepHours: number): number {
    return clamp01(1 - sleepHours / 8);
}

/** Screen time: higher screen = higher risk. 10h is max. */
export function normScreenTime(screenTimeHours: number): number {
    return clamp01(screenTimeHours / 10);
}

/** Mood: lower mood = higher risk. Scale 1-5. */
export function normMood(mood: number): number {
    return clamp01(1 - (mood - 1) / 4);
}

/** Study hours: lower study = higher risk. 6h is optimal. */
export function normStudyHours(studyHours: number): number {
    return clamp01(1 - studyHours / 6);
}

/** Social interaction: lower social = higher risk. Scale 1-5. */
export function normSocial(social: number): number {
    return clamp01(1 - (social - 1) / 4);
}

/** CIA Marks: lower marks = higher risk. Scale 0-100. */
export function normMarks(ciaAverage: number, maxMarks: number = 100): number {
    return clamp01(1 - ciaAverage / maxMarks);
}

/** Attendance: lower attendance = higher risk. Scale 0-100%. */
export function normAttendance(attendancePercentage: number): number {
    return clamp01(1 - attendancePercentage / 100);
}

/** Faculty feedback: higher score = lower risk. Scale 1-5 (5 = excellent). */
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
