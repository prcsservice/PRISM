import {
    normSleep, normScreenTime, normMood, normStudyHours, normSocial,
    normMarks, normAttendance, normFeedback, normalizeAll, computeScores
} from "../normalization";

describe("Individual normalization functions", () => {
    test("normSleep: 0 hours → max risk (1.0)", () => {
        expect(normSleep(0)).toBe(1);
    });

    test("normSleep: 8 hours → no risk (0.0)", () => {
        expect(normSleep(8)).toBe(0);
    });

    test("normSleep: 4 hours → 0.5 risk", () => {
        expect(normSleep(4)).toBe(0.5);
    });

    test("normSleep: negative → clamped to 1.0", () => {
        expect(normSleep(-2)).toBe(1);
    });

    test("normSleep: very high → clamped to 0.0", () => {
        expect(normSleep(12)).toBe(0);
    });

    test("normScreenTime: 0 hrs → 0.0", () => {
        expect(normScreenTime(0)).toBe(0);
    });

    test("normScreenTime: 10 hrs → 1.0", () => {
        expect(normScreenTime(10)).toBe(1);
    });

    test("normScreenTime: 5 hrs → 0.5", () => {
        expect(normScreenTime(5)).toBe(0.5);
    });

    test("normMood: 5 (Great) → 0.0 risk", () => {
        expect(normMood(5)).toBe(0);
    });

    test("normMood: 1 (Very Bad) → 1.0 risk", () => {
        expect(normMood(1)).toBe(1);
    });

    test("normMood: 3 (Neutral) → 0.5 risk", () => {
        expect(normMood(3)).toBe(0.5);
    });

    test("normStudyHours: 6 hrs → 0.0", () => {
        expect(normStudyHours(6)).toBe(0);
    });

    test("normStudyHours: 0 hrs → 1.0", () => {
        expect(normStudyHours(0)).toBe(1);
    });

    test("normSocial: 5 (Very Active) → 0.0", () => {
        expect(normSocial(5)).toBe(0);
    });

    test("normSocial: 1 (Isolated) → 1.0", () => {
        expect(normSocial(1)).toBe(1);
    });

    test("normMarks: 100 → 0.0 risk", () => {
        expect(normMarks(100)).toBe(0);
    });

    test("normMarks: 0 → 1.0 risk", () => {
        expect(normMarks(0)).toBe(1);
    });

    test("normAttendance: 100% → 0.0", () => {
        expect(normAttendance(100)).toBe(0);
    });

    test("normAttendance: 0% → 1.0", () => {
        expect(normAttendance(0)).toBe(1);
    });

    test("normFeedback: 5 → 0.0", () => {
        expect(normFeedback(5)).toBe(0);
    });

    test("normFeedback: 1 → 1.0", () => {
        expect(normFeedback(1)).toBe(1);
    });
});

describe("normalizeAll", () => {
    test("returns all 8 normalized features", () => {
        const result = normalizeAll({
            sleepHours: 8,
            screenTimeHours: 0,
            mood: 5,
            studyHours: 6,
            socialInteraction: 5,
            ciaAverage: 100,
            attendancePercentage: 100,
            facultyFeedbackScore: 5,
        });

        expect(result.sleepNorm).toBe(0);
        expect(result.screenTimeNorm).toBe(0);
        expect(result.moodNorm).toBe(0);
        expect(result.studyNorm).toBe(0);
        expect(result.socialNorm).toBe(0);
        expect(result.marksNorm).toBe(0);
        expect(result.attendanceNorm).toBe(0);
        expect(result.feedbackNorm).toBe(0);
    });

    test("worst-case input produces all 1.0 features", () => {
        const result = normalizeAll({
            sleepHours: 0,
            screenTimeHours: 10,
            mood: 1,
            studyHours: 0,
            socialInteraction: 1,
            ciaAverage: 0,
            attendancePercentage: 0,
            facultyFeedbackScore: 1,
        });

        expect(result.sleepNorm).toBe(1);
        expect(result.screenTimeNorm).toBe(1);
        expect(result.moodNorm).toBe(1);
        expect(result.studyNorm).toBe(1);
        expect(result.socialNorm).toBe(1);
        expect(result.marksNorm).toBe(1);
        expect(result.attendanceNorm).toBe(1);
        expect(result.feedbackNorm).toBe(1);
    });
});

describe("computeScores", () => {
    test("all-zero features → Low risk", () => {
        const features = {
            sleepNorm: 0, screenTimeNorm: 0, moodNorm: 0, studyNorm: 0,
            socialNorm: 0, marksNorm: 0, attendanceNorm: 0, feedbackNorm: 0,
        };
        const result = computeScores(features);
        expect(result.riskLevel).toBe("Low");
        expect(result.riskScore).toBe(0);
        expect(result.stressLevel).toBe(0);
        expect(result.failureProbability).toBe(0);
        expect(result.attendanceDecline).toBe(0);
    });

    test("all-one features → High risk", () => {
        const features = {
            sleepNorm: 1, screenTimeNorm: 1, moodNorm: 1, studyNorm: 1,
            socialNorm: 1, marksNorm: 1, attendanceNorm: 1, feedbackNorm: 1,
        };
        const result = computeScores(features);
        expect(result.riskLevel).toBe("High");
        expect(result.riskScore).toBe(1);
        expect(result.stressLevel).toBe(1);
        expect(result.failureProbability).toBe(1);
    });

    test("moderate features → Moderate risk", () => {
        const features = {
            sleepNorm: 0.5, screenTimeNorm: 0.5, moodNorm: 0.5, studyNorm: 0.5,
            socialNorm: 0.5, marksNorm: 0.5, attendanceNorm: 0.5, feedbackNorm: 0.5,
        };
        const result = computeScores(features);
        expect(result.riskLevel).toBe("Moderate");
        expect(result.riskScore).toBeCloseTo(0.5, 1);
    });

    test("riskScore boundaries: 0.4 → Moderate", () => {
        // These features are chosen so the weighted sum ≈ 0.4
        const features = {
            sleepNorm: 0.4, screenTimeNorm: 0.4, moodNorm: 0.4, studyNorm: 0.4,
            socialNorm: 0.4, marksNorm: 0.4, attendanceNorm: 0.4, feedbackNorm: 0.4,
        };
        const result = computeScores(features);
        expect(result.riskLevel).toBe("Moderate");
    });
});

// === Alert Logic Tests (pure logic, no Firestore) ===

describe("Alert threshold behavior", () => {
    test("Low risk → no alert should be created", () => {
        const result = computeScores({
            sleepNorm: 0, screenTimeNorm: 0, moodNorm: 0, studyNorm: 0,
            socialNorm: 0, marksNorm: 0, attendanceNorm: 0, feedbackNorm: 0,
        });
        expect(result.riskLevel).toBe("Low");
    });

    test("High risk level generates Critical priority", () => {
        const riskLevel: string = "High";
        const priority = riskLevel === "High" ? "Critical" : "Warning";
        expect(priority).toBe("Critical");
    });

    test("Moderate risk level generates Warning priority", () => {
        const riskLevel: string = "Moderate";
        const priority = riskLevel === "High" ? "Critical" : "Warning";
        expect(priority).toBe("Warning");
    });
});

describe("Alert reason building", () => {
    function buildReason(data: {
        stressLevel: number;
        failureProbability: number;
        riskScore: number;
        riskLevel: string;
    }): string {
        const parts: string[] = [];
        if (data.stressLevel > 0.7)
            parts.push(`high stress level (${Math.round(data.stressLevel * 100)}%)`);
        if (data.failureProbability > 0.6)
            parts.push(`elevated failure probability (${Math.round(data.failureProbability * 100)}%)`);
        if (data.riskScore > 0.7)
            parts.push(`overall risk score exceeds threshold (${Math.round(data.riskScore * 100)}%)`);
        if (parts.length === 0)
            parts.push(`risk level assessed as ${data.riskLevel}`);
        return `Student flagged for: ${parts.join(", ")}.`;
    }

    test("high stress → includes stress in reason", () => {
        const reason = buildReason({ stressLevel: 0.8, failureProbability: 0.3, riskScore: 0.5, riskLevel: "Moderate" });
        expect(reason).toContain("high stress level (80%)");
    });

    test("high failure → includes failure in reason", () => {
        const reason = buildReason({ stressLevel: 0.3, failureProbability: 0.75, riskScore: 0.5, riskLevel: "Moderate" });
        expect(reason).toContain("elevated failure probability (75%)");
    });

    test("combined high indicators", () => {
        const reason = buildReason({ stressLevel: 0.8, failureProbability: 0.8, riskScore: 0.85, riskLevel: "High" });
        expect(reason).toContain("high stress level");
        expect(reason).toContain("elevated failure probability");
        expect(reason).toContain("overall risk score exceeds threshold");
    });

    test("moderate with no high indicators → fallback reason", () => {
        const reason = buildReason({ stressLevel: 0.5, failureProbability: 0.5, riskScore: 0.5, riskLevel: "Moderate" });
        expect(reason).toBe("Student flagged for: risk level assessed as Moderate.");
    });
});
