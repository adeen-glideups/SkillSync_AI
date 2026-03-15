const express = require('express');
const Joi = require('joi');
const jobController = require('../controllers/jobController');
const { validate, validateQuery } = require('../../../shared/middleware/validate');
const { authenticate } = require('../../../modules/auth/middleware/authenticate');

const router = express.Router();

// ─── Validation Schemas ────────────────────────────────────────────────────────

const createJobSchema = Joi.object({
  title: Joi.string().trim().min(5).max(255).required(),
  description: Joi.string().trim().min(20).required(),
});

const listJobsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  search: Joi.string().trim().max(255).optional(),
  remote: Joi.boolean().optional(),
  category: Joi.string().trim().max(100).optional(),
  jobType: Joi.string().trim().max(100).optional(),
});

const jobIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const userMatchesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  resumeId: Joi.number().integer().positive().optional(),
});

// ─── Routes ────────────────────────────────────────────────────────────────────

// Static paths MUST come before /:id to avoid being caught by the param route

/**
 * GET /api/jobs/categories
 * List all job categories with counts
 */
router.get('/categories', jobController.listCategories);

/**
 * GET /api/jobs/home
 * Dashboard stats for authenticated user
 */
router.get('/home', authenticate, jobController.getHome);

/**
 * GET /api/jobs/user-matches
 * User's match results with job details (paginated)
 */
router.get(
  '/user-matches',
  authenticate,
  validateQuery(userMatchesSchema),
  jobController.getUserMatches
);

/**
 * GET /api/jobs
 * List jobs with pagination and filters
 */
router.get('/', validateQuery(listJobsSchema), jobController.listJobs);

/**
 * GET /api/jobs/:id
 * Get full job detail by ID
 */
router.get('/:id', validateQuery(jobIdSchema), jobController.getJobDetail);

/**
 * POST /api/jobs
 * Create a new job posting with auto-generated embedding
 */
router.post('/', authenticate, validate(createJobSchema), jobController.createJob);

module.exports = router;
