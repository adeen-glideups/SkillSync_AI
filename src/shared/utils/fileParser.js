const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const AppError = require('../middleware/errorHandler').AppError;

console.log('✅ PDF and DOCX parsers loaded successfully');

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} - Extracted text from PDF
 */
const extractPdfText = async (filePath) => {
  try {
    // Dynamically import pdfjs-dist ES module
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdfjsLib = pdfjs.default || pdfjs;

    const dataBuffer = fs.readFileSync(filePath);
    // Convert Buffer to Uint8Array for pdfjs-dist
    const uint8Array = new Uint8Array(dataBuffer);
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let fullText = '';

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => (item.str ? item.str : ''))
          .join(' ');
        fullText += pageText + ' ';
      } catch (pageError) {
        console.warn(`Warning: Could not extract text from page ${i}`);
        continue;
      }
    }

    if (!fullText || fullText.trim().length === 0) {
      throw new Error('No text extracted from PDF');
    }

    return fullText.trim();
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
 * Extract text from DOCX file
 * @param {string} filePath - Path to DOCX file
 * @returns {Promise<string>} - Extracted text from DOCX
 */
const extractDocxText = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new AppError('Failed to parse DOCX file', 400, 'RESUME_PARSING_FAILED');
  }
};

/**
 * Parse resume file and extract text based on file extension or MIME type
 * @param {string} filePath - Path to the uploaded file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} - Extracted text from resume
 */
const parseResumeFile = async (filePath, mimeType) => {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new AppError('Resume file not found', 400, 'FILE_NOT_FOUND');
  }

  const fileExtension = path.extname(filePath).toLowerCase();
  let text = '';

  // Detect file type by extension or MIME type
  if (fileExtension === '.pdf' || mimeType === 'application/pdf') {
    text = await extractPdfText(filePath);
  } else if (
    fileExtension === '.docx' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/vnd.ms-word.document.macroEnabled.12'
  ) {
    text = await extractDocxText(filePath);
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
