"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAcademicDataUpdated = exports.onDailyLogCreated = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const normalization_1 = require("./normalization");
const alerts_1 = require("./alerts");
admin.initializeApp();
/**
 * Trigger: When a new daily log is created for a student.
 * Flow: Fetch data -> Normalize -> Score -> Generate text -> Store prediction -> Update metrics -> Check alerts
 */
exports.onDailyLogCreated = functions.firestore
    .document("students/{studentId}/dailyLogs/{logId}")
    .onCreate(async (snap, context) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const { studentId } = context.params;
    const logData = snap.data();
    const db = admin.firestore();
    try {
        // 1. Fetch academic data (may not exist yet)
        const academicSnap = await db.doc(`students/${studentId}/academic/data`).get();
        const academic = academicSnap.exists ? academicSnap.data() : {
            ciaMarks: [50],
            attendancePercentage: 75,
            facultyFeedbackScore: 3,
        };
        // 2. Compute CIA average
        const ciaMarks = academic.ciaMarks || [50];
        const ciaAverage = ciaMarks.reduce((a, b) => a + b, 0) / ciaMarks.length;
        // 3. Normalize features
        const features = (0, normalization_1.normalizeAll)({
            sleepHours: (_a = logData.sleepHours) !== null && _a !== void 0 ? _a : 7,
            screenTimeHours: (_b = logData.screenTimeHours) !== null && _b !== void 0 ? _b : 3,
            mood: (_c = logData.mood) !== null && _c !== void 0 ? _c : 3,
            studyHours: (_d = logData.studyHours) !== null && _d !== void 0 ? _d : 3,
            socialInteraction: (_e = logData.socialInteraction) !== null && _e !== void 0 ? _e : 3,
            ciaAverage,
            attendancePercentage: (_f = academic.attendancePercentage) !== null && _f !== void 0 ? _f : 75,
            facultyFeedbackScore: (_g = academic.facultyFeedbackScore) !== null && _g !== void 0 ? _g : 3,
        });
        // 4. Compute scores deterministically
        const scores = (0, normalization_1.computeScores)(features);
        // 5. Generate suggestions based on features
        const suggestions = generateSuggestions(features, scores);
        const explanation = generateExplanation(features, scores);
        // 6. Fetch 7-day averages for metrics
        const logsSnap = await db.collection(`students/${studentId}/dailyLogs`)
            .orderBy("timestamp", "desc")
            .limit(7)
            .get();
        const recentLogs = logsSnap.docs.map((d) => d.data());
        const avgSleep7d = avg(recentLogs.map((l) => { var _a; return (_a = l.sleepHours) !== null && _a !== void 0 ? _a : 7; }));
        const avgScreenTime7d = avg(recentLogs.map((l) => { var _a; return (_a = l.screenTimeHours) !== null && _a !== void 0 ? _a : 3; }));
        const avgMood7d = avg(recentLogs.map((l) => { var _a; return (_a = l.mood) !== null && _a !== void 0 ? _a : 3; }));
        // 7. Store prediction
        await db.collection(`students/${studentId}/predictions`).add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            riskScore: scores.riskScore,
            riskLevel: scores.riskLevel,
            predictionData: {
                stressLevel: scores.stressLevel,
                failureProbability: scores.failureProbability,
                attendanceDecline: scores.attendanceDecline,
            },
            metrics: {
                avgSleep7d,
                avgScreenTime7d,
                avgMood7d,
                ciaAverage,
            },
            explanation,
            suggestions,
        });
        // 8. Update student metrics
        await db.doc(`students/${studentId}/metrics/current`).set({
            currentStressLevel: scores.stressLevel,
            riskScore: scores.riskScore,
            riskLevel: scores.riskLevel,
            lastCalculated: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        // 9. Check and create alert if needed
        const profileSnap = await db.doc(`students/${studentId}/profile/main`).get();
        const studentName = profileSnap.exists ? profileSnap.data().name : "Unknown Student";
        await (0, alerts_1.checkAndCreateAlert)({
            studentId,
            studentName,
            riskScore: scores.riskScore,
            riskLevel: scores.riskLevel,
            stressLevel: scores.stressLevel,
            failureProbability: scores.failureProbability,
        });
        functions.logger.info(`Prediction completed for student ${studentId}`, { riskLevel: scores.riskLevel });
    }
    catch (error) {
        functions.logger.error(`Error processing daily log for ${studentId}:`, error);
    }
});
/**
 * Trigger: When academic data is updated by a teacher.
 * Re-runs prediction using latest daily log + new academic data.
 */
exports.onAcademicDataUpdated = functions.firestore
    .document("students/{studentId}/academic/data")
    .onWrite(async (change, context) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const { studentId } = context.params;
    const db = admin.firestore();
    try {
        // Get latest daily log
        const logsSnap = await db.collection(`students/${studentId}/dailyLogs`)
            .orderBy("timestamp", "desc")
            .limit(1)
            .get();
        if (logsSnap.empty) {
            functions.logger.info(`No daily logs for student ${studentId}, skipping re-prediction.`);
            return;
        }
        const latestLog = logsSnap.docs[0].data();
        const academic = change.after.exists ? change.after.data() : {
            ciaMarks: [50],
            attendancePercentage: 75,
            facultyFeedbackScore: 3,
        };
        const ciaMarks = academic.ciaMarks || [50];
        const ciaAverage = ciaMarks.reduce((a, b) => a + b, 0) / ciaMarks.length;
        const features = (0, normalization_1.normalizeAll)({
            sleepHours: (_a = latestLog.sleepHours) !== null && _a !== void 0 ? _a : 7,
            screenTimeHours: (_b = latestLog.screenTimeHours) !== null && _b !== void 0 ? _b : 3,
            mood: (_c = latestLog.mood) !== null && _c !== void 0 ? _c : 3,
            studyHours: (_d = latestLog.studyHours) !== null && _d !== void 0 ? _d : 3,
            socialInteraction: (_e = latestLog.socialInteraction) !== null && _e !== void 0 ? _e : 3,
            ciaAverage,
            attendancePercentage: (_f = academic.attendancePercentage) !== null && _f !== void 0 ? _f : 75,
            facultyFeedbackScore: (_g = academic.facultyFeedbackScore) !== null && _g !== void 0 ? _g : 3,
        });
        const scores = (0, normalization_1.computeScores)(features);
        // Update metrics
        await db.doc(`students/${studentId}/metrics/current`).set({
            currentStressLevel: scores.stressLevel,
            riskScore: scores.riskScore,
            riskLevel: scores.riskLevel,
            lastCalculated: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        functions.logger.info(`Re-scored student ${studentId} after academic update`, { riskLevel: scores.riskLevel });
    }
    catch (error) {
        functions.logger.error(`Error re-scoring student ${studentId}:`, error);
    }
});
// === Helper Functions ===
function avg(arr) {
    if (arr.length === 0)
        return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function generateSuggestions(features, scores) {
    const suggestions = [];
    if (features.sleepNorm > 0.5) {
        suggestions.push("Try to maintain 7-8 hours of sleep per night for better focus and emotional regulation.");
    }
    if (features.screenTimeNorm > 0.5) {
        suggestions.push("Consider reducing non-academic screen time. Try the 20-20-20 rule for eye health.");
    }
    if (features.moodNorm > 0.5) {
        suggestions.push("Your mood patterns suggest elevated stress. Consider talking to a counselor or trusted friend.");
    }
    if (features.studyNorm > 0.5) {
        suggestions.push("Increasing structured study time, even by 30 minutes daily, can significantly improve performance.");
    }
    if (features.socialNorm > 0.5) {
        suggestions.push("Social connection is important for mental health. Try joining a study group or campus activity.");
    }
    if (features.marksNorm > 0.5) {
        suggestions.push("Review your recent CIA performance with your faculty advisor for targeted improvement.");
    }
    if (features.attendanceNorm > 0.4) {
        suggestions.push("Regular class attendance strongly correlates with better outcomes. Aim for 75%+ attendance.");
    }
    if (scores.riskLevel === "High" && suggestions.length < 3) {
        suggestions.push("Reach out to your academic counselor for personalized support and guidance.");
    }
    if (suggestions.length === 0) {
        suggestions.push("Keep up the good work! Your current habits are supporting your academic success.");
    }
    return suggestions.slice(0, 4);
}
function generateExplanation(features, scores) {
    const factors = [];
    if (features.sleepNorm > 0.5)
        factors.push("insufficient sleep");
    if (features.screenTimeNorm > 0.5)
        factors.push("high screen time");
    if (features.moodNorm > 0.5)
        factors.push("low mood indicators");
    if (features.marksNorm > 0.5)
        factors.push("declining CIA scores");
    if (features.attendanceNorm > 0.4)
        factors.push("attendance below threshold");
    if (features.studyNorm > 0.5)
        factors.push("limited study hours");
    if (factors.length === 0) {
        return `Overall risk is ${scores.riskLevel}. All indicators are within healthy ranges.`;
    }
    return `Risk assessed as ${scores.riskLevel} based on ${factors.join(", ")}. Stress at ${Math.round(scores.stressLevel * 100)}%, failure probability at ${Math.round(scores.failureProbability * 100)}%.`;
}
//# sourceMappingURL=index.js.map