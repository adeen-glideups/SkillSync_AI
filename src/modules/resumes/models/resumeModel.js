const { prisma } = require('../../../config/database');

/**
 * Create a new user resume with embedding
 * @param {object} data - Resume data
 * @returns {Promise<object>} - Created resume object
 */
const createResume = async (data) => {
  return prisma.userResume.create({
    data: {
      userId: data.userId,
      fileName: data.fileName,
      originalText: data.originalText,
      embedding: data.embedding,
    },
    select: {
      id: true,
      userId: true,
      fileName: true,
      uploadedAt: true,
    },
  });
};

/**
 * Get the latest resume for a user
 * @param {number} userId - User ID
 * @returns {Promise<object|null>} - Resume object or null if not found
 */
const getLatestResumeByUserId = async (userId) => {
  return prisma.userResume.findFirst({
    where: { userId },
    select: {
      id: true,
      userId: true,
      fileName: true,
      originalText: true,
      embedding: true,
      uploadedAt: true,
    },
    orderBy: {
      uploadedAt: 'desc',
    },
  });
};

/**
 * Delete a resume by ID
 * @param {number} resumeId - Resume ID
 * @returns {Promise<object>} - Deleted resume object
 */
const deleteResumeById = async (resumeId) => {
  return prisma.userResume.delete({
    where: { id: resumeId },
  });
};

/**
 * Get all resumes for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} - Array of resume objects
 */
const getUserResumes = async (userId) => {
  return prisma.userResume.findMany({
    where: { userId },
    select: {
      id: true,
      fileName: true,
      uploadedAt: true,
    },
    orderBy: {
      uploadedAt: 'desc',
    },
  });
};

/**
 * Delete all resumes for a user except the latest one
 * @param {number} userId - User ID
 * @returns {Promise<void>}
 */
const deleteOldResumesByUserId = async (userId) => {
  // Get all resumes for user, ordered by date
  const resumes = await prisma.userResume.findMany({
    where: { userId },
    orderBy: { uploadedAt: 'desc' },
    select: { id: true },
  });

  // Delete all except the first (most recent)
  if (resumes.length > 1) {
    const idsToDelete = resumes.slice(1).map((r) => r.id);
    await prisma.userResume.deleteMany({
      where: { id: { in: idsToDelete } },
    });
  }
};

module.exports = {
  createResume,
  getUserResumes,
  getLatestResumeByUserId,
  deleteResumeById,
  deleteOldResumesByUserId,
};
