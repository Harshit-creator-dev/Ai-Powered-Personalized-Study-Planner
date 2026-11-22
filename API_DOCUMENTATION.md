# REST API DOCUMENTATION

This document provides complete technical specifications for all Express.js REST API endpoints available in the **AI-Powered Personalized Study Plan Generator**.

Base URL: `http://localhost:5000/api`

---

## 1. Study Plan APIs

### 1.1 Generate AI Study Plan
Generates a new study timetable using Gemini 3.5 Flash Lite prompt engineering (or algorithmic constraint engine), evaluates its constraints, saves it in MongoDB, and creates linked sessions.

- **Method:** `POST`
- **Endpoint:** `/study-plans/generate`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "workspaceId": "default-student-workspace",
  "planName": "University Semester Finals Preparation Plan",
  "planningStartDate": "2026-10-12",
  "planningEndDate": "2026-10-19",
  "availableHoursPerDay": 4,
  "weakSubjects": ["DBMS"],
  "subjects": [
    {
      "name": "DSA",
      "difficulty": "Hard",
      "topics": ["Dynamic Programming", "Graph Theory", "Trees & Heaps"]
    },
    {
      "name": "DBMS",
      "difficulty": "Hard",
      "topics": ["Normalization", "Transactions", "Concurrency"]
    },
    {
      "name": "OS",
      "difficulty": "Medium",
      "topics": ["Process Scheduling", "Semaphores", "Virtual Memory"]
    },
    {
      "name": "NLP",
      "difficulty": "Medium",
      "topics": ["Tokenization", "Language Models", "Transformers"]
    }
  ],
  "examDates": [
    { "subject": "DSA", "examDate": "2026-10-20" },
    { "subject": "DBMS", "examDate": "2026-10-24" },
    { "subject": "OS", "examDate": "2026-10-28" },
    { "subject": "NLP", "examDate": "2026-11-02" }
  ],
  "preferences": {
    "preferredSessionDuration": 60,
    "studyTimeOfDay": "Flexible",
    "techniques": ["Active Recall", "Spaced Repetition"],
    "revisionIntensity": "High",
    "practiceRequirement": true,
    "revisionRequirement": true
  },
  "allowFallbackOnFailure": true
}
```

- **Success Response:** `201 Created`
```json
{
  "success": true,
  "message": "Study plan generated and saved successfully.",
  "source": "GEMINI_AI",
  "data": {
    "_id": "6b02d3844f4097d417965c83",
    "workspaceId": "default-student-workspace",
    "planName": "University Semester Finals Preparation Plan",
    "availableHoursPerDay": 4,
    "planningStartDate": "2026-10-12",
    "planningEndDate": "2026-10-19",
    "subjects": [...],
    "examDates": [...],
    "weakSubjects": ["DBMS"],
    "timetable": [
      {
        "_id": "6b02d3854f4097d417965ca5",
        "date": "2026-10-12",
        "day": "Monday",
        "subject": "DBMS",
        "topic": "Normalization & Normal Forms",
        "task": "Study and master fundamentals and practice 1NF, 2NF, 3NF exercises.",
        "duration": 1,
        "activityType": "Learning",
        "completed": false,
        "sessionId": "6b02d3854f4097d417965ca5"
      }
    ],
    "evaluationResults": {
      "overallScore": 100,
      "feasibilityScore": 100,
      "completenessScore": 100,
      "consistencyScore": 100,
      "hourSatisfactionScore": 100,
      "examComplianceScore": 100,
      "revisionCoverageScore": 100,
      "practiceCoverageScore": 100,
      "weakSubjectPrioritizationScore": 100,
      "metrics": [...]
    },
    "generatedPrompt": {
      "modelUsed": "gemini-3.5-flash-lite",
      "latencyMs": 1420
    }
  },
  "validation": {
    "isFeasible": true,
    "violationCount": 0,
    "violations": []
  }
}
```

- **Error Responses:**
  - `400 Bad Request`: Input validation failure (missing subjects or invalid date range).
  - `502 Bad Gateway`: Gemini API network failure or model authentication rejection.

---

### 1.2 Get All Study Plans
Returns all study plans created under a specific student workspace.

- **Method:** `GET`
- **Endpoint:** `/study-plans?workspaceId=default-student-workspace`
- **Success Response:** `200 OK`
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "6b02d3844f4097d417965c83",
      "planName": "University Semester Finals Preparation Plan",
      "workspaceId": "default-student-workspace",
      "availableHoursPerDay": 4,
      "planningStartDate": "2026-10-12",
      "planningEndDate": "2026-10-19",
      "subjects": [...],
      "evaluationResults": { "overallScore": 100 },
      "createdAt": "2026-11-22T14:48:00.000Z"
    }
  ]
}
```

---

### 1.3 Get Single Study Plan by ID
Retrieves full details, timetable sessions, prompt telemetry, and evaluation results for a single plan.

- **Method:** `GET`
- **Endpoint:** `/study-plans/:id`
- **Success Response:** `200 OK`
- **Error Response:** `404 Not Found` if ID does not exist.

---

### 1.4 Update Study Plan Metadata
Updates plan title or daily hours.

- **Method:** `PUT`
- **Endpoint:** `/study-plans/:id`
- **Request Body:**
```json
{
  "planName": "Updated Finals Schedule",
  "availableHoursPerDay": 5
}
```
- **Success Response:** `200 OK`

---

### 1.5 Delete Study Plan
Deletes a study plan and cascade-deletes all associated `StudySession` records from MongoDB.

- **Method:** `DELETE`
- **Endpoint:** `/study-plans/:id`
- **Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Study plan and associated sessions deleted."
}
```

---

## 2. Study Session APIs

### 2.1 Get Sessions by Plan ID
Returns all individual session documents for a study plan, sorted by date.

- **Method:** `GET`
- **Endpoint:** `/sessions/:planId`
- **Success Response:** `200 OK`
```json
{
  "success": true,
  "count": 32,
  "data": [
    {
      "_id": "6b02d3854f4097d417965ca5",
      "studyPlanId": "6b02d3844f4097d417965c83",
      "date": "2026-10-12",
      "day": "Monday",
      "subject": "DBMS",
      "topic": "Normalization & Normal Forms",
      "task": "Study and master fundamentals and practice 1NF, 2NF, 3NF exercises.",
      "duration": 1,
      "activityType": "Learning",
      "completed": false
    }
  ]
}
```

---

### 2.2 Toggle Session Completion
Marks a session as completed or pending, updating both the `StudySession` collection and the embedded timetable in `StudyPlan`.

- **Method:** `PATCH`
- **Endpoint:** `/sessions/:id/complete`
- **Request Body:**
```json
{
  "completed": true
}
```
- **Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Session marked as completed.",
  "data": {
    "_id": "6b02d3854f4097d417965ca5",
    "completed": true,
    "completedAt": "2026-11-22T14:50:00.000Z"
  }
}
```

---

### 2.3 Update Study Session
Modifies session parameters (date, topic, task, duration, activityType). Automatically triggers re-evaluation on parent plan.

- **Method:** `PUT`
- **Endpoint:** `/sessions/:id`
- **Request Body:**
```json
{
  "task": "Solve 20 past exam normalization queries",
  "duration": 1.5,
  "activityType": "Practice"
}
```
- **Success Response:** `200 OK`

---

### 2.4 Delete Study Session
Deletes a single session and synchronizes parent plan.

- **Method:** `DELETE`
- **Endpoint:** `/sessions/:id`
- **Success Response:** `200 OK`

---

## 3. AI & Model Verification APIs

### 3.1 AI Status & Model Verification
Inspects whether the Gemini API key is configured and verifies availability of model `gemini-3.5-flash-lite`.

- **Method:** `GET`
- **Endpoint:** `/ai/status`
- **Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "configured": true,
    "modelName": "gemini-3.5-flash-lite",
    "verification": {
      "available": true,
      "configured": true,
      "model": "gemini-3.5-flash-lite",
      "message": "Model gemini-3.5-flash-lite verified and ready."
    },
    "instructions": "Gemini API key is configured. Model verification completed."
  }
}
```

---

### 3.2 Preview AI Prompts
Constructs and previews the exact system and user prompt without invoking the Gemini API.

- **Method:** `POST`
- **Endpoint:** `/ai/preview-prompt`
- **Request Body:** (Same as study plan input)
- **Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "systemPrompt": "You are an elite Academic Scheduling Architect...",
    "userPrompt": "### STUDENT STUDY PLAN SPECIFICATIONS...",
    "fullPrompt": "...",
    "meta": {
      "totalDays": 8,
      "totalAvailableHours": 32,
      "availableHoursPerDay": 4
    }
  }
}
```

---

## 4. Evaluation & Constraint APIs

### 4.1 Re-Evaluate Study Plan
Executes the deterministic evaluation engine on an existing plan and persists updated metrics to MongoDB.

- **Method:** `POST`
- **Endpoint:** `/evaluation/:planId`
- **Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Plan evaluated successfully.",
  "data": {
    "evaluation": {
      "overallScore": 100,
      "feasibilityScore": 100,
      "examComplianceScore": 100,
      "metrics": [...]
    },
    "validation": {
      "isFeasible": true,
      "violationCount": 0
    }
  }
}
```

---

## 5. Dashboard Analytics APIs

### 5.1 Get Aggregated Dashboard Statistics
Aggregates statistics across all plans in a workspace.

- **Method:** `GET`
- **Endpoint:** `/dashboard/stats?workspaceId=default-student-workspace`
- **Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalPlans": 1,
      "totalSessions": 32,
      "completedSessionsCount": 1,
      "totalScheduledHours": 32,
      "completedHours": 1,
      "remainingHours": 31,
      "overallCompletionRate": 3
    },
    "upcomingExams": [
      { "subject": "DSA", "examDate": "2026-10-20", "daysLeft": -33, "isWeak": false },
      { "subject": "DBMS", "examDate": "2026-10-24", "daysLeft": -29, "isWeak": true },
      { "subject": "OS", "examDate": "2026-10-28", "daysLeft": -25, "isWeak": false },
      { "subject": "NLP", "examDate": "2026-11-02", "daysLeft": -20, "isWeak": false }
    ],
    "subjectProgress": [
      { "subject": "DBMS", "totalHours": 12, "completedHours": 1, "remainingHours": 11, "completionRate": 8, "isWeak": true },
      { "subject": "DSA", "totalHours": 8, "completedHours": 0, "remainingHours": 8, "completionRate": 0, "isWeak": false }
    ],
    "activityStats": {
      "Learning": { "total": 16, "completed": 1 },
      "Revision": { "total": 8, "completed": 0 },
      "Practice": { "total": 6, "completed": 0 },
      "Self-assessment": { "total": 2, "completed": 0 }
    },
    "dailyCompletion": [
      { "date": "2026-10-12", "total": 4, "completed": 1 }
    ]
  }
}
```

---

## 6. System Utility APIs

### 6.1 Health & Diagnostics
- **Method:** `GET`
- **Endpoint:** `/health`
- **Success Response:** `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2026-11-22T14:48:00.000Z",
  "uptime": 124.5,
  "database": {
    "state": "connected",
    "isConnected": true,
    "host": "127.0.0.1",
    "name": "study_planner",
    "isMemoryFallback": true
  },
  "gemini": {
    "configured": false,
    "model": "gemini-3.5-flash-lite"
  },
  "version": "1.0.0",
  "app": "AI-Powered Personalized Study Plan Generator"
}
```

### 6.2 Sample Data (Section 17 Dataset)
- **Method:** `GET`
- **Endpoint:** `/sample-data`
- **Success Response:** `200 OK` Returns the pre-configured DSA, DBMS, OS, NLP test dataset.
