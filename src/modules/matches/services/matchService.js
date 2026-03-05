const matchModel = require('../models/matchModel');
const { rankMatches } = require('../../../shared/utils/similarityCalculator');
const { generateExplanation } = require('../../../shared/utils/embeddingService');
const AppError = require('../../../shared/middleware/errorHandler').AppError;

/**
 * Calculate matches for a user's specific resume
 * @param {number} userId - User ID (authenticated user)
 * @param {number} resumeId - Resume ID to calculate matches for
 * @param {number} topN - Number of top matches to return (default 5, max 10)
 * @returns {Promise<object>} - Match results with explanations
 * @throws {AppError} - If resume not found, doesn't belong to user, or has no embedding
 */
const calculateMatches = async (userId, resumeId, topN = 5) => {
  try {
    // Validate topN parameter
    if (topN < 1 || topN > 10) {
      topN = 5;
    }

    // Fetch the specific resume by ID using model
    const resume = await matchModel.getResumeById(resumeId);

    // Edge Case 1: Resume doesn't exist
    if (!resume) {
      throw new AppError(
        `Resume with ID ${resumeId} not found`,
        404,
        'RESUME_NOT_FOUND'
      );
    }

    // Edge Case 2: Resume exists but doesn't belong to the authenticated user
    if (resume.userId !== userId) {
      throw new AppError(
        'You do not have permission to access this resume. Resume ID does not belong to your account.',
        403,
        'FORBIDDEN_RESUME_ACCESS'
      );
    }

    // Edge Case 3: Resume has no embedding (should not happen in normal flow)
    if (!resume.embedding) {
      throw new AppError(
        `Resume ${resumeId} does not have an embedding. Please re-upload the resume.`,
        500,
        'EMBEDDING_GENERATION_FAILED'
      );
    }

    // Fetch all jobs using model
    const jobs = await matchModel.getAllJobs();

    // Edge Case 4: No jobs available to match
    if (!jobs || jobs.length === 0) {
      throw new AppError(
        'No jobs available for matching. Please try again later when jobs are posted.',
        404,
        'NO_JOBS_FOUND'
      );
    }

    // Rank jobs by similarity
    let resumeEmbedding = resume.embedding;

    // Handle case where embedding is stored as JSON string
    if (typeof resumeEmbedding === 'string') {
      try {
        resumeEmbedding = JSON.parse(resumeEmbedding);
      } catch (e) {
        throw new AppError(
          'Invalid resume embedding format. Please re-upload the resume.',
          500,
          'EMBEDDING_GENERATION_FAILED'
        );
      }
    }

    // Edge Case 5: Embedding is not in expected array format
    if (!Array.isArray(resumeEmbedding)) {
      throw new AppError(
        'Resume embedding format is invalid. Please re-upload the resume.',
        500,
        'EMBEDDING_GENERATION_FAILED'
      );
    }

    const rankedJobs = rankMatches(jobs, resumeEmbedding, topN);

    // Define minimum match score threshold from LLM reranker
    // Top matches from embeddings proceed to LLM verification
    // LLM scores below 50/100 indicate poor fit (like content writer matching coding jobs)
    const MATCH_SCORE_THRESHOLD = 0;

    if (!rankedJobs || rankedJobs.length === 0) {
      return {
        resumeId: resume.id,
        fileName: resume.fileName,
        uploadedAt: resume.uploadedAt,
        totalJobsAnalyzed: jobs.length,
        topMatches: [],
        message: 'We don\'t have any job that matches your profile right now. Your skills are better suited for a different career path.',
      };
    }

    // Generate scores and explanations for top matches (Stage 2: Reranking)
    const topMatches = [];
    const matchesToSave = [];

    for (let i = 0; i < rankedJobs.length; i++) {
      const job = rankedJobs[i];

      try {
        // Use Groq as a reranker to verify and score the match
        const scoreData = await generateExplanation(resume.originalText, {
          title: job.title,
          description: job.description,
        });

        // Only include matches that pass the LLM threshold
        if (scoreData.matchScore >= MATCH_SCORE_THRESHOLD) {
          const matchData = {
            rank: topMatches.length + 1,
            jobId: job.id,
            jobTitle: job.title,
            matchScore: scoreData.matchScore, // Use LLM score instead of embedding similarity
            explanation: scoreData.explanation,
          };

          topMatches.push(matchData);

          // Prepare data for saving to database
          matchesToSave.push({
            userId,
            resumeId: resume.id,
            jobId: job.id,
            similarityScore: scoreData.matchScore, // Store LLM score in DB
            explanation: scoreData.explanation,
          });
        }
      } catch (error) {
        console.error(`Error generating score for job ${job.id}:`, error);
        // Continue with remaining jobs even if one fails
      }
    }

    // If no matches passed the threshold, return friendly message
    if (topMatches.length === 0) {
      return {
        resumeId: resume.id,
        fileName: resume.fileName,
        uploadedAt: resume.uploadedAt,
        totalJobsAnalyzed: jobs.length,
        topMatches: [],
        message: 'We don\'t have any job that matches your profile right now. Your skills are better suited for a different career path.',
      };
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
      fileName: resume.fileName,
      uploadedAt: resume.uploadedAt,
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
