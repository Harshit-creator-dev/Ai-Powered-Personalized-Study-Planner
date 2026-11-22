const { verifyGeminiModel, getGeminiConfig } = require('../config/gemini');
const { generateStudyPlanWithAI } = require('../services/aiService');
const { buildStudyPlanPrompts } = require('../prompts/studyPlanPrompt');

/**
 * Direct AI generation endpoint
 * POST /api/ai/generate
 */
const generateAI = async (req, res, next) => {
  try {
    const planData = req.body;
    const aiResult = await generateStudyPlanWithAI(planData);
    res.status(200).json({
      success: true,
      data: aiResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * AI Status & Model Verification endpoint
 * GET /api/ai/status
 * Strictly verifies the configured model (gemini-3.5-flash-lite)
 */
const getStatus = async (req, res, next) => {
  try {
    const config = getGeminiConfig();
    const verification = await verifyGeminiModel();

    res.status(200).json({
      success: true,
      data: {
        configured: config.isConfigured,
        modelName: config.modelName,
        verification,
        instructions: config.isConfigured
          ? 'Gemini API key is configured. Model verification completed.'
          : 'Please set GEMINI_API_KEY in backend/.env to connect directly to the Gemini API.',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Preview prompt without generating
 * POST /api/ai/preview-prompt
 */
const previewPrompt = (req, res) => {
  try {
    const prompts = buildStudyPlanPrompts(req.body);
    res.status(200).json({
      success: true,
      data: prompts,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  generateAI,
  getStatus,
  previewPrompt,
};
