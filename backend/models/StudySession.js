const mongoose = require('mongoose');

const StudySessionSchema = new mongoose.Schema({
  studyPlanId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StudyPlan', 
    required: true, 
    index: true 
  },
  workspaceId: {
    type: String,
    required: true,
    index: true,
    default: 'default-student-workspace'
  },
  date: { 
    type: String, 
    required: true,
    index: true // Format: YYYY-MM-DD
  },
  day: {
    type: String,
    required: true // Monday, Tuesday, etc.
  },
  subject: { 
    type: String, 
    required: true, 
    trim: true,
    index: true 
  },
  topic: { 
    type: String, 
    required: true, 
    trim: true 
  },
  task: { 
    type: String, 
    required: true, 
    trim: true 
  },
  duration: { 
    type: Number, 
    required: true, 
    min: 0.25, 
    max: 12 
  }, // in hours (e.g. 1.0, 1.5)
  activityType: { 
    type: String, 
    enum: ['Learning', 'Revision', 'Practice', 'Self-assessment'], 
    required: true,
    index: true 
  },
  completed: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  completedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
});

// Composite index for querying sessions by plan and date
StudySessionSchema.index({ studyPlanId: 1, date: 1 });
StudySessionSchema.index({ workspaceId: 1, completed: 1 });

module.exports = mongoose.model('StudySession', StudySessionSchema);
