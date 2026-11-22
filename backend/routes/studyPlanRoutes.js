const express = require('express');
const router = express.Router();
const {
  generatePlan,
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
} = require('../controllers/studyPlanController');

// POST /api/study-plans/generate
router.post('/generate', generatePlan);

// POST /api/study-plans
router.post('/', createPlan);

// GET /api/study-plans
router.get('/', getAllPlans);

// GET /api/study-plans/:id
router.get('/:id', getPlanById);

// PUT /api/study-plans/:id
router.put('/:id', updatePlan);

// DELETE /api/study-plans/:id
router.delete('/:id', deletePlan);

module.exports = router;
