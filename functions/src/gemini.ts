import { VertexAI } from "@google-cloud/vertexai";
import { logger } from "firebase-functions";
import { NormalizedFeatures } from "./normalization";

export interface GeminiPrediction {
    stressLevel: number;
    riskLevel: "Low" | "Moderate" | "High";
    failureProbability: number;
    attendanceDecline: number;
    suggestions: string[];
    explainability: string;
}

const PREDICTION_PROMPT = `You are PRISM's AI prediction engine — an academic early-warning system. Given a student's normalized behavioral and academic features (each 0-1, higher = worse), generate a structured risk assessment.

RULES:
- All scores must be between 0 and 1
- riskLevel: "Low" if stressLevel < 0.4, "Moderate" if 0.4-0.7, "High" if >= 0.7
- Provide 2-4 actionable, compassionate suggestions
- Explainability must reference specific contributing factors
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
  "explainability": "<explanation string>"
}`;

function buildPrompt(features: NormalizedFeatures, rawInput: Record<string, any>): string {
    const featureText = `
- Sleep Risk (sleepNorm): ${features.sleepNorm.toFixed(3)} [raw: ${rawInput.sleepHours ?? "N/A"} hrs]
- Screen Time Risk (screenTimeNorm): ${features.screenTimeNorm.toFixed(3)} [raw: ${rawInput.screenTimeHours ?? "N/A"} hrs]
- Mood Risk (moodNorm): ${features.moodNorm.toFixed(3)} [raw: ${rawInput.mood ?? "N/A"}/5]
- Study Risk (studyNorm): ${features.studyNorm.toFixed(3)} [raw: ${rawInput.studyHours ?? "N/A"} hrs]
- Social Risk (socialNorm): ${features.socialNorm.toFixed(3)} [raw: ${rawInput.socialInteraction ?? "N/A"}/5]
- Marks Risk (marksNorm): ${features.marksNorm.toFixed(3)} [raw CIA avg: ${rawInput.ciaAverage ?? "N/A"}]
- Attendance Risk (attendanceNorm): ${features.attendanceNorm.toFixed(3)} [raw: ${rawInput.attendancePercentage ?? "N/A"}%]
- Feedback Risk (feedbackNorm): ${features.feedbackNorm.toFixed(3)} [raw: ${rawInput.facultyFeedbackScore ?? "N/A"}/5]`;

    return PREDICTION_PROMPT.replace("{{FEATURES}}", featureText);
}

function validateResponse(data: any): data is GeminiPrediction {
    if (typeof data !== "object" || data === null) return false;
    if (typeof data.stressLevel !== "number" || data.stressLevel < 0 || data.stressLevel > 1) return false;
    if (!["Low", "Moderate", "High"].includes(data.riskLevel)) return false;
    if (typeof data.failureProbability !== "number" || data.failureProbability < 0 || data.failureProbability > 1) return false;
    if (typeof data.attendanceDecline !== "number" || data.attendanceDecline < 0 || data.attendanceDecline > 1) return false;
    if (!Array.isArray(data.suggestions) || data.suggestions.length === 0) return false;
    if (typeof data.explainability !== "string" || data.explainability.length === 0) return false;
    return true;
}

/**
 * Calls Gemini 2.0 Flash for structured risk prediction.
 * Returns null on any failure — caller should fall back to deterministic model.
 */
export async function callGeminiPrediction(
    features: NormalizedFeatures,
    rawInput: Record<string, any>
): Promise<GeminiPrediction | null> {
    try {
        // Vertex AI uses default credentials from Cloud Functions environment
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
        const timeoutPromise = new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), 8000)
        );

        const geminiPromise = (async () => {
            const result = await model.generateContent(prompt);
            const response = result.response;

            const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                logger.warn("Gemini returned empty response");
                return null;
            }

            const parsed = JSON.parse(text);

            if (!validateResponse(parsed)) {
                logger.warn("Gemini response failed validation", { parsed });
                return null;
            }

            logger.info("Gemini prediction successful", {
                riskLevel: parsed.riskLevel,
                stressLevel: parsed.stressLevel,
            });

            return parsed as GeminiPrediction;
        })();

        return await Promise.race([geminiPromise, timeoutPromise]);
    } catch (error) {
        logger.warn("Gemini prediction failed, will use fallback", { error });
        return null;
    }
}
