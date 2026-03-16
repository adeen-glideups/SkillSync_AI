const resumeService = require('../services/resumeService');
const {asyncHandler} = require('../../../shared/utils/asyncHandler');
const {sendSuccess} = require('../../../shared/utils/response');
const AppError = require('../../../shared/middleware/errorHandler').AppError;

/**
 * Get all resumes for authenticated user
 * GET /api/resumes
 */
const getUserResumes = asyncHandler(async (req, res, next) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  // Get all resumes for user
  const resumes = await resumeService.getUserResumes(userId);

  res.status(200).json({
    success: true,
    message: 'Resumes retrieved successfully',
    data: resumes,
  });
});

/**
 * Upload a resume file
 * POST /api/resumes/upload
 */
const uploadResume = asyncHandler(async (req, res, next) => {
  const userId = req.user?.userId;
  console.log('Uploading resume for user ID:', userId);
  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  if (!req.file) {
    throw new AppError('No resume file provided', 400, 'REQUIRED_FIELDS_MISSING');
  }

  // Upload resume and generate embedding
  const resume = await resumeService.uploadResumeWithEmbedding(userId, req.file);

  res.status(201).json({
    success: true,
    message: 'Resume uploaded successfully',
    data: resume,
  });
});

const deleteResumeById = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const resumeId = parseInt(req.params.resumeId, 10);

  const result = await resumeService.deleteResumeById(userId, resumeId);

  sendSuccess(res, result, 'Resume deleted successfully');
});

const clearAllResumes = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const result = await resumeService.clearAllResumes(userId);

  sendSuccess(res, result, 'All resumes cleared successfully');
});

module.exports = {
  getUserResumes,
  uploadResume,
  deleteResumeById,
  clearAllResumes,
};
