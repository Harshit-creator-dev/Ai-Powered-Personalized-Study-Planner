const StudyPlan = require('../models/StudyPlan');
const StudySession = require('../models/StudySession');
const { generateStudyPlanWithAI } = require('../services/aiService');
const { validateConstraints, generateDeterministicSchedule } = require('../services/schedulerEngine');
const { evaluateStudyPlan } = require('../services/evaluationEngine');
const { buildStudyPlanPrompts } = require('../prompts/studyPlanPrompt');
const { getGeminiConfig } = require('../config/gemini');

const normalizeActivityType = (type) => {
  if (!type) return 'Learning';
  const clean = String(type).trim().toLowerCase();
  if (clean.includes('self') || clean.includes('assess') || clean.includes('quiz') || clean.includes('mock') || clean.includes('test')) {
    return 'Self-assessment';
  }
  if (clean.includes('revis') || clean.includes('review') || clean.includes('recall')) {
    return 'Revision';
  }
  if (clean.includes('prac') || clean.includes('problem') || clean.includes('exercise') || clean.includes('question')) {
    return 'Practice';
  }
  return 'Learning';
};

const parseDuration = (dur) => {
  if (typeof dur === 'number' && !isNaN(dur) && dur > 0) {
    return Math.round(dur * 10) / 10;
  }
  if (typeof dur === 'string') {
    const match = dur.match(/[\d.]+/);
    if (match) {
      const parsed = parseFloat(match[0]);
      if (!isNaN(parsed) && parsed > 0) return Math.round(parsed * 10) / 10;
    }
  }
  return 1.0;
};

/**
 * Generate a new AI-Powered or Algorithmic Study Plan
 * POST /api/study-plans/generate
 */
const generatePlan = async (req, res, next) => {
  try {
    const {
      workspaceId = 'default-student-workspace',
      planName,
      subjects,
      examDates,
      weakSubjects = [],
      availableHoursPerDay,
      planningStartDate,
      planningEndDate,
      preferences = {},
      useAlgorithmicBaseline = false,
    } = req.body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one subject is required.' });
    }
    if (!planningStartDate || !planningEndDate) {
      return res.status(400).json({ success: false, message: 'Planning start and end dates are required.' });
    }
    if (new Date(planningStartDate) > new Date(planningEndDate)) {
      return res.status(400).json({ success: false, message: 'Planning start date must be before or equal to planning end date.' });
    }
    if (!availableHoursPerDay || availableHoursPerDay <= 0) {
      return res.status(400).json({ success: false, message: 'Available study hours per day must be a positive number.' });
    }

    const planInput = {
      workspaceId,
      planName: planName || 'Personalized Exam Study Plan',
      subjects,
      examDates: examDates || [],
      weakSubjects,
      availableHoursPerDay: Number(availableHoursPerDay),
      planningStartDate,
      planningEndDate,
      preferences,
    };

    let timetable = [];
    let promptMetadata = {};
    let generationSource = 'ALGORITHMIC_BASELINE';

    const { isConfigured, modelName } = getGeminiConfig();

    if (!useAlgorithmicBaseline && isConfigured) {
      try {
        console.log(`[StudyPlanController] Initiating Gemini generation with model: ${modelName}`);
        const aiResult = await generateStudyPlanWithAI(planInput);
        timetable = aiResult.timetable;
        promptMetadata = aiResult.promptMetadata;
        generationSource = 'GEMINI_AI';
      } catch (aiErr) {
        console.warn(`[StudyPlanController] Gemini AI generation encountered error: ${aiErr.message}`);
        // If AI generation fails due to missing key, model error, or quota, return explicit error
        // Or if requested, allow the student to view the algorithmic schedule with a clear notification
        if (req.body.allowFallbackOnFailure) {
          console.log('[StudyPlanController] Falling back to intelligent deterministic algorithmic scheduler.');
          timetable = generateDeterministicSchedule(planInput);
          const prompts = buildStudyPlanPrompts(planInput);
          promptMetadata = {
            systemPrompt: prompts.systemPrompt,
            userPrompt: prompts.userPrompt,
            fullPrompt: prompts.fullPrompt,
            modelUsed: `${modelName} (Deterministic Algorithmic Fallback due to: ${aiErr.message})`,
            rawResponseText: JSON.stringify({ note: 'Algorithmic constraint-satisfaction schedule', fallbackReason: aiErr.message }),
            promptTokensEstimate: Math.ceil(prompts.fullPrompt.length / 4),
            responseTokensEstimate: 0,
            latencyMs: 120,
            meta: prompts.meta,
            generatedAt: new Date(),
          };
          generationSource = 'ALGORITHMIC_FALLBACK';
        } else {
          return res.status(aiErr.statusCode || 500).json({
            success: false,
            message: aiErr.message,
            code: aiErr.code || 'AI_GENERATION_FAILED',
            details: aiErr.details,
          });
        }
      }
    } else {
      // Algorithmic generation directly requested or AI key not configured
      console.log('[StudyPlanController] Generating timetable via deterministic constraint-satisfaction engine.');
      timetable = generateDeterministicSchedule(planInput);
      const prompts = buildStudyPlanPrompts(planInput);
      promptMetadata = {
        systemPrompt: prompts.systemPrompt,
        userPrompt: prompts.userPrompt,
        fullPrompt: prompts.fullPrompt,
        modelUsed: isConfigured ? modelName : 'Algorithmic Optimizer (GEMINI_API_KEY unconfigured)',
        rawResponseText: JSON.stringify({ note: 'Algorithmic constraint-satisfaction schedule' }),
        promptTokensEstimate: Math.ceil(prompts.fullPrompt.length / 4),
        responseTokensEstimate: 0,
        latencyMs: 85,
        meta: prompts.meta,
        generatedAt: new Date(),
      };
      generationSource = 'ALGORITHMIC_OPTIMIZER';
    }

    // Run independent constraint validation
    const validationResults = validateConstraints(planInput, timetable);

    // Run deterministic rule-based evaluation engine
    const evaluationResults = evaluateStudyPlan(planInput, timetable);

    // Prepare normalized timetable items
    const normalizedTimetable = timetable.map((item) => ({
      date: item.date,
      day: item.day,
      subject: item.subject,
      topic: item.topic,
      task: item.task,
      duration: parseDuration(item.duration),
      activityType: normalizeActivityType(item.activityType),
      completed: false,
    }));

    // Check if regenerating an existing plan
    let savedPlan = null;
    const existingId = req.body._id || req.body.planId || req.body.id;

    if (existingId) {
      savedPlan = await StudyPlan.findById(existingId);
    }

    if (savedPlan) {
      // Regenerate in-place: clean up old sessions first to prevent duplicate accumulation
      await StudySession.deleteMany({ studyPlanId: savedPlan._id });

      savedPlan.planName = planInput.planName;
      savedPlan.subjects = planInput.subjects;
      savedPlan.examDates = planInput.examDates;
      savedPlan.weakSubjects = planInput.weakSubjects;
      savedPlan.availableHoursPerDay = planInput.availableHoursPerDay;
      savedPlan.planningStartDate = planInput.planningStartDate;
      savedPlan.planningEndDate = planInput.planningEndDate;
      savedPlan.preferences = planInput.preferences;
      savedPlan.timetable = normalizedTimetable;
      savedPlan.evaluationResults = evaluationResults;
      savedPlan.generatedPrompt = promptMetadata;
      await savedPlan.save();
    } else {
      // Create fresh plan document
      const newPlan = new StudyPlan({
        workspaceId,
        planName: planInput.planName,
        subjects: planInput.subjects,
        examDates: planInput.examDates,
        weakSubjects: planInput.weakSubjects,
        availableHoursPerDay: planInput.availableHoursPerDay,
        planningStartDate: planInput.planningStartDate,
        planningEndDate: planInput.planningEndDate,
        preferences: planInput.preferences,
        timetable: normalizedTimetable,
        evaluationResults,
        generatedPrompt: promptMetadata,
      });
      savedPlan = await newPlan.save();
    }

    // Create corresponding StudySession documents
    const sessionDocs = savedPlan.timetable.map((item) => ({
      studyPlanId: savedPlan._id,
      workspaceId,
      date: item.date,
      day: item.day,
      subject: item.subject,
      topic: item.topic,
      task: item.task,
      duration: item.duration,
      activityType: item.activityType,
      completed: false,
    }));

    if (sessionDocs.length > 0) {
      const insertedSessions = await StudySession.insertMany(sessionDocs);
      // Link session IDs back into saved plan timetable
      savedPlan.timetable.forEach((item, idx) => {
        if (insertedSessions[idx]) {
          item.sessionId = insertedSessions[idx]._id;
        }
      });
      await savedPlan.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Study plan generated and saved successfully.',
      source: generationSource,
      data: savedPlan,
      validation: validationResults,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a study plan directly
 * POST /api/study-plans
 */
const createPlan = async (req, res, next) => {
  try {
    const newPlan = new StudyPlan(req.body);
    const savedPlan = await newPlan.save();
    res.status(201).json({ success: true, data: savedPlan });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all study plans for a workspace
 * GET /api/study-plans
 */
const getAllPlans = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspaceId || 'default-student-workspace';
    const plans = await StudyPlan.find({ workspaceId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single study plan by ID
 * GET /api/study-plans/:id
 */
const getPlanById = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Study plan not found.' });
    }
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a study plan
 * PUT /api/study-plans/:id
 */
const updatePlan = async (req, res, next) => {
  try {
    const updatedPlan = await StudyPlan.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updatedPlan) {
      return res.status(404).json({ success: false, message: 'Study plan not found.' });
    }
    res.status(200).json({ success: true, data: updatedPlan });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a study plan
 * DELETE /api/study-plans/:id
 */
const deletePlan = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Study plan not found.' });
    }
    // Cascade delete sessions
    await StudySession.deleteMany({ studyPlanId: req.params.id });
    res.status(200).json({ success: true, message: 'Study plan and associated sessions deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generatePlan,
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
};
