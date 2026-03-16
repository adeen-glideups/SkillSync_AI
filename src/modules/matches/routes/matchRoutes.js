const express = require('express');
const Joi = require('joi');
const matchController = require('../controllers/matchController');
const {validate} = require('../../../shared/middleware/validate');
const {authenticate} = require('../../../modules/auth/middleware/authenticate');

const router = express.Router();

// Validation schemas
const getMatchesSchema = Joi.object({
  resumeId: Joi.number().integer().positive().required().messages({
    'number.base': 'resumeId must be a number',
    'number.positive': 'resumeId must be a positive number',
    'any.required': 'resumeId is required',
  }),
  topN: Joi.number().integer().min(1).max(10).optional().default(5).messages({
    'number.base': 'topN must be a number',
    'number.min': 'topN must be at least 1',
    'number.max': 'topN cannot exceed 10',
  }),
});

// Routes

/**
 * POST /api/resumes/match
 * Get job matches for user's resume with AI explanations
 */
router.post(
  '/',
  authenticate,
  validate(getMatchesSchema),
  matchController.getMatches
);

router.get(
  '/resume/:resumeId',
  authenticate,
  matchController.getMatchesByResumeId
);

/**
 * DELETE /api/matches/resume/:resumeId
 * Clear all match results for a specific resume
 */
router.delete(
  '/resume/:resumeId',
  authenticate,
  matchController.clearMatchesByResumeId
);

module.exports = router;
