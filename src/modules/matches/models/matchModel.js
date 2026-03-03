const { prisma } = require('../../../config/database');

/**
 * Get a resume by ID with all necessary fields for matching
 * @param {number} resumeId - Resume ID
 * @returns {Promise<object|null>} - Resume object or null if not found
 */
const getResumeById = async (resumeId) => {
  return prisma.userResume.findFirst({
    where: {
      id: resumeId,
    },
    select: {
      id: true,
      userId: true,
      fileName: true,
      originalText: true,
      embedding: true,
      uploadedAt: true,
    },
  });
};

/**
 * Get all available jobs for matching
 * @returns {Promise<Array>} - Array of job objects with embeddings
 */
const getAllJobs = async () => {
  return prisma.job.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      embedding: true,
    },
  });
};

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
  getResumeById,
  getAllJobs,
  createMatchResult,
  createMultipleMatchResults,
};
