const serverless = require('serverless-http');
const app = require('../../backend/server');
const { connectDB } = require('../../backend/config/db');

let serverlessHandler = null;

exports.handler = async (event, context) => {
  // Prevent function from waiting for idle event loop connections (Mongoose keep-alive)
  context.callbackWaitsForEmptyEventLoop = false;

  // Connect to MongoDB Atlas (reuses existing connection across warm invocations)
  try {
    await connectDB();
  } catch (dbErr) {
    console.error('[Netlify Function] Database connection error:', dbErr);
  }

  // Initialize handler
  if (!serverlessHandler) {
    serverlessHandler = serverless(app);
  }

  // Normalize path: map Netlify Function path to Express /api route
  if (event.path) {
    if (event.path.startsWith('/.netlify/functions/api')) {
      event.path = event.path.replace('/.netlify/functions/api', '/api');
    }
    if (event.path.startsWith('/api/api')) {
      event.path = event.path.replace('/api/api', '/api');
    }
  }

  return await serverlessHandler(event, context);
};
