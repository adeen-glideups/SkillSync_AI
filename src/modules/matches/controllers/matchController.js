const matchService = require('../services/matchService');
const {asyncHandler} = require('../../../shared/utils/asyncHandler');
const AppError = require('../../../shared/middleware/errorHandler').AppError;

/**
 * Get job matches for user's resume
 * POST /api/matches
 */
const getMatches = asyncHandler(async (req, res, next) => {
  const userId = req.user?.userId;
  const { resumeId, topN = 5 } = req.body;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  if (!resumeId) {
    throw new AppError('resumeId is required in request body', 400, 'INVALID_INPUT');
  }

  // Validate resumeId is a positive number
  if (!Number.isInteger(resumeId) || resumeId <= 0) {
    throw new AppError('resumeId must be a positive integer', 400, 'INVALID_INPUT');
  }

  // Validate topN parameter
  if (topN && (typeof topN !== 'number' || topN < 1 || topN > 10)) {
    throw new AppError('topN must be a number between 1 and 10', 400, 'INVALID_INPUT');
  }

  // Calculate matches for specific resume
  const matches = await matchService.calculateMatches(userId, resumeId, topN || 5);

  res.status(200).json({
    success: true,
    message: 'Matching completed successfully',
    data: matches,
  });
});

module.exports = {
  getMatches,
};
