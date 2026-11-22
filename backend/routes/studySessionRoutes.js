const express = require('express');
const router = express.Router();
const {
  getSessionsByPlanId,
  toggleSessionComplete,
  updateSession,
  deleteSession,
} = require('../controllers/studySessionController');

// GET /api/sessions/:planId
router.get('/:planId', getSessionsByPlanId);

// PATCH /api/sessions/:id/complete
router.patch('/:id/complete', toggleSessionComplete);

// PUT /api/sessions/:id
router.put('/:id', updateSession);

// DELETE /api/sessions/:id
router.delete('/:id', deleteSession);

module.exports = router;
