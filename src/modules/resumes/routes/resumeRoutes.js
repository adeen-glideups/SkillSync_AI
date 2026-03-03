const express = require('express');
const resumeController = require('../controllers/resumeController');
const { uploadResume } = require('../../../shared/utils/uploadHelper');
const {authenticate} = require('../../../modules/auth/middleware/authenticate');

const router = express.Router();

// Routes

/**
 * GET /api/resumes
 * Get all resumes for the authenticated user
 */
router.get(
  '/',
  authenticate,
  resumeController.getUserResumes
);

/**
 * POST /api/resumes/upload
 * Upload a resume file (PDF or DOCX) with auto-generated embedding
 */
router.post(
  '/upload',
  authenticate,
  uploadResume,
  resumeController.uploadResume
);

module.exports = router;
