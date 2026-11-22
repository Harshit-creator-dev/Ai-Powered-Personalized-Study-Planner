const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    default: 'Medium' 
  },
  topics: [{ type: String, trim: true }],
}, { _id: false });

const ExamDateSchema = new mongoose.Schema({
  subject: { type: String, required: true, trim: true },
  examDate: { type: String, required: true }, // Format: YYYY-MM-DD
}, { _id: false });

const PreferenceSchema = new mongoose.Schema({
  preferredSessionDuration: { type: Number, default: 60 }, // in minutes (30, 45, 60, 90, 120)
  studyTimeOfDay: { type: String, enum: ['Morning', 'Afternoon', 'Evening', 'Flexible'], default: 'Flexible' },
  techniques: [{ type: String }], // e.g., 'Pomodoro', 'Active Recall', 'Spaced Repetition'
  revisionIntensity: { type: String, enum: ['Standard', 'High', 'Intensive'], default: 'Standard' },
  practiceRequirement: { type: Boolean, default: true },
  revisionRequirement: { type: Boolean, default: true },
}, { _id: false });

const EvaluationMetricSchema = new mongoose.Schema({
  rule: { type: String, required: true },
  name: { type: String, required: true },
  score: { type: Number, required: true }, // 0 to 100
  status: { type: String, enum: ['PASS', 'WARNING', 'FAIL'], default: 'PASS' },
  details: { type: String, default: '' },
  mathExplanation: { type: String, default: '' },
}, { _id: false });

const EvaluationResultsSchema = new mongoose.Schema({
  overallScore: { type: Number, default: 0 },
  feasibilityScore: { type: Number, default: 0 },
  completenessScore: { type: Number, default: 0 },
  consistencyScore: { type: Number, default: 0 },
  hourSatisfactionScore: { type: Number, default: 0 },
  examComplianceScore: { type: Number, default: 0 },
  revisionCoverageScore: { type: Number, default: 0 },
  practiceCoverageScore: { type: Number, default: 0 },
  weakSubjectPrioritizationScore: { type: Number, default: 0 },
  metrics: [EvaluationMetricSchema],
  warnings: [{ type: String }],
  recommendations: [{ type: String }],
  evaluatedAt: { type: Date, default: Date.now },
}, { _id: false });

const GeneratedPromptSchema = new mongoose.Schema({
  systemPrompt: { type: String, default: '' },
  userPrompt: { type: String, default: '' },
  fullPrompt: { type: String, default: '' },
  modelUsed: { type: String, default: 'gemini-3.5-flash-lite' },
  rawResponseText: { type: String, default: '' },
  promptTokensEstimate: { type: Number, default: 0 },
  responseTokensEstimate: { type: Number, default: 0 },
  latencyMs: { type: Number, default: 0 },
  generatedAt: { type: Date, default: Date.now },
}, { _id: false });

const TimetableItemSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  day: { type: String, required: true }, // Monday, Tuesday, etc.
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  task: { type: String, required: true },
  duration: { type: Number, required: true }, // in hours (e.g. 1.0, 1.5)
  activityType: { 
    type: String, 
    enum: ['Learning', 'Revision', 'Practice', 'Self-assessment'], 
    required: true 
  },
  completed: { type: Boolean, default: false },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudySession' }
}, { _id: true });

const StudyPlanSchema = new mongoose.Schema({
  workspaceId: { 
    type: String, 
    required: true, 
    index: true,
    trim: true,
    default: 'default-student-workspace'
  },
  planName: { 
    type: String, 
    required: true, 
    trim: true,
    default: 'Personalized Exam Study Plan'
  },
  subjects: [SubjectSchema],
  examDates: [ExamDateSchema],
  weakSubjects: [{ type: String, trim: true }],
  availableHoursPerDay: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 16,
    default: 4 
  },
  planningStartDate: { 
    type: String, 
    required: true // YYYY-MM-DD
  },
  planningEndDate: { 
    type: String, 
    required: true // YYYY-MM-DD
  },
  preferences: { 
    type: PreferenceSchema, 
    default: () => ({}) 
  },
  timetable: [TimetableItemSchema],
  evaluationResults: { 
    type: EvaluationResultsSchema, 
    default: () => ({}) 
  },
  generatedPrompt: { 
    type: GeneratedPromptSchema, 
    default: () => ({}) 
  },
}, {
  timestamps: true,
});

// Indexes for fast querying
StudyPlanSchema.index({ workspaceId: 1, createdAt: -1 });
StudyPlanSchema.index({ planningStartDate: 1, planningEndDate: 1 });

module.exports = mongoose.model('StudyPlan', StudyPlanSchema);
