# Jobs Module - API Documentation

## Overview

The Jobs module provides endpoints for browsing, searching, and filtering job listings. It also includes user-specific features like job matching based on resume similarity.

**Base URL**: `/api/jobs`

---

## Quick Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/jobs` | GET | No | List jobs with filters & pagination |
| `/api/jobs/categories` | GET | No | Get all job categories with counts |
| `/api/jobs/:id` | GET | No | Get single job details |
| `/api/jobs/home` | GET | Yes | Get user dashboard stats |
| `/api/jobs/user-matches` | GET | Yes | Get AI-matched jobs for user |

---

## API Endpoints

### 1. List Jobs

Fetches paginated job listings with optional filters and sorting.

**Endpoint**: `GET /api/jobs`

**Authentication**: Not required

#### Query Parameters

| Parameter | Type    | Default   | Description                                    |
|-----------|---------|-----------|------------------------------------------------|
| `page`    | number  | 1         | Page number                                    |
| `limit`   | number  | 10        | Items per page (max recommended: 50)           |
| `search`  | string  | -         | Search in title, company, tags                 |
| `remote`  | boolean | -         | Filter remote jobs (`true` or `false`)         |
| `category`| string  | -         | Filter by category (e.g., "software engineering") |
| `jobType` | string  | -         | Filter by type: `full-time`, `part-time`, `contract` |
| `sort`    | string  | `newest`  | Sort order: `newest` or `oldest`               |

#### Frontend Usage Examples

**Basic fetch (newest first):**
```javascript
// React/Next.js example
const fetchJobs = async () => {
  const response = await fetch('/api/jobs?page=1&limit=10');
  const data = await response.json();
  return data.data;
};
```

**With filters:**
```javascript
// Fetch remote software engineering jobs, oldest first
const fetchFilteredJobs = async () => {
  const params = new URLSearchParams({
    page: 1,
    limit: 20,
    remote: true,
    category: 'software engineering',
    sort: 'oldest'
  });

  const response = await fetch(`/api/jobs?${params}`);
  const data = await response.json();
  return data.data;
};
```

**Search with sorting:**
```javascript
// Search for "React" jobs, newest first
const searchJobs = async (searchTerm, sortOrder = 'newest') => {
  const params = new URLSearchParams({
    search: searchTerm,
    sort: sortOrder,
    page: 1,
    limit: 15
  });

  const response = await fetch(`/api/jobs?${params}`);
  return response.json();
};

// Usage
searchJobs('React Developer', 'newest');
searchJobs('Python', 'oldest');
```

**React Hook Example:**
```javascript
import { useState, useEffect } from 'react';

const useJobs = (filters) => {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const params = new URLSearchParams({
        page: filters.page || 1,
        limit: filters.limit || 10,
        sort: filters.sort || 'newest',
        ...(filters.search && { search: filters.search }),
        ...(filters.remote !== undefined && { remote: filters.remote }),
        ...(filters.category && { category: filters.category }),
        ...(filters.jobType && { jobType: filters.jobType }),
      });

      const res = await fetch(`/api/jobs?${params}`);
      const data = await res.json();

      setJobs(data.data.jobs);
      setPagination(data.data.pagination);
      setLoading(false);
    };

    fetchJobs();
  }, [filters]);

  return { jobs, pagination, loading };
};

// Usage in component
const JobList = () => {
  const [sort, setSort] = useState('newest');
  const { jobs, pagination, loading } = useJobs({ sort, page: 1 });

  return (
    <div>
      <select value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
      </select>

      {jobs.map(job => <JobCard key={job.id} job={job} />)}
    </div>
  );
};
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Jobs fetched successfully",
  "data": {
    "jobs": [
      {
        "id": 15,
        "title": "Senior Backend Developer",
        "company": "TechCorp Inc.",
        "tags": ["Node.js", "PostgreSQL", "AWS"],
        "location": "San Francisco, CA",
        "remote": true,
        "jobType": "full-time",
        "category": "software engineering",
        "sourceUrl": "https://example.com/job/123",
        "postedAt": "2024-03-10T00:00:00.000Z",
        "createdAt": "2024-03-12T14:30:00.000Z"
      },
      {
        "id": 14,
        "title": "Full Stack Engineer",
        "company": "StartupXYZ",
        "tags": ["React", "Node.js", "MongoDB"],
        "location": "Remote",
        "remote": true,
        "jobType": "full-time",
        "category": "software engineering",
        "sourceUrl": "https://example.com/job/456",
        "postedAt": "2024-03-08T00:00:00.000Z",
        "createdAt": "2024-03-10T09:15:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 156,
      "totalPages": 16
    }
  }
}
```

---

### 2. Get Categories

Fetches all distinct job categories with their job counts.

**Endpoint**: `GET /api/jobs/categories`

**Authentication**: Not required

#### Frontend Usage Example

```javascript
const fetchCategories = async () => {
  const response = await fetch('/api/jobs/categories');
  const data = await response.json();
  return data.data.categories;
};

// Use for filter dropdown
const CategoryFilter = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  return (
    <select onChange={(e) => onCategoryChange(e.target.value)}>
      <option value="">All Categories</option>
      {categories.map(cat => (
        <option key={cat.name} value={cat.name}>
          {cat.name} ({cat.count})
        </option>
      ))}
    </select>
  );
};
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "data": {
    "categories": [
      { "name": "software engineering", "count": 89 },
      { "name": "design", "count": 34 },
      { "name": "marketing", "count": 28 },
      { "name": "data science", "count": 22 },
      { "name": "product management", "count": 15 }
    ]
  }
}
```

---

### 3. Get Job Detail

Fetches complete details for a single job.

**Endpoint**: `GET /api/jobs/:id`

**Authentication**: Not required

#### Frontend Usage Example

```javascript
const fetchJobDetail = async (jobId) => {
  const response = await fetch(`/api/jobs/${jobId}`);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.data.job;
};

// In Next.js page
export default function JobPage({ params }) {
  const [job, setJob] = useState(null);

  useEffect(() => {
    fetchJobDetail(params.id)
      .then(setJob)
      .catch(err => console.error('Job not found'));
  }, [params.id]);

  if (!job) return <Loading />;

  return (
    <div>
      <h1>{job.title}</h1>
      <h2>{job.company}</h2>
      <p>{job.description}</p>
      <button onClick={() => navigate(`/easy-apply/${job.id}`)}>
        Easy Apply
      </button>
    </div>
  );
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Job detail fetched successfully",
  "data": {
    "job": {
      "id": 15,
      "title": "Senior Backend Developer",
      "company": "TechCorp Inc.",
      "description": "We are looking for an experienced backend developer to join our team. You will be responsible for designing and implementing scalable APIs, database optimization, and mentoring junior developers.\n\nRequirements:\n- 5+ years of experience with Node.js\n- Strong knowledge of PostgreSQL or MySQL\n- Experience with AWS or GCP\n- Excellent communication skills",
      "tags": ["Node.js", "PostgreSQL", "AWS", "Docker"],
      "location": "San Francisco, CA",
      "remote": true,
      "jobType": "full-time",
      "sourceApi": "arbeitnow",
      "sourceUrl": "https://arbeitnow.com/jobs/senior-backend-dev",
      "category": "software engineering",
      "postedAt": "2024-03-10T00:00:00.000Z",
      "createdAt": "2024-03-12T14:30:00.000Z"
    }
  }
}
```

#### Error Response (404 Not Found)

```json
{
  "success": false,
  "message": "Job not found",
  "errorCode": "JOB_NOT_FOUND"
}
```

---

### 4. Get Home Dashboard

Fetches dashboard statistics for authenticated user.

**Endpoint**: `GET /api/jobs/home`

**Authentication**: Required (Bearer token)

#### Frontend Usage Example

```javascript
const fetchDashboard = async (token) => {
  const response = await fetch('/api/jobs/home', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Dashboard component
const Dashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboard(token).then(res => setStats(res.data));
  }, [token]);

  return (
    <div className="dashboard-stats">
      <StatCard title="Resumes Uploaded" value={stats?.resumesUploaded || 0} />
      <StatCard title="Jobs Applied" value={stats?.jobsApplied || 0} />
      <StatCard title="Jobs Matched" value={stats?.jobsMatched || 0} />
    </div>
  );
};
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Home dashboard fetched successfully",
  "data": {
    "resumesUploaded": 2,
    "jobsApplied": 5,
    "jobsMatched": 47
  }
}
```

---

### 5. Get User Matches

Fetches AI-matched jobs based on user's resume similarity scores.

**Endpoint**: `GET /api/jobs/user-matches`

**Authentication**: Required (Bearer token)

#### Query Parameters

| Parameter  | Type   | Default | Description                          |
|------------|--------|---------|--------------------------------------|
| `page`     | number | 1       | Page number                          |
| `limit`    | number | 10      | Items per page                       |
| `resumeId` | number | -       | Filter matches for specific resume   |

#### Frontend Usage Example

```javascript
const fetchMatches = async (token, resumeId = null) => {
  const params = new URLSearchParams({
    page: 1,
    limit: 20,
    ...(resumeId && { resumeId })
  });

  const response = await fetch(`/api/jobs/user-matches?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Matches list component
const MatchedJobs = () => {
  const { token } = useAuth();
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetchMatches(token).then(res => setMatches(res.data.matches));
  }, [token]);

  return (
    <div>
      <h2>Jobs Matched to Your Resume</h2>
      {matches.map(match => (
        <MatchCard
          key={match.id}
          job={match.job}
          score={match.similarityScore}
          explanation={match.explanation}
        />
      ))}
    </div>
  );
};
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "User matches fetched successfully",
  "data": {
    "matches": [
      {
        "id": 102,
        "resumeId": 1,
        "resumeFileName": "John_Doe_Resume.pdf",
        "jobId": 15,
        "job": {
          "id": 15,
          "title": "Senior Backend Developer",
          "company": "TechCorp Inc.",
          "location": "San Francisco, CA",
          "remote": true,
          "jobType": "full-time",
          "category": "software engineering",
          "tags": ["Node.js", "PostgreSQL", "AWS"],
          "postedAt": "2024-03-10T00:00:00.000Z"
        },
        "similarityScore": 0.89,
        "explanation": "Strong match based on 5+ years Node.js experience, PostgreSQL expertise, and AWS deployment skills mentioned in resume.",
        "createdAt": "2024-03-15T10:30:00.000Z"
      },
      {
        "id": 98,
        "resumeId": 1,
        "resumeFileName": "John_Doe_Resume.pdf",
        "jobId": 22,
        "job": {
          "id": 22,
          "title": "Full Stack Engineer",
          "company": "StartupXYZ",
          "location": "Remote",
          "remote": true,
          "jobType": "full-time",
          "category": "software engineering",
          "tags": ["React", "Node.js", "MongoDB"],
          "postedAt": "2024-03-08T00:00:00.000Z"
        },
        "similarityScore": 0.82,
        "explanation": "Good match for React and Node.js skills. MongoDB experience not explicitly mentioned but similar NoSQL experience noted.",
        "createdAt": "2024-03-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 47,
      "totalPages": 5
    }
  }
}
```

---

## Complete Frontend Integration Example

```javascript
// services/jobService.js
const API_BASE = '/api/jobs';

export const jobService = {
  // List jobs with all filters
  async listJobs({ page = 1, limit = 10, search, remote, category, jobType, sort = 'newest' }) {
    const params = new URLSearchParams({
      page,
      limit,
      sort,
      ...(search && { search }),
      ...(remote !== undefined && { remote }),
      ...(category && { category }),
      ...(jobType && { jobType }),
    });

    const res = await fetch(`${API_BASE}?${params}`);
    return res.json();
  },

  // Get job details
  async getJob(id) {
    const res = await fetch(`${API_BASE}/${id}`);
    return res.json();
  },

  // Get categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    return res.json();
  },

  // Get dashboard (requires auth)
  async getDashboard(token) {
    const res = await fetch(`${API_BASE}/home`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Get matched jobs (requires auth)
  async getMatches(token, { page = 1, limit = 10, resumeId } = {}) {
    const params = new URLSearchParams({
      page,
      limit,
      ...(resumeId && { resumeId }),
    });

    const res = await fetch(`${API_BASE}/user-matches?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
};
```

---

## Sort Parameter Values

| Value    | Description                        |
|----------|------------------------------------|
| `newest` | Most recently added jobs first (default) |
| `oldest` | Oldest jobs first                  |

---

## Error Codes Reference

| Error Code           | HTTP Status | Description                    |
|----------------------|-------------|--------------------------------|
| `JOB_NOT_FOUND`      | 404         | Job with given ID doesn't exist |
| `REQUIRED_FIELDS_MISSING` | 400    | Missing required fields        |
| `INTERNAL_SERVER_ERROR` | 500      | Server error                   |
