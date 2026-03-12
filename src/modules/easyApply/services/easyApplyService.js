const { AppError } = require('../../../shared/middleware/errorHandler');
const { prisma } = require('../../../config/database');
const model = require('../models/easyApplyModel');
const { sendApplicationEmail } = require('../../auth/services/emailService');

// ─── Groq helper ─────────────────────────────────────────────────────────────

const callGroq = async (prompt, maxTokens = 500) => {
  if (!process.env.GROQ_API_KEY) {
    throw new AppError('Groq API key not configured', 500, 'GROQ_NOT_CONFIGURED');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_completion_tokens: maxTokens,
      temperature: 0.2,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new AppError(
      `Groq error: ${data.error?.message || 'Unknown'}`,
      response.status,
      'GROQ_ERROR'
    );
  }

  return data.choices?.[0]?.message?.content?.trim() || '';
};

// ─── Extract contact info from resume text via LLM ───────────────────────────

const extractContactFromResume = async (resumeText) => {
  const prompt = `Extract contact information from this resume text. Return ONLY valid JSON, no other text.

RESUME:
${resumeText.substring(0, 1500)}

Return this exact JSON structure (use null for any field not found):
{"phone": null, "countryCode": null, "city": null, "country": null}

Rules:
- phone: digits only, no country code (e.g. "3001234567")
- countryCode: with + prefix (e.g. "+92", "+1", "+44")
- city: city name only
- country: full country name`;

  try {
    const raw = await callGroq(prompt, 150);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      phone: parsed.phone || null,
      countryCode: parsed.countryCode || null,
      city: parsed.city || null,
      country: parsed.country || null,
    };
  } catch {
    return {};
  }
};

// ─── Generate screening questions from job description via LLM ───────────────

const generateScreeningQuestions = async (job) => {
  const prompt = `You are an HR assistant. Generate 4 screening questions for a job applicant based on this job posting.

JOB TITLE: ${job.title}
COMPANY: ${job.company}
DESCRIPTION: ${job.description.substring(0, 800)}

Return ONLY valid JSON array, no other text. Each question must have:
- "question": the question text
- "type": one of "text", "yesno", "number"

Example:
[
  {"question": "How many years of experience do you have with Node.js?", "type": "number"},
  {"question": "Are you authorized to work in the job location without sponsorship?", "type": "yesno"},
  {"question": "What is your notice period?", "type": "text"},
  {"question": "What is your expected salary range?", "type": "text"}
]

Generate exactly 4 relevant questions for THIS specific job:`;

  try {
    const raw = await callGroq(prompt, 400);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return getDefaultQuestions();
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed) || parsed.length === 0) return getDefaultQuestions();
    return parsed.slice(0, 5);
  } catch {
    return getDefaultQuestions();
  }
};

const getDefaultQuestions = () => [
  { question: 'How many years of relevant work experience do you have?', type: 'number' },
  { question: 'Are you authorized to work in the job location without visa sponsorship?', type: 'yesno' },
  { question: 'What is your availability / notice period?', type: 'text' },
  { question: 'What is your expected salary range?', type: 'text' },
];

// ─── Service: Get prefill data ────────────────────────────────────────────────

const getPrefillData = async (userId, userEmail, jobId) => {
  // Validate job exists
  const job = await model.getJobById(jobId);
  if (!job) throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');

  // Get user's resumes
  const resumes = await model.getUserResumes(userId);

  // Contact info: use saved record or extract from resume via LLM
  let contactInfo = await model.getContactInfo(userId);
  let contactSource = 'saved';

  if (!contactInfo) {
    const latestResume = await model.getLatestResume(userId);
    if (latestResume) {
      const extracted = await extractContactFromResume(latestResume.originalText);
      contactInfo = { phone: null, countryCode: null, city: null, country: null, ...extracted };
    } else {
      contactInfo = { phone: null, countryCode: null, city: null, country: null };
    }
    contactSource = 'extracted';
  }

  // Screening questions: use cached or generate via LLM
  let screeningRecord = await model.getScreeningQuestions(jobId);
  if (!screeningRecord) {
    const questions = await generateScreeningQuestions(job);
    screeningRecord = await model.saveScreeningQuestions(jobId, questions);
  }

  return {
    contact: {
      email: userEmail,
      phone: contactInfo.phone,
      countryCode: contactInfo.countryCode,
      city: contactInfo.city,
      country: contactInfo.country,
      source: contactSource, // tells frontend whether this was pre-saved or AI-extracted
    },
    resumes,
    job: { id: job.id, title: job.title, company: job.company, location: job.location },
    screeningQuestions: screeningRecord.questions,
  };
};

// ─── Service: Save contact info ───────────────────────────────────────────────

const saveContactInfo = async (userId, data) => {
  const saved = await model.upsertContactInfo(userId, {
    phone: data.phone || null,
    countryCode: data.countryCode || null,
    city: data.city || null,
    country: data.country || null,
  });
  return saved;
};

// ─── Service: Submit application ──────────────────────────────────────────────

const submitApplication = async (userId, userEmail, jobId, payload) => {
  const { resumeId, contact, answers } = payload;

  // Validate job
  const job = await model.getJobById(jobId);
  if (!job) throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');

  // Validate resume belongs to user
  const resume = await model.getResumeById(resumeId, userId);
  if (!resume) throw new AppError('Resume not found or does not belong to you', 404, 'RESUME_NOT_FOUND');

  // Check duplicate
  const existing = await model.findExistingApplication(userId, jobId);
  if (existing) throw new AppError('You have already applied to this job', 409, 'ALREADY_APPLIED');

  // Fetch user name for email
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });

  // Save application
  const application = await model.createApplication({
    userId,
    jobId,
    resumeId,
    contactSnapshot: {
      email: contact.email || userEmail,
      phone: contact.phone || null,
      countryCode: contact.countryCode || null,
      city: contact.city || null,
      country: contact.country || null,
    },
    answers: answers || [],
    status: 'APPLIED',
  });

  // Persist contact info for future applications (upsert silently)
  if (contact.phone || contact.city || contact.country) {
    await model.upsertContactInfo(userId, {
      phone: contact.phone || null,
      countryCode: contact.countryCode || null,
      city: contact.city || null,
      country: contact.country || null,
    }).catch(() => {}); // non-blocking
  }

  // Send confirmation email
  await sendApplicationEmail(userEmail, user?.name || 'User', job.title, job.company);

  return {
    applicationId: application.id,
    status: application.status,
    appliedAt: application.appliedAt,
    job: { title: job.title, company: job.company },
    resume: { id: resume.id, fileName: resume.fileName },
  };
};

// ─── Service: Get user's applications ────────────────────────────────────────

const getUserApplications = (userId) => model.getUserApplications(userId);

module.exports = {
  getPrefillData,
  saveContactInfo,
  submitApplication,
  getUserApplications,
};
