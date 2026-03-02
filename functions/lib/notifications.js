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
exports.createNotification = createNotification;
exports.notifyDepartmentTeachers = notifyDepartmentTeachers;
exports.generateMentorSuggestions = generateMentorSuggestions;
exports.detectStressTrend = detectStressTrend;
const admin = __importStar(require("firebase-admin"));
/**
 * Creates a notification document for a user.
 * Notifications are displayed in the in-app notification panel.
 */
async function createNotification(params) {
    const db = admin.firestore();
    const ref = await db.collection("notifications").add({
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        link: params.link || null,
        metadata: params.metadata || {},
    });
    return ref.id;
}
/**
 * Notify all teachers in the same department as a student.
 */
async function notifyDepartmentTeachers(studentDepartment, notification) {
    const db = admin.firestore();
    // Find all teacher user docs
    const teacherQuery = await db.collection("users")
        .where("role", "==", "teacher")
        .get();
    // Find teacher profiles in this department
    const notifyPromises = [];
    for (const teacherDoc of teacherQuery.docs) {
        const teacherProfileSnap = await db.doc(`teachers/${teacherDoc.id}`).get();
        if (teacherProfileSnap.exists) {
            const teacherProfile = teacherProfileSnap.data();
            if (teacherProfile.department === studentDepartment) {
                notifyPromises.push(createNotification({
                    ...notification,
                    userId: teacherDoc.id,
                }));
            }
        }
    }
    await Promise.all(notifyPromises);
}
/**
 * Generate AI-suggested mentor actions based on prediction data.
 */
function generateMentorSuggestions(data) {
    const suggestions = [];
    if (data.stressLevel > 0.8) {
        suggestions.push(`Schedule an immediate one-on-one wellness check with ${data.studentName}`);
        suggestions.push("Consider referring to campus counseling services");
    }
    else if (data.stressLevel > 0.6) {
        suggestions.push(`Send a check-in message to ${data.studentName} about their well-being`);
    }
    if (data.failureProbability > 0.7) {
        suggestions.push("Create an academic recovery plan with targeted study sessions");
        suggestions.push("Arrange peer tutoring or study group participation");
    }
    else if (data.failureProbability > 0.5) {
        suggestions.push("Review recent CIA performance and identify weak areas together");
    }
    if (data.riskLevel === "High") {
        suggestions.push("Contact the student's guardian to discuss support strategies");
        suggestions.push("Coordinate with other faculty about the student's overall performance");
    }
    if (suggestions.length === 0) {
        suggestions.push(`Send encouragement to ${data.studentName} to maintain their positive trajectory`);
    }
    return suggestions.slice(0, 4);
}
/**
 * Detect stress trends: returns true if stress has been increasing over 3+ data points.
 */
async function detectStressTrend(studentId) {
    const db = admin.firestore();
    const predictionsSnap = await db.collection(`students/${studentId}/predictions`)
        .orderBy("timestamp", "desc")
        .limit(4)
        .get();
    if (predictionsSnap.docs.length < 3)
        return false;
    const stressLevels = predictionsSnap.docs
        .map(d => { var _a, _b; return (_b = (_a = d.data().predictionData) === null || _a === void 0 ? void 0 : _a.stressLevel) !== null && _b !== void 0 ? _b : 0; })
        .reverse(); // oldest to newest
    // Check if stress is consecutively increasing
    let increasing = 0;
    for (let i = 1; i < stressLevels.length; i++) {
        if (stressLevels[i] > stressLevels[i - 1] + 0.02) {
            increasing++;
        }
    }
    return increasing >= 2; // 3+ consecutive increases (2 comparisons = 3 data points)
}
//# sourceMappingURL=notifications.js.map