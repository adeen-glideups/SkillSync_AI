# Easy Apply Module - API Documentation

## Overview

The Easy Apply module allows authenticated users to apply for jobs with a streamlined process. It includes:

- **Prefill Data**: Auto-populates contact info (from saved data or AI-extracted from resume) and generates AI-powered screening questions
- **Contact Management**: Save/update contact information for future applications
- **Job Application**: Submit applications with resume, contact info, and screening question answers
- **Application History**: View all submitted applications

**Base URL**: `/api/easy-apply`

---

## Authentication

All endpoints require authentication via JWT Bearer token.

```
Authorization: Bearer <access_token>
```

---

## API Endpoints

### 1. Get Prefill Data

Fetches all data needed to populate the Easy Apply form.

**Endpoint**: `GET /api/easy-apply/:jobId/prefill`

**Description**: Returns user's contact info (saved or AI-extracted from resume), available resumes, job details, and AI-generated screening questions.

#### Request

```http
GET /api/easy-apply/15/prefill
Authorization: Bearer <access_token>
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Prefill data fetched successfully",
  "data": {
    "contact": {
      "email": "john.doe@example.com",
      "phone": "3001234567",
      "countryCode": "+92",
      "city": "Lahore",
      "country": "Pakistan",
      "source": "saved"
    },
    "resumes": [
      {
        "id": 1,
        "fileName": "John_Doe_Resume.pdf",
        "uploadedAt": "2024-03-15T10:30:00.000Z"
      },
      {
        "id": 2,
        "fileName": "John_Doe_CV_2024.docx",
        "uploadedAt": "2024-03-10T08:15:00.000Z"
      }
    ],
    "job": {
      "id": 15,
      "title": "Senior Backend Developer",
      "company": "TechCorp Inc.",
      "location": "Remote"
    },
    "screeningQuestions": [
      {
        "question": "How many years of experience do you have with Node.js?",
        "type": "number"
      },
      {
        "question": "Are you authorized to work in the job location without sponsorship?",
        "type": "yesno"
      },
      {
        "question": "What is your notice period?",
        "type": "text"
      },
      {
        "question": "What is your expected salary range?",
        "type": "text"
      }
    ]
  }
}
```

#### Contact Source Values

| Source      | Description                                      |
|-------------|--------------------------------------------------|
| `saved`     | Contact info was retrieved from saved user data  |
| `extracted` | Contact info was AI-extracted from user's resume |

#### Error Responses

**Job Not Found (404)**
```json
{
  "success": false,
  "message": "Job not found",
  "errorCode": "JOB_NOT_FOUND"
}
```

---

### 2. Save Contact Info

Saves or updates the user's contact information for future applications.

**Endpoint**: `PUT /api/easy-apply/contact`

**Description**: Persists contact info so it can be reused across multiple job applications.

#### Request

```http
PUT /api/easy-apply/contact
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "phone": "3001234567",
  "countryCode": "+92",
  "city": "Lahore",
  "country": "Pakistan"
}
```

#### Request Body Schema

| Field       | Type   | Required | Max Length | Description                    |
|-------------|--------|----------|------------|--------------------------------|
| phone       | string | No       | 20         | Phone number (digits only)     |
| countryCode | string | No       | 10         | Country code with + (e.g. +92) |
| city        | string | No       | 100        | City name                      |
| country     | string | No       | 100        | Country name                   |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Contact info saved successfully",
  "data": {
    "id": 5,
    "userId": 12,
    "phone": "3001234567",
    "countryCode": "+92",
    "city": "Lahore",
    "country": "Pakistan",
    "updatedAt": "2024-03-15T14:30:00.000Z"
  }
}
```

---

### 3. Submit Application

Submits a job application with selected resume, contact info, and screening question answers.

**Endpoint**: `POST /api/easy-apply/:jobId/submit`

**Description**: Creates a new job application. Sends a confirmation email to the user upon success.

#### Request

```http
POST /api/easy-apply/15/submit
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "resumeId": 1,
  "contact": {
    "email": "john.doe@example.com",
    "phone": "3001234567",
    "countryCode": "+92",
    "city": "Lahore",
    "country": "Pakistan"
  },
  "answers": [
    {
      "question": "How many years of experience do you have with Node.js?",
      "answer": "5"
    },
    {
      "question": "Are you authorized to work in the job location without sponsorship?",
      "answer": "Yes"
    },
    {
      "question": "What is your notice period?",
      "answer": "2 weeks"
    },
    {
      "question": "What is your expected salary range?",
      "answer": "$80,000 - $100,000"
    }
  ]
}
```

#### Request Body Schema

| Field              | Type    | Required | Description                              |
|--------------------|---------|----------|------------------------------------------|
| resumeId           | integer | Yes      | ID of the resume to attach               |
| contact            | object  | Yes      | Contact information snapshot             |
| contact.email      | string  | No       | Email (defaults to user's account email) |
| contact.phone      | string  | No       | Phone number                             |
| contact.countryCode| string  | No       | Country code                             |
| contact.city       | string  | No       | City                                     |
| contact.country    | string  | No       | Country                                  |
| answers            | array   | Yes      | Array of screening question answers      |
| answers[].question | string  | Yes      | The question text                        |
| answers[].answer   | string  | Yes      | The answer (can be empty string)         |

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "applicationId": 42,
    "status": "APPLIED",
    "appliedAt": "2024-03-15T14:45:00.000Z",
    "job": {
      "title": "Senior Backend Developer",
      "company": "TechCorp Inc."
    },
    "resume": {
      "id": 1,
      "fileName": "John_Doe_Resume.pdf"
    }
  }
}
```

#### Error Responses

**Job Not Found (404)**
```json
{
  "success": false,
  "message": "Job not found",
  "errorCode": "JOB_NOT_FOUND"
}
```

**Resume Not Found (404)**
```json
{
  "success": false,
  "message": "Resume not found or does not belong to you",
  "errorCode": "RESUME_NOT_FOUND"
}
```

**Already Applied (409)**
```json
{
  "success": false,
  "message": "You have already applied to this job",
  "errorCode": "ALREADY_APPLIED"
}
```

---

### 4. Get My Applications

Retrieves all jobs the authenticated user has applied to.

**Endpoint**: `GET /api/easy-apply/my-applications`

**Description**: Returns a list of all submitted applications with job details.

#### Request

```http
GET /api/easy-apply/my-applications
Authorization: Bearer <access_token>
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Applications fetched successfully",
  "data": {
    "applications": [
      {
        "id": 42,
        "jobId": 15,
        "resumeId": 1,
        "status": "APPLIED",
        "appliedAt": "2024-03-15T14:45:00.000Z",
        "job": {
          "title": "Senior Backend Developer",
          "company": "TechCorp Inc."
        }
      },
      {
        "id": 38,
        "jobId": 8,
        "resumeId": 1,
        "status": "APPLIED",
        "appliedAt": "2024-03-12T09:20:00.000Z",
        "job": {
          "title": "Full Stack Engineer",
          "company": "StartupXYZ"
        }
      }
    ]
  }
}
```

---

## Application Flow

```
1. User views job details
           │
           ▼
2. GET /api/easy-apply/:jobId/prefill
   - Fetch contact info (saved or AI-extracted)
   - Fetch user's resumes list
   - Fetch/Generate screening questions
           │
           ▼
3. User fills the Easy Apply form
   - Select resume
   - Confirm/edit contact info
   - Answer screening questions
           │
           ▼
4. (Optional) PUT /api/easy-apply/contact
   - Save contact info for future use
           │
           ▼
5. POST /api/easy-apply/:jobId/submit
   - Submit application
   - Confirmation email sent
           │
           ▼
6. GET /api/easy-apply/my-applications
   - View application history
```

---

## Screening Question Types

| Type     | Description                          | Expected Answer Format |
|----------|--------------------------------------|------------------------|
| `text`   | Free-form text response              | Any string             |
| `yesno`  | Yes/No question                      | "Yes" or "No"          |
| `number` | Numeric response (e.g., years exp)   | Numeric string         |

---

## Error Codes Reference

| Error Code         | HTTP Status | Description                                |
|--------------------|-------------|--------------------------------------------|
| `JOB_NOT_FOUND`    | 404         | The specified job does not exist           |
| `RESUME_NOT_FOUND` | 404         | Resume not found or doesn't belong to user |
| `ALREADY_APPLIED`  | 409         | User has already applied to this job       |
| `GROQ_NOT_CONFIGURED` | 500      | AI service not configured (server error)   |
| `GROQ_ERROR`       | varies      | AI service error during question generation|

---

## Notes

- **AI Features**: Contact extraction and screening question generation use Groq LLM (llama-3.3-70b-versatile)
- **Caching**: Generated screening questions are cached per job to avoid repeated API calls
- **Email**: A confirmation email is sent to the user after successful application submission
- **Contact Persistence**: Contact info provided during application is automatically saved for future use
