require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB, getDBStatus } = require('./config/db');
const { getGeminiConfig, verifyGeminiModel } = require('./config/gemini');
const errorHandler = require('./middleware/errorHandler');
const { sampleStudyPlanData } = require('./utils/seedData');

// Import routes
const studyPlanRoutes = require('./routes/studyPlanRoutes');
const studySessionRoutes = require('./routes/studySessionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow frontend development requests
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Mount API routes
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/sessions', studySessionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/evaluation', evaluationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health & Diagnostic API
app.get('/api/health', async (req, res) => {
  const dbStatus = getDBStatus();
  const geminiConfig = getGeminiConfig();

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    gemini: {
      configured: geminiConfig.isConfigured,
      model: geminiConfig.modelName,
    },
    version: '1.0.0',
    app: 'AI-Powered Personalized Study Plan Generator',
  });
});

// Sample Test Data API for instant loading
app.get('/api/sample-data', (req, res) => {
  res.status(200).json({
    success: true,
    data: sampleStudyPlanData,
  });
});

// Root welcome endpoint
app.get('/', (req, res) => {
  res.json({
    title: 'AI-Powered Personalized Study Plan Generator API',
    status: 'Active',
    endpoints: [
      '/api/health',
      '/api/sample-data',
      '/api/study-plans',
      '/api/study-plans/generate',
      '/api/sessions',
      '/api/ai/status',
      '/api/ai/generate',
      '/api/evaluation/:planId',
      '/api/dashboard/stats',
    ],
  });
});

// Centralized error handler
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Study Plan Generator Backend running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🤖 Target Gemini Model: ${process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
