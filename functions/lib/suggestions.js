"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFallbackSuggestions = generateFallbackSuggestions;
exports.generateFallbackExplanation = generateFallbackExplanation;
// ===== Suggestion Pool System =====
// Each factor has multiple suggestion variants to avoid repetitive output.
const SLEEP_SUGGESTIONS = [
    "Try to maintain at least 7-8 hours of sleep per night for better focus and emotional regulation.",
    "Prioritize a consistent sleep schedule — going to bed and waking up at the same time helps cognitive performance.",
    "Avoid screens 30 minutes before bed. Quality sleep is strongly linked to academic success.",
    "Consider a short wind-down routine before bed (reading, journaling). Even 15 min of extra sleep can boost focus.",
];
const SCREEN_TIME_SUGGESTIONS = [
    "Reduce screen time, especially before bed, to improve sleep quality.",
    "Try the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds to reduce eye strain.",
    "Consider using app timers to limit non-academic screen usage to under 3 hours per day.",
    "Replace 30 minutes of daily screen time with a walk or physical activity — it reduces stress and improves concentration.",
];
const MOOD_SUGGESTIONS = [
    "Your mood patterns suggest elevated stress. Consider talking to a counselor or trusted friend.",
    "Practice a brief mindfulness or deep-breathing exercise when feeling overwhelmed — even 5 minutes can help.",
    "Journaling your thoughts for 10 minutes daily can improve mood clarity and emotional resilience.",
    "If low mood persists for more than two weeks, please reach out to campus wellness support. You're not alone.",
];
const STUDY_SUGGESTIONS = [
    "Schedule specific study blocks and stick to them to improve study habits.",
    "Try the Pomodoro technique: 25 minutes of focused study, then a 5-minute break. It boosts retention.",
    "Even adding 30 minutes of structured study daily can significantly improve academic performance.",
    "Study in a dedicated, distraction-free space. Changing your environment can boost productivity.",
];
const SOCIAL_SUGGESTIONS = [
    "Engage in social activities to improve mood and reduce social isolation.",
    "Try joining a study group or campus club — social connection is protective against academic burnout.",
    "Reach out to a classmate or friend this week. Even brief social contact can improve well-being.",
    "Consider group study sessions — they combine academic work with social connection.",
];
const MARKS_SUGGESTIONS = [
    "Review your recent CIA performance with your faculty advisor. Consider targeted revision for weaker topics.",
    "Identify your two weakest CIA topics and schedule extra revision sessions this week.",
    "Ask your instructor for practice problems or past papers to improve CIA scores in specific areas.",
    "Consider forming a study group focused on your weaker subjects — peer learning can accelerate improvement.",
];
const ATTENDANCE_SUGGESTIONS = [
    "Regular class attendance strongly correlates with better outcomes. Try to maintain 75%+ attendance.",
    "Set a daily alarm specifically for your first class. Consistent attendance builds academic momentum.",
    "Even attending one additional class per week can significantly improve your understanding and performance.",
    "If health or personal issues are affecting attendance, inform your faculty advisor — accommodations may be available.",
];
const HIGH_RISK_SUGGESTIONS = [
    "Reach out to your academic counselor for personalized support and guidance.",
    "Schedule a meeting with your department mentor — they can help create a recovery plan tailored to you.",
    "Consider visiting the campus wellness center. Multi-factor risk often benefits from professional support.",
];
const LOW_RISK_SUGGESTIONS = [
    "Keep up the good work! Your current habits are supporting your academic success.",
    "Great balance! Continue maintaining your current patterns — consistency is key.",
    "You're doing well. Consider setting stretch goals to challenge yourself further.",
];
function pickVariant(pool, features) {
    const hash = Object.values(features).reduce((acc, v) => acc + Math.round(v * 1000), 0);
    return pool[hash % pool.length];
}
function generateFallbackSuggestions(features, riskLevel, stressLevel, failureProbability) {
    const suggestions = [];
    const factors = [
        { value: features.sleepNorm, threshold: 0.5, pool: SLEEP_SUGGESTIONS },
        { value: features.screenTimeNorm, threshold: 0.5, pool: SCREEN_TIME_SUGGESTIONS },
        { value: features.moodNorm, threshold: 0.5, pool: MOOD_SUGGESTIONS },
        { value: features.studyNorm, threshold: 0.5, pool: STUDY_SUGGESTIONS },
        { value: features.socialNorm, threshold: 0.5, pool: SOCIAL_SUGGESTIONS },
        { value: features.marksNorm, threshold: 0.5, pool: MARKS_SUGGESTIONS },
        { value: features.attendanceNorm, threshold: 0.4, pool: ATTENDANCE_SUGGESTIONS },
    ];
    const flagged = factors
        .filter(f => f.value > f.threshold)
        .sort((a, b) => b.value - a.value);
    for (const factor of flagged) {
        if (suggestions.length >= 4)
            break;
        suggestions.push(pickVariant(factor.pool, features));
    }
    if (riskLevel === "High" && suggestions.length < 3) {
        suggestions.push(pickVariant(HIGH_RISK_SUGGESTIONS, features));
    }
    if (suggestions.length === 0) {
        suggestions.push(pickVariant(LOW_RISK_SUGGESTIONS, features));
    }
    return suggestions.slice(0, 4);
}
function generateFallbackExplanation(features, stressLevel, failureProbability, attendanceDecline, riskLevel) {
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
    if (features.feedbackNorm > 0.5)
        factors.push("concerning faculty feedback");
    if (factors.length === 0) {
        return `Overall risk level is ${riskLevel}. All behavioral and academic indicators are within healthy ranges. Keep up the great work!`;
    }
    const topFactors = factors.slice(0, 3).join(", ");
    const remaining = factors.length > 3 ? ` and ${factors.length - 3} other factor(s)` : "";
    return `Risk level assessed as ${riskLevel} based on ${topFactors}${remaining}. Stress at ${Math.round(stressLevel * 100)}%, failure probability at ${Math.round(failureProbability * 100)}%, and attendance decline risk at ${Math.round(attendanceDecline * 100)}%.`;
}
//# sourceMappingURL=suggestions.js.map