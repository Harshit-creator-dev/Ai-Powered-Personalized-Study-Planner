const StudySession = require('../models/StudySession');
const StudyPlan = require('../models/StudyPlan');
const { evaluateStudyPlan } = require('../services/evaluationEngine');

/**
 * Get all sessions for a specific study plan
 * GET /api/sessions/:planId
 */
const getSessionsByPlanId = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const sessions = await StudySession.find({ studyPlanId: planId }).sort({ date: 1, createdAt: 1 });
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle completion status of a study session
 * PATCH /api/sessions/:id/complete
 */
const toggleSessionComplete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const session = await StudySession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Study session not found.' });
    }

    session.completed = completed !== undefined ? completed : !session.completed;
    session.completedAt = session.completed ? new Date() : null;
    await session.save();

    // Sync with parent study plan timetable
    if (session.studyPlanId) {
      const plan = await StudyPlan.findById(session.studyPlanId);
      if (plan && plan.timetable) {
        const item = plan.timetable.find((t) => t.sessionId && t.sessionId.toString() === id.toString() || (t.date === session.date && t.topic === session.topic && t.subject === session.subject));
        if (item) {
          item.completed = session.completed;
          await plan.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Session marked as ${session.completed ? 'completed' : 'incomplete'}.`,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a study session
 * PUT /api/sessions/:id
 */
const updateSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedSession = await StudySession.findByIdAndUpdate(
      id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedSession) {
      return res.status(404).json({ success: false, message: 'Study session not found.' });
    }

    // Sync with parent study plan and re-evaluate
    if (updatedSession.studyPlanId) {
      const plan = await StudyPlan.findById(updatedSession.studyPlanId);
      if (plan) {
        const itemIndex = plan.timetable.findIndex((t) => t.sessionId && t.sessionId.toString() === id.toString());
        if (itemIndex > -1) {
          plan.timetable[itemIndex].date = updatedSession.date;
          plan.timetable[itemIndex].day = updatedSession.day;
          plan.timetable[itemIndex].subject = updatedSession.subject;
          plan.timetable[itemIndex].topic = updatedSession.topic;
          plan.timetable[itemIndex].task = updatedSession.task;
          plan.timetable[itemIndex].duration = updatedSession.duration;
          plan.timetable[itemIndex].activityType = updatedSession.activityType;
          plan.timetable[itemIndex].completed = updatedSession.completed;
        }
        // Re-evaluate
        plan.evaluationResults = evaluateStudyPlan(plan, plan.timetable);
        await plan.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Study session updated successfully.',
      data: updatedSession,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a study session
 * DELETE /api/sessions/:id
 */
const deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await StudySession.findByIdAndDelete(id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Study session not found.' });
    }

    // Remove from parent plan
    if (session.studyPlanId) {
      const plan = await StudyPlan.findById(session.studyPlanId);
      if (plan) {
        plan.timetable = plan.timetable.filter((t) => !(t.sessionId && t.sessionId.toString() === id.toString()));
        plan.evaluationResults = evaluateStudyPlan(plan, plan.timetable);
        await plan.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Study session deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSessionsByPlanId,
  toggleSessionComplete,
  updateSession,
  deleteSession,
};
