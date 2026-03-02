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
exports.checkAndCreateAlert = checkAndCreateAlert;
const admin = __importStar(require("firebase-admin"));
const notifications_1 = require("./notifications");
const email_1 = require("./email");
async function checkAndCreateAlert(data) {
    const db = admin.firestore();
    // Only create alerts for Moderate or High risk
    if (data.riskLevel === "Low")
        return null;
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
    const mentorSuggestions = (0, notifications_1.generateMentorSuggestions)({
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
    const department = profileSnap.exists ? profileSnap.data().department : null;
    if (department) {
        // In-app notifications
        await (0, notifications_1.notifyDepartmentTeachers)(department, {
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
            if (tProfileSnap.exists && tProfileSnap.data().department === department) {
                const teacherUser = teacherDoc.data();
                if (teacherUser.email) {
                    (0, email_1.sendAlertEmail)({
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
function buildReason(data) {
    const parts = [];
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
//# sourceMappingURL=alerts.js.map