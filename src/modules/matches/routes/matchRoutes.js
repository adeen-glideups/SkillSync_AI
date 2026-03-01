const express = require('express');
const Joi = require('joi');
const matchController = require('../controllers/matchController');
const {validate} = require('../../../shared/middleware/validate');
const {authenticate} = require('../../../modules/auth/middleware/authenticate');

const router = express.Router();

// Validation schemas
const getMatchesSchema = Joi.object({
  topN: Joi.number().integer().min(1).max(10).optional(),
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

module.exports = router;
