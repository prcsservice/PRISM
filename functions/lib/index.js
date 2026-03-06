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
exports.onInterventionCreated = exports.onAcademicDataUpdated = exports.onDailyLogCreated = exports.onUserDeletionRequested = exports.processDataDeletion = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firebase_functions_1 = require("firebase-functions");
const admin = __importStar(require("firebase-admin"));
const normalization_1 = require("./normalization");
const suggestions_1 = require("./suggestions");
const alerts_1 = require("./alerts");
const gemini_1 = require("./gemini");
const notifications_1 = require("./notifications");
const email_1 = require("./email");
admin.initializeApp();
/**
 * Compute CIA average from academic data.
 * Supports both new subject-wise format and legacy flat ciaMarks array.
 */
function computeCiaAverageFromAcademic(academic) {
    var _a;
    // New format: semesters[].subjects[] with cia1/cia2/cia3
    if (academic.semesters && academic.currentSemester) {
        const currentSem = academic.semesters.find((s) => s.semester === academic.currentSemester);
        if (currentSem && ((_a = currentSem.subjects) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            const marks = [];
            for (const sub of currentSem.subjects) {
                if (sub.cia1 != null)
                    marks.push(sub.cia1);
                if (sub.cia2 != null)
                    marks.push(sub.cia2);
                if (sub.cia3 != null)
                    marks.push(sub.cia3);
            }
            if (marks.length > 0) {
                return marks.reduce((a, b) => a + b, 0) / marks.length;
            }
        }
    }
    // Legacy format: flat ciaMarks array
    const ciaMarks = academic.ciaMarks;
    if (ciaMarks && Array.isArray(ciaMarks) && ciaMarks.length > 0) {
        return ciaMarks.reduce((a, b) => a + b, 0) / ciaMarks.length;
    }
    return 50; // default when no data
}
// ===== Data Deletion Functions =====
/**
 * Scheduled function: Runs daily at 2 AM UTC.
 * Finds users who requested deletion and wipes all their data.
 */
exports.processDataDeletion = (0, scheduler_1.onSchedule)("every day 02:00", async () => {
    const db = admin.firestore();
    const usersSnap = await db.collection("users")
        .where("deletionRequested", "==", true)
        .get();
    if (usersSnap.empty) {
        firebase_functions_1.logger.info("No pending deletion requests.");
        return;
    }
    for (const userDoc of usersSnap.docs) {
        const uid = userDoc.id;
        firebase_functions_1.logger.info(`Processing data deletion for user ${uid}`);
        try {
            await deleteStudentData(db, uid);
            // Delete user doc last
            await db.doc(`users/${uid}`).delete();
            firebase_functions_1.logger.info(`Successfully deleted all data for user ${uid}`);
        }
        catch (error) {
            firebase_functions_1.logger.error(`Error deleting data for user ${uid}:`, error);
        }
    }
});
/**
 * Real-time trigger: When a user sets deletionRequested = true,
 * immediately process the deletion.
 */
exports.onUserDeletionRequested = (0, firestore_1.onDocumentWritten)("users/{userId}", async (event) => {
    var _a, _b, _c, _d;
    const before = (_b = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before) === null || _b === void 0 ? void 0 : _b.data();
    const after = (_d = (_c = event.data) === null || _c === void 0 ? void 0 : _c.after) === null || _d === void 0 ? void 0 : _d.data();
    // Only trigger when deletionRequested changes from false/undefined to true
    if ((before === null || before === void 0 ? void 0 : before.deletionRequested) || !(after === null || after === void 0 ? void 0 : after.deletionRequested))
        return;
    const uid = event.params.userId;
    const db = admin.firestore();
    firebase_functions_1.logger.info(`Immediate deletion triggered for user ${uid}`);
    try {
        await deleteStudentData(db, uid);
        await db.doc(`users/${uid}`).delete();
        firebase_functions_1.logger.info(`Successfully deleted all data for user ${uid}`);
    }
    catch (error) {
        firebase_functions_1.logger.error(`Error in immediate deletion for ${uid}:`, error);
    }
});
/**
 * Helper: Deletes all student subcollections and related alerts/interventions.
 */
async function deleteStudentData(db, uid) {
    // Delete subcollections: dailyLogs, predictions
    const subcollections = ["dailyLogs", "predictions"];
    for (const sub of subcollections) {
        const snap = await db.collection(`students/${uid}/${sub}`).get();
        const batch = db.batch();
        snap.docs.forEach(doc => batch.delete(doc.ref));
        if (!snap.empty)
            await batch.commit();
    }
    // Delete single docs: profile/main, academic/data, metrics/current
    const singleDocs = [
        `students/${uid}/profile/main`,
        `students/${uid}/academic/data`,
        `students/${uid}/metrics/current`,
    ];
    for (const path of singleDocs) {
        const ref = db.doc(path);
        const snap = await ref.get();
        if (snap.exists)
            await ref.delete();
    }
    // Delete the student root doc
    const studentRef = db.doc(`students/${uid}`);
    const studentSnap = await studentRef.get();
    if (studentSnap.exists)
        await studentRef.delete();
    // Delete associated alerts
    const alertsSnap = await db.collection("alerts")
        .where("studentId", "==", uid)
        .get();
    if (!alertsSnap.empty) {
        const batch = db.batch();
        alertsSnap.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    }
    // Delete associated interventions
    const interventionsSnap = await db.collection("interventions")
        .where("studentId", "==", uid)
        .get();
    if (!interventionsSnap.empty) {
        const batch = db.batch();
        interventionsSnap.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    }
}
/**
 * Trigger: When a new daily log is created for a student.
 * Flow: Fetch data -> Normalize -> Score -> Generate text -> Store prediction -> Update metrics -> Check alerts
 */
exports.onDailyLogCreated = (0, firestore_1.onDocumentCreated)("students/{studentId}/dailyLogs/{logId}", async (event) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const snap = event.data;
    if (!snap)
        return;
    const studentId = event.params.studentId;
    const logData = snap.data();
    const db = admin.firestore();
    try {
        // 1. Fetch academic data (may not exist yet)
        const academicSnap = await db.doc(`students/${studentId}/academic/data`).get();
        const academic = academicSnap.exists ? academicSnap.data() : {
            currentSemester: 1,
            semesters: [],
            ciaMarks: [50],
            attendancePercentage: 75,
            facultyFeedbackScore: 3,
        };
        // 2. Compute CIA average (supports new subject-wise and legacy flat format)
        const ciaAverage = computeCiaAverageFromAcademic(academic);
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
        // 4. Try Gemini AI first, fallback to deterministic scoring
        const rawInput = {
            sleepHours: logData.sleepHours,
            screenTimeHours: logData.screenTimeHours,
            mood: logData.mood,
            studyHours: logData.studyHours,
            socialInteraction: logData.socialInteraction,
            ciaAverage,
            attendancePercentage: (_h = academic.attendancePercentage) !== null && _h !== void 0 ? _h : 75,
            facultyFeedbackScore: (_j = academic.facultyFeedbackScore) !== null && _j !== void 0 ? _j : 3,
        };
        const geminiResult = await (0, gemini_1.callGeminiPrediction)(features, rawInput);
        let stressLevel;
        let failureProbability;
        let attendanceDecline;
        let riskScore;
        let riskLevel;
        let suggestions;
        let explanation;
        let modelUsed;
        if (geminiResult) {
            // Use Gemini result
            stressLevel = geminiResult.stressLevel;
            failureProbability = geminiResult.failureProbability;
            attendanceDecline = geminiResult.attendanceDecline;
            riskScore = stressLevel * 0.4 + failureProbability * 0.4 + attendanceDecline * 0.2;
            riskLevel = geminiResult.riskLevel;
            suggestions = geminiResult.suggestions;
            explanation = geminiResult.explainability;
            modelUsed = "gemini";
            firebase_functions_1.logger.info(`Gemini prediction used for student ${studentId}`);
        }
        else {
            // Fallback to deterministic model
            const scores = (0, normalization_1.computeScores)(features);
            stressLevel = scores.stressLevel;
            failureProbability = scores.failureProbability;
            attendanceDecline = scores.attendanceDecline;
            riskScore = scores.riskScore;
            riskLevel = scores.riskLevel;
            suggestions = (0, suggestions_1.generateFallbackSuggestions)(features, scores.riskLevel, scores.stressLevel, scores.failureProbability);
            explanation = (0, suggestions_1.generateFallbackExplanation)(features, scores.stressLevel, scores.failureProbability, scores.attendanceDecline, scores.riskLevel);
            modelUsed = "fallback";
            firebase_functions_1.logger.info(`Fallback model used for student ${studentId}`);
        }
        // 5. Fetch 7-day averages for metrics
        const logsSnap = await db.collection(`students/${studentId}/dailyLogs`)
            .orderBy("timestamp", "desc")
            .limit(7)
            .get();
        const recentLogs = logsSnap.docs.map((d) => d.data());
        const avgSleep7d = avg(recentLogs.map((l) => { var _a; return (_a = l.sleepHours) !== null && _a !== void 0 ? _a : 7; }));
        const avgScreenTime7d = avg(recentLogs.map((l) => { var _a; return (_a = l.screenTimeHours) !== null && _a !== void 0 ? _a : 3; }));
        const avgMood7d = avg(recentLogs.map((l) => { var _a; return (_a = l.mood) !== null && _a !== void 0 ? _a : 3; }));
        // 6. Store prediction
        await db.collection(`students/${studentId}/predictions`).add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            riskScore,
            riskLevel,
            predictionData: {
                stressLevel,
                failureProbability,
                attendanceDecline,
            },
            metrics: {
                avgSleep7d,
                avgScreenTime7d,
                avgMood7d,
                ciaAverage,
            },
            explanation,
            suggestions,
            modelUsed,
        });
        // 7. Update student metrics
        await db.doc(`students/${studentId}/metrics/current`).set({
            currentStressLevel: stressLevel,
            riskScore,
            riskLevel,
            lastCalculated: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        // 8. Check and create alert if needed
        const profileSnap = await db.doc(`students/${studentId}/profile/main`).get();
        const studentName = profileSnap.exists ? profileSnap.data().name : "Unknown Student";
        await (0, alerts_1.checkAndCreateAlert)({
            studentId,
            studentName,
            riskScore,
            riskLevel,
            stressLevel,
            failureProbability,
        });
        // 9. Send notification to student about their latest prediction
        await (0, notifications_1.createNotification)({
            userId: studentId,
            type: "new_prediction",
            title: `Risk Assessment: ${riskLevel}`,
            message: `Your latest analysis shows ${Math.round(stressLevel * 100)}% stress level. ${suggestions[0] || ""}`,
            link: "/dashboard/student/suggestions",
            metadata: { riskLevel, stressLevel, failureProbability },
        });
        // 10. Detect stress trend and proactively alert teachers
        const isTrending = await (0, notifications_1.detectStressTrend)(studentId);
        if (isTrending && studentName) {
            const department = profileSnap.exists ? profileSnap.data().department : null;
            if (department) {
                // In-app notifications
                await (0, notifications_1.notifyDepartmentTeachers)(department, {
                    type: "stress_trend",
                    title: `📈 Stress Trending Up: ${studentName}`,
                    message: `${studentName}'s stress has been increasing over the last 3+ assessments. Current: ${Math.round(stressLevel * 100)}%. Consider reaching out.`,
                    link: `/dashboard/teacher/student/${studentId}`,
                    metadata: { studentId, stressLevel, riskLevel },
                });
                // Email alerts to department teachers
                const teacherQuery = await db.collection("users").where("role", "==", "teacher").get();
                for (const tDoc of teacherQuery.docs) {
                    const tProfileSnap = await db.doc(`teachers/${tDoc.id}`).get();
                    if (tProfileSnap.exists && tProfileSnap.data().department === department) {
                        const tUser = tDoc.data();
                        if (tUser.email) {
                            (0, email_1.sendStressTrendEmail)({
                                teacherEmail: tUser.email,
                                teacherName: tUser.name || "Teacher",
                                studentName,
                                stressLevel: Math.round(stressLevel * 100),
                                appUrl: `${process.env.APP_URL || 'https://prism-app.vercel.app'}/dashboard/teacher/student/${studentId}`,
                            }).catch(() => { });
                        }
                    }
                }
            }
            firebase_functions_1.logger.info(`Stress trend detected for student ${studentId}`);
        }
        firebase_functions_1.logger.info(`Prediction completed for student ${studentId}`, { riskLevel, modelUsed });
    }
    catch (error) {
        firebase_functions_1.logger.error(`Error processing daily log for ${studentId}:`, error);
    }
});
/**
 * Trigger: When academic data is updated by a teacher.
 * Re-runs prediction using latest daily log + new academic data.
 */
exports.onAcademicDataUpdated = (0, firestore_1.onDocumentWritten)("students/{studentId}/academic/data", async (event) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const studentId = event.params.studentId;
    const db = admin.firestore();
    const afterData = (_b = (_a = event.data) === null || _a === void 0 ? void 0 : _a.after) === null || _b === void 0 ? void 0 : _b.data();
    try {
        // Get latest daily log
        const logsSnap = await db.collection(`students/${studentId}/dailyLogs`)
            .orderBy("timestamp", "desc")
            .limit(1)
            .get();
        if (logsSnap.empty) {
            firebase_functions_1.logger.info(`No daily logs for student ${studentId}, skipping re-prediction.`);
            return;
        }
        const latestLog = logsSnap.docs[0].data();
        const academic = afterData !== null && afterData !== void 0 ? afterData : {
            currentSemester: 1,
            semesters: [],
            ciaMarks: [50],
            attendancePercentage: 75,
            facultyFeedbackScore: 3,
        };
        const ciaAverage = computeCiaAverageFromAcademic(academic);
        const features = (0, normalization_1.normalizeAll)({
            sleepHours: (_c = latestLog.sleepHours) !== null && _c !== void 0 ? _c : 7,
            screenTimeHours: (_d = latestLog.screenTimeHours) !== null && _d !== void 0 ? _d : 3,
            mood: (_e = latestLog.mood) !== null && _e !== void 0 ? _e : 3,
            studyHours: (_f = latestLog.studyHours) !== null && _f !== void 0 ? _f : 3,
            socialInteraction: (_g = latestLog.socialInteraction) !== null && _g !== void 0 ? _g : 3,
            ciaAverage,
            attendancePercentage: (_h = academic.attendancePercentage) !== null && _h !== void 0 ? _h : 75,
            facultyFeedbackScore: (_j = academic.facultyFeedbackScore) !== null && _j !== void 0 ? _j : 3,
        });
        // Try Gemini, then fallback
        const rawInput = {
            sleepHours: latestLog.sleepHours,
            screenTimeHours: latestLog.screenTimeHours,
            mood: latestLog.mood,
            studyHours: latestLog.studyHours,
            socialInteraction: latestLog.socialInteraction,
            ciaAverage,
            attendancePercentage: (_k = academic.attendancePercentage) !== null && _k !== void 0 ? _k : 75,
            facultyFeedbackScore: (_l = academic.facultyFeedbackScore) !== null && _l !== void 0 ? _l : 3,
        };
        const geminiResult = await (0, gemini_1.callGeminiPrediction)(features, rawInput);
        let riskScore;
        let riskLevel;
        let stressLevel;
        if (geminiResult) {
            stressLevel = geminiResult.stressLevel;
            riskLevel = geminiResult.riskLevel;
            riskScore = geminiResult.stressLevel * 0.4 + geminiResult.failureProbability * 0.4 + geminiResult.attendanceDecline * 0.2;
        }
        else {
            const scores = (0, normalization_1.computeScores)(features);
            stressLevel = scores.stressLevel;
            riskLevel = scores.riskLevel;
            riskScore = scores.riskScore;
        }
        // Update metrics
        await db.doc(`students/${studentId}/metrics/current`).set({
            currentStressLevel: stressLevel,
            riskScore,
            riskLevel,
            lastCalculated: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        firebase_functions_1.logger.info(`Re-scored student ${studentId} after academic update`, { riskLevel });
    }
    catch (error) {
        firebase_functions_1.logger.error(`Error re-scoring student ${studentId}:`, error);
    }
});
// === Helper Functions ===
function avg(arr) {
    if (arr.length === 0)
        return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}
/**
 * Trigger: When a teacher creates an intervention for a student.
 * Notifies the student that their mentor took action.
 */
exports.onInterventionCreated = (0, firestore_1.onDocumentCreated)("interventions/{interventionId}", async (event) => {
    var _a;
    const snap = event.data;
    if (!snap)
        return;
    const data = snap.data();
    const studentId = data.studentId;
    const teacherName = data.teacherName || "Your mentor";
    const actionLabel = data.actionTaken || data.actionType || "an action";
    try {
        // In-app notification to student
        await (0, notifications_1.createNotification)({
            userId: studentId,
            type: "mentor_action",
            title: `🎯 Mentor Action: ${actionLabel}`,
            message: `${teacherName} has recorded an intervention for you: "${((_a = data.notes) === null || _a === void 0 ? void 0 : _a.substring(0, 100)) || actionLabel}"`,
            link: "/dashboard/student",
            metadata: {
                teacherName,
                actionType: data.actionType,
                interventionId: event.params.interventionId,
            },
        });
        // Email notification to student
        const db = admin.firestore();
        const studentUser = await db.doc(`users/${studentId}`).get();
        if (studentUser.exists) {
            const studentData = studentUser.data();
            if (studentData.email) {
                await (0, email_1.sendMentorActionEmail)({
                    studentEmail: studentData.email,
                    studentName: studentData.name || "Student",
                    teacherName,
                    actionType: actionLabel,
                    notes: data.notes || "No additional notes.",
                    appUrl: `${process.env.APP_URL || 'https://prism-app.vercel.app'}/dashboard/student`,
                });
            }
        }
        firebase_functions_1.logger.info(`Student ${studentId} notified of mentor action by ${teacherName}`);
    }
    catch (error) {
        firebase_functions_1.logger.error(`Error notifying student of intervention:`, error);
    }
});
//# sourceMappingURL=index.js.map