const express = require('express');
const router = express.Router();
const {
  generateAI,
  getStatus,
  previewPrompt,
} = require('../controllers/aiController');

// POST /api/ai/generate
router.post('/generate', generateAI);

// GET /api/ai/status
router.get('/status', getStatus);

// POST /api/ai/preview-prompt
router.post('/preview-prompt', previewPrompt);

module.exports = router;
