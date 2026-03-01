const { GoogleGenerativeAI } = require('@google/generative-ai');
const AppError = require('../middleware/errorHandler').AppError;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate embedding for given text using Google's gemini-embedding-001 model
 * @param {string} text - The text to embed
 * @returns {Promise<Array<number>>} - 768-dimensional embedding vector
 */
const generateEmbedding = async (text) => {
  if (!text || text.trim().length === 0) {
    throw new AppError('Text cannot be empty for embedding generation', 400, 'INVALID_INPUT');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

    const result = await model.embedContent(text);
    const embedding = result.embedding.values;

    if (!embedding || embedding.length === 0) {
      throw new AppError('Failed to generate embedding', 500, 'EMBEDDING_GENERATION_FAILED');
    }

    return embedding;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Embedding generation error:', error);
    throw new AppError('Failed to generate embedding', 500, 'EMBEDDING_GENERATION_FAILED');
  }
};

/**
 * Generate explanation for job-resume match using Gemini
 * @param {string} resumeText - The resume text
 * @param {object} job - Job object with title and description
 * @returns {Promise<string>} - Explanation of why they match
 */
const generateExplanation = async (resumeText, job) => {
  if (!resumeText || !job || !job.title || !job.description) {
    throw new AppError('Invalid input for explanation generation', 400, 'INVALID_INPUT');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Given this resume and job posting, explain in 2-3 sentences why they are a good match based on skills, experience, and qualifications.

Resume:
${resumeText}

Job Title: ${job.title}
Job Description: ${job.description}

Provide a concise, professional explanation:`;

    const result = await model.generateContent(prompt);
    const explanation = result.response.text();

    if (!explanation) {
      throw new AppError('Failed to generate explanation', 500, 'EXPLANATION_GENERATION_FAILED');
    }

    return explanation.trim();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Explanation generation error:', error);
    throw new AppError('Failed to generate job match explanation', 500, 'EXPLANATION_GENERATION_FAILED');
  }
};

module.exports = {
  generateEmbedding,
  generateExplanation,
};
