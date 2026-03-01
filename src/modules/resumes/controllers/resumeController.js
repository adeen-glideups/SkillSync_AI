const resumeService = require('../services/resumeService');
const {asyncHandler} = require('../../../shared/utils/asyncHandler');
const AppError = require('../../../shared/middleware/errorHandler').AppError;

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

module.exports = {
  uploadResume,
};
