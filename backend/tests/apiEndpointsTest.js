require('dotenv').config();
const http = require('http');
const app = require('../server');
const mongoose = require('mongoose');
const { sampleStudyPlanData } = require('../utils/seedData');

const testApiEndpoints = async () => {
  console.log('\n======================================================');
  console.log('🌐 RUNNING FULL REST API INTEGRATION SUITE');
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

  // Start temporary test server
  const server = http.createServer(app);
  const TEST_PORT = 5055;

  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`Test server running on port ${TEST_PORT}\n`);

  const request = async (method, path, body = null) => {
    const url = `http://127.0.0.1:${TEST_PORT}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  };

  try {
    // 1. GET /api/health
    console.log('[1/12] Testing GET /api/health...');
    const healthRes = await request('GET', '/api/health');
    assert(healthRes.status === 200 && healthRes.data.status === 'healthy', 'Health check returns status 200 with healthy state');
    assert(healthRes.data.gemini && healthRes.data.gemini.model === 'gemini-3.5-flash-lite', 'Health check returns target model: gemini-3.5-flash-lite');

    // 2. GET /api/sample-data
    console.log('\n[2/12] Testing GET /api/sample-data...');
    const sampleRes = await request('GET', '/api/sample-data');
    assert(sampleRes.status === 200 && sampleRes.data.success === true, 'Sample data endpoint returns 200');
    assert(sampleRes.data.data.weakSubjects.includes('DBMS'), 'Sample data includes weak subject DBMS');
    assert(sampleRes.data.data.subjects.length === 4, 'Sample data contains 4 subjects: DSA, DBMS, OS, NLP');

    // 3. GET /api/ai/status
    console.log('\n[3/12] Testing GET /api/ai/status...');
    const aiStatusRes = await request('GET', '/api/ai/status');
    assert(aiStatusRes.status === 200 && aiStatusRes.data.success === true, 'AI status endpoint returns 200');
    assert(aiStatusRes.data.data.modelName === 'gemini-3.5-flash-lite', 'AI status confirms model name is gemini-3.5-flash-lite');

    // 4. POST /api/study-plans/generate (Section 17 Sample dataset)
    console.log('\n[4/12] Testing POST /api/study-plans/generate...');
    const generatePayload = {
      ...sampleStudyPlanData,
      workspaceId: 'api-integration-test-suite',
      useAlgorithmicBaseline: true, // test deterministic constraint engine via API
    };
    const genRes = await request('POST', '/api/study-plans/generate', generatePayload);
    assert(genRes.status === 201 && genRes.data.success === true, 'Study plan generated and saved with HTTP 201');
    const createdPlan = genRes.data.data;
    assert(createdPlan._id, `Plan created with MongoDB ObjectId: ${createdPlan._id}`);
    assert(Array.isArray(createdPlan.timetable) && createdPlan.timetable.length === 32, `Timetable created with 32 sessions`);
    assert(createdPlan.evaluationResults.overallScore >= 95, `Evaluation score is ${createdPlan.evaluationResults.overallScore}%`);

    const planId = createdPlan._id;

    // 5. GET /api/study-plans
    console.log('\n[5/12] Testing GET /api/study-plans...');
    const getPlansRes = await request('GET', `/api/study-plans?workspaceId=api-integration-test-suite`);
    assert(getPlansRes.status === 200 && getPlansRes.data.data.length >= 1, `Fetched ${getPlansRes.data.data.length} plans for workspace`);

    // 6. GET /api/study-plans/:id
    console.log('\n[6/12] Testing GET /api/study-plans/:id...');
    const getSingleRes = await request('GET', `/api/study-plans/${planId}`);
    assert(getSingleRes.status === 200 && getSingleRes.data.data.planName === createdPlan.planName, 'Single study plan retrieved successfully');

    // 7. GET /api/sessions/:planId
    console.log('\n[7/12] Testing GET /api/sessions/:planId...');
    const sessionsRes = await request('GET', `/api/sessions/${planId}`);
    assert(sessionsRes.status === 200 && sessionsRes.data.data.length === 32, `Retrieved ${sessionsRes.data.data.length} individual StudySession documents`);
    const firstSession = sessionsRes.data.data[0];

    // 8. PATCH /api/sessions/:id/complete
    console.log('\n[8/12] Testing PATCH /api/sessions/:id/complete...');
    const patchRes = await request('PATCH', `/api/sessions/${firstSession._id}/complete`, { completed: true });
    assert(patchRes.status === 200 && patchRes.data.data.completed === true, 'StudySession marked as completed: true');

    // 9. PUT /api/sessions/:id
    console.log('\n[9/12] Testing PUT /api/sessions/:id...');
    const updateSessionRes = await request('PUT', `/api/sessions/${firstSession._id}`, {
      task: 'Updated via REST API Integration Test',
      duration: 1.5,
    });
    assert(updateSessionRes.status === 200 && updateSessionRes.data.data.duration === 1.5, 'StudySession duration updated to 1.5h');

    // 10. POST /api/evaluation/:planId
    console.log('\n[10/12] Testing POST /api/evaluation/:planId...');
    const reEvalRes = await request('POST', `/api/evaluation/${planId}`);
    assert(reEvalRes.status === 200 && reEvalRes.data.data.evaluation.overallScore > 0, `Re-evaluation executed with score: ${reEvalRes.data.data.evaluation.overallScore}%`);

    // 11. GET /api/dashboard/stats
    console.log('\n[11/12] Testing GET /api/dashboard/stats...');
    const statsRes = await request('GET', `/api/dashboard/stats?workspaceId=api-integration-test-suite`);
    assert(statsRes.status === 200 && statsRes.data.data.summary.totalSessions === 32, `Dashboard stats aggregates 32 total sessions`);
    assert(statsRes.data.data.summary.completedSessionsCount === 1, 'Dashboard stats reflects exactly 1 completed session');
    assert(statsRes.data.data.upcomingExams.length === 4, 'Dashboard stats returns 4 upcoming examination countdowns');

    // 12. DELETE /api/study-plans/:id
    console.log('\n[12/12] Testing DELETE /api/study-plans/:id...');
    const deleteRes = await request('DELETE', `/api/study-plans/${planId}`);
    assert(deleteRes.status === 200 && deleteRes.data.success === true, 'Study plan deleted with cascade session removal');

    const verifyDelete = await request('GET', `/api/study-plans/${planId}`);
    assert(verifyDelete.status === 404, 'Verified plan no longer exists (404 Not Found)');

  } catch (err) {
    console.error('Fatal API test error:', err);
    failed++;
  } finally {
    console.log('\n======================================================');
    console.log(`🏁 API SUITE RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('======================================================\n');
    server.close();
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
};

testApiEndpoints();
