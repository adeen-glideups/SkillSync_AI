const fs = require('fs');
const resumeModel = require('../models/resumeModel');
const { parseResumeFile, cleanText } = require('../../../shared/utils/fileParser');
const { generateEmbedding } = require('../../../shared/utils/embeddingService');
const AppError = require('../../../shared/middleware/errorHandler').AppError;

/**
 * Upload and process a resume file with auto-generated embedding
 * @param {number} userId - User ID
 * @param {object} file - Multer file object
 * @returns {Promise<object>} - Created resume object
 */
const uploadResumeWithEmbedding = async (userId, file) => {
  if (!file) {
    throw new AppError('No file provided', 400, 'REQUIRED_FIELDS_MISSING');
  }

  if (!userId) {
    throw new AppError('User ID is required', 400, 'REQUIRED_FIELDS_MISSING');
  }

  let resumeText = '';

  try {
    // Parse file and extract text
    resumeText = await parseResumeFile(file.path, file.mimetype);
    resumeText = cleanText(resumeText);

    if (!resumeText || resumeText.length === 0) {
      throw new AppError('Failed to extract text from resume', 400, 'RESUME_PARSING_FAILED');
    }

    // Generate embedding for resume
    const embedding = await generateEmbedding(resumeText);

    // Delete old resumes for this user
    await resumeModel.deleteOldResumesByUserId(userId);

    // Create new resume
    const resume = await resumeModel.createResume({
      userId,
      fileName: file.originalname,
      originalText: resumeText,
      embedding,
    });

    return resume;
  } catch (error) {
    // Clean up uploaded file on error
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error uploading resume:', error);
    throw new AppError('Failed to process resume', 500, 'INTERNAL_SERVER_ERROR');
  }
};

module.exports = {
  uploadResumeWithEmbedding,
};
