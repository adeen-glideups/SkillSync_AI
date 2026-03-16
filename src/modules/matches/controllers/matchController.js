const matchService = require('../services/matchService');
const {asyncHandler} = require('../../../shared/utils/asyncHandler');
const {sendSuccess} = require('../../../shared/utils/response');
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

/**
 * Get saved match results by resumeId
 * GET /api/matches/resume/:resumeId
 */
const getMatchesByResumeId = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const resumeId = parseInt(req.params.resumeId, 10);

  const result = await matchService.getMatchesByResumeId(userId, resumeId);

  sendSuccess(res, result, 'Match results fetched successfully');
});

/**
 * Clear all match results for a specific resume
 * DELETE /api/matches/resume/:resumeId
 */
const clearMatchesByResumeId = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const resumeId = parseInt(req.params.resumeId, 10);

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  if (!resumeId || isNaN(resumeId) || resumeId <= 0) {
    throw new AppError('resumeId must be a positive integer', 400, 'INVALID_INPUT');
  }

  const result = await matchService.clearMatchesByResumeId(userId, resumeId);

  sendSuccess(res, result, 'Match results cleared successfully');
});

module.exports = {
  getMatches,
  getMatchesByResumeId,
  clearMatchesByResumeId,
};
