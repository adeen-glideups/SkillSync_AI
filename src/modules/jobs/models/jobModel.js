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

/**
 * Build Prisma where clause from filter params
 */
const buildJobWhereClause = ({ search, remote, category, jobType }) => {
  const where = {};

  if (remote !== undefined) {
    where.remote = remote;
  }

  if (category) {
    where.category = category;
  }

  if (jobType) {
    where.jobType = jobType;
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { company: { contains: search } },
      { tags: { string_contains: search } },
    ];
  }

  return where;
};

/**
 * Get paginated jobs with filters
 */
const getJobsPaginated = async ({ page = 1, limit = 10, search, remote, category, jobType, sort = 'newest' }) => {
  const where = buildJobWhereClause({ search, remote, category, jobType });
  const skip = (page - 1) * limit;

  // Determine sort order
  const orderBy = sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      select: {
        id: true,
        title: true,
        company: true,
        tags: true,
        location: true,
        remote: true,
        jobType: true,
        category: true,
        sourceUrl: true,
        postedAt: true,
        createdAt: true,
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);

  return {
    jobs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get distinct categories with job counts
 */
const getDistinctCategories = async () => {
  const results = await prisma.job.groupBy({
    by: ['category'],
    where: { category: { not: null } },
    _count: { category: true },
    orderBy: { _count: { category: 'desc' } },
  });

  return results.map((r) => ({
    name: r.category,
    count: r._count.category,
  }));
};

/**
 * Get full job detail by ID (excludes embedding)
 */
const getJobDetailById = async (id) => {
  return prisma.job.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      company: true,
      description: true,
      tags: true,
      location: true,
      remote: true,
      jobType: true,
      sourceApi: true,
      sourceUrl: true,
      category: true,
      postedAt: true,
      createdAt: true,
    },
  });
};

/**
 * Get user match results with job details, paginated
 */
const getUserMatchesPaginated = async (userId, { page = 1, limit = 10, resumeId }) => {
  const where = { userId };
  if (resumeId) {
    where.resumeId = resumeId;
  }

  const skip = (page - 1) * limit;

  const [matches, total] = await Promise.all([
    prisma.matchResult.findMany({
      where,
      select: {
        id: true,
        resumeId: true,
        jobId: true,
        similarityScore: true,
        explanation: true,
        createdAt: true,
        resume: {
          select: { fileName: true },
        },
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            remote: true,
            jobType: true,
            category: true,
            tags: true,
            postedAt: true,
          },
        },
      },
      orderBy: { similarityScore: 'desc' },
      skip,
      take: limit,
    }),
    prisma.matchResult.count({ where }),
  ]);

  return {
    matches: matches.map((m) => ({
      id: m.id,
      resumeId: m.resumeId,
      resumeFileName: m.resume.fileName,
      jobId: m.jobId,
      job: m.job,
      similarityScore: m.similarityScore,
      explanation: m.explanation,
      createdAt: m.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get dashboard counts for a user
 */
const getUserDashboardCounts = async (userId) => {
  const [resumesUploaded, jobsApplied, jobsMatched] = await Promise.all([
    prisma.userResume.count({ where: { userId } }),
    prisma.jobApplication.count({ where: { userId } }),
    prisma.matchResult.count({ where: { userId } }),
  ]);

  return { resumesUploaded, jobsApplied, jobsMatched };
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  getJobsPaginated,
  getDistinctCategories,
  getJobDetailById,
  getUserMatchesPaginated,
  getUserDashboardCounts,
};
