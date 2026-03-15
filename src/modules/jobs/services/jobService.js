const jobModel = require('../models/jobModel');
const { generateEmbedding } = require('../../../shared/utils/embeddingService');
const AppError = require('../../../shared/middleware/errorHandler').AppError;

/**
 * Create a new job with auto-generated embedding
 * @param {string} title - Job title
 * @param {string} description - Job description
 * @returns {Promise<object>} - Created job object
 */
const createJobWithEmbedding = async (title, description) => {
  try {
    // Generate embedding for job description
    const embedding = await generateEmbedding(description);

    // Create job with embedding
    const job = await jobModel.createJob({
      title,
      description,
      embedding,
    });

    return job;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error creating job with embedding:', error);
    throw new AppError('Failed to create job', 500, 'INTERNAL_SERVER_ERROR');
  }
};

/**
 * Get paginated job listings with filters
 */
const getJobsList = async (query) => {
  return jobModel.getJobsPaginated(query);
};

/**
 * Get all distinct categories with counts
 */
const getCategories = async () => {
  return jobModel.getDistinctCategories();
};

/**
 * Get full job detail by ID
 */
const getJobDetail = async (id) => {
  const job = await jobModel.getJobDetailById(id);
  if (!job) {
    throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
  }
  return job;
};

/**
 * Get home dashboard stats for authenticated user
 */
const getHomeDashboard = async (userId) => {
  return jobModel.getUserDashboardCounts(userId);
};

/**
 * Get user's match results with job details, paginated
 */
const getUserMatches = async (userId, query) => {
  return jobModel.getUserMatchesPaginated(userId, query);
};

module.exports = {
  createJobWithEmbedding,
  getJobsList,
  getCategories,
  getJobDetail,
  getHomeDashboard,
  getUserMatches,
};
