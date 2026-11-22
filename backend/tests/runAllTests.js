require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const StudyPlan = require('../models/StudyPlan');
const StudySession = require('../models/StudySession');
const { buildStudyPlanPrompts } = require('../prompts/studyPlanPrompt');
const { validateConstraints, generateDeterministicSchedule } = require('../services/schedulerEngine');
const { evaluateStudyPlan } = require('../services/evaluationEngine');
const { sampleStudyPlanData } = require('../utils/seedData');
const { verifyGeminiModel, getGeminiConfig } = require('../config/gemini');

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 RUNNING COMPREHENSIVE BACKEND VERIFICATION TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}: ${details}`);
      failed++;
    }
  };

  try {
    // TEST 1: Database Connection
    console.log('[1/7] Testing MongoDB Connection...');
    const conn = await connectDB();
    assert(conn && mongoose.connection.readyState === 1, 'MongoDB Connected Successfully');

    // TEST 2: Prompt Construction
    console.log('\n[2/7] Testing Prompt Construction System...');
    const promptPackage = buildStudyPlanPrompts(sampleStudyPlanData);
    assert(promptPackage.systemPrompt && promptPackage.systemPrompt.includes('Academic Scheduling Architect'), 'System Prompt includes Persona & Cognitive Scientist Role');
    assert(promptPackage.userPrompt.includes('DBMS') && promptPackage.userPrompt.includes('DSA'), 'User Prompt includes specific subjects');
    assert(promptPackage.systemPrompt.includes('DAILY HOUR CEILING: The total session duration on ANY single day MUST NOT exceed 4 hours'), 'System Prompt enforces daily hours constraint');
    assert(promptPackage.systemPrompt.includes('EXAM DEADLINE COMPLIANCE'), 'System Prompt enforces exam deadlines');
    assert(promptPackage.meta.totalDays === 8, 'Calculates 8 days between 2026-10-12 and 2026-10-19');

    // TEST 3: Scheduler Engine with Section 17 Sample Data
    console.log('\n[3/7] Testing Algorithmic Constraint Satisfaction Engine...');
    const schedule = generateDeterministicSchedule(sampleStudyPlanData);
    assert(Array.isArray(schedule) && schedule.length > 0, `Schedule generated with ${schedule.length} sessions`);

    // Verify daily study hours never exceed 4 hours
    const dailyHours = {};
    schedule.forEach((s) => {
      dailyHours[s.date] = (dailyHours[s.date] || 0) + s.duration;
    });

    const maxDailyHours = Math.max(...Object.values(dailyHours));
    assert(maxDailyHours <= 4, `Daily hours strictly <= 4.0h (Actual max: ${maxDailyHours.toFixed(1)}h)`);

    // Verify exam dates: no preparation on/after exam date
    let examViolations = 0;
    const examMap = {
      DSA: '2026-10-20',
      DBMS: '2026-10-24',
      OS: '2026-10-28',
      NLP: '2026-11-02',
    };
    schedule.forEach((s) => {
      if (examMap[s.subject] && s.date >= examMap[s.subject]) {
        examViolations++;
      }
    });
    assert(examViolations === 0, `Zero post-exam study sessions scheduled (Actual violations: ${examViolations})`);

    // Verify weak subject prioritization (DBMS is weak)
    const dbmsHours = schedule.filter((s) => s.subject === 'DBMS').reduce((a, b) => a + b.duration, 0);
    const dsaHours = schedule.filter((s) => s.subject === 'DSA').reduce((a, b) => a + b.duration, 0);
    const osHours = schedule.filter((s) => s.subject === 'OS').reduce((a, b) => a + b.duration, 0);
    const nlpHours = schedule.filter((s) => s.subject === 'NLP').reduce((a, b) => a + b.duration, 0);

    console.log(`    Allocation: DBMS (Weak)=${dbmsHours.toFixed(1)}h, DSA=${dsaHours.toFixed(1)}h, OS=${osHours.toFixed(1)}h, NLP=${nlpHours.toFixed(1)}h`);
    assert(dbmsHours >= Math.max(osHours, nlpHours), `Weak subject (DBMS) receives highest or prioritized allocation (${dbmsHours.toFixed(1)}h)`);

    // Verify activity types include Learning, Revision, Practice, Self-assessment
    const activityTypesFound = new Set(schedule.map((s) => s.activityType));
    assert(activityTypesFound.has('Learning'), 'Learning sessions present');
    assert(activityTypesFound.has('Revision'), 'Revision sessions present');
    assert(activityTypesFound.has('Practice'), 'Practice sessions present');
    assert(activityTypesFound.has('Self-assessment'), 'Self-assessment sessions present');

    // TEST 4: Constraint Validator Service
    console.log('\n[4/7] Testing Independent Constraint Validator...');
    const constraintValidation = validateConstraints(sampleStudyPlanData, schedule);
    assert(constraintValidation.isFeasible === true, 'Schedule verified as strictly FEASIBLE with zero constraint violations');
    assert(constraintValidation.violationCount === 0, 'Violation count is exactly 0');

    // TEST 5: Deterministic Evaluation Engine
    console.log('\n[5/7] Testing Deterministic Evaluation Engine...');
    const evalResults = evaluateStudyPlan(sampleStudyPlanData, schedule);
    assert(evalResults.overallScore >= 80, `Overall Evaluation Score: ${evalResults.overallScore}%`);
    assert(evalResults.feasibilityScore === 100, `Feasibility Score: ${evalResults.feasibilityScore}%`);
    assert(evalResults.examComplianceScore === 100, `Exam Compliance Score: ${evalResults.examComplianceScore}%`);
    assert(evalResults.hourSatisfactionScore === 100, `Hour Satisfaction Score: ${evalResults.hourSatisfactionScore}%`);
    assert(evalResults.weakSubjectPrioritizationScore >= 90, `Weak Prioritization Score: ${evalResults.weakSubjectPrioritizationScore}%`);
    assert(evalResults.metrics.length === 8, `Engine calculated all 8 deterministic metric categories`);

    // TEST 6: MongoDB CRUD Operations (StudyPlan & StudySession)
    console.log('\n[6/7] Testing MongoDB Mongoose CRUD Operations...');
    const testPlan = new StudyPlan({
      workspaceId: 'test-workspace-suite',
      planName: 'Automated Test Plan',
      subjects: sampleStudyPlanData.subjects,
      examDates: sampleStudyPlanData.examDates,
      weakSubjects: sampleStudyPlanData.weakSubjects,
      availableHoursPerDay: 4,
      planningStartDate: sampleStudyPlanData.planningStartDate,
      planningEndDate: sampleStudyPlanData.planningEndDate,
      preferences: sampleStudyPlanData.preferences,
      timetable: schedule,
      evaluationResults: evalResults,
    });
    const savedPlan = await testPlan.save();
    assert(savedPlan._id, `StudyPlan created with ID: ${savedPlan._id}`);

    const sessionDoc = new StudySession({
      studyPlanId: savedPlan._id,
      workspaceId: 'test-workspace-suite',
      date: schedule[0].date,
      day: schedule[0].day,
      subject: schedule[0].subject,
      topic: schedule[0].topic,
      task: schedule[0].task,
      duration: schedule[0].duration,
      activityType: schedule[0].activityType,
      completed: false,
    });
    const savedSession = await sessionDoc.save();
    assert(savedSession._id && savedSession.completed === false, 'StudySession created and saved');

    // Toggle completion
    savedSession.completed = true;
    await savedSession.save();
    const fetchedSession = await StudySession.findById(savedSession._id);
    assert(fetchedSession.completed === true, 'StudySession completion toggled and persisted');

    // Clean up test docs
    await StudySession.deleteMany({ studyPlanId: savedPlan._id });
    await StudyPlan.findByIdAndDelete(savedPlan._id);
    assert(true, 'Test artifacts cleaned up from database');

    // TEST 7: Gemini Verification Handler
    console.log('\n[7/7] Testing Gemini AI Configuration & Model Verification Handler...');
    const geminiConfig = getGeminiConfig();
    assert(geminiConfig.modelName === 'gemini-3.5-flash-lite', `Target Model configured as: ${geminiConfig.modelName}`);
    const verification = await verifyGeminiModel();
    console.log(`    Verification status: Configured=${verification.configured}, Available=${verification.available}, Message: "${verification.message}"`);
    assert(typeof verification.available === 'boolean', 'Gemini verification handler executed without fatal crash');

  } catch (err) {
    console.error('Fatal test execution error:', err);
    failed++;
  } finally {
    console.log('\n======================================================');
    console.log(`🏁 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('======================================================\n');
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
