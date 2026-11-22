const express = require('express');
const router = express.Router();
const {
  evaluatePlan,
  getPlanEvaluation,
} = require('../controllers/evaluationController');

// POST /api/evaluation/:planId
router.post('/:planId', evaluatePlan);

// GET /api/evaluation/:planId
router.get('/:planId', getPlanEvaluation);

module.exports = router;
