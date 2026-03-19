const jobService = require('../services/jobService');
const {asyncHandler} = require('../../../shared/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../../shared/utils/response');
const AppError = require('../../../shared/middleware/errorHandler').AppError;

/**
 * Create a new job posting
 * POST /api/jobs
 */
const createJob = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new AppError(
      'Title and description are required',
      400,
      'REQUIRED_FIELDS_MISSING'
    );
  }

  const job = await jobService.createJobWithEmbedding(title, description);
  sendCreated(res, job, 'Job created successfully');
});

/**
 * List jobs with pagination and filters
 * GET /api/jobs
 */
const listJobs = asyncHandler(async (req, res) => {
  const { page, limit, search, remote, category, jobType, sort } = req.query;

  const result = await jobService.getJobsList({
    page: page || 1,
    limit: limit || 10,
    search,
    remote,
    category,
    jobType,
    sort: sort || 'newest',
  });

  sendSuccess(res, result, 'Jobs fetched successfully');
});

/**
 * List all categories with job counts
 * GET /api/jobs/categories
 */
const listCategories = asyncHandler(async (req, res) => {
  const categories = await jobService.getCategories();
  sendSuccess(res, { categories }, 'Categories fetched successfully');
});

/**
 * Get full job detail by ID
 * GET /api/jobs/:id
 */
const getJobDetail = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const job = await jobService.getJobDetail(id);
  sendSuccess(res, { job }, 'Job detail fetched successfully');
});

/**
 * Get home dashboard stats for authenticated user
 * GET /api/jobs/home
 */
const getHome = asyncHandler(async (req, res) => {
  const data = await jobService.getHomeDashboard(req.user.userId);
  sendSuccess(res, data, 'Home dashboard fetched successfully');
});

/**
 * Get user's match results with job details
 * GET /api/jobs/user-matches
 */
const getUserMatches = asyncHandler(async (req, res) => {
  const { page, limit, resumeId } = req.query;

  const result = await jobService.getUserMatches(req.user.userId, {
    page: page || 1,
    limit: limit || 10,
    resumeId,
  });

  sendSuccess(res, result, 'User matches fetched successfully');
});

module.exports = {
  createJob,
  listJobs,
  listCategories,
  getJobDetail,
  getHome,
  getUserMatches,
};
