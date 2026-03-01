import { onDocumentCreated, onDocumentWritten } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import * as admin from "firebase-admin";
import { normalizeAll, computeScores, RiskLevel } from "./normalization";
import { checkAndCreateAlert } from "./alerts";
import { callGeminiPrediction } from "./gemini";

admin.initializeApp();

// ===== Data Deletion Functions =====

/**
 * Scheduled function: Runs daily at 2 AM UTC.
 * Finds users who requested deletion and wipes all their data.
 */
export const processDataDeletion = onSchedule("every day 02:00", async () => {
    const db = admin.firestore();

    const usersSnap = await db.collection("users")
        .where("deletionRequested", "==", true)
        .get();

    if (usersSnap.empty) {
        logger.info("No pending deletion requests.");
        return;
    }

    for (const userDoc of usersSnap.docs) {
        const uid = userDoc.id;
        logger.info(`Processing data deletion for user ${uid}`);

        try {
            await deleteStudentData(db, uid);

            // Delete user doc last
            await db.doc(`users/${uid}`).delete();

            logger.info(`Successfully deleted all data for user ${uid}`);
        } catch (error) {
            logger.error(`Error deleting data for user ${uid}:`, error);
        }
    }
});

/**
 * Real-time trigger: When a user sets deletionRequested = true,
 * immediately process the deletion.
 */
export const onUserDeletionRequested = onDocumentWritten(
    "users/{userId}",
    async (event) => {
        const before = event.data?.before?.data();
        const after = event.data?.after?.data();

        // Only trigger when deletionRequested changes from false/undefined to true
        if (before?.deletionRequested || !after?.deletionRequested) return;

        const uid = event.params.userId;
        const db = admin.firestore();

        logger.info(`Immediate deletion triggered for user ${uid}`);

        try {
            await deleteStudentData(db, uid);
            await db.doc(`users/${uid}`).delete();
            logger.info(`Successfully deleted all data for user ${uid}`);
        } catch (error) {
            logger.error(`Error in immediate deletion for ${uid}:`, error);
        }
    }
);

/**
 * Helper: Deletes all student subcollections and related alerts/interventions.
 */
async function deleteStudentData(db: admin.firestore.Firestore, uid: string) {
    // Delete subcollections: dailyLogs, predictions
    const subcollections = ["dailyLogs", "predictions"];
    for (const sub of subcollections) {
        const snap = await db.collection(`students/${uid}/${sub}`).get();
        const batch = db.batch();
        snap.docs.forEach(doc => batch.delete(doc.ref));
        if (!snap.empty) await batch.commit();
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
        if (snap.exists) await ref.delete();
    }

    // Delete the student root doc
    const studentRef = db.doc(`students/${uid}`);
    const studentSnap = await studentRef.get();
    if (studentSnap.exists) await studentRef.delete();

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
export const onDailyLogCreated = onDocumentCreated(
    "students/{studentId}/dailyLogs/{logId}",
    async (event) => {
        const snap = event.data;
        if (!snap) return;

        const studentId = event.params.studentId;
        const logData = snap.data();
        const db = admin.firestore();

        try {
            // 1. Fetch academic data (may not exist yet)
            const academicSnap = await db.doc(`students/${studentId}/academic/data`).get();
            const academic = academicSnap.exists ? academicSnap.data()! : {
                ciaMarks: [50],
                attendancePercentage: 75,
                facultyFeedbackScore: 3,
            };

            // 2. Compute CIA average
            const ciaMarks = academic.ciaMarks || [50];
            const ciaAverage = ciaMarks.reduce((a: number, b: number) => a + b, 0) / ciaMarks.length;

            // 3. Normalize features
            const features = normalizeAll({
                sleepHours: logData.sleepHours ?? 7,
                screenTimeHours: logData.screenTimeHours ?? 3,
                mood: logData.mood ?? 3,
                studyHours: logData.studyHours ?? 3,
                socialInteraction: logData.socialInteraction ?? 3,
                ciaAverage,
                attendancePercentage: academic.attendancePercentage ?? 75,
                facultyFeedbackScore: academic.facultyFeedbackScore ?? 3,
            });

            // 4. Try Gemini AI first, fallback to deterministic scoring
            const rawInput = {
                sleepHours: logData.sleepHours,
                screenTimeHours: logData.screenTimeHours,
                mood: logData.mood,
                studyHours: logData.studyHours,
                socialInteraction: logData.socialInteraction,
                ciaAverage,
                attendancePercentage: academic.attendancePercentage ?? 75,
                facultyFeedbackScore: academic.facultyFeedbackScore ?? 3,
            };

            const geminiResult = await callGeminiPrediction(features, rawInput);

            let stressLevel: number;
            let failureProbability: number;
            let attendanceDecline: number;
            let riskScore: number;
            let riskLevel: RiskLevel;
            let suggestions: string[];
            let explanation: string;
            let modelUsed: "gemini" | "fallback";

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
                logger.info(`Gemini prediction used for student ${studentId}`);
            } else {
                // Fallback to deterministic model
                const scores = computeScores(features);
                stressLevel = scores.stressLevel;
                failureProbability = scores.failureProbability;
                attendanceDecline = scores.attendanceDecline;
                riskScore = scores.riskScore;
                riskLevel = scores.riskLevel;
                suggestions = generateSuggestions(features, scores);
                explanation = generateExplanation(features, scores);
                modelUsed = "fallback";
                logger.info(`Fallback model used for student ${studentId}`);
            }

            // 5. Fetch 7-day averages for metrics
            const logsSnap = await db.collection(`students/${studentId}/dailyLogs`)
                .orderBy("timestamp", "desc")
                .limit(7)
                .get();

            const recentLogs = logsSnap.docs.map((d: any) => d.data());
            const avgSleep7d = avg(recentLogs.map((l: any) => l.sleepHours ?? 7));
            const avgScreenTime7d = avg(recentLogs.map((l: any) => l.screenTimeHours ?? 3));
            const avgMood7d = avg(recentLogs.map((l: any) => l.mood ?? 3));

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
            const studentName = profileSnap.exists ? profileSnap.data()!.name : "Unknown Student";

            await checkAndCreateAlert({
                studentId,
                studentName,
                riskScore,
                riskLevel,
                stressLevel,
                failureProbability,
            });

            logger.info(`Prediction completed for student ${studentId}`, { riskLevel, modelUsed });
        } catch (error) {
            logger.error(`Error processing daily log for ${studentId}:`, error);
        }
    }
);

/**
 * Trigger: When academic data is updated by a teacher.
 * Re-runs prediction using latest daily log + new academic data.
 */
export const onAcademicDataUpdated = onDocumentWritten(
    "students/{studentId}/academic/data",
    async (event) => {
        const studentId = event.params.studentId;
        const db = admin.firestore();
        const afterData = event.data?.after?.data();

        try {
            // Get latest daily log
            const logsSnap = await db.collection(`students/${studentId}/dailyLogs`)
                .orderBy("timestamp", "desc")
                .limit(1)
                .get();

            if (logsSnap.empty) {
                logger.info(`No daily logs for student ${studentId}, skipping re-prediction.`);
                return;
            }

            const latestLog = logsSnap.docs[0].data();
            const academic = afterData ?? {
                ciaMarks: [50],
                attendancePercentage: 75,
                facultyFeedbackScore: 3,
            };

            const ciaMarks = academic.ciaMarks || [50];
            const ciaAverage = ciaMarks.reduce((a: number, b: number) => a + b, 0) / ciaMarks.length;

            const features = normalizeAll({
                sleepHours: latestLog.sleepHours ?? 7,
                screenTimeHours: latestLog.screenTimeHours ?? 3,
                mood: latestLog.mood ?? 3,
                studyHours: latestLog.studyHours ?? 3,
                socialInteraction: latestLog.socialInteraction ?? 3,
                ciaAverage,
                attendancePercentage: academic.attendancePercentage ?? 75,
                facultyFeedbackScore: academic.facultyFeedbackScore ?? 3,
            });

            // Try Gemini, then fallback
            const rawInput = {
                sleepHours: latestLog.sleepHours,
                screenTimeHours: latestLog.screenTimeHours,
                mood: latestLog.mood,
                studyHours: latestLog.studyHours,
                socialInteraction: latestLog.socialInteraction,
                ciaAverage,
                attendancePercentage: academic.attendancePercentage ?? 75,
                facultyFeedbackScore: academic.facultyFeedbackScore ?? 3,
            };

            const geminiResult = await callGeminiPrediction(features, rawInput);
            let riskScore: number;
            let riskLevel: RiskLevel;
            let stressLevel: number;

            if (geminiResult) {
                stressLevel = geminiResult.stressLevel;
                riskLevel = geminiResult.riskLevel;
                riskScore = geminiResult.stressLevel * 0.4 + geminiResult.failureProbability * 0.4 + geminiResult.attendanceDecline * 0.2;
            } else {
                const scores = computeScores(features);
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

            logger.info(`Re-scored student ${studentId} after academic update`, { riskLevel });
        } catch (error) {
            logger.error(`Error re-scoring student ${studentId}:`, error);
        }
    }
);

// === Helper Functions ===

function avg(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function generateSuggestions(features: any, scores: any): string[] {
    const suggestions: string[] = [];

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

function generateExplanation(features: any, scores: any): string {
    const factors: string[] = [];

    if (features.sleepNorm > 0.5) factors.push("insufficient sleep");
    if (features.screenTimeNorm > 0.5) factors.push("high screen time");
    if (features.moodNorm > 0.5) factors.push("low mood indicators");
    if (features.marksNorm > 0.5) factors.push("declining CIA scores");
    if (features.attendanceNorm > 0.4) factors.push("attendance below threshold");
    if (features.studyNorm > 0.5) factors.push("limited study hours");

    if (factors.length === 0) {
        return `Overall risk is ${scores.riskLevel}. All indicators are within healthy ranges.`;
    }

    return `Risk assessed as ${scores.riskLevel} based on ${factors.join(", ")}. Stress at ${Math.round(scores.stressLevel * 100)}%, failure probability at ${Math.round(scores.failureProbability * 100)}%.`;
}
