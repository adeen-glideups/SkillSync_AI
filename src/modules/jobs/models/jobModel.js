const { prisma } = require('../../../config/database');

/**
 * Create a new job with embedding
 * @param {object} data - Job data including title, description, and embedding
 * @returns {Promise<object>} - Created job object
 */
const createJob = async (data) => {
  return prisma.job.create({
    data: {
      title: data.title,
      description: data.description,
      embedding: data.embedding,
    },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
    },
  });
};

/**
 * Get all jobs with their embeddings
 * @returns {Promise<Array>} - Array of all jobs
 */
const getAllJobs = async () => {
  return prisma.job.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      embedding: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Get a single job by ID
 * @param {number} id - Job ID
 * @returns {Promise<object|null>} - Job object or null if not found
 */
const getJobById = async (id) => {
  return prisma.job.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      embedding: true,
      createdAt: true,
    },
  });
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
};
