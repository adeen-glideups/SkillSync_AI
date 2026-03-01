const matchService = require('../services/matchService');
const {asyncHandler} = require('../../../shared/utils/asyncHandler');
const AppError = require('../../../shared/middleware/errorHandler').AppError;

/**
 * Get job matches for user's resume
 * POST /api/resumes/match
 */
const getMatches = asyncHandler(async (req, res, next) => {
  const userId = req.user?.userId;
  const { topN = 5 } = req.body;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  // Validate topN parameter
  if (topN && (typeof topN !== 'number' || topN < 1 || topN > 10)) {
    throw new AppError('topN must be a number between 1 and 10', 400, 'INVALID_INPUT');
  }

  // Calculate matches
  const matches = await matchService.calculateMatches(userId, topN || 5);

  res.status(200).json({
    success: true,
    message: 'Matching completed successfully',
    data: matches,
  });
});

module.exports = {
  getMatches,
};
