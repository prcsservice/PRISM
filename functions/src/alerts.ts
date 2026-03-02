import * as admin from "firebase-admin";
import { RiskLevel } from "./normalization";
import { createNotification, notifyDepartmentTeachers, generateMentorSuggestions } from "./notifications";
import { sendAlertEmail } from "./email";

interface AlertCheck {
    studentId: string;
    studentName: string;
    riskScore: number;
    riskLevel: RiskLevel;
    stressLevel: number;
    failureProbability: number;
}

export async function checkAndCreateAlert(data: AlertCheck): Promise<string | null> {
    const db = admin.firestore();

    // Only create alerts for Moderate or High risk
    if (data.riskLevel === "Low") return null;

    // Check for existing unresolved alert for this student
    const existingQuery = await db.collection("alerts")
        .where("studentId", "==", data.studentId)
        .where("resolved", "==", false)
        .limit(1)
        .get();

    // If an unresolved alert already exists, update it instead of creating a new one
    if (!existingQuery.empty) {
        const existingDoc = existingQuery.docs[0];
        await existingDoc.ref.update({
            priority: data.riskLevel === "High" ? "Critical" : "Warning",
            riskLevel: data.riskLevel,
            reason: buildReason(data),
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        return existingDoc.id;
    }

    // Generate AI-suggested mentor actions
    const mentorSuggestions = generateMentorSuggestions({
        riskLevel: data.riskLevel,
        stressLevel: data.stressLevel,
        failureProbability: data.failureProbability,
        studentName: data.studentName,
    });

    // Create new alert with AI suggestions
    const priority = data.riskLevel === "High" ? "Critical" : "Warning";
    const reason = buildReason(data);

    const ref = await db.collection("alerts").add({
        studentId: data.studentId,
        studentName: data.studentName,
        priority,
        reason,
        riskLevel: data.riskLevel,
        resolved: false,
        status: "new",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        suggestedActions: mentorSuggestions,
    });

    // Notify teachers in the same department
    const profileSnap = await db.doc(`students/${data.studentId}/profile/main`).get();
    const department = profileSnap.exists ? profileSnap.data()!.department : null;

    if (department) {
        // In-app notifications
        await notifyDepartmentTeachers(department, {
            type: "alert_created",
            title: `⚠️ ${priority} Alert: ${data.studentName}`,
            message: reason,
            link: `/dashboard/teacher/student/${data.studentId}`,
            metadata: { studentId: data.studentId, riskLevel: data.riskLevel, suggestedActions: mentorSuggestions },
        });

        // Email alerts to teachers
        const teacherQuery = await db.collection("users").where("role", "==", "teacher").get();
        for (const teacherDoc of teacherQuery.docs) {
            const tProfileSnap = await db.doc(`teachers/${teacherDoc.id}`).get();
            if (tProfileSnap.exists && tProfileSnap.data()!.department === department) {
                const teacherUser = teacherDoc.data();
                if (teacherUser.email) {
                    sendAlertEmail({
                        teacherEmail: teacherUser.email,
                        teacherName: teacherUser.name || "Teacher",
                        studentName: data.studentName,
                        riskLevel: data.riskLevel,
                        reason,
                        suggestedActions: mentorSuggestions,
                        appUrl: `https://prism-app.vercel.app/dashboard/teacher/student/${data.studentId}`,
                    }).catch(() => { });
                }
            }
        }
    }

    return ref.id;
}

function buildReason(data: AlertCheck): string {
    const parts: string[] = [];

    if (data.stressLevel > 0.7) {
        parts.push(`high stress level (${Math.round(data.stressLevel * 100)}%)`);
    }
    if (data.failureProbability > 0.6) {
        parts.push(`elevated failure probability (${Math.round(data.failureProbability * 100)}%)`);
    }
    if (data.riskScore > 0.7) {
        parts.push(`overall risk score exceeds threshold (${Math.round(data.riskScore * 100)}%)`);
    }

    if (parts.length === 0) {
        parts.push(`risk level assessed as ${data.riskLevel}`);
    }

    return `Student flagged for: ${parts.join(", ")}.`;
}
