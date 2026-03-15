# SkillSync AI - API Documentation

**Base URL:** `http://localhost:<PORT>/api`

**Authentication:** Endpoints marked with `Auth: Yes` require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

**Standard Response Format:**

```json
{
  "success": true,
  "message": "Description of result",
  "data": { ... }
}
```

**Error Response Format:**

```json
{
  "success": false,
  "message": "Error description",
  "error_code": "ERROR_CODE"
}
```

---

## 1. Auth Module (`/api/auth`)

### 1.1 Signup

```
POST /api/auth/signup
Auth: No
Content-Type: multipart/form-data
```

| Field          | Type   | Required | Notes                              |
| -------------- | ------ | -------- | ---------------------------------- |
| email          | string | Yes      | Valid email                        |
| password       | string | Yes      | Min 8 characters                   |
| name           | string | Yes      |                                    |
| gender         | string | Yes      | `male`, `female`, or `other`       |
| profileImage   | file   | No       | Image file (handled by multer)     |

**Response:**

```json
{
  "success": true,
  "message": "Signup successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "gender": "male",
      "profileImage": "/uploads/profiles/image.jpg",
      "isEmailVerified": false
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

---

### 1.2 Login

```
POST /api/auth/login
Auth: No
Content-Type: application/json
```

**Body:**

```json
{
  "email": "john@example.com",
  "password": "password123",
  "deviceType": "android",
  "fcmToken": "optional_fcm_token"
}
```

| Field      | Type   | Required | Notes            |
| ---------- | ------ | -------- | ---------------- |
| email      | string | Yes      | Valid email      |
| password   | string | Yes      |                  |
| deviceType | string | No       |                  |
| fcmToken   | string | No       | For push notifs  |

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": 1, "name": "John Doe", "email": "john@example.com", ... },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

---

### 1.3 Firebase Social Login (Google/Apple)

```
POST /api/auth/join
Auth: No
Content-Type: application/json
```

**Body:**

```json
{
  "firebaseToken": "firebase_id_token_here"
}
```

---

### 1.4 Request OTP

```
POST /api/auth/request-otp
Auth: No
Content-Type: application/json
```

**Body:**

```json
{
  "email": "john@example.com",
  "purpose": "VERIFYEMAIL"
}
```

| Field   | Type   | Required | Valid Values                                                              |
| ------- | ------ | -------- | ------------------------------------------------------------------------- |
| email   | string | Yes      |                                                                           |
| purpose | string | Yes      | `LOGIN`, `VERIFYEMAIL`, `VERIFYPHONE`, `FORGOTPASSWORD`, `UPDATEPASSWORD`, `DELETEACCOUNT` |

---

### 1.5 Verify OTP

```
POST /api/auth/verify-otp
Auth: No
Content-Type: application/json
```

**Body:**

```json
{
  "email": "john@example.com",
  "otp": "123456",
  "purpose": "VERIFYEMAIL"
}
```

| Field   | Type   | Required | Notes                     |
| ------- | ------ | -------- | ------------------------- |
| email   | string | Yes      |                           |
| otp     | string | Yes      | Exactly 6 characters      |
| purpose | string | Yes      | Same values as Request OTP |

---

### 1.6 Forgot Password - Request OTP

```
POST /api/auth/forgot-password-request-otp
Auth: No
Content-Type: application/json
```

**Body:**

```json
{
  "email": "john@example.com"
}
```

---

### 1.7 Update Password

```
POST /api/auth/update-password
Auth: Yes
Content-Type: application/json
```

**Body:**

```json
{
  "oldPassword": "current_password",
  "newPassword": "new_password123"
}
```

| Field       | Type   | Required | Notes            |
| ----------- | ------ | -------- | ---------------- |
| oldPassword | string | Yes      | Min 8 characters |
| newPassword | string | Yes      | Min 8 characters |

---

### 1.8 Refresh Token

```
POST /api/auth/refresh-token
Auth: No
Content-Type: application/json
```

**Body:**

```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

---

### 1.9 Logout (Single Device)

```
POST /api/auth/logout
Auth: No
Content-Type: application/json
```

**Body:**

```json
{
  "refreshToken": "eyJhbGci..."
}
```

---

### 1.10 Logout All Devices

```
POST /api/auth/logout-all
Auth: Yes
```

No body required.

---

### 1.11 Update Profile

```
POST /api/auth/update-profile
Auth: Yes
Content-Type: multipart/form-data
```

| Field              | Type    | Required | Notes                           |
| ------------------ | ------- | -------- | ------------------------------- |
| name               | string  | No       |                                 |
| gender             | string  | No       | `male`, `female`, or `other`    |
| profileImage       | file    | No       | New profile image               |
| removeProfileImage | boolean | No       | Set `true` to clear the image   |

---

## 2. Jobs Module (`/api/jobs`)

### 2.1 List Jobs (Paginated + Filters)

```
GET /api/jobs
Auth: No
```

**Query Parameters:**

| Param    | Type    | Default | Notes                                                    |
| -------- | ------- | ------- | -------------------------------------------------------- |
| page     | number  | 1       | Min 1                                                    |
| limit    | number  | 10      | Min 1, Max 50                                            |
| search   | string  | -       | Searches across job title, company name, and tags        |
| remote   | boolean | -       | `true` = remote only, `false` = onsite only, omit = all  |
| category | string  | -       | Filter by category (e.g. `"engineering"`, `"design"`)    |
| jobType  | string  | -       | Filter by job type (e.g. `"full-time"`, `"contract"`)    |

**Example Request:**

```
GET /api/jobs?page=1&limit=10&search=react&remote=true&category=engineering
```

**Response:**

```json
{
  "success": true,
  "message": "Jobs fetched successfully",
  "data": {
    "jobs": [
      {
        "id": 1,
        "title": "Senior React Developer",
        "company": "TechCorp",
        "tags": ["React", "TypeScript", "Node.js"],
        "location": "San Francisco, CA",
        "remote": true,
        "jobType": "full-time",
        "category": "engineering",
        "sourceUrl": "https://boards.greenhouse.io/...",
        "postedAt": "2026-03-10T00:00:00.000Z",
        "createdAt": "2026-03-12T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15
    }
  }
}
```

---

### 2.2 Get All Categories

```
GET /api/jobs/categories
Auth: No
```

**Response:**

```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "data": {
    "categories": [
      { "name": "engineering", "count": 245 },
      { "name": "design", "count": 89 },
      { "name": "marketing", "count": 56 },
      { "name": "product", "count": 43 },
      { "name": "data", "count": 38 },
      { "name": "sales", "count": 27 }
    ]
  }
}
```

---

### 2.3 Get Job Detail

```
GET /api/jobs/:id
Auth: No
```

**URL Params:**

| Param | Type   | Required | Notes                  |
| ----- | ------ | -------- | ---------------------- |
| id    | number | Yes      | Positive integer       |

**Example Request:**

```
GET /api/jobs/42
```

**Response:**

```json
{
  "success": true,
  "message": "Job detail fetched successfully",
  "data": {
    "job": {
      "id": 42,
      "title": "Senior React Developer",
      "company": "TechCorp",
      "description": "Full HTML job description text...",
      "tags": ["React", "TypeScript", "Node.js"],
      "location": "San Francisco, CA",
      "remote": true,
      "jobType": "full-time",
      "sourceApi": "greenhouse",
      "sourceUrl": "https://boards.greenhouse.io/...",
      "category": "engineering",
      "postedAt": "2026-03-10T00:00:00.000Z",
      "createdAt": "2026-03-12T10:30:00.000Z"
    }
  }
}
```

**Error (404):**

```json
{
  "success": false,
  "message": "Job not found",
  "error_code": "JOB_NOT_FOUND"
}
```

---

### 2.4 Home Dashboard

```
GET /api/jobs/home
Auth: Yes
```

Returns summary counts for the authenticated user.

**Response:**

```json
{
  "success": true,
  "message": "Home dashboard fetched successfully",
  "data": {
    "resumesUploaded": 3,
    "jobsApplied": 5,
    "jobsMatched": 12
  }
}
```

---

### 2.5 User Matches (Saved Match Results)

```
GET /api/jobs/user-matches
Auth: Yes
```

Returns the authenticated user's previously calculated AI match results with full job details.

**Query Parameters:**

| Param    | Type   | Default | Notes                               |
| -------- | ------ | ------- | ----------------------------------- |
| page     | number | 1       | Min 1                               |
| limit    | number | 10      | Min 1, Max 50                       |
| resumeId | number | -       | Filter matches for a specific resume |

**Example Request:**

```
GET /api/jobs/user-matches?page=1&limit=5&resumeId=3
```

**Response:**

```json
{
  "success": true,
  "message": "User matches fetched successfully",
  "data": {
    "matches": [
      {
        "id": 101,
        "resumeId": 3,
        "resumeFileName": "john_doe_resume.pdf",
        "jobId": 42,
        "job": {
          "id": 42,
          "title": "Senior React Developer",
          "company": "TechCorp",
          "location": "San Francisco, CA",
          "remote": true,
          "jobType": "full-time",
          "category": "engineering",
          "tags": ["React", "TypeScript"],
          "postedAt": "2026-03-10T00:00:00.000Z"
        },
        "similarityScore": 87.5,
        "explanation": "Strong match due to React and TypeScript experience...",
        "createdAt": "2026-03-14T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 12,
      "totalPages": 3
    }
  }
}
```

---

### 2.6 Create Job

```
POST /api/jobs
Auth: Yes
Content-Type: application/json
```

**Body:**

```json
{
  "title": "Senior React Developer",
  "description": "We are looking for a senior React developer with 5+ years of experience..."
}
```

| Field       | Type   | Required | Notes           |
| ----------- | ------ | -------- | --------------- |
| title       | string | Yes      | 5-255 chars     |
| description | string | Yes      | Min 20 chars    |

**Response (201):**

```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    "id": 100,
    "title": "Senior React Developer",
    "description": "We are looking for...",
    "createdAt": "2026-03-15T12:00:00.000Z"
  }
}
```

---

## 3. Resumes Module (`/api/resumes`)

### 3.1 Get User's Resumes

```
GET /api/resumes
Auth: Yes
```

Returns all resumes uploaded by the authenticated user.

**Response:**

```json
{
  "success": true,
  "message": "Resumes fetched successfully",
  "data": {
    "resumes": [
      {
        "id": 1,
        "fileName": "john_doe_resume.pdf",
        "uploadedAt": "2026-03-10T12:00:00.000Z",
        "updatedAt": "2026-03-10T12:00:00.000Z"
      }
    ]
  }
}
```

---

### 3.2 Upload Resume

```
POST /api/resumes/upload
Auth: Yes
Content-Type: multipart/form-data
```

| Field  | Type | Required | Notes                    |
| ------ | ---- | -------- | ------------------------ |
| resume | file | Yes      | PDF or DOCX file only    |

The server automatically extracts text from the file and generates an AI embedding for matching.

**Response (201):**

```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "resume": {
      "id": 1,
      "fileName": "john_doe_resume.pdf",
      "uploadedAt": "2026-03-15T12:00:00.000Z"
    }
  }
}
```

---

## 4. Matches Module (`/api/matches`)

### 4.1 Calculate Job Matches (AI Matching)

```
POST /api/matches
Auth: Yes
Content-Type: application/json
```

Triggers the AI matching engine: compares the given resume against all jobs using embedding similarity + LLM reranking. Results are saved to the database and can later be retrieved via `GET /api/jobs/user-matches`.

**Body:**

```json
{
  "resumeId": 1,
  "topN": 5
}
```

| Field    | Type   | Required | Default | Notes                 |
| -------- | ------ | -------- | ------- | --------------------- |
| resumeId | number | Yes      |         | Must belong to user   |
| topN     | number | No       | 5       | 1-10, top matches     |

**Response:**

```json
{
  "success": true,
  "message": "Matching completed successfully",
  "data": {
    "resumeId": 1,
    "fileName": "john_doe_resume.pdf",
    "uploadedAt": "2026-03-10T12:00:00.000Z",
    "totalJobsAnalyzed": 500,
    "topMatches": [
      {
        "rank": 1,
        "jobId": 42,
        "jobTitle": "Senior React Developer",
        "matchScore": 87.5,
        "explanation": "Strong match due to React and TypeScript background..."
      },
      {
        "rank": 2,
        "jobId": 78,
        "jobTitle": "Full Stack Engineer",
        "matchScore": 72.0,
        "explanation": "Good overlap in backend skills..."
      }
    ]
  }
}
```

**When no matches found:**

```json
{
  "success": true,
  "message": "Matching completed successfully",
  "data": {
    "resumeId": 1,
    "fileName": "resume.pdf",
    "uploadedAt": "...",
    "totalJobsAnalyzed": 500,
    "topMatches": [],
    "message": "We don't have any job that matches your profile right now."
  }
}
```

---

## 5. Easy Apply Module (`/api/easy-apply`)

### 5.1 Get Prefill Data

```
GET /api/easy-apply/:jobId/prefill
Auth: Yes
```

Returns everything needed to render the "Easy Apply" form: saved contact info, user's resumes, and AI-generated screening questions for the job.

**URL Params:**

| Param | Type   | Required |
| ----- | ------ | -------- |
| jobId | number | Yes      |

**Response:**

```json
{
  "success": true,
  "message": "Prefill data fetched successfully",
  "data": {
    "contact": {
      "email": "john@example.com",
      "phone": "+1234567890",
      "countryCode": "+1",
      "city": "San Francisco",
      "country": "US"
    },
    "resumes": [
      { "id": 1, "fileName": "resume.pdf", "uploadedAt": "..." }
    ],
    "screeningQuestions": [
      { "question": "How many years of React experience do you have?", "type": "number" },
      { "question": "Are you authorized to work in the US?", "type": "yesno" }
    ]
  }
}
```

---

### 5.2 Save/Update Contact Info

```
PUT /api/easy-apply/contact
Auth: Yes
Content-Type: application/json
```

**Body:**

```json
{
  "phone": "1234567890",
  "countryCode": "+1",
  "city": "San Francisco",
  "country": "US"
}
```

| Field       | Type   | Required | Notes       |
| ----------- | ------ | -------- | ----------- |
| phone       | string | No       | Max 20 chars |
| countryCode | string | No       | Max 10 chars |
| city        | string | No       | Max 100 chars|
| country     | string | No       | Max 100 chars|

---

### 5.3 Submit Application

```
POST /api/easy-apply/:jobId/submit
Auth: Yes
Content-Type: application/json
```

**URL Params:**

| Param | Type   | Required |
| ----- | ------ | -------- |
| jobId | number | Yes      |

**Body:**

```json
{
  "resumeId": 1,
  "contact": {
    "email": "john@example.com",
    "phone": "1234567890",
    "countryCode": "+1",
    "city": "San Francisco",
    "country": "US"
  },
  "answers": [
    { "question": "How many years of React experience?", "answer": "5" },
    { "question": "Are you authorized to work in the US?", "answer": "Yes" }
  ]
}
```

| Field             | Type   | Required | Notes                          |
| ----------------- | ------ | -------- | ------------------------------ |
| resumeId          | number | Yes      | Positive integer               |
| contact           | object | Yes      | Contact snapshot at apply time |
| contact.email     | string | No       | Valid email                    |
| contact.phone     | string | No       | Max 20 chars                   |
| contact.countryCode | string | No    | Max 10 chars                   |
| contact.city      | string | No       | Max 100 chars                  |
| contact.country   | string | No       | Max 100 chars                  |
| answers           | array  | Yes      | Array of Q&A objects           |
| answers[].question| string | Yes      |                                |
| answers[].answer  | string | Yes      | Can be empty string            |

**Response (201):**

```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "applicationId": 10,
    "jobId": 42,
    "status": "APPLIED",
    "appliedAt": "2026-03-15T14:30:00.000Z"
  }
}
```

**Error (409 - already applied):**

```json
{
  "success": false,
  "message": "You have already applied to this job",
  "error_code": "ALREADY_APPLIED"
}
```

---

### 5.4 Get My Applications

```
GET /api/easy-apply/my-applications
Auth: Yes
```

Returns all jobs the authenticated user has applied to.

**Response:**

```json
{
  "success": true,
  "message": "Applications fetched successfully",
  "data": {
    "applications": [
      {
        "id": 10,
        "jobId": 42,
        "resumeId": 1,
        "status": "APPLIED",
        "appliedAt": "2026-03-15T14:30:00.000Z",
        "job": {
          "id": 42,
          "title": "Senior React Developer",
          "company": "TechCorp"
        }
      }
    ]
  }
}
```

---

## Quick Reference Table

| # | Method | Endpoint                            | Auth | Description                        |
|---|--------|-------------------------------------|------|------------------------------------|
| 1 | POST   | `/api/auth/signup`                  | No   | Create account                     |
| 2 | POST   | `/api/auth/login`                   | No   | Email + password login             |
| 3 | POST   | `/api/auth/join`                    | No   | Firebase social login              |
| 4 | POST   | `/api/auth/request-otp`             | No   | Send OTP                           |
| 5 | POST   | `/api/auth/verify-otp`              | No   | Verify OTP                         |
| 6 | POST   | `/api/auth/forgot-password-request-otp` | No | Forgot password OTP            |
| 7 | POST   | `/api/auth/update-password`         | Yes  | Change password                    |
| 8 | POST   | `/api/auth/refresh-token`           | No   | Refresh access token               |
| 9 | POST   | `/api/auth/logout`                  | No   | Single device logout               |
| 10| POST   | `/api/auth/logout-all`              | Yes  | Logout all devices                 |
| 11| POST   | `/api/auth/update-profile`          | Yes  | Update name/gender/image           |
| 12| **GET**| **`/api/jobs`**                     | No   | **List jobs (paginated + filters)**|
| 13| **GET**| **`/api/jobs/categories`**          | No   | **All categories with counts**     |
| 14| **GET**| **`/api/jobs/home`**                | Yes  | **Dashboard stats**                |
| 15| **GET**| **`/api/jobs/user-matches`**        | Yes  | **User's saved match results**     |
| 16| **GET**| **`/api/jobs/:id`**                 | No   | **Job detail by ID**               |
| 17| POST   | `/api/jobs`                         | Yes  | Create job                         |
| 18| GET    | `/api/resumes`                      | Yes  | List user's resumes                |
| 19| POST   | `/api/resumes/upload`               | Yes  | Upload resume (PDF/DOCX)           |
| 20| POST   | `/api/matches`                      | Yes  | Run AI job matching                |
| 21| GET    | `/api/easy-apply/:jobId/prefill`    | Yes  | Get Easy Apply form data           |
| 22| PUT    | `/api/easy-apply/contact`           | Yes  | Save contact info                  |
| 23| POST   | `/api/easy-apply/:jobId/submit`     | Yes  | Submit application                 |
| 24| GET    | `/api/easy-apply/my-applications`   | Yes  | List user's applications           |

> Rows in **bold** are the newly added endpoints.
