/**
 * Prompt Engineering Module for AI-Powered Personalized Study Plan Generator
 * 
 * Implements advanced prompt techniques:
 * 1. Persona & Role Framing (Senior Pedagogical Scheduling Expert)
 * 2. Multi-tier Constraint Hierarchy (Hard vs Soft Constraints)
 * 3. Chain-of-Thought (CoT) Structured Reasoning
 * 4. Dynamic Few-Shot Contextual Grounding
 * 5. Strict JSON Schema Specification with No Markdown delimiters
 */

const buildStudyPlanPrompts = (planData) => {
  const {
    planName = 'Personalized Study Plan',
    subjects = [],
    examDates = [],
    weakSubjects = [],
    availableHoursPerDay = 4,
    planningStartDate,
    planningEndDate,
    preferences = {},
  } = planData;

  const {
    preferredSessionDuration = 60,
    studyTimeOfDay = 'Flexible',
    techniques = ['Spaced Repetition', 'Active Recall'],
    revisionIntensity = 'Standard',
    practiceRequirement = true,
    revisionRequirement = true,
  } = preferences;

  // Format subjects and their topics with difficulty levels
  const formattedSubjects = subjects.map((subj, idx) => {
    const isWeak = weakSubjects.includes(subj.name);
    const topicsList = Array.isArray(subj.topics) && subj.topics.length > 0 
      ? subj.topics.join(', ') 
      : 'Comprehensive syllabus coverage';
    const examEntry = examDates.find((e) => e.subject === subj.name);
    const examStr = examEntry ? `Examination Date: ${examEntry.examDate}` : 'Examination Date: Unspecified';

    return `  [Subject ${idx + 1}] ${subj.name}
    - Difficulty: ${subj.difficulty || 'Medium'}
    - Weak Subject Status: ${isWeak ? 'CRITICAL / WEAK SUBJECT (Requires minimum 35% more time and focused revision)' : 'Standard Proficiency'}
    - ${examStr}
    - Topics to Master: ${topicsList}`;
  }).join('\n\n');

  // Format exam deadlines
  const formattedExams = examDates.map((e) => `  * ${e.subject}: ${e.examDate}`).join('\n');

  // Calculate day count between start and end date
  const startD = new Date(planningStartDate);
  const endD = new Date(planningEndDate);
  const totalDays = Math.max(1, Math.round((endD - startD) / (1000 * 60 * 60 * 24)) + 1);
  const totalAvailableHours = totalDays * availableHoursPerDay;

  const systemPrompt = `You are an elite Academic Scheduling Architect and Cognitive Learning Scientist specializing in high-stakes university examination preparation.
Your objective is to generate an optimal, mathematically feasible, personalized study timetable tailored strictly to student constraints.

### SYSTEM RULES & HARD CONSTRAINTS:
1. DAILY HOUR CEILING: The total session duration on ANY single day MUST NOT exceed ${availableHoursPerDay} hours. Never over-schedule a single minute.
2. EXAM DEADLINE COMPLIANCE: NEVER schedule study or revision for a subject on or after its examination date. All preparation for a subject must strictly complete before that subject's exam.
3. PLANNING BOUNDARIES: Timetable sessions MUST occur strictly between ${planningStartDate} and ${planningEndDate} inclusive. No dates before ${planningStartDate} or after ${planningEndDate}.
4. WEAK SUBJECT PRIORITIZATION: Weak subjects (${weakSubjects.length > 0 ? weakSubjects.join(', ') : 'None specified'}) MUST receive preferential allocation (at least 30-40% higher cumulative hours) and additional active revision sessions.
5. PEDAGOGICAL COMPOSITION: Distribute sessions across 4 mandatory activity types:
   - "Learning": Core concept acquisition and topic deep-dives (~45-50% of time)
   - "Revision": Active recall, mind-mapping, summary consolidation (~25-30% of time)
   - "Practice": Problem-solving, past year questions, numericals (~15-20% of time)
   - "Self-assessment": Timed mock tests, self-quizzing (~5-10% of time)
6. SESSION DURATIONS: Preferred session duration is ${preferredSessionDuration} minutes (${(preferredSessionDuration / 60).toFixed(2)} hours). Standard sessions should typically be 1.0, 1.5, or 2.0 hours.
7. FEASIBILITY CHECK: Calculate daily sum of hours explicitly. If the planning duration (${totalDays} days, ${totalAvailableHours} total available hours) is tight for the requested syllabus, prioritize upcoming examinations first, followed by weak subjects.

### OUTPUT FORMAT:
You MUST respond with a VALID, RAW JSON object ONLY.
Do NOT enclose the JSON in markdown code blocks like \`\`\`json. Output pure parseable JSON.`;

  const userPrompt = `### STUDENT STUDY PLAN SPECIFICATIONS

Plan Title: "${planName}"
Planning Window: ${planningStartDate} to ${planningEndDate} (${totalDays} total calendar days)
Daily Study Capacity: ${availableHoursPerDay} hours per day (Total budget: ${totalAvailableHours} hours)
Preferred Single Session Duration: ${preferredSessionDuration} minutes
Preferred Time of Day: ${studyTimeOfDay}
Active Techniques: ${techniques.join(', ')}
Revision Requirement: ${revisionRequirement ? 'MANDATORY' : 'Optional'} (Intensity: ${revisionIntensity})
Practice Requirement: ${practiceRequirement ? 'MANDATORY' : 'Optional'}

### EXAMINATION DATES:
${formattedExams || '  No specific examination dates specified.'}

### DETAILED SUBJECT BREAKDOWN:
${formattedSubjects}

### WEAK SUBJECTS (HIGH PRIORITY):
${weakSubjects.length > 0 ? weakSubjects.join(', ') : 'None identified as weak.'}

### INSTRUCTIONS FOR REASONING & OUTPUT GENERATION:
1. First, verify the calendar from ${planningStartDate} to ${planningEndDate}. Ensure every day has a schedule that does not exceed ${availableHoursPerDay} hours.
2. Ensure subjects with earlier examination dates are completed before their exam day.
3. Ensure weak subjects receive deeper practice and spaced revision.
4. Provide structured JSON adhering exactly to the following schema:

{
  "planSummary": {
    "totalDays": ${totalDays},
    "totalAllocatedHours": <number>,
    "dailyHourBudget": ${availableHoursPerDay},
    "feasibilityAssessment": "<FEASIBLE | TIGHT_BUT_ACHIEVABLE | DEFICIT>",
    "strategyOverview": "<2-3 sentence overview of the prioritization and revision schedule>"
  },
  "subjectBreakdown": [
    {
      "subject": "<Subject Name>",
      "allocatedHours": <number>,
      "percentage": <number>,
      "isWeakSubject": <true|false>,
      "learningHours": <number>,
      "revisionHours": <number>,
      "practiceHours": <number>
    }
  ],
  "timetable": [
    {
      "date": "YYYY-MM-DD",
      "day": "Monday/Tuesday/etc",
      "subject": "<Subject Name>",
      "topic": "<Specific topic>",
      "task": "<Actionable task description, e.g. 'Solve 15 SQL normalization queries'>",
      "duration": <number in hours, e.g. 1.0 or 1.5>,
      "activityType": "<Learning | Revision | Practice | Self-assessment>"
    }
  ],
  "pedagogicalInsights": [
    "<Recommendation 1>",
    "<Recommendation 2>"
  ]
}

Ensure the sum of durations for any specific date in the "timetable" array does not exceed ${availableHoursPerDay} hours.
Generate the complete schedule now in raw JSON.`;

  const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;

  return {
    systemPrompt,
    userPrompt,
    fullPrompt,
    meta: {
      totalDays,
      totalAvailableHours,
      availableHoursPerDay,
      planningStartDate,
      planningEndDate,
      subjectCount: subjects.length,
      weakSubjectCount: weakSubjects.length,
    }
  };
};

module.exports = {
  buildStudyPlanPrompts,
};
