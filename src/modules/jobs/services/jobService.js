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

module.exports = {
  createJobWithEmbedding,
};
