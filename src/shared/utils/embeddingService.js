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
 * Generate explanation for job-resume match using Grok API
 * Falls back to rule-based explanation if Grok is unavailable
 * @param {string} resumeText - The resume text
 * @param {object} job - Job object with title and description
 * @returns {Promise<string>} - Explanation of why they match
 */
const generateExplanation = async (resumeText, job) => {
  if (!resumeText || !job || !job.title || !job.description) {
    throw new AppError('Invalid input for explanation generation', 400, 'INVALID_INPUT');
  }

  if (!process.env.GROQ_API_KEY) {
    throw new AppError('Groq API key not configured.', 500, 'EXPLANATION_GENERATION_FAILED');
  }

  try {
    // Simplified and focused prompt - only asking for the explanation without repeating the full context
    const prompt = `You are a professional recruiter. Explain in 2-3 sentences why this candidate is a good match for the job.

Job: ${job.title}
Focus: ${job.description.substring(0, 300)}

Only respond with 2-3 sentences. No introduction, no repeated job posting details. Direct explanation only.`;

    // Updated to Groq Endpoint
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_completion_tokens: 150, // Reduced to prevent verbose responses
        temperature: 0.5, // Lower temperature for more focused outputs
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API error:', data);

      // If you hit a rate limit (common on free tier), use the fallback
      if (response.status === 429) {
        console.warn('Groq Rate limit hit. Using fallback.');
        return generateFallbackExplanation(resumeText, job);
      }

      throw new AppError(
        `Groq API error: ${data.error?.message || 'Unknown error'}`,
        response.status,
        'EXPLANATION_GENERATION_FAILED'
      );
    }

    let explanation = data.choices?.[0]?.message?.content?.trim();

    // Clean up the explanation - remove any prompt artifacts
    if (explanation) {
      // Remove any parts that look like repeated context
      explanation = explanation.replace(/Job Posting:|Job Title:|Job Description:/gi, '');
      explanation = explanation.replace(/Resume:|Candidate:|Experience:/gi, '');

      // Remove any markdown code blocks if they appear
      explanation = explanation.replace(/```[\s\S]*?```/g, '');

      // Clean up excessive whitespace and leading/trailing punctuation
      explanation = explanation.trim().replace(/^\s*[-•]\s*/, '').trim();

      // If explanation is empty after cleaning, use fallback
      if (explanation && explanation.length > 10) {
        return explanation;
      }
    }

    return generateFallbackExplanation(resumeText, job);

  } catch (error) {
    if (error instanceof AppError) throw error;

    console.error('Explanation generation error:', error);
    return generateFallbackExplanation(resumeText, job);
  }
};

/**
 * Generate a rule-based explanation when Groq API is unavailable
 * @param {string} resumeText - The resume text
 * @param {object} job - Job object with title and description
 * @returns {string} - Fallback explanation
 */
const generateFallbackExplanation = (resumeText, job) => {
  const resumeLower = resumeText.toLowerCase();
  const titleLower = job.title.toLowerCase();
  const descLower = job.description.toLowerCase();

  // Extract key skills that match between resume and job
  const skillKeywords = ['javascript', 'node', 'react', 'python', 'java', 'aws', 'docker', 'kubernetes', 'sql', 'mongodb', 'api', 'rest', 'microservices', 'devops', 'ci/cd', 'terraform', 'openstack', 'kvm', 'openvz', 'linux', 'cloud', 'infrastructure', 'virtualization', 'containerization'];
  const matchedSkills = skillKeywords.filter(skill => resumeLower.includes(skill) && descLower.includes(skill));

  // Extract years of experience if mentioning specific years
  const yearsMatch = resumeText.match(/(\d+)\s*\+?\s*years/i);
  const yearsExp = yearsMatch ? yearsMatch[1] : null;

  // Build explanation based on matched skills
  if (matchedSkills.length >= 2) {
    return `This candidate demonstrates strong expertise in ${matchedSkills.slice(0, 2).join(' and ')}, which directly align with the ${titleLower} role requirements. Their proven experience in implementing and managing these technologies positions them as a strong fit for this position.`;
  } else if (matchedSkills.length === 1) {
    return `With demonstrated expertise in ${matchedSkills[0]}, this candidate meets a key requirement for the ${titleLower} position. Their background in related infrastructure and systems management makes them a viable candidate for this role.`;
  } else if (yearsExp) {
    return `This candidate brings substantial experience as a ${titleLower} with proven track record of managing critical systems. Their ${yearsExp}+ years in the field position them well to understand and address the technical challenges outlined in the job description.`;
  }

  return `This candidate's professional background and technical expertise align well with the ${titleLower} position. Their experience in designing and managing infrastructure demonstrates readiness for the responsibilities outlined in this role.`;
};


module.exports = {
  generateEmbedding,
  generateExplanation,
};
