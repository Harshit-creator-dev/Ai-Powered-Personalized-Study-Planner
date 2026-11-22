const { GoogleGenAI } = require('@google/genai');

const getGeminiConfig = () => {
  const apiKey = process.env.GEMINI_API_KEY || '';
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

  return {
    apiKey,
    modelName,
    isConfigured: Boolean(apiKey && apiKey.trim().length > 5 && !apiKey.includes('your_gemini_api_key')),
  };
};

let genAIClient = null;

const getGenAIClient = () => {
  const { apiKey, isConfigured } = getGeminiConfig();
  if (!isConfigured) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
};

/**
 * Verifies whether the specified Gemini model is available with the current API key.
 * Strictly adheres to the requirement: "Do not silently substitute another model."
 */
const verifyGeminiModel = async () => {
  const { apiKey, modelName, isConfigured } = getGeminiConfig();

  if (!isConfigured) {
    return {
      available: false,
      configured: false,
      model: modelName,
      message: 'GEMINI_API_KEY is missing or invalid in backend/.env',
    };
  }

  try {
    const ai = getGenAIClient();
    // Attempt to verify the model availability using SDK
    const response = await ai.models.get({ model: modelName });
    return {
      available: true,
      configured: true,
      model: modelName,
      displayName: response?.displayName || modelName,
      supportedGenerationMethods: response?.supportedGenerationMethods || [],
      message: `Model ${modelName} verified and ready.`,
    };
  } catch (error) {
    // If exact model check fails, do NOT substitute. Report verified error.
    return {
      available: false,
      configured: true,
      model: modelName,
      error: error.message,
      message: `Model '${modelName}' verification failed: ${error.message}. As per strict requirement, another model will not be silently substituted.`,
    };
  }
};

module.exports = {
  getGeminiConfig,
  getGenAIClient,
  verifyGeminiModel,
};
