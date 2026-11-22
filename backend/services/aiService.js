const { getGenAIClient, verifyGeminiModel, getGeminiConfig } = require('../config/gemini');
const { buildStudyPlanPrompts } = require('../prompts/studyPlanPrompt');

/**
 * Service to interact directly with Google Gemini API via official Google GenAI SDK.
 * Respects strict constraint: "Verify that the requested Gemini model is available. Do not silently substitute another model."
 */
const generateStudyPlanWithAI = async (planData) => {
  const { apiKey, modelName, isConfigured } = getGeminiConfig();

  if (!isConfigured) {
    const error = new Error('GEMINI_API_KEY is not configured or is using placeholder credentials in backend/.env.');
    error.statusCode = 400;
    error.code = 'API_KEY_MISSING';
    throw error;
  }

  // 1. Verify model availability strictly
  const verification = await verifyGeminiModel();
  if (!verification.available) {
    const error = new Error(`Requested Gemini model '${modelName}' is not available: ${verification.message || verification.error}. As per system requirements, no other model is silently substituted.`);
    error.statusCode = 400;
    error.code = 'MODEL_UNAVAILABLE';
    error.details = verification;
    throw error;
  }

  // 2. Build prompt
  const { systemPrompt, userPrompt, fullPrompt, meta } = buildStudyPlanPrompts(planData);

  // 3. Query Gemini via SDK
  const ai = getGenAIClient();
  const startTime = Date.now();

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [{ text: fullPrompt }]
        }
      ],
      config: {
        temperature: 0.2, // Low temperature for high deterministic constraint adherence
        topP: 0.95,
        responseMimeType: 'application/json',
      }
    });

    const latencyMs = Date.now() - startTime;
    const rawText = response?.text || (response?.candidates && response.candidates[0]?.content?.parts[0]?.text) || '';

    if (!rawText) {
      throw new Error('Gemini API returned an empty response.');
    }

    // 4. Parse JSON cleanly (handle potential markdown fences if present)
    let cleanedText = rawText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanedText);
    } catch (parseError) {
      throw new Error(`Failed to parse Gemini output as JSON: ${parseError.message}. Raw output preview: ${cleanedText.substring(0, 200)}...`);
    }

    // Validate that parsedResult contains a timetable array
    if (!parsedResult || !Array.isArray(parsedResult.timetable)) {
      throw new Error('Gemini response JSON did not conform to the expected schema (missing "timetable" array).');
    }

    // Estimate tokens
    const promptTokensEstimate = Math.ceil(fullPrompt.length / 4);
    const responseTokensEstimate = Math.ceil(rawText.length / 4);

    return {
      success: true,
      source: 'GEMINI_AI',
      modelUsed: modelName,
      planSummary: parsedResult.planSummary || {},
      subjectBreakdown: parsedResult.subjectBreakdown || [],
      timetable: parsedResult.timetable,
      pedagogicalInsights: parsedResult.pedagogicalInsights || [],
      promptMetadata: {
        systemPrompt,
        userPrompt,
        fullPrompt,
        modelUsed: modelName,
        rawResponseText: rawText,
        promptTokensEstimate,
        responseTokensEstimate,
        latencyMs,
        meta,
        generatedAt: new Date(),
      }
    };
  } catch (apiError) {
    console.error('❌ [AI Service] Gemini Generation Error:', apiError);
    if (apiError.statusCode) throw apiError;

    const error = new Error(`Gemini API execution failed: ${apiError.message}`);
    error.statusCode = 502;
    error.code = 'GEMINI_EXECUTION_ERROR';
    error.details = apiError.message;
    throw error;
  }
};

module.exports = {
  generateStudyPlanWithAI,
};
