/**
 * Calculate cosine similarity between two embedding vectors
 * @param {Array<number>} vecA - First vector (embedding)
 * @param {Array<number>} vecB - Second vector (embedding)
 * @returns {number} - Similarity score between 0 and 1
 */
const calculateCosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    throw new Error('Vectors must be non-empty arrays of equal length');
  }

  // Calculate dot product
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);

  // Calculate magnitudes
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  // Avoid division by zero
  if (magA === 0 || magB === 0) {
    return 0;
  }

  // Calculate and return cosine similarity
  return dotProduct / (magA * magB);
};

/**
 * Rank job matches based on cosine similarity with resume embedding
 * @param {Array<object>} jobs - Array of job objects with embeddings
 * @param {Array<number>} resumeEmbedding - Resume embedding vector
 * @param {number} topN - Number of top matches to return (default 5)
 * @returns {Array<object>} - Top matches with scores, sorted by relevance descending
 */
const rankMatches = (jobs, resumeEmbedding, topN = 5) => {
  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
    return [];
  }

  if (!resumeEmbedding || !Array.isArray(resumeEmbedding) || resumeEmbedding.length === 0) {
    throw new Error('Resume embedding must be a non-empty array');
  }

  // Calculate similarity for each job
  const scoredJobs = jobs
    .map((job) => {
      let jobEmbedding = job.embedding;

      // Handle case where embedding is stored as JSON string
      if (typeof jobEmbedding === 'string') {
        try {
          jobEmbedding = JSON.parse(jobEmbedding);
        } catch (e) {
          console.error('Failed to parse job embedding:', e);
          return { ...job, similarityScore: 0 };
        }
      }

      // Handle case where embedding is a JSON object with 'values' or similar structure
      if (jobEmbedding && typeof jobEmbedding === 'object' && !Array.isArray(jobEmbedding)) {
        jobEmbedding = jobEmbedding.values || Object.values(jobEmbedding);
      }

      if (!Array.isArray(jobEmbedding)) {
        return { ...job, similarityScore: 0 };
      }

      const score = calculateCosineSimilarity(jobEmbedding, resumeEmbedding);
      return { ...job, similarityScore: Math.max(0, Math.min(1, score)) };
    })
    .filter((job) => job.similarityScore > 0);

  // Sort by similarity score descending
  scoredJobs.sort((a, b) => b.similarityScore - a.similarityScore);

  // Return top N results
  return scoredJobs.slice(0, topN);
};

module.exports = {
  calculateCosineSimilarity,
  rankMatches,
};
