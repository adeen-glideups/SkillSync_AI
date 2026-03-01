const express = require('express');
const Joi = require('joi');
const jobController = require('../controllers/jobController');
const {validate} = require('../../../shared/middleware/validate');
const {authenticate} = require('../../../modules/auth/middleware/authenticate');

const router = express.Router();

// Validation schemas
const createJobSchema = Joi.object({
  title: Joi.string().trim().min(5).max(255).required(),
  description: Joi.string().trim().min(20).required(),
});

// Routes

/**
 * POST /api/jobs
 * Create a new job posting with auto-generated embedding
 */
router.post(
  '/',
  authenticate,
  validate(createJobSchema),
  jobController.createJob
);

module.exports = router;
