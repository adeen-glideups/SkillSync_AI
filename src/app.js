const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config');
const { connectDatabase } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./shared/middleware/errorHandler');

// Import modules
const authModule = require('./modules/auth');
const jobsModule = require('./modules/jobs');
const resumesModule = require('./modules/resumes');
const matchesModule = require('./modules/matches');
const easyApplyModule = require('./modules/easyApply');


const app = express();

// Global middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// 🔥 GLOBAL BigInt JSON FIX
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Mount modules
app.use('/api/auth', authModule.router);
app.use('/api/jobs', jobsModule.router);
app.use('/api/resumes', resumesModule.router);
app.use('/api/matches', matchesModule.router);
app.use('/api/easy-apply', easyApplyModule.router);

const path = require('path');
app.use('/uploads', express.static(path.join(process.cwd(), 'src', 'uploads')));


// Error handling
app.use(notFoundHandler);
app.use(errorHandler);
console.log("ENV TEST:", {
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "✅ LOADED" : "❌ MISSING",
});

// Start server
const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(config.app.port, () => {
      console.log(`Server running on port ${config.app.port}`);
      console.log(`Environment: ${config.app.env}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
