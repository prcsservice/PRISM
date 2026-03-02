import * as admin from "firebase-admin";

type NotificationType =
    | "risk_change"
    | "new_prediction"
    | "mentor_action"
    | "alert_created"
    | "log_reminder"
    | "stress_trend"
    | "ai_suggestion";

interface CreateNotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, any>;
}

/**
 * Creates a notification document for a user.
 * Notifications are displayed in the in-app notification panel.
 */
export async function createNotification(params: CreateNotificationParams): Promise<string> {
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
export async function notifyDepartmentTeachers(
    studentDepartment: string,
    notification: Omit<CreateNotificationParams, "userId">
): Promise<void> {
    const db = admin.firestore();

    // Find all teacher user docs
    const teacherQuery = await db.collection("users")
        .where("role", "==", "teacher")
        .get();

    // Find teacher profiles in this department
    const notifyPromises: Promise<string>[] = [];

    for (const teacherDoc of teacherQuery.docs) {
        const teacherProfileSnap = await db.doc(`teachers/${teacherDoc.id}`).get();
        if (teacherProfileSnap.exists) {
            const teacherProfile = teacherProfileSnap.data()!;
            if (teacherProfile.department === studentDepartment) {
                notifyPromises.push(
                    createNotification({
                        ...notification,
                        userId: teacherDoc.id,
                    })
                );
            }
        }
    }

    await Promise.all(notifyPromises);
}

/**
 * Generate AI-suggested mentor actions based on prediction data.
 */
export function generateMentorSuggestions(data: {
    riskLevel: string;
    stressLevel: number;
    failureProbability: number;
    studentName: string;
}): string[] {
    const suggestions: string[] = [];

    if (data.stressLevel > 0.8) {
        suggestions.push(`Schedule an immediate one-on-one wellness check with ${data.studentName}`);
        suggestions.push("Consider referring to campus counseling services");
    } else if (data.stressLevel > 0.6) {
        suggestions.push(`Send a check-in message to ${data.studentName} about their well-being`);
    }

    if (data.failureProbability > 0.7) {
        suggestions.push("Create an academic recovery plan with targeted study sessions");
        suggestions.push("Arrange peer tutoring or study group participation");
    } else if (data.failureProbability > 0.5) {
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
export async function detectStressTrend(studentId: string): Promise<boolean> {
    const db = admin.firestore();

    const predictionsSnap = await db.collection(`students/${studentId}/predictions`)
        .orderBy("timestamp", "desc")
        .limit(4)
        .get();

    if (predictionsSnap.docs.length < 3) return false;

    const stressLevels = predictionsSnap.docs
        .map(d => d.data().predictionData?.stressLevel ?? 0)
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
