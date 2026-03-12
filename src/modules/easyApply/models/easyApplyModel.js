const { prisma } = require('../../../config/database');

// ─── Contact Info ─────────────────────────────────────────────────────────────

const getContactInfo = (userId) =>
  prisma.userContactInfo.findUnique({ where: { userId } });

const upsertContactInfo = (userId, data) =>
  prisma.userContactInfo.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });

// ─── Screening Questions ──────────────────────────────────────────────────────

const getScreeningQuestions = (jobId) =>
  prisma.jobScreeningQuestion.findUnique({ where: { jobId } });

const saveScreeningQuestions = (jobId, questions) =>
  prisma.jobScreeningQuestion.create({ data: { jobId, questions } });

// ─── Job lookup (for prefill + submit) ──────────────────────────────────────

const getJobById = (jobId) =>
  prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, title: true, company: true, description: true, location: true },
  });

// ─── Resume ───────────────────────────────────────────────────────────────────

const getUserResumes = (userId) =>
  prisma.userResume.findMany({
    where: { userId },
    select: { id: true, fileName: true, uploadedAt: true },
    orderBy: { uploadedAt: 'desc' },
  });

const getLatestResume = (userId) =>
  prisma.userResume.findFirst({
    where: { userId },
    orderBy: { uploadedAt: 'desc' },
    select: { id: true, originalText: true, fileName: true },
  });

const getResumeById = (resumeId, userId) =>
  prisma.userResume.findFirst({
    where: { id: resumeId, userId },
    select: { id: true, fileName: true },
  });

// ─── Application ──────────────────────────────────────────────────────────────

const findExistingApplication = (userId, jobId) =>
  prisma.jobApplication.findUnique({ where: { userId_jobId: { userId, jobId } } });

const createApplication = (data) =>
  prisma.jobApplication.create({ data });

const getUserApplications = (userId) =>
  prisma.jobApplication.findMany({
    where: { userId },
    select: {
      id: true,
      jobId: true,
      resumeId: true,
      status: true,
      appliedAt: true,
      job: { select: { title: true, company: true } },
    },
    orderBy: { appliedAt: 'desc' },
  });

module.exports = {
  getContactInfo,
  upsertContactInfo,
  getScreeningQuestions,
  saveScreeningQuestions,
  getJobById,
  getUserResumes,
  getLatestResume,
  getResumeById,
  findExistingApplication,
  createApplication,
  getUserApplications,
};
