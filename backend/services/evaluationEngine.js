/**
 * Rule-Based Deterministic Evaluation Engine
 * Evaluates generated study timetables strictly against student constraints
 * without random numbers or placeholder data.
 */

const evaluateStudyPlan = (planData, timetable = []) => {
  const {
    subjects = [],
    examDates = [],
    weakSubjects = [],
    availableHoursPerDay = 4,
    planningStartDate,
    planningEndDate,
  } = planData;

  const metrics = [];
  const warnings = [];
  const recommendations = [];

  const sessions = Array.isArray(timetable) ? timetable : [];
  const totalSessions = sessions.length;

  if (totalSessions === 0) {
    return {
      overallScore: 0,
      feasibilityScore: 0,
      completenessScore: 0,
      consistencyScore: 0,
      hourSatisfactionScore: 0,
      examComplianceScore: 0,
      revisionCoverageScore: 0,
      practiceCoverageScore: 0,
      weakSubjectPrioritizationScore: 0,
      metrics: [],
      warnings: ['Timetable is empty. No sessions to evaluate.'],
      recommendations: ['Generate a timetable using the AI Planner to evaluate performance.'],
      evaluatedAt: new Date(),
    };
  }

  // Group sessions by date
  const dateHoursMap = {};
  const subjectHoursMap = {};
  const subjectActivitiesMap = {};
  const activityHoursMap = {
    Learning: 0,
    Revision: 0,
    Practice: 0,
    'Self-assessment': 0,
  };

  subjects.forEach((s) => {
    subjectHoursMap[s.name] = 0;
    subjectActivitiesMap[s.name] = new Set();
  });

  sessions.forEach((sess) => {
    const d = sess.date;
    const dur = Number(sess.duration) || 0;
    dateHoursMap[d] = (dateHoursMap[d] || 0) + dur;

    if (sess.subject) {
      subjectHoursMap[sess.subject] = (subjectHoursMap[sess.subject] || 0) + dur;
      if (subjectActivitiesMap[sess.subject]) {
        subjectActivitiesMap[sess.subject].add(sess.activityType);
      }
    }

    if (activityHoursMap[sess.activityType] !== undefined) {
      activityHoursMap[sess.activityType] += dur;
    }
  });

  const scheduledDates = Object.keys(dateHoursMap);
  const totalDays = scheduledDates.length;
  const totalHours = Object.values(dateHoursMap).reduce((a, b) => a + b, 0);

  // 1. FEASIBILITY EVALUATION
  let daysExceeding = 0;
  let maxExcess = 0;
  scheduledDates.forEach((d) => {
    const dailySum = dateHoursMap[d];
    if (dailySum > availableHoursPerDay) {
      daysExceeding++;
      const excess = dailySum - availableHoursPerDay;
      if (excess > maxExcess) maxExcess = excess;
    }
  });

  let feasibilityScore = 100;
  if (daysExceeding > 0) {
    const penalty = (daysExceeding / totalDays) * 40 + Math.min(40, maxExcess * 15);
    feasibilityScore = Math.max(0, Math.round(100 - penalty));
    warnings.push(`${daysExceeding} day(s) exceed the maximum daily limit of ${availableHoursPerDay}h (max excess: +${maxExcess.toFixed(1)}h).`);
  }

  metrics.push({
    rule: 'FEASIBILITY',
    name: 'Schedule Feasibility & Workload Cap',
    score: feasibilityScore,
    status: feasibilityScore >= 90 ? 'PASS' : feasibilityScore >= 70 ? 'WARNING' : 'FAIL',
    details: `${totalDays - daysExceeding}/${totalDays} days strictly within ${availableHoursPerDay}h daily capacity.`,
    mathExplanation: `Formula: 100 - ((violations=${daysExceeding} / days=${totalDays}) * 40 + min(40, maxExcess=${maxExcess.toFixed(1)} * 15)) = ${feasibilityScore}%`,
  });

  // 2. COMPLETENESS EVALUATION
  const requestedSubjectNames = subjects.map((s) => s.name);
  const coveredSubjects = requestedSubjectNames.filter((name) => (subjectHoursMap[name] || 0) > 0);
  const subjectCoverageRatio = requestedSubjectNames.length > 0 
    ? coveredSubjects.length / requestedSubjectNames.length 
    : 1;

  const uniqueActivitiesPresent = Object.keys(activityHoursMap).filter((k) => activityHoursMap[k] > 0).length;
  const activityDiversityRatio = uniqueActivitiesPresent / 4;

  const completenessScore = Math.round(subjectCoverageRatio * 60 + activityDiversityRatio * 40);
  if (coveredSubjects.length < requestedSubjectNames.length) {
    const missing = requestedSubjectNames.filter((n) => !coveredSubjects.includes(n));
    warnings.push(`Missing coverage for ${missing.length} subject(s): ${missing.join(', ')}.`);
  }

  metrics.push({
    rule: 'COMPLETENESS',
    name: 'Curriculum & Activity Completeness',
    score: completenessScore,
    status: completenessScore >= 85 ? 'PASS' : completenessScore >= 65 ? 'WARNING' : 'FAIL',
    details: `${coveredSubjects.length}/${requestedSubjectNames.length} subjects covered; ${uniqueActivitiesPresent}/4 pedagogical activity types included.`,
    mathExplanation: `Formula: (${coveredSubjects.length}/${requestedSubjectNames.length} * 60) + (${uniqueActivitiesPresent}/4 * 40) = ${completenessScore}%`,
  });

  // 3. CONSISTENCY EVALUATION
  let sessionsInRange = 0;
  let sessionsWithValidDayName = 0;
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  sessions.forEach((s) => {
    if (s.date >= planningStartDate && s.date <= planningEndDate) {
      sessionsInRange++;
    }
    const dObj = new Date(s.date + 'T00:00:00');
    if (!isNaN(dObj.getTime())) {
      const expectedDay = dayNames[dObj.getDay()];
      if (s.day && s.day.toLowerCase() === expectedDay.toLowerCase()) {
        sessionsWithValidDayName++;
      }
    }
  });

  const rangeRatio = totalSessions > 0 ? sessionsInRange / totalSessions : 1;
  const dayRatio = totalSessions > 0 ? sessionsWithValidDayName / totalSessions : 1;
  const consistencyScore = Math.round(rangeRatio * 70 + dayRatio * 30);

  if (rangeRatio < 1) {
    warnings.push(`${totalSessions - sessionsInRange} session(s) fall outside planning window (${planningStartDate} to ${planningEndDate}).`);
  }

  metrics.push({
    rule: 'CONSISTENCY',
    name: 'Temporal Consistency & Date Integrity',
    score: consistencyScore,
    status: consistencyScore >= 90 ? 'PASS' : consistencyScore >= 70 ? 'WARNING' : 'FAIL',
    details: `${sessionsInRange}/${totalSessions} sessions within date window; ${sessionsWithValidDayName}/${totalSessions} day labels perfectly synchronized.`,
    mathExplanation: `Formula: (${sessionsInRange}/${totalSessions} * 70) + (${sessionsWithValidDayName}/${totalSessions} * 30) = ${consistencyScore}%`,
  });

  // 4. STUDY-HOUR CONSTRAINT SATISFACTION
  const compliantDays = scheduledDates.filter((d) => dateHoursMap[d] <= availableHoursPerDay).length;
  const hourSatisfactionScore = totalDays > 0 ? Math.round((compliantDays / totalDays) * 100) : 100;

  metrics.push({
    rule: 'HOUR_SATISFACTION',
    name: 'Study-Hour Constraint Satisfaction',
    score: hourSatisfactionScore,
    status: hourSatisfactionScore >= 95 ? 'PASS' : hourSatisfactionScore >= 75 ? 'WARNING' : 'FAIL',
    details: `${compliantDays}/${totalDays} days strictly meet the maximum ${availableHoursPerDay}h threshold.`,
    mathExplanation: `Formula: (${compliantDays} compliant days / ${totalDays} total scheduled days) * 100 = ${hourSatisfactionScore}%`,
  });

  // 5. EXAMINATION DATE COMPLIANCE
  const examMap = {};
  examDates.forEach((e) => {
    if (e.subject && e.examDate) {
      examMap[e.subject] = e.examDate;
    }
  });

  let examCompliantSessions = 0;
  let postExamViolations = 0;
  const violatedSubjects = new Set();

  sessions.forEach((s) => {
    const examDate = examMap[s.subject];
    if (examDate) {
      // Must strictly be before exam date (or on exam date before exam time; constraint says never after exam)
      if (s.date >= examDate) {
        postExamViolations++;
        violatedSubjects.add(s.subject);
      } else {
        examCompliantSessions++;
      }
    } else {
      examCompliantSessions++;
    }
  });

  const examComplianceScore = totalSessions > 0 
    ? Math.round((examCompliantSessions / totalSessions) * 100) 
    : 100;

  if (postExamViolations > 0) {
    warnings.push(`${postExamViolations} session(s) scheduled on or after examination date for: ${Array.from(violatedSubjects).join(', ')}.`);
  }

  metrics.push({
    rule: 'EXAM_COMPLIANCE',
    name: 'Examination Deadline Compliance',
    score: examComplianceScore,
    status: examComplianceScore === 100 ? 'PASS' : examComplianceScore >= 80 ? 'WARNING' : 'FAIL',
    details: `${examCompliantSessions}/${totalSessions} sessions scheduled strictly prior to examination dates.`,
    mathExplanation: `Formula: (${examCompliantSessions} compliant / ${totalSessions} sessions) * 100 = ${examComplianceScore}%`,
  });

  // 6. REVISION COVERAGE
  const subjectsWithRevision = requestedSubjectNames.filter((subj) => {
    const acts = subjectActivitiesMap[subj];
    return acts && acts.has('Revision');
  }).length;

  const revisionRatioSubjects = requestedSubjectNames.length > 0 
    ? subjectsWithRevision / requestedSubjectNames.length 
    : 1;
  const revisionHourRatio = totalHours > 0 ? activityHoursMap.Revision / totalHours : 0;
  // Ideal revision ratio is 20-35%
  const revisionHourScore = Math.min(40, Math.round((revisionHourRatio / 0.25) * 40));
  const revisionCoverageScore = Math.min(100, Math.round(revisionRatioSubjects * 60 + revisionHourScore));

  metrics.push({
    rule: 'REVISION_COVERAGE',
    name: 'Spaced Revision Allocation',
    score: revisionCoverageScore,
    status: revisionCoverageScore >= 80 ? 'PASS' : revisionCoverageScore >= 60 ? 'WARNING' : 'FAIL',
    details: `${subjectsWithRevision}/${requestedSubjectNames.length} subjects have structured revision (${(revisionHourRatio * 100).toFixed(1)}% of total study time).`,
    mathExplanation: `Formula: (${subjectsWithRevision}/${requestedSubjectNames.length} * 60) + min(40, (${(revisionHourRatio).toFixed(2)}/0.25 * 40)) = ${revisionCoverageScore}%`,
  });

  // 7. PRACTICE & ASSESSMENT COVERAGE
  const subjectsWithPractice = requestedSubjectNames.filter((subj) => {
    const acts = subjectActivitiesMap[subj];
    return acts && (acts.has('Practice') || acts.has('Self-assessment'));
  }).length;

  const practiceRatioSubjects = requestedSubjectNames.length > 0 
    ? subjectsWithPractice / requestedSubjectNames.length 
    : 1;
  const practiceHoursTotal = activityHoursMap.Practice + activityHoursMap['Self-assessment'];
  const practiceHourRatio = totalHours > 0 ? practiceHoursTotal / totalHours : 0;
  // Ideal practice ratio is 15-30%
  const practiceHourScore = Math.min(40, Math.round((practiceHourRatio / 0.20) * 40));
  const practiceCoverageScore = Math.min(100, Math.round(practiceRatioSubjects * 60 + practiceHourScore));

  metrics.push({
    rule: 'PRACTICE_COVERAGE',
    name: 'Active Practice & Mock Assessment Coverage',
    score: practiceCoverageScore,
    status: practiceCoverageScore >= 80 ? 'PASS' : practiceCoverageScore >= 60 ? 'WARNING' : 'FAIL',
    details: `${subjectsWithPractice}/${requestedSubjectNames.length} subjects feature practice questions or self-assessment (${(practiceHourRatio * 100).toFixed(1)}% of total study time).`,
    mathExplanation: `Formula: (${subjectsWithPractice}/${requestedSubjectNames.length} * 60) + min(40, (${practiceHourRatio.toFixed(2)}/0.20 * 40)) = ${practiceCoverageScore}%`,
  });

  // 8. WEAK SUBJECT PRIORITIZATION
  let weakSubjectPrioritizationScore = 100;
  if (weakSubjects && weakSubjects.length > 0) {
    const weakHours = weakSubjects.map((w) => subjectHoursMap[w] || 0);
    const avgWeakHours = weakHours.reduce((a, b) => a + b, 0) / weakSubjects.length;

    const normalSubjects = requestedSubjectNames.filter((s) => !weakSubjects.includes(s));
    const normalHours = normalSubjects.map((n) => subjectHoursMap[n] || 0);
    const avgNormalHours = normalSubjects.length > 0 
      ? normalHours.reduce((a, b) => a + b, 0) / normalSubjects.length 
      : avgWeakHours;

    const priorityRatio = avgNormalHours > 0 ? avgWeakHours / avgNormalHours : 1.5;
    // Target ratio: weak subject should have >= 1.25x the average hours
    weakSubjectPrioritizationScore = Math.min(100, Math.max(30, Math.round((priorityRatio / 1.25) * 100)));

    metrics.push({
      rule: 'WEAK_PRIORITIZATION',
      name: 'Weak Subject Preferential Allocation',
      score: weakSubjectPrioritizationScore,
      status: weakSubjectPrioritizationScore >= 90 ? 'PASS' : weakSubjectPrioritizationScore >= 70 ? 'WARNING' : 'FAIL',
      details: `Weak subject average: ${avgWeakHours.toFixed(1)}h vs Standard subject average: ${avgNormalHours.toFixed(1)}h (Ratio: ${priorityRatio.toFixed(2)}x vs target 1.25x).`,
      mathExplanation: `Formula: min(100, (Ratio ${priorityRatio.toFixed(2)} / 1.25) * 100) = ${weakSubjectPrioritizationScore}%`,
    });

    if (priorityRatio < 1.1) {
      warnings.push(`Weak subject(s) [${weakSubjects.join(', ')}] received only ${priorityRatio.toFixed(2)}x time allocation relative to standard subjects.`);
    }
  } else {
    metrics.push({
      rule: 'WEAK_PRIORITIZATION',
      name: 'Weak Subject Preferential Allocation',
      score: 100,
      status: 'PASS',
      details: 'No weak subjects specified. Uniform balanced scheduling applied.',
      mathExplanation: 'Baseline 100% applied due to empty weak subject list.',
    });
  }

  // OVERALL WEIGHTED SCORE CALCULATION
  const weights = {
    feasibility: 0.20,
    examCompliance: 0.20,
    hourSatisfaction: 0.15,
    weakPrioritization: 0.15,
    completeness: 0.10,
    consistency: 0.10,
    revisionCoverage: 0.05,
    practiceCoverage: 0.05,
  };

  const overallScore = Math.round(
    feasibilityScore * weights.feasibility +
    examComplianceScore * weights.examCompliance +
    hourSatisfactionScore * weights.hourSatisfaction +
    weakSubjectPrioritizationScore * weights.weakPrioritization +
    completenessScore * weights.completeness +
    consistencyScore * weights.consistency +
    revisionCoverageScore * weights.revisionCoverage +
    practiceCoverageScore * weights.practiceCoverage
  );

  // Recommendations based on metrics
  if (feasibilityScore < 85) {
    recommendations.push('Reduce daily study scope or extend planning end date to alleviate overburdened days.');
  }
  if (examComplianceScore < 100) {
    recommendations.push('Shift sessions scheduled on/after examination dates to earlier calendar days.');
  }
  if (revisionCoverageScore < 75) {
    recommendations.push('Incorporate additional spaced revision blocks 2-3 days before each respective examination.');
  }
  if (practiceCoverageScore < 75) {
    recommendations.push('Add timed past paper solving and active recall quizzes to consolidate weak concepts.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Timetable exhibits optimal pedagogical distribution and strictly satisfies all scheduling constraints.');
  }

  return {
    overallScore,
    feasibilityScore,
    completenessScore,
    consistencyScore,
    hourSatisfactionScore,
    examComplianceScore,
    revisionCoverageScore,
    practiceCoverageScore,
    weakSubjectPrioritizationScore,
    metrics,
    warnings,
    recommendations,
    evaluatedAt: new Date(),
  };
};

module.exports = {
  evaluateStudyPlan,
};
