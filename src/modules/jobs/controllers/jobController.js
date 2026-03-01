const jobService = require('../services/jobService');
const {asyncHandler} = require('../../../shared/utils/asyncHandler');
const AppError = require('../../../shared/middleware/errorHandler').AppError;

/**
 * Create a new job posting
 * POST /api/jobs
 */
const createJob = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;

  // Validate required fields
  if (!title || !description) {
    throw new AppError(
      'Title and description are required',
      400,
      'REQUIRED_FIELDS_MISSING'
    );
  }

  // Create job with embedding
  const job = await jobService.createJobWithEmbedding(title, description);

  res.status(201).json({
    success: true,
    message: 'Job created successfully',
    data: job,
  });
});

module.exports = {
  createJob,
};
