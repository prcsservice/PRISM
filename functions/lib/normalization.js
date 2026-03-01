"use strict";
// Server-side normalization formulas
// All outputs clamped to [0, 1]
Object.defineProperty(exports, "__esModule", { value: true });
exports.normSleep = normSleep;
exports.normScreenTime = normScreenTime;
exports.normMood = normMood;
exports.normStudyHours = normStudyHours;
exports.normSocial = normSocial;
exports.normMarks = normMarks;
exports.normAttendance = normAttendance;
exports.normFeedback = normFeedback;
exports.normalizeAll = normalizeAll;
exports.computeScores = computeScores;
function clamp01(v) {
    return Math.max(0, Math.min(1, v));
}
function normSleep(sleepHours) {
    return clamp01(1 - sleepHours / 8);
}
function normScreenTime(screenTimeHours) {
    return clamp01(screenTimeHours / 10);
}
function normMood(mood) {
    return clamp01(1 - (mood - 1) / 4);
}
function normStudyHours(studyHours) {
    return clamp01(1 - studyHours / 6);
}
function normSocial(social) {
    return clamp01(1 - (social - 1) / 4);
}
function normMarks(ciaAverage, maxMarks = 100) {
    return clamp01(1 - ciaAverage / maxMarks);
}
function normAttendance(attendancePercentage) {
    return clamp01(1 - attendancePercentage / 100);
}
function normFeedback(feedbackScore) {
    return clamp01(1 - (feedbackScore - 1) / 4);
}
function normalizeAll(input) {
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
function weightedSum(features, weights) {
    var _a;
    let sum = 0;
    for (const [key, weight] of Object.entries(weights)) {
        sum += ((_a = features[key]) !== null && _a !== void 0 ? _a : 0) * weight;
    }
    return clamp01(sum);
}
function computeScores(features) {
    const stressLevel = weightedSum(features, WEIGHTS.stress);
    const failureProbability = weightedSum(features, WEIGHTS.failure);
    const attendanceDecline = weightedSum(features, WEIGHTS.attendanceDecline);
    const riskScore = clamp01(stressLevel * 0.4 + failureProbability * 0.4 + attendanceDecline * 0.2);
    let riskLevel = "Low";
    if (riskScore >= 0.7)
        riskLevel = "High";
    else if (riskScore >= 0.4)
        riskLevel = "Moderate";
    return { stressLevel, failureProbability, attendanceDecline, riskScore, riskLevel };
}
//# sourceMappingURL=normalization.js.map