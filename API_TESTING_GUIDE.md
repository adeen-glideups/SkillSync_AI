# SkillSync AI - Job Matching Engine Testing Guide

## Database Setup ✅
Database migration completed successfully! Tables created:
- `Job` - Job postings with embeddings
- `UserResume` - User resumes with embeddings
- `MatchResult` - Historical match results

---

## Postman Collection Import

### Import Steps:
1. Open Postman
2. Click **Import** (top-left)
3. Select file: `SkillSync_AI_Postman_Collection.json`
4. Collection imported with all endpoints pre-configured

### Environment Variables:
Collection includes 4 variables that auto-populate:
- `base_url` - `http://localhost:3000`
- `access_token` - Auto-saved after login
- `user_id` - Auto-saved after login
- `resume_id` - Auto-saved after resume upload

---

## Testing Workflow

### 1️⃣ Authentication (Start Here)
**Run in order:**

**a) Signup**
- Endpoint: `POST /api/auth/signup`
- Creates test account
- Response includes `accessToken`

**b) Login**
- Endpoint: `POST /api/auth/login`
- Use credentials from signup
- ✅ Auto-saves `access_token` to environment
- ✅ Auto-saves `user_id` to environment

---

### 2️⃣ Create Test Jobs
**Run any 5 Job Creation endpoints:**

- `POST /api/jobs` - Senior Backend Engineer
- `POST /api/jobs` - React Frontend Developer
- `POST /api/jobs` - Full Stack Developer
- `POST /api/jobs` - DevOps Engineer
- `POST /api/jobs` - Machine Learning Engineer

**What happens:**
- Each job description is sent to Google's `text-embedding-004` model
- 768-dimensional embedding vector generated and stored in database
- Job saved to `Job` table with embedding

**Check Prisma Studio:**
```bash
npm run db:studio
# Navigate to Job table
# You should see 5 jobs with embedding JSON arrays (768 numbers each)
```

---

### 3️⃣ Upload Resume
**Endpoint:** `POST /api/resumes/upload`

**Steps:**
1. Click the endpoint in Postman
2. Go to **Body** tab → **form-data**
3. Click file upload button next to "resume" field
4. Select a PDF or DOCX file from your computer
5. Send request

**What happens:**
- File parsed (text extracted from PDF/DOCX)
- Text sent to Google API for embedding generation
- Resume saved to `UserResume` table with embedding
- ✅ Auto-saves `resume_id` to environment
- Any old resumes for user are deleted (keeps only latest)

**Supported formats:**
- `.pdf` - PDF documents
- `.docx` - Word documents

---

### 4️⃣ Get Job Matches 🎯
**Endpoint:** `POST /api/matches`

**Request body:**
```json
{
  "topN": 5
}
```

**What happens:**
1. Fetches your latest resume
2. Fetches all jobs from database
3. Calculates cosine similarity (pure math) for each job
4. Ranks jobs by similarity score (0-1, where 1 = perfect match)
5. For top 5 jobs, sends to Google's `gemini-1.5-flash` model
6. Gemini generates AI explanation: "Why this job matches your skills"
7. Results saved to `MatchResult` table
8. Returns top matches with scores + explanations

**Response example:**
```json
{
  "success": true,
  "message": "Matching completed successfully",
  "data": {
    "resumeId": 1,
    "totalJobsAnalyzed": 5,
    "topMatches": [
      {
        "rank": 1,
        "jobId": 3,
        "jobTitle": "Senior Backend Engineer",
        "similarityScore": 0.87,
        "explanation": "Your Node.js and database experience strongly aligns with this role..."
      },
      {
        "rank": 2,
        "jobId": 1,
        "jobTitle": "Full Stack Developer",
        "similarityScore": 0.74,
        "explanation": "..."
      }
    ]
  }
}
```

---

## Complete Testing Sequence

**Copy-paste this sequence into Postman:**

```
1. 🔐 Authentication
   └─ 1. Signup
   └─ 2. Login (saves access_token)

2. 💼 Jobs Management (Create 5 Jobs)
   └─ 1. Create Job - Senior Backend Engineer
   └─ 2. Create Job - React Frontend Developer
   └─ 3. Create Job - Full Stack Developer
   └─ 4. Create Job - DevOps Engineer
   └─ 5. Create Job - Machine Learning Engineer

3. 📄 Resume Management
   └─ 1. Upload Resume (select your PDF/DOCX file) [saves resume_id]

4. 🎯 Job Matching Engine
   └─ 1. Get Job Matches - Top 5 (topN: 5)
   └─ 2. Get Top 3 Matches (topN: 3)
```

---

## Verify Everything Works

### Check Jobs Created
```bash
npm run db:studio
# Navigate to Job table
# Should see 5 jobs with embeddings
```

### Check Resume Uploaded
```bash
npm run db:studio
# Navigate to UserResume table
# Should see 1 resume with embedding + original text
```

### Check Match Results Saved
```bash
npm run db:studio
# Navigate to MatchResult table
# Should see 5 match results with scores + explanations
```

---

## API Endpoints Summary

### Jobs
- **POST** `/api/jobs` - Create job with auto-generated embedding
  - Required: Authentication (Bearer token)
  - Body: `{ title, description }`
  - Response: 201 Created

### Resumes
- **POST** `/api/resumes/upload` - Upload resume with auto-generated embedding
  - Required: Authentication (Bearer token)
  - Body: multipart form-data with "resume" file (PDF/DOCX)
  - Response: 201 Created

### Matches
- **POST** `/api/resumes/match` - Get top matching jobs with AI explanations
  - Required: Authentication (Bearer token)
  - Body: `{ topN: 5 }` (optional, default 5, max 10)
  - Response: 200 OK with matches + explanations

---

## Troubleshooting

### ❌ "No resume found for this user"
- **Fix**: Upload a resume first using `/api/resumes/upload`

### ❌ "No jobs available for matching"
- **Fix**: Create at least 1 job using `/api/jobs`

### ❌ "Unauthorized" / 401 Error
- **Fix**: Make sure you're logged in and `access_token` is set in environment
- Re-run the Login endpoint to refresh token

### ❌ "Invalid resume format"
- **Fix**: Upload a valid PDF or DOCX file (not PPTX, TXT, etc.)

### ❌ Gemini API errors
- **Fix**: Make sure `GEMINI_API_KEY` is set correctly in `.env`
- Key should be from https://aistudio.google.com

### ❌ Connection refused on localhost:3000
- **Fix**: Start server with `npm run dev`

---

## Performance Notes

- **Job embedding generation**: ~1-2 seconds per job
- **Resume parsing + embedding**: ~2-3 seconds
- **Top 5 matches calculation**: ~3-5 seconds total
  - Similarity scoring: <100ms for 5 jobs
  - Gemini AI explanations: ~2-4 seconds (5 API calls)
- **Database save**: <100ms

---

## What's Happening Under the Hood

### Embeddings Flow:
```
Job/Resume Text
    ↓
Google Gemini API (text-embedding-004)
    ↓
768-dimensional vector [0.12, -0.45, 0.78, ...]
    ↓
Stored in database as JSON
```

### Matching Flow:
```
Resume Embedding + All Job Embeddings
    ↓
Calculate Cosine Similarity (pure math, no library)
    ↓
Rank by similarity score (0-1)
    ↓
Take top 5 results
    ↓
For each top result: Send to Gemini Flash for explanation
    ↓
Save to MatchResult table
    ↓
Return to frontend with scores + explanations
```

---

## Next Steps

1. ✅ Test all endpoints in Postman
2. ✅ Verify data in Prisma Studio
3. ✅ Connect frontend to the 3 endpoints
4. ✅ Add rate limiting if needed
5. ✅ Add more job seeding for production
6. ✅ Consider caching embeddings for performance

---

## Questions?

All endpoints follow the established error handling pattern:
```json
{
  "success": false,
  "message": "User-friendly error message",
  "errorCode": "ERROR_CODE"
}
```

Status codes:
- 200 - Success (GET/match)
- 201 - Created (POST new resources)
- 400 - Bad Request (validation errors)
- 401 - Unauthorized (auth required)
- 404 - Not Found (resource missing)
- 500 - Server Error (contact support)
