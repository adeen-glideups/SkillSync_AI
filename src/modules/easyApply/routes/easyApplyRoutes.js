const express = require('express');
const Joi = require('joi');

const { authenticate } = require('../../auth/middleware/authenticate');
const { validate } = require('../../../shared/middleware/validate');
const controller = require('../controllers/easyApplyController');

const router = express.Router();

// ─── Validation Schemas ────────────────────────────────────────────────────────

const saveContactSchema = Joi.object({
  phone: Joi.string().max(20).allow(null, '').optional(),
  countryCode: Joi.string().max(10).allow(null, '').optional(),
  city: Joi.string().max(100).allow(null, '').optional(),
  country: Joi.string().max(100).allow(null, '').optional(),
});

const submitSchema = Joi.object({
  resumeId: Joi.number().integer().positive().required(),
  contact: Joi.object({
    email: Joi.string().email().allow(null, '').optional(),
    phone: Joi.string().max(20).allow(null, '').optional(),
    countryCode: Joi.string().max(10).allow(null, '').optional(),
    city: Joi.string().max(100).allow(null, '').optional(),
    country: Joi.string().max(100).allow(null, '').optional(),
  }).required(),
  answers: Joi.array()
    .items(
      Joi.object({
        question: Joi.string().required(),
        answer: Joi.string().allow('').required(),
      })
    )
    .required(),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/easy-apply/:jobId/prefill
 * Returns contact info (saved or AI-extracted), user's resumes, and screening questions.
 */
router.get('/:jobId/prefill', authenticate, controller.getPrefill);

/**
 * PUT /api/easy-apply/contact
 * Save or update user's contact info (persists for all future applications).
 */
router.put('/contact', authenticate, validate(saveContactSchema), controller.saveContact);

/**
 * POST /api/easy-apply/:jobId/submit
 * Submit an Easy Apply application for a specific job.
 */
router.post('/:jobId/submit', authenticate, validate(submitSchema), controller.submitApplication);

/**
 * GET /api/easy-apply/my-applications
 * Get all jobs the authenticated user has applied to.
 */
router.get('/my-applications', authenticate, controller.getMyApplications);

module.exports = router;
