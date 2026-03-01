import { NormalizedFeatures, clamp01 } from "./normalization";
import type { RiskLevel } from "./types";

// Weights for the deterministic scoring model
const WEIGHTS = {
    stress: {
        sleepNorm: 0.20,
        screenTimeNorm: 0.15,
        moodNorm: 0.25,
        studyNorm: 0.10,
        socialNorm: 0.10,
        marksNorm: 0.05,
        attendanceNorm: 0.10,
        feedbackNorm: 0.05,
    },
    failure: {
        sleepNorm: 0.10,
        screenTimeNorm: 0.10,
        moodNorm: 0.15,
        studyNorm: 0.15,
        socialNorm: 0.05,
        marksNorm: 0.25,
        attendanceNorm: 0.15,
        feedbackNorm: 0.05,
    },
    attendanceDecline: {
        sleepNorm: 0.15,
        screenTimeNorm: 0.20,
        moodNorm: 0.20,
        studyNorm: 0.10,
        socialNorm: 0.10,
        marksNorm: 0.05,
        attendanceNorm: 0.15,
        feedbackNorm: 0.05,
    },
};

function weightedSum(features: NormalizedFeatures, weights: Record<string, number>): number {
    let sum = 0;
    for (const [key, weight] of Object.entries(weights)) {
        sum += (features[key as keyof NormalizedFeatures] ?? 0) * weight;
    }
    return clamp01(sum);
}

export interface FallbackPrediction {
    stressLevel: number;
    failureProbability: number;
    attendanceDecline: number;
    riskScore: number;
    riskLevel: RiskLevel;
    suggestions: string[];
    explanation: string;
}

export function computeFallbackPrediction(features: NormalizedFeatures): FallbackPrediction {
    const stressLevel = weightedSum(features, WEIGHTS.stress);
    const failureProbability = weightedSum(features, WEIGHTS.failure);
    const attendanceDecline = weightedSum(features, WEIGHTS.attendanceDecline);

    // Overall risk score: weighted average of the three sub-scores
    const riskScore = clamp01(stressLevel * 0.4 + failureProbability * 0.4 + attendanceDecline * 0.2);

    // Risk level classification
    let riskLevel: RiskLevel = "Low";
    if (riskScore >= 0.7) riskLevel = "High";
    else if (riskScore >= 0.4) riskLevel = "Moderate";

    // Template-based suggestions
    const suggestions = generateSuggestions(features, riskLevel);
    const explanation = generateExplanation(features, stressLevel, failureProbability, riskLevel);

    return {
        stressLevel,
        failureProbability,
        attendanceDecline,
        riskScore,
        riskLevel,
        suggestions,
        explanation,
    };
}

function generateSuggestions(features: NormalizedFeatures, riskLevel: RiskLevel): string[] {
    const suggestions: string[] = [];

    if (features.sleepNorm > 0.5) {
        suggestions.push("Try to maintain at least 7-8 hours of sleep per night for better focus and emotional regulation.");
    }
    if (features.screenTimeNorm > 0.5) {
        suggestions.push("Consider reducing non-academic screen time. Try the 20-20-20 rule for eye health.");
    }
    if (features.moodNorm > 0.5) {
        suggestions.push("Your mood patterns suggest elevated stress. Consider talking to a counselor or trusted friend.");
    }
    if (features.studyNorm > 0.5) {
        suggestions.push("Increasing structured study time, even by 30 minutes daily, can significantly improve academic performance.");
    }
    if (features.socialNorm > 0.5) {
        suggestions.push("Social connection is important for mental health. Try joining a study group or campus activity.");
    }
    if (features.marksNorm > 0.5) {
        suggestions.push("Review your recent CIA performance with your faculty advisor. Consider targeted revision for weaker topics.");
    }
    if (features.attendanceNorm > 0.4) {
        suggestions.push("Regular class attendance strongly correlates with better outcomes. Try to maintain 75%+ attendance.");
    }

    if (riskLevel === "High" && suggestions.length < 3) {
        suggestions.push("Reach out to your academic counselor for personalized support and guidance.");
    }

    if (suggestions.length === 0) {
        suggestions.push("Keep up the good work! Your current habits are supporting your academic success.");
    }

    return suggestions.slice(0, 4);
}

function generateExplanation(
    features: NormalizedFeatures,
    stressLevel: number,
    failureProbability: number,
    riskLevel: RiskLevel
): string {
    const factors: string[] = [];

    if (features.sleepNorm > 0.5) factors.push("insufficient sleep");
    if (features.screenTimeNorm > 0.5) factors.push("high screen time");
    if (features.moodNorm > 0.5) factors.push("low mood indicators");
    if (features.marksNorm > 0.5) factors.push("declining CIA scores");
    if (features.attendanceNorm > 0.4) factors.push("attendance below threshold");
    if (features.studyNorm > 0.5) factors.push("limited study hours");

    if (factors.length === 0) {
        return `Overall risk level is ${riskLevel}. All behavioral and academic indicators are within healthy ranges.`;
    }

    const factorStr = factors.join(", ");
    return `Risk level assessed as ${riskLevel} based on ${factorStr}. Stress level is at ${(stressLevel * 100).toFixed(0)}% and failure probability at ${(failureProbability * 100).toFixed(0)}%.`;
}
