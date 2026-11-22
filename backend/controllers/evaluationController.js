const StudyPlan = require('../models/StudyPlan');
const { evaluateStudyPlan } = require('../services/evaluationEngine');
const { validateConstraints } = require('../services/schedulerEngine');

/**
 * Re-evaluate a study plan
 * POST /api/evaluation/:planId
 */
const evaluatePlan = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const plan = await StudyPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Study plan not found.' });
    }

    const evaluationResults = evaluateStudyPlan(plan, plan.timetable);
    const validation = validateConstraints(plan, plan.timetable);

    plan.evaluationResults = evaluationResults;
    await plan.save();

    res.status(200).json({
      success: true,
      message: 'Plan evaluated successfully.',
      data: {
        evaluation: evaluationResults,
        validation,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get evaluation results for a study plan
 * GET /api/evaluation/:planId
 */
const getPlanEvaluation = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const plan = await StudyPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Study plan not found.' });
    }

    const validation = validateConstraints(plan, plan.timetable);

    res.status(200).json({
      success: true,
      data: {
        evaluation: plan.evaluationResults,
        validation,
        generatedPrompt: plan.generatedPrompt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  evaluatePlan,
  getPlanEvaluation,
};
