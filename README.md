# SkillSync AI - Intelligent Job Matching Platform

<div align="center">

![SkillSync AI](https://img.shields.io/badge/SkillSync-AI%20Powered-4CAF50?style=for-the-badge&logo=openai&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.18-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

**An AI-powered job matching platform that uses semantic embeddings and LLM-based reranking to connect job seekers with their ideal opportunities.**

[Live Demo](https://skillsync-ai-snowy.vercel.app) | [API Documentation](#api-endpoints) | [Architecture](#system-architecture)

</div>

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [AI/ML Pipeline](#aiml-pipeline---the-brain-of-skillsync)
- [Modules Deep Dive](#modules-deep-dive)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Deployment Architecture](#deployment-architecture)
- [Why These Technologies?](#why-these-technologies)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

---

## Project Overview

**SkillSync AI** is a full-stack intelligent job matching platform that revolutionizes how job seekers find relevant opportunities. Unlike traditional keyword-based job search, SkillSync uses **semantic understanding** through AI embeddings to match resumes with job descriptions based on actual skill alignment, experience relevance, and role compatibility.

### The Problem We Solve

Traditional job boards rely on keyword matching, which often results in:
- Irrelevant job recommendations
- Missed opportunities due to different terminology (e.g., "Frontend Developer" vs "UI Engineer")
- Time wasted reviewing unsuitable positions

### Our Solution

SkillSync AI uses a **Two-Stage AI Pipeline**:
1. **Semantic Embedding Search** - Convert resumes and jobs into 768-dimensional vectors for meaning-based similarity
2. **LLM Reranking** - Use Llama 3.3 70B to verify matches and provide human-readable explanations

---

## Key Features

### For Job Seekers

| Feature | Description |
|---------|-------------|
| **AI Resume Parsing** | Upload PDF/DOCX resumes with automatic text extraction |
| **Smart Job Matching** | Get personalized job matches with AI-generated explanations |
| **Match Scoring** | See 0-100 compatibility scores for each job |
| **Easy Apply** | One-click applications with auto-filled contact info |
| **Application Tracking** | Monitor all submitted applications in one place |
| **Screening Questions** | AI-generated job-specific questions for better applications |

### For the Platform

| Feature | Description |
|---------|-------------|
| **Multi-Source Job Aggregation** | Jobs from 45+ top tech companies via Greenhouse, Remotive, RemoteOK |
| **Automatic Skill Extraction** | 100+ skills identified from job descriptions |
| **Category Classification** | Jobs auto-categorized (Engineering, Design, Marketing, etc.) |
| **Email Notifications** | OTP verification and application confirmation emails |
| **Social Authentication** | Google and Apple Sign-In via Firebase |

---

## System Architecture

```
                                    SkillSync AI Architecture

    +-----------------------------------------------------------------------------------+
    |                                   FRONTEND (Vercel)                               |
    |                               React + Vite + Tailwind                             |
    |                         https://skillsync-ai-snowy.vercel.app                     |
    +-----------------------------------------------------------------------------------+
                                            |
                                            | HTTPS/REST API
                                            v
    +-----------------------------------------------------------------------------------+
    |                                   BACKEND (Vercel)                                |
    |                              Node.js + Express.js                                 |
    |                        Serverless Functions Architecture                          |
    +-----------------------------------------------------------------------------------+
    |                                                                                   |
    |   +-------------+  +-------------+  +-------------+  +-------------+  +---------+ |
    |   |    Auth     |  |    Jobs     |  |   Resumes   |  |   Matches   |  |  Easy   | |
    |   |   Module    |  |   Module    |  |   Module    |  |   Module    |  |  Apply  | |
    |   +-------------+  +-------------+  +-------------+  +-------------+  +---------+ |
    |         |                |                |                |              |       |
    +-----------------------------------------------------------------------------------+
                  |                    |                    |
                  v                    v                    v
    +------------------+    +------------------+    +------------------+
    |   Google Gemini  |    |    Groq API      |    |   Cloudinary     |
    |   (Embeddings)   |    |   (LLM/Llama)    |    |   (File Storage) |
    |  768-dim vectors |    | Scoring + Q&A    |    |  Images/Resumes  |
    +------------------+    +------------------+    +------------------+
                                    |
                                    v
    +-----------------------------------------------------------------------------------+
    |                              DATABASE (Railway)                                   |
    |                                   MySQL 8.0                                       |
    |                              Prisma ORM Layer                                     |
    +-----------------------------------------------------------------------------------+
    |  Users | Jobs | Resumes | MatchResults | Applications | ScreeningQuestions | OTP  |
    +-----------------------------------------------------------------------------------+
```

### Request Flow Example: Job Matching

```
1. User uploads resume (PDF/DOCX)
           |
           v
2. File Parser extracts text (pdf-parse / mammoth)
           |
           v
3. Text sent to Google Gemini for embedding generation
           |
           v
4. 768-dimensional vector stored in database
           |
           v
5. User requests job matches
           |
           v
6. Cosine similarity calculated against all job embeddings
           |
           v
7. Top candidates sent to Groq/Llama for LLM reranking
           |
           v
8. Final scores (0-100) and explanations returned to user
```

---

## Technology Stack

### Backend Core

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express.js** | 4.18.2 | Web framework |
| **Prisma** | 5.22.0 | ORM for MySQL |
| **MySQL** | 8.0 | Relational database |

### AI/ML Services

| Technology | Model | Purpose |
|------------|-------|---------|
| **Google Generative AI** | gemini-embedding-001 | 768-dim embedding generation |
| **Groq API** | llama-3.3-70b-versatile | LLM reranking, scoring, contact extraction |

### Authentication & Security

| Technology | Purpose |
|------------|---------|
| **JWT (jsonwebtoken)** | Access & refresh token management |
| **bcrypt** | Password hashing (10 salt rounds) |
| **Firebase Admin** | Google/Apple social authentication |
| **Helmet** | HTTP security headers |
| **CORS** | Cross-origin resource sharing |

### File Handling & Storage

| Technology | Purpose |
|------------|---------|
| **Multer** | Multipart form data parsing |
| **pdf-parse-new** | PDF text extraction |
| **Mammoth** | DOCX text extraction |
| **Cloudinary** | Cloud storage for images/resumes |

### Email & Communication

| Technology | Purpose |
|------------|---------|
| **Nodemailer** | SMTP email sending |
| **Gmail SMTP** | Email delivery service |

### Validation & Error Handling

| Technology | Purpose |
|------------|---------|
| **Joi** | Request validation schemas |
| **Custom Error Handler** | Standardized error responses |

---

## AI/ML Pipeline - The Brain of SkillSync

### Stage 1: Embedding Generation (Google Gemini)

```javascript
// Using gemini-embedding-001 model
const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
const result = await model.embedContent(text);
const embedding = result.embedding.values; // 768-dimensional vector
```

**Why Gemini Embeddings?**
- High-quality 768-dimensional vectors
- Excellent semantic understanding
- Fast API response times
- Cost-effective for high-volume embedding generation

### Stage 2: Cosine Similarity Calculation

```javascript
// Calculate cosine similarity between resume and job embeddings
const calculateCosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magA * magB);
};
```

### Stage 3: LLM Reranking (Groq/Llama 3.3 70B)

```javascript
// Groq API call for match scoring
const prompt = `You are a strict HR Technical Recruiter. Compare the Resume and Job.
1. Assign a Match Score from 0 to 100
2. Provide a 2-3 sentence explanation.

Return ONLY JSON: {"matchScore": 75, "explanation": "..."}`;

const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  body: JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3, // Low temp for consistent scoring
  }),
});
```

**Why Llama 3.3 70B via Groq?**
- **Speed**: Groq's LPU delivers ultra-fast inference
- **Quality**: 70B parameters for nuanced understanding
- **Cost**: More affordable than OpenAI GPT-4
- **Reliability**: Consistent JSON output for structured responses

### Fallback Mechanism

When Groq API is unavailable (rate limits, outages), a rule-based fallback ensures continuity:

```javascript
const generateFallbackScore = (resumeText, job) => {
  // Skill keyword matching
  const skillKeywords = ['javascript', 'node', 'react', 'python', ...];
  const matchedSkills = skillKeywords.filter(skill =>
    resumeLower.includes(skill) && descLower.includes(skill)
  );

  // Years of experience bonus
  const yearsMatch = resumeText.match(/(\d+)\s*\+?\s*years/i);

  // Calculate score based on matches
  let matchScore = matchedSkills.length * 10 + experienceBonus;

  return { matchScore, explanation };
};
```

---

## Modules Deep Dive

### 1. Authentication Module (`/api/auth`)

**Files:** `src/modules/auth/`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/signup` | POST | Register with email/password + optional profile image |
| `/login` | POST | Email/password login |
| `/join` | POST | Firebase social login (Google/Apple) |
| `/request-otp` | POST | Request OTP for various purposes |
| `/verify-otp` | POST | Verify OTP code |
| `/forgot-password-request-otp` | POST | Password reset OTP |
| `/reset-password` | POST | Reset password (authenticated) |
| `/update-password` | POST | Change password (authenticated) |
| `/refresh-token` | POST | Refresh JWT tokens |
| `/logout` | POST | Single device logout |
| `/logout-all` | POST | All devices logout |
| `/profile` | GET | Get user profile |
| `/update-profile` | POST | Update name, gender, profile image |

**Key Features:**
- JWT-based authentication (access + refresh tokens)
- 6-digit OTP with 1-minute expiration
- Multi-device session management
- Password hashing with bcrypt (10 salt rounds)
- Firebase social authentication integration

### 2. Jobs Module (`/api/jobs`)

**Files:** `src/modules/jobs/`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | List jobs with pagination, filters, search |
| `/` | POST | Create job with auto-embedding (authenticated) |
| `/categories` | GET | Get all job categories with counts |
| `/home` | GET | Dashboard stats (authenticated) |
| `/user-matches` | GET | Get user's match results |
| `/:id` | GET | Get job detail by ID |

**Query Parameters for Job Listing:**
```
GET /api/jobs?page=1&limit=10&remote=true&category=engineering&search=react
```

**Job Data Model:**
```javascript
{
  id: 1,
  title: "Senior Frontend Developer",
  company: "Stripe",
  description: "...",
  tags: ["React", "TypeScript", "Next.js"],
  location: "San Francisco, CA",
  remote: true,
  jobType: "Full-time",
  category: "engineering",
  embedding: [0.123, -0.456, ...], // 768 dimensions
  sourceApi: "greenhouse",
  sourceUrl: "https://...",
}
```

### 3. Resumes Module (`/api/resumes`)

**Files:** `src/modules/resumes/`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Get user's resumes |
| `/upload` | POST | Upload resume (PDF/DOCX) with auto-embedding |
| `/` | DELETE | Clear all user resumes |
| `/:resumeId` | DELETE | Delete specific resume |

**Resume Processing Pipeline:**
1. **Upload** - Multer receives file, stores in memory
2. **Parse** - pdf-parse-new (PDF) or mammoth (DOCX) extracts text
3. **Clean** - Text normalized (whitespace, newlines)
4. **Embed** - Google Gemini generates 768-dim vector
5. **Store** - Resume saved with text and embedding to MySQL

### 4. Matches Module (`/api/matches`)

**Files:** `src/modules/matches/`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | POST | Calculate AI job matches for resume |
| `/resume/:resumeId` | GET | Get saved matches for resume |
| `/resume/:resumeId` | DELETE | Clear matches for resume |

**Match Calculation Pipeline:**
```
Resume Embedding → Cosine Similarity vs All Jobs → Top N Candidates
     ↓
Groq LLM Reranking → Score (0-100) + Explanation
     ↓
Filter by Threshold (min 20) → Save to MatchResult table
```

**Response Format:**
```json
{
  "resumeId": 1,
  "fileName": "john_doe_resume.pdf",
  "totalJobsAnalyzed": 1500,
  "topMatches": [
    {
      "rank": 1,
      "jobId": 42,
      "jobTitle": "Senior React Developer",
      "matchScore": 87,
      "explanation": "Strong alignment with React/TypeScript requirements. 5+ years experience matches senior-level expectations."
    }
  ]
}
```

### 5. Easy Apply Module (`/api/easy-apply`)

**Files:** `src/modules/easyApply/`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/:jobId/prefill` | GET | Get prefilled application data |
| `/contact` | PUT | Save user contact info |
| `/:jobId/submit` | POST | Submit job application |
| `/my-applications` | GET | Get user's applications |

**AI-Powered Features:**

1. **Contact Extraction from Resume:**
```javascript
const prompt = `Extract contact information from this resume text.
Return JSON: {"phone": null, "countryCode": null, "city": null, "country": null}`;
```

2. **Screening Question Generation:**
```javascript
const prompt = `Generate 4 screening questions for a ${job.title} position.
Each question must have "question" and "type" (text/yesno/number).`;
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐      ┌─────────────────┐      ┌──────────────┐
│    User     │──────│  LoggedDevices  │      │     Job      │
├─────────────┤ 1:N  ├─────────────────┤      ├──────────────┤
│ id          │      │ id              │      │ id           │
│ name        │      │ userId          │      │ title        │
│ email       │      │ refreshToken    │      │ company      │
│ passwordHash│      │ deviceModel     │      │ description  │
│ gender      │      │ fcmToken        │      │ tags (JSON)  │
│ profileImage│      │ ipAddress       │      │ embedding    │
│ provider    │      └─────────────────┘      │ category     │
│ isVerified  │                               │ remote       │
└─────────────┘                               │ sourceApi    │
       │                                      └──────────────┘
       │ 1:N                                         │
       ▼                                             │
┌─────────────┐      ┌─────────────────┐            │
│ UserResume  │      │  MatchResult    │◄───────────┘
├─────────────┤ 1:N  ├─────────────────┤
│ id          │──────│ id              │
│ userId      │      │ userId          │
│ fileName    │      │ resumeId        │
│ originalText│      │ jobId           │
│ embedding   │      │ similarityScore │
│ uploadedAt  │      │ explanation     │
└─────────────┘      └─────────────────┘

┌─────────────────────┐      ┌───────────────────────┐
│  UserContactInfo    │      │ JobScreeningQuestion  │
├─────────────────────┤      ├───────────────────────┤
│ id                  │      │ id                    │
│ userId (unique)     │      │ jobId (unique)        │
│ phone               │      │ questions (JSON)      │
│ countryCode         │      │ generatedAt           │
│ city                │      └───────────────────────┘
│ country             │
└─────────────────────┘

┌─────────────────────┐
│   JobApplication    │
├─────────────────────┤
│ id                  │
│ userId              │
│ jobId               │
│ resumeId            │
│ contactSnapshot     │
│ answers (JSON)      │
│ status              │
│ appliedAt           │
└─────────────────────┘
```

### Prisma Models

```prisma
model User {
  id              Int       @id @default(autoincrement())
  name            String
  email           String    @unique
  passwordHash    String?
  gender          Gender
  profileImage    String?
  isDeleted       Boolean   @default(false)
  isEmailVerified Boolean   @default(false)
  provider        Provider  @default(EMAIL)

  loggedDevices   LoggedDevices[]
  otp             Otp[]
  resumes         UserResume[]
  matchResults    MatchResult[]
  contactInfo     UserContactInfo?
  applications    JobApplication[]
}

model Job {
  id          Int       @id @default(autoincrement())
  title       String    @db.VarChar(255)
  company     String    @db.VarChar(255)
  description String    @db.LongText
  tags        Json?     // ["React", "Node.js"]
  location    String?
  remote      Boolean   @default(false)
  jobType     String?
  category    String?
  embedding   Json?     // 768-dim vector
  sourceApi   String    // "greenhouse", "remotive", "remoteok"
  sourceUrl   String?
  externalId  String?

  @@unique([sourceApi, externalId])
}
```

---

## API Endpoints

### Complete API Reference

```
BASE URL: https://skillsync-ai.vercel.app/api

┌────────────────────────────────────────────────────────────────┐
│                       AUTHENTICATION                           │
├────────────────────────────────────────────────────────────────┤
│ POST   /auth/signup                  Register new user         │
│ POST   /auth/login                   Email/password login      │
│ POST   /auth/join                    Firebase social login     │
│ POST   /auth/request-otp             Request OTP               │
│ POST   /auth/verify-otp              Verify OTP                │
│ POST   /auth/forgot-password-request-otp  Password reset OTP   │
│ POST   /auth/reset-password          Reset password            │
│ POST   /auth/update-password         Change password           │
│ POST   /auth/refresh-token           Refresh tokens            │
│ POST   /auth/logout                  Logout device             │
│ POST   /auth/logout-all              Logout all devices        │
│ GET    /auth/profile                 Get profile               │
│ POST   /auth/update-profile          Update profile            │
├────────────────────────────────────────────────────────────────┤
│                          JOBS                                  │
├────────────────────────────────────────────────────────────────┤
│ GET    /jobs                         List jobs (paginated)     │
│ POST   /jobs                         Create job (auth)         │
│ GET    /jobs/categories              Get categories            │
│ GET    /jobs/home                    Dashboard stats (auth)    │
│ GET    /jobs/user-matches            User's matches (auth)     │
│ GET    /jobs/:id                     Get job details           │
├────────────────────────────────────────────────────────────────┤
│                         RESUMES                                │
├────────────────────────────────────────────────────────────────┤
│ GET    /resumes                      Get user's resumes (auth) │
│ POST   /resumes/upload               Upload resume (auth)      │
│ DELETE /resumes                      Clear all resumes (auth)  │
│ DELETE /resumes/:resumeId            Delete resume (auth)      │
├────────────────────────────────────────────────────────────────┤
│                         MATCHES                                │
├────────────────────────────────────────────────────────────────┤
│ POST   /matches                      Calculate matches (auth)  │
│ GET    /matches/resume/:resumeId     Get resume matches (auth) │
│ DELETE /matches/resume/:resumeId     Clear matches (auth)      │
├────────────────────────────────────────────────────────────────┤
│                       EASY APPLY                               │
├────────────────────────────────────────────────────────────────┤
│ GET    /easy-apply/:jobId/prefill    Get prefill data (auth)   │
│ PUT    /easy-apply/contact           Save contact info (auth)  │
│ POST   /easy-apply/:jobId/submit     Submit application (auth) │
│ GET    /easy-apply/my-applications   Get applications (auth)   │
└────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

### Production Stack

```
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL (Frontend)                       │
│              https://skillsync-ai-snowy.vercel.app          │
│                    React + Vite + Tailwind                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL (Backend)                        │
│                Serverless Node.js Functions                 │
│                      Express.js + Prisma                    │
│                                                             │
│  Configuration (vercel.json):                               │
│  {                                                          │
│    "builds": [{ "src": "src/app.js", "use": "@vercel/node" }]│
│    "routes": [{ "src": "/(.*)", "dest": "src/app.js" }]     │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Prisma Client
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     RAILWAY (Database)                      │
│                        MySQL 8.0                            │
│                                                             │
│  Connection: mysql://user:pass@host.railway.app:3306/db    │
│  Features:                                                  │
│  - Automatic backups                                        │
│  - SSL connections                                          │
│  - Scalable compute                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ File Storage
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     CLOUDINARY (Storage)                    │
│                                                             │
│  Folders:                                                   │
│  - skillsync/profile     (profile images)                   │
│  - skillsync/resumes     (resume files)                     │
│                                                             │
│  Why Cloudinary?                                            │
│  - Serverless compatible (no local file system)             │
│  - CDN delivery for fast access                             │
│  - Automatic image optimization                             │
└─────────────────────────────────────────────────────────────┘
```

### Why Vercel + Railway?

| Aspect | Vercel | Railway |
|--------|--------|---------|
| **Use Case** | Frontend + Backend hosting | Database hosting |
| **Scaling** | Auto-scales with traffic | Managed MySQL scaling |
| **Cost** | Free tier available | Free tier ($5 credit) |
| **DX** | Git-based deployments | One-click provisioning |
| **SSL** | Automatic HTTPS | Automatic SSL |

---

## Why These Technologies?

### Why Google Gemini for Embeddings?

| Alternative | Why Not? |
|-------------|----------|
| OpenAI Ada | Higher cost at scale |
| Cohere | Slightly lower quality |
| Self-hosted | Infrastructure overhead |

**Gemini Advantages:**
- Free tier available (generous limits)
- 768 dimensions (good balance of quality/size)
- Fast API response times
- Google's semantic understanding quality

### Why Groq + Llama 3.3 70B?

| Alternative | Why Not? |
|-------------|----------|
| OpenAI GPT-4 | 10x more expensive |
| Claude | API availability in some regions |
| Self-hosted LLM | Requires GPU infrastructure |

**Groq Advantages:**
- Ultra-fast inference (LPU architecture)
- Llama 3.3 70B quality at fraction of cost
- Consistent JSON output
- Generous free tier

### Why Prisma over Raw SQL?

- **Type Safety:** Auto-generated TypeScript types
- **Migrations:** Version-controlled schema changes
- **Relations:** Easy eager loading with `include`
- **DX:** Prisma Studio for database visualization

### Why Railway for MySQL?

- **Managed Service:** No server maintenance
- **Free Tier:** $5/month free credit
- **One-Click:** Deploy MySQL in seconds
- **Connection Pooling:** Built-in for serverless

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- MySQL 8.0+ (or Railway account)
- Cloudinary account
- Google Cloud account (for Gemini API)
- Groq account (for LLM)

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/skillsync-ai.git
cd skillsync-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file (see [Environment Variables](#environment-variables) section)

### 4. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial job data (optional)
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

---

## Environment Variables

```env
# Application
NODE_ENV=development
PORT=3000
APP_NAME=SkillSync AI
BASE_URL=http://localhost:3000

# Database (Railway MySQL)
DATABASE_URL="mysql://user:password@host.railway.app:3306/skillsync"

# JWT Authentication
ACCESS_SECRET=your-super-secret-access-key
REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRES_IN=8d
JWT_REFRESH_EXPIRES_IN=7d

# Firebase (Social Auth)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"..."}' # JSON string

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=SkillSync AI

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AI APIs
GEMINI_API_KEY=your-google-gemini-api-key
GROQ_API_KEY=your-groq-api-key
```

---

## Job Seeding System

SkillSync automatically aggregates jobs from multiple sources:

### Data Sources

| Source | API | Companies/Categories |
|--------|-----|---------------------|
| **Greenhouse** | `api.greenhouse.io` | Stripe, Notion, Figma, OpenAI, Vercel, Airbnb, Shopify (45+ companies) |
| **Remotive** | `remotive.com/api` | 9 categories (software-dev, design, marketing, etc.) |
| **RemoteOK** | `remoteok.com/api` | Remote jobs aggregator |

### Seeding Process

```bash
npm run db:seed
```

**What it does:**
1. Fetches jobs from all APIs
2. Strips HTML from descriptions
3. Filters non-English content
4. Extracts skills using 100+ regex patterns
5. Infers category from job title
6. Deduplicates by source + externalId
7. Generates Gemini embeddings
8. Saves to database

### Skill Extraction

```javascript
const skillMap = {
  'JavaScript': /\bjavascript\b/,
  'React': /\breact\.?js\b|\breact\b/,
  'Node.js': /\bnode\.?js\b/,
  'Python': /\bpython\b/,
  'AWS': /\baws\b|\bamazon web services\b/,
  // ... 100+ more skills
};
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server (nodemon) |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed jobs from APIs |

---

## Project Structure

```
SkillSync_AI/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.js                # Job seeding script
│   └── migrations/            # Migration history
├── src/
│   ├── app.js                 # Express application entry
│   ├── config/
│   │   ├── index.js           # Environment config
│   │   ├── database.js        # Prisma client
│   │   └── firebase.json      # Firebase config
│   ├── modules/
│   │   ├── auth/              # Authentication module
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── middleware/
│   │   ├── jobs/              # Jobs module
│   │   ├── resumes/           # Resumes module
│   │   ├── matches/           # AI matching module
│   │   └── easyApply/         # Easy apply module
│   └── shared/
│       ├── constants/         # Error codes, Joi errors
│       ├── middleware/        # Error handler, validation
│       └── utils/             # Embedding, parsing, upload utilities
├── vercel.json                # Vercel deployment config
├── package.json
└── README.md
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - feel free to use this project for learning and building.

---

<div align="center">

**Built with AI at the core**

Made with love by the Adeen Hussain

</div>
