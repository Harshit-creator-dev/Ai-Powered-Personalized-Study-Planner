/**
 * Scheduler Engine
 * Independent Backend Validation & Algorithmic Constraint Satisfaction Engine
 */

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Validates scheduling constraints strictly
 */
const validateConstraints = (planData, timetable = []) => {
  const {
    availableHoursPerDay = 4,
    planningStartDate,
    planningEndDate,
    examDates = [],
    weakSubjects = [],
    subjects = []
  } = planData;

  const violations = [];
  const suggestions = [];

  const examMap = {};
  examDates.forEach((e) => {
    if (e.subject && e.examDate) examMap[e.subject] = e.examDate;
  });

  const dailyHours = {};
  const subjectHours = {};

  timetable.forEach((session, index) => {
    const { date, subject, duration, activityType } = session;
    const dur = Number(duration) || 0;

    // 1. Date window check
    if (date < planningStartDate || date > planningEndDate) {
      violations.push({
        type: 'DATE_OUT_OF_BOUNDS',
        sessionIndex: index,
        details: `Session on ${date} is outside the planning window (${planningStartDate} to ${planningEndDate}).`,
      });
    }

    // 2. Exam date check
    if (subject && examMap[subject]) {
      if (date >= examMap[subject]) {
        violations.push({
          type: 'POST_EXAM_SESSION',
          sessionIndex: index,
          subject,
          date,
          examDate: examMap[subject],
          details: `Session for '${subject}' on ${date} is scheduled on/after its exam date (${examMap[subject]}).`,
        });
      }
    }

    dailyHours[date] = (dailyHours[date] || 0) + dur;
    subjectHours[subject] = (subjectHours[subject] || 0) + dur;
  });

  // 3. Daily capacity check
  Object.keys(dailyHours).forEach((d) => {
    if (dailyHours[d] > availableHoursPerDay) {
      violations.push({
        type: 'DAILY_HOURS_EXCEEDED',
        date: d,
        scheduledHours: dailyHours[d],
        limit: availableHoursPerDay,
        details: `Total scheduled hours on ${d} (${dailyHours[d].toFixed(1)}h) exceed the daily limit of ${availableHoursPerDay}h.`,
      });
    }
  });

  // Calculate feasibility overview
  const startD = new Date(planningStartDate);
  const endD = new Date(planningEndDate);
  const totalDays = Math.max(1, Math.round((endD - startD) / (1000 * 60 * 60 * 24)) + 1);
  const totalBudget = totalDays * availableHoursPerDay;
  const totalScheduled = Object.values(dailyHours).reduce((a, b) => a + b, 0);

  if (totalScheduled > totalBudget) {
    suggestions.push(`Total scheduled hours (${totalScheduled.toFixed(1)}h) exceed total available budget (${totalBudget}h). Consider increasing daily hours or extending the end date.`);
  }

  // Check weak subject prioritization
  if (weakSubjects.length > 0) {
    const weakTotal = weakSubjects.reduce((acc, ws) => acc + (subjectHours[ws] || 0), 0) / weakSubjects.length;
    const normalSubjs = subjects.filter((s) => !weakSubjects.includes(s.name));
    const normalTotal = normalSubjs.length > 0 
      ? normalSubjs.reduce((acc, s) => acc + (subjectHours[s.name] || 0), 0) / normalSubjs.length 
      : weakTotal;

    if (normalTotal > 0 && weakTotal / normalTotal < 1.1) {
      suggestions.push(`Weak subjects (${weakSubjects.join(', ')}) received ${weakTotal.toFixed(1)}h avg compared to ${normalTotal.toFixed(1)}h for normal subjects. Recommend increasing weak subject allocation.`);
    }
  }

  return {
    isFeasible: violations.length === 0,
    violationCount: violations.length,
    violations,
    suggestions,
    totalBudget,
    totalScheduled,
    dailyHours,
  };
};

/**
 * Intelligent deterministic timetable generator
 * Used as high-reliability algorithmic backup and constraint benchmark
 */
const generateDeterministicSchedule = (planData) => {
  const {
    subjects = [],
    examDates = [],
    weakSubjects = [],
    availableHoursPerDay = 4,
    planningStartDate,
    planningEndDate,
    preferences = {},
  } = planData;

  const sessionDuration = (preferences.preferredSessionDuration || 60) / 60; // in hours (e.g. 1.0 or 1.5)
  const examMap = {};
  examDates.forEach((e) => {
    if (e.subject && e.examDate) examMap[e.subject] = e.examDate;
  });

  // Generate calendar dates
  const dates = [];
  const curr = new Date(planningStartDate + 'T00:00:00');
  const end = new Date(planningEndDate + 'T00:00:00');

  while (curr <= end) {
    const yyyy = curr.getFullYear();
    const mm = String(curr.getMonth() + 1).padStart(2, '0');
    const dd = String(curr.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    dates.push({
      date: dateStr,
      day: dayNames[curr.getDay()],
    });
    curr.setDate(curr.getDate() + 1);
  }

  // Compute subject weights and available topics
  const subjectPool = subjects.map((subj) => {
    const isWeak = weakSubjects.includes(subj.name);
    const difficultyMultiplier = subj.difficulty === 'Hard' ? 1.3 : subj.difficulty === 'Easy' ? 0.8 : 1.0;
    const weakMultiplier = isWeak ? 1.45 : 1.0;
    const examDate = examMap[subj.name] || '9999-12-31';
    const topics = Array.isArray(subj.topics) && subj.topics.length > 0 
      ? [...subj.topics] 
      : [`${subj.name} Core Concepts`, `${subj.name} Advanced Theory`, `${subj.name} Problem Sets`, `${subj.name} Comprehensive Revision`];

    return {
      name: subj.name,
      difficulty: subj.difficulty || 'Medium',
      isWeak,
      weight: difficultyMultiplier * weakMultiplier,
      examDate,
      topics,
      currentTopicIndex: 0,
      sessionsCount: 0,
      activityCycle: ['Learning', 'Learning', 'Revision', 'Practice', 'Self-assessment'],
      cycleIndex: 0,
    };
  });

  const timetable = [];

  // Iterate over each planning day
  dates.forEach(({ date, day }) => {
    let dayRemainingHours = availableHoursPerDay;

    // Filter subjects whose exam hasn't arrived yet
    const activeSubjects = subjectPool.filter((s) => date < s.examDate);

    if (activeSubjects.length === 0) {
      return; // All exams passed for all subjects
    }

    // Sort active subjects by urgency: closest exam date first, then weak status, then least sessions scheduled
    activeSubjects.sort((a, b) => {
      if (a.examDate !== b.examDate) {
        return a.examDate.localeCompare(b.examDate);
      }
      if (a.isWeak !== b.isWeak) {
        return a.isWeak ? -1 : 1;
      }
      return (a.sessionsCount / a.weight) - (b.sessionsCount / b.weight);
    });

    while (dayRemainingHours >= 0.5 && activeSubjects.length > 0) {
      // Pick subject with lowest normalized session count based on weight (preferential allocation)
      const subj = activeSubjects.reduce((minSubj, curr) => {
        const currNorm = curr.sessionsCount / curr.weight;
        const minNorm = minSubj.sessionsCount / minSubj.weight;
        if (currNorm < minNorm) return curr;
        if (currNorm === minNorm && curr.isWeak) return curr;
        return minSubj;
      }, activeSubjects[0]);

      const allocDuration = Math.min(dayRemainingHours, sessionDuration >= 1.0 ? 1.0 : sessionDuration);

      const topic = subj.topics[subj.currentTopicIndex % subj.topics.length];
      const activityType = subj.activityCycle[subj.cycleIndex % subj.activityCycle.length];

      let taskDesc = '';
      if (activityType === 'Learning') {
        taskDesc = `Study and master ${topic} fundamentals, notes, and key mechanisms.`;
      } else if (activityType === 'Revision') {
        taskDesc = `Active recall session and high-yield summary review of ${topic}.`;
      } else if (activityType === 'Practice') {
        taskDesc = `Solve past examination questions and problem sets for ${topic}.`;
      } else {
        taskDesc = `Timed self-assessment mock test and error analysis on ${topic}.`;
      }

      timetable.push({
        date,
        day,
        subject: subj.name,
        topic,
        task: taskDesc,
        duration: allocDuration,
        activityType,
        completed: false,
      });

      subj.sessionsCount += 1;
      subj.cycleIndex += 1;
      if (subj.cycleIndex % 2 === 0) {
        subj.currentTopicIndex += 1;
      }

      dayRemainingHours -= allocDuration;
    }
  });

  return timetable;
};

module.exports = {
  validateConstraints,
  generateDeterministicSchedule,
};
