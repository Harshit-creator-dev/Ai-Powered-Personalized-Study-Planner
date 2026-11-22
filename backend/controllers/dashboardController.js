const StudyPlan = require('../models/StudyPlan');
const StudySession = require('../models/StudySession');

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

/**
 * Get aggregated dashboard statistics
 * GET /api/dashboard/stats
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspaceId || 'default-student-workspace';
    const planId = req.query.planId;

    const plans = await StudyPlan.find({ workspaceId }).sort({ createdAt: -1 });

    const targetPlan = planId 
      ? plans.find((p) => p._id.toString() === planId.toString()) || plans[0]
      : plans[0];

    const totalPlans = plans.length;
    let totalScheduledHours = 0;
    let completedHours = 0;
    let completedSessionsCount = 0;

    const subjectHours = {};
    const subjectCompletedHours = {};
    const activityStats = {
      Learning: { total: 0, completed: 0 },
      Revision: { total: 0, completed: 0 },
      Practice: { total: 0, completed: 0 },
      'Self-assessment': { total: 0, completed: 0 },
    };

    const dailyCompletion = {};
    let totalSessions = 0;

    if (targetPlan && Array.isArray(targetPlan.timetable)) {
      totalSessions = targetPlan.timetable.length;

      targetPlan.timetable.forEach((item) => {
        const dur = Number(item.duration) || 1;
        totalScheduledHours += dur;

        if (item.completed) {
          completedHours += dur;
          completedSessionsCount++;
        }

        if (item.subject) {
          subjectHours[item.subject] = (subjectHours[item.subject] || 0) + dur;
          if (item.completed) {
            subjectCompletedHours[item.subject] = (subjectCompletedHours[item.subject] || 0) + dur;
          }
        }

        const actType = normalizeActivityType(item.activityType);
        activityStats[actType].total = Number((activityStats[actType].total + dur).toFixed(1));
        if (item.completed) {
          activityStats[actType].completed = Number((activityStats[actType].completed + dur).toFixed(1));
        }

        if (item.date) {
          if (!dailyCompletion[item.date]) {
            dailyCompletion[item.date] = { date: item.date, total: 0, completed: 0 };
          }
          dailyCompletion[item.date].total = Number((dailyCompletion[item.date].total + dur).toFixed(1));
          if (item.completed) {
            dailyCompletion[item.date].completed = Number((dailyCompletion[item.date].completed + dur).toFixed(1));
          }
        }
      });
    }

    const overallCompletionRate = totalScheduledHours > 0 
      ? Math.round((completedHours / totalScheduledHours) * 100) 
      : 0;

    // Collect upcoming exams from target plan or across active plans
    const upcomingExams = [];
    const seenExams = new Set();
    const todayStr = new Date().toISOString().split('T')[0];

    const plansToScan = targetPlan ? [targetPlan] : plans;
    plansToScan.forEach((plan) => {
      if (Array.isArray(plan.examDates)) {
        plan.examDates.forEach((ed) => {
          const key = `${ed.subject}-${ed.examDate}`;
          if (!seenExams.has(key)) {
            seenExams.add(key);
            const daysLeft = Math.ceil((new Date(ed.examDate) - new Date(todayStr)) / (1000 * 60 * 60 * 24));
            upcomingExams.push({
              subject: ed.subject,
              examDate: ed.examDate,
              daysLeft: isNaN(daysLeft) ? null : daysLeft,
              isWeak: (plan.weakSubjects || []).includes(ed.subject),
            });
          }
        });
      }
    });

    upcomingExams.sort((a, b) => a.examDate.localeCompare(b.examDate));

    // Subject breakdown array
    const subjectProgress = Object.keys(subjectHours).map((subject) => {
      const total = Number(subjectHours[subject].toFixed(1));
      const done = Number((subjectCompletedHours[subject] || 0).toFixed(1));
      const isWeak = targetPlan ? (targetPlan.weakSubjects || []).includes(subject) : false;
      return {
        subject,
        totalHours: total,
        completedHours: done,
        remainingHours: Number(Math.max(0, total - done).toFixed(1)),
        completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
        isWeak,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalPlans,
          totalSessions,
          completedSessionsCount,
          totalScheduledHours: Number(totalScheduledHours.toFixed(1)),
          completedHours: Number(completedHours.toFixed(1)),
          remainingHours: Number(Math.max(0, totalScheduledHours - completedHours).toFixed(1)),
          overallCompletionRate,
        },
        upcomingExams,
        subjectProgress,
        activityStats,
        dailyCompletion: Object.values(dailyCompletion).sort((a, b) => a.date.localeCompare(b.date)),
        activePlan: targetPlan || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
