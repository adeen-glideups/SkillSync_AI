const { GoogleGenerativeAI } = require('@google/generative-ai');
const AppError = require('../middleware/errorHandler').AppError;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate embedding for given text using Voyage AI's voyage-3.5-lite model
 * @param {string} text - The text to embed
 * @returns {Promise<Array<number>>} - 512-dimensional embedding vector
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
 * Generate match score and explanation using Groq API
 * Uses LLM as a reranker to verify embeddings (Two-Stage Pipeline)
 * @param {string} resumeText - The resume text
 * @param {object} job - Job object with title and description
 * @returns {Promise<object>} - Object with matchScore (0-100) and explanation
 */
const generateExplanation = async (resumeText, job) => {
  if (!resumeText || !job || !job.title || !job.description) {
    throw new AppError('Invalid input for explanation generation', 400, 'INVALID_INPUT');
  }

  if (!process.env.GROQ_API_KEY) {
    throw new AppError('Groq API key not configured.', 500, 'EXPLANATION_GENERATION_FAILED');
  }

  try {
    // Prompt Groq to act as a reranker: assign a score AND provide explanation
    const prompt = `You are a strict HR Technical Recruiter. Compare the Resume and Job below.
1. Assign a Match Score from 0 to 100 (0=no match, 50=moderate, 100=perfect fit).
2. Provide a 2-3 sentence explanation.

RESUME:
${resumeText.substring(0, 600)}

JOB: ${job.title}
REQUIREMENTS: ${job.description.substring(0, 400)}

Return ONLY this JSON format (no other text):
{"matchScore": 75, "explanation": "Your explanation here in 2-3 sentences"}`;

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
        max_completion_tokens: 200,
        temperature: 0.3, // Lower temp for consistent scoring
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API error:', data);

      if (response.status === 429) {
        console.warn('Groq Rate limit hit. Using fallback scoring.');
        return generateFallbackScore(resumeText, job);
      }

      throw new AppError(
        `Groq API error: ${data.error?.message || 'Unknown error'}`,
        response.status,
        'EXPLANATION_GENERATION_FAILED'
      );
    }

    let responseText = data.choices?.[0]?.message?.content?.trim();

    if (!responseText) {
      return generateFallbackScore(resumeText, job);
    }

    // Extract JSON from response (in case there's extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('Could not parse Groq response as JSON:', responseText);
      return generateFallbackScore(resumeText, job);
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate and normalize the score
    const matchScore = Math.max(0, Math.min(100, parseInt(result.matchScore) || 0));
    const explanation = (result.explanation || '').trim();

    if (!explanation || explanation.length < 10) {
      return generateFallbackScore(resumeText, job);
    }

    return {
      matchScore,
      explanation,
    };

  } catch (error) {
    if (error instanceof AppError) throw error;

    console.error('Explanation generation error:', error);
    return generateFallbackScore(resumeText, job);
  }
};

/**
 * Generate a fallback score and explanation when Groq API is unavailable
 * Uses direct skill matching to assign a score (0-100)
 * @param {string} resumeText - The resume text
 * @param {object} job - Job object with title and description
 * @returns {object} - Object with matchScore and explanation
 */
const generateFallbackScore = (resumeText, job) => {
  const resumeLower = resumeText.toLowerCase();
  const titleLower = job.title.toLowerCase();
  const descLower = job.description.toLowerCase();

  // Extract key skills that match between resume and job
  const skillKeywords = ['javascript', 'node', 'react', 'python', 'java', 'aws', 'docker', 'kubernetes', 'sql', 'mongodb', 'api', 'rest', 'microservices', 'devops', 'ci/cd', 'terraform', 'openstack', 'kvm', 'openvz', 'linux', 'cloud', 'infrastructure', 'virtualization', 'containerization', 'typescript', 'nodejs', 'express', 'mysql', 'postgresql', 'redis', 'git', 'agile', 'scrum', 'junit', 'jest', 'testing'];

  const matchedSkills = skillKeywords.filter(skill => resumeLower.includes(skill) && descLower.includes(skill));

  // Extract years of experience if mentioning specific years
  const yearsMatch = resumeText.match(/(\d+)\s*\+?\s*years/i);
  const yearsExp = yearsMatch ? parseInt(yearsMatch[1]) : 0;

  // Calculate match score based on skills and experience
  let matchScore = 0;

  // Each matched skill adds points
  matchScore += Math.min(20, matchedSkills.length * 10); // Up to 20 points for skills

  // Years of experience adds points
  if (yearsExp >= 5) matchScore += 25;
  else if (yearsExp >= 3) matchScore += 15;
  else if (yearsExp >= 1) matchScore += 10;

  // Check for relevant job titles in resume
  const relevantTitles = titleLower.split(/\s+/).filter(word => word.length > 3);
  const titleMatches = relevantTitles.filter(title => resumeLower.includes(title)).length;
  matchScore += Math.min(20, titleMatches * 10);

  // Check for degree or certifications
  if (resumeLower.includes('degree') || resumeLower.includes('bachelor') || resumeLower.includes('master') || resumeLower.includes('certification')) {
    matchScore += 10;
  }

  // Cap at 100
  matchScore = Math.min(100, matchScore);

  // Build explanation based on matched skills
  let explanation = '';

  if (matchedSkills.length >= 2) {
    explanation = `This candidate demonstrates expertise in ${matchedSkills.slice(0, 2).join(' and ')}, which directly align with the ${titleLower} role. Their background positions them as a suitable candidate for this position.`;
  } else if (matchedSkills.length === 1) {
    explanation = `With expertise in ${matchedSkills[0]}, this candidate meets a key requirement for the ${titleLower} position. Additional relevant experience would strengthen their candidacy.`;
  } else if (yearsExp > 0) {
    explanation = `This candidate brings ${yearsExp}+ years of professional experience. However, their specific technical skills may need further evaluation against this ${titleLower} role's requirements.`;
  } else {
    explanation = `This candidate's professional background may be relevant to the ${titleLower} position. A detailed review of their specific skills is recommended.`;
  }

  return {
    matchScore,
    explanation,
  };
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
