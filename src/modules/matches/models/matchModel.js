const { prisma } = require('../../../config/database');

/**
 * Create a single match result
 * @param {object} data - Match result data
 * @returns {Promise<object>} - Created match result
 */
const createMatchResult = async (data) => {
  return prisma.matchResult.create({
    data: {
      userId: data.userId,
      resumeId: data.resumeId,
      jobId: data.jobId,
      similarityScore: data.similarityScore,
      explanation: data.explanation,
    },
  });
};

/**
 * Create multiple match results at once
 * @param {Array} results - Array of match result data objects
 * @returns {Promise<void>}
 */
const createMultipleMatchResults = async (results) => {
  if (!results || results.length === 0) {
    return;
  }

  return prisma.matchResult.createMany({
    data: results,
    skipDuplicates: true,
  });
};

module.exports = {
  createMatchResult,
  createMultipleMatchResults,
};
