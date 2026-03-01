const matchModel = require('../models/matchModel');
const { prisma } = require('../../../config/database');
const { rankMatches } = require('../../../shared/utils/similarityCalculator');
const { generateExplanation } = require('../../../shared/utils/embeddingService');
const AppError = require('../../../shared/middleware/errorHandler').AppError;

/**
 * Calculate matches for a user's resume
 * @param {number} userId - User ID
 * @param {number} topN - Number of top matches to return (default 5, max 10)
 * @returns {Promise<object>} - Match results with explanations
 */
const calculateMatches = async (userId, topN = 5) => {
  try {
    // Validate topN parameter
    if (topN < 1 || topN > 10) {
      topN = 5;
    }

    // Fetch user's latest resume
    const resume = await prisma.userResume.findFirst({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        originalText: true,
        embedding: true,
      },
    });

    if (!resume) {
      throw new AppError('No resume found for this user', 404, 'NO_RESUMES_FOUND');
    }

    if (!resume.embedding) {
      throw new AppError('Resume embedding not found', 500, 'EMBEDDING_GENERATION_FAILED');
    }

    // Fetch all jobs
    const jobs = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        embedding: true,
      },
    });

    if (!jobs || jobs.length === 0) {
      throw new AppError('No jobs available for matching', 404, 'NO_JOBS_FOUND');
    }

    // Rank jobs by similarity
    let resumeEmbedding = resume.embedding;

    // Handle case where embedding is stored as JSON string
    if (typeof resumeEmbedding === 'string') {
      try {
        resumeEmbedding = JSON.parse(resumeEmbedding);
      } catch (e) {
        throw new AppError('Invalid resume embedding format', 500, 'EMBEDDING_GENERATION_FAILED');
      }
    }

    if (!Array.isArray(resumeEmbedding)) {
      throw new AppError('Invalid resume embedding format', 500, 'EMBEDDING_GENERATION_FAILED');
    }

    const rankedJobs = rankMatches(jobs, resumeEmbedding, topN);

    if (!rankedJobs || rankedJobs.length === 0) {
      return {
        resumeId: resume.id,
        totalJobsAnalyzed: jobs.length,
        topMatches: [],
      };
    }

    // Generate explanations for top matches
    const topMatches = [];
    const matchesToSave = [];

    for (let i = 0; i < rankedJobs.length; i++) {
      const job = rankedJobs[i];

      try {
        // Generate explanation using Gemini
        const explanation = await generateExplanation(resume.originalText, {
          title: job.title,
          description: job.description,
        });

        const matchData = {
          rank: i + 1,
          jobId: job.id,
          jobTitle: job.title,
          similarityScore: job.similarityScore,
          explanation,
        };

        topMatches.push(matchData);

        // Prepare data for saving to database
        matchesToSave.push({
          userId,
          resumeId: resume.id,
          jobId: job.id,
          similarityScore: job.similarityScore,
          explanation,
        });
      } catch (error) {
        console.error(`Error generating explanation for job ${job.id}:`, error);
        // Continue with remaining jobs even if one fails
        topMatches.push({
          rank: i + 1,
          jobId: job.id,
          jobTitle: job.title,
          similarityScore: job.similarityScore,
          explanation: 'Explanation could not be generated at this time',
        });
      }
    }

    // Save match results to database
    try {
      if (matchesToSave.length > 0) {
        await matchModel.createMultipleMatchResults(matchesToSave);
      }
    } catch (dbError) {
      console.error('Error saving match results to database:', dbError);
      // Don't fail the entire request if saving fails
    }

    return {
      resumeId: resume.id,
      totalJobsAnalyzed: jobs.length,
      topMatches,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error calculating matches:', error);
    throw new AppError('Failed to calculate matches', 500, 'INTERNAL_SERVER_ERROR');
  }
};

module.exports = {
  calculateMatches,
};
