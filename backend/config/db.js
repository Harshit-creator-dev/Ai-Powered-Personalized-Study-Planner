const mongoose = require('mongoose');

let isConnected = false;
let memoryServerInstance = null;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;

  // 1. Try specified MONGODB_URI (e.g. MongoDB Atlas or local MongoDB)
  if (uri && !uri.includes('<username>') && !uri.includes('your_username')) {
    try {
      const sanitized = uri.replace(/\/\/.*@/, '//<credentials>@');
      console.log(`[Database] Connecting to MongoDB at: ${sanitized}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
      console.log('✅ [Database] Successfully connected to MongoDB Atlas / Remote Cluster.');
      return mongoose.connection;
    } catch (err) {
      console.warn(`⚠️ [Database] Connection to MONGODB_URI failed: ${err.message}`);
    }
  }

  // 2. Try mongodb-memory-server fallback if installed
  try {
    const memPkg = 'mongodb-memory-server';
    const { MongoMemoryServer } = require(memPkg);
    console.log('ℹ️ [Database] Initializing in-memory MongoDB fallback...');
    memoryServerInstance = await MongoMemoryServer.create();
    const fallbackUri = memoryServerInstance.getUri();
    await mongoose.connect(fallbackUri);
    isConnected = true;
    console.log(`✅ [Database] Connected to in-memory MongoDB at: ${fallbackUri}`);
    return mongoose.connection;
  } catch (memoryErr) {
    // If mongodb-memory-server is not installed or fails, try standard local MongoDB default
    try {
      console.log('ℹ️ [Database] Trying default local MongoDB at mongodb://127.0.0.1:27017/study_planner ...');
      await mongoose.connect('mongodb://127.0.0.1:27017/study_planner', {
        serverSelectionTimeoutMS: 3000,
      });
      isConnected = true;
      console.log('✅ [Database] Connected to local MongoDB.');
      return mongoose.connection;
    } catch (localErr) {
      console.warn('⚠️ [Database] Could not connect to MongoDB Atlas or local daemon.');
      console.warn('ℹ️ [Database] Please set MONGODB_URI in backend/.env with your MongoDB Atlas connection string.');
      // Do not throw so server still boots up to report diagnostic status to frontend!
    }
  }
};

const getDBStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateCode = mongoose.connection.readyState;
  return {
    state: states[stateCode] || 'disconnected',
    isConnected: stateCode === 1,
    host: mongoose.connection.host || 'none',
    name: mongoose.connection.name || 'none',
    isMemoryFallback: Boolean(memoryServerInstance),
    instructions: stateCode !== 1
      ? 'MongoDB is currently disconnected. Add your MongoDB Atlas connection string to MONGODB_URI in backend/.env'
      : 'MongoDB connection is active.',
  };
};

module.exports = { connectDB, getDBStatus };
