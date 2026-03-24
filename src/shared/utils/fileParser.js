const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const AppError = require('../middleware/errorHandler').AppError;

console.log('✅ PDF and DOCX parsers loaded successfully');

/**
 * Extract text from PDF buffer
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} - Extracted text from PDF
 */
const extractPdfText = async (buffer) => {
  try {
    const data = await pdfParse(buffer);

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text extracted from PDF');
    }

    return data.text.trim();
  } catch (error) {
    console.error('PDF parsing error:', error.message);
    throw new AppError(
      'Failed to parse PDF file. Please ensure it\'s a valid PDF with extractable text.',
      400,
      'RESUME_PARSING_FAILED'
    );
  }
};

/**
 * Extract text from DOCX buffer
 * @param {Buffer} buffer - DOCX file buffer
 * @returns {Promise<string>} - Extracted text from DOCX
 */
const extractDocxText = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new AppError('Failed to parse DOCX file', 400, 'RESUME_PARSING_FAILED');
  }
};

/**
 * Parse resume file and extract text based on MIME type
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - MIME type of the file
 * @param {string} originalName - Original filename (for extension detection)
 * @returns {Promise<string>} - Extracted text from resume
 */
const parseResumeFile = async (buffer, mimeType, originalName = '') => {
  if (!buffer || buffer.length === 0) {
    throw new AppError('Resume file is empty', 400, 'FILE_NOT_FOUND');
  }

  const fileExtension = originalName ? originalName.toLowerCase().split('.').pop() : '';
  let text = '';

  // Detect file type by extension or MIME type
  if (fileExtension === 'pdf' || mimeType === 'application/pdf') {
    text = await extractPdfText(buffer);
  } else if (
    fileExtension === 'docx' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/vnd.ms-word.document.macroEnabled.12'
  ) {
    text = await extractDocxText(buffer);
  } else {
    throw new AppError('Unsupported file format. Please upload PDF or DOCX.', 400, 'INVALID_RESUME_FORMAT');
  }

  if (!text || text.trim().length === 0) {
    throw new AppError('Failed to extract text from resume file', 400, 'RESUME_PARSING_FAILED');
  }

  return text.trim();
};

/**
 * Clean and normalize extracted text for embedding
 * @param {string} text - Raw extracted text
 * @returns {string} - Cleaned text
 */
const cleanText = (text) => {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n+/g, ' ') // Replace newlines with space
    .trim();
};

module.exports = {
  parseResumeFile,
  cleanText,
};
