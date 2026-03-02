"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callGeminiPrediction = callGeminiPrediction;
const firebase_functions_1 = require("firebase-functions");
const PREDICTION_PROMPT = `You are PRISM's AI prediction engine — an academic early-warning system. Given a student's normalized behavioral and academic features (each 0-1, higher = worse), generate a structured risk assessment.

RULES:
- All scores must be between 0 and 1
- riskLevel: "Low" if stressLevel < 0.4, "Moderate" if 0.4-0.7, "High" if >= 0.7
- Provide 2-4 actionable, compassionate, personalized suggestions
- Explainability must be written in plain, student-friendly language — do NOT use technical variable names or normalized scores. Instead, describe findings using everyday terms like "sleep habits", "screen time", "mood", "study patterns", "social activity", "academic marks", "attendance". For example: "Your stress is low because you maintain good sleep and study habits" NOT "sleepNorm: 0.000"
- This is NOT a medical diagnosis; it's an academic support tool

FEATURES:
{{FEATURES}}

Respond with ONLY valid JSON in this exact schema:
{
  "stressLevel": <number 0-1>,
  "riskLevel": "<Low|Moderate|High>",
  "failureProbability": <number 0-1>,
  "attendanceDecline": <number 0-1>,
  "suggestions": ["<suggestion1>", "<suggestion2>"],
  "explainability": "<plain-language explanation for the student>"
}`;
function buildPrompt(features, rawInput) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const featureText = `
- Sleep Risk: ${features.sleepNorm.toFixed(3)} [raw: ${(_a = rawInput.sleepHours) !== null && _a !== void 0 ? _a : "N/A"} hours of sleep]
- Screen Time Risk: ${features.screenTimeNorm.toFixed(3)} [raw: ${(_b = rawInput.screenTimeHours) !== null && _b !== void 0 ? _b : "N/A"} hours]
- Mood Risk: ${features.moodNorm.toFixed(3)} [raw: ${(_c = rawInput.mood) !== null && _c !== void 0 ? _c : "N/A"} out of 5]
- Study Risk: ${features.studyNorm.toFixed(3)} [raw: ${(_d = rawInput.studyHours) !== null && _d !== void 0 ? _d : "N/A"} hours of study]
- Social Risk: ${features.socialNorm.toFixed(3)} [raw: ${(_e = rawInput.socialInteraction) !== null && _e !== void 0 ? _e : "N/A"} out of 5]
- Marks Risk: ${features.marksNorm.toFixed(3)} [raw CIA average: ${(_f = rawInput.ciaAverage) !== null && _f !== void 0 ? _f : "N/A"}]
- Attendance Risk: ${features.attendanceNorm.toFixed(3)} [raw: ${(_g = rawInput.attendancePercentage) !== null && _g !== void 0 ? _g : "N/A"}%]
- Faculty Feedback Risk: ${features.feedbackNorm.toFixed(3)} [raw: ${(_h = rawInput.facultyFeedbackScore) !== null && _h !== void 0 ? _h : "N/A"} out of 5]`;
    return PREDICTION_PROMPT.replace("{{FEATURES}}", featureText);
}
function validateResponse(data) {
    if (typeof data !== "object" || data === null)
        return false;
    if (typeof data.stressLevel !== "number" || data.stressLevel < 0 || data.stressLevel > 1)
        return false;
    if (!["Low", "Moderate", "High"].includes(data.riskLevel))
        return false;
    if (typeof data.failureProbability !== "number" || data.failureProbability < 0 || data.failureProbability > 1)
        return false;
    if (typeof data.attendanceDecline !== "number" || data.attendanceDecline < 0 || data.attendanceDecline > 1)
        return false;
    if (!Array.isArray(data.suggestions) || data.suggestions.length === 0)
        return false;
    if (typeof data.explainability !== "string" || data.explainability.length === 0)
        return false;
    return true;
}
/**
 * Calls Gemini 2.0 Flash for structured risk prediction.
 * Returns null on any failure — caller should fall back to deterministic model.
 */
async function callGeminiPrediction(features, rawInput) {
    try {
        // Lazy-load Vertex AI SDK to avoid deployment timeout
        // (the module is heavy and causes Firebase deploy analysis to exceed 10s)
        const { VertexAI } = require("@google-cloud/vertexai");
        const vertexAI = new VertexAI({
            project: process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || "",
            location: "us-central1",
        });
        const model = vertexAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 1024,
                responseMimeType: "application/json",
            },
        });
        const prompt = buildPrompt(features, rawInput);
        // 8-second timeout for the entire call
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 8000));
        const geminiPromise = (async () => {
            var _a, _b, _c, _d, _e;
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = (_e = (_d = (_c = (_b = (_a = response === null || response === void 0 ? void 0 : response.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text;
            if (!text) {
                firebase_functions_1.logger.warn("Gemini returned empty response");
                return null;
            }
            const parsed = JSON.parse(text);
            if (!validateResponse(parsed)) {
                firebase_functions_1.logger.warn("Gemini response failed validation", { parsed });
                return null;
            }
            firebase_functions_1.logger.info("Gemini prediction successful", {
                riskLevel: parsed.riskLevel,
                stressLevel: parsed.stressLevel,
            });
            return parsed;
        })();
        return await Promise.race([geminiPromise, timeoutPromise]);
    }
    catch (error) {
        firebase_functions_1.logger.warn("Gemini prediction failed, will use fallback", { error });
        return null;
    }
}
//# sourceMappingURL=gemini.js.map