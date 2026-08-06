# Hirebase

Hirebase is an automated job aggregation and intelligence platform designed to discover, clean, normalize, and publish job listings from tech parks across Kerala.

The system consists of a Next.js web application frontend, an Express.js REST API backend, and an automated background service that scrapes, normalizes, and manages job lifecycles.

---

## Architecture Overview

Hirebase operates on a 3-tier architecture:

1. **Frontend**: Next.js 16 (React 19) web application providing searchable, filterable job listings with SEO-optimized slug routes and responsive UI components.
2. **Backend API**: Express.js REST API with Drizzle ORM and PostgreSQL for querying active jobs, filtering by experience level, location, company, and date ranges.
3. **Scraper & Normalization Engine**: Automated node-cron pipeline that executes daily scrapers across 5 tech park platforms, normalizes raw data using an AI model (with an automated heuristic parser fallback), and manages job expiration.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS v4, Framer Motion
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js, Express.js
- **Database**: PostgreSQL (Supabase / Neon DB)
- **ORM**: Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
- **Deployment**: Koyeb

### Automation & Services
- **Scrapers**: Cheerio, Axios
- **AI Processing**: Groq SDK (`llama-3.1-8b-instant`), OpenRouter API
- **Scheduling**: `node-cron`

---

## Project Structure

```
hirebase/
├── client/                 # Next.js Frontend Application
│   ├── src/
│   │   ├── app/            # App router pages and API routes
│   │   ├── components/     # UI components
│   │   └── lib/            # Utilities
│   ├── public/             # Static assets
│   └── package.json
│
└── server/                 # Express.js Backend API & Automated Scrapers
    ├── config/             # Database connection and prompt configurations
    ├── controllers/        # Route controllers for jobs and filters
    ├── db/                 # Database migrations and instances
    ├── middleware/         # Express middleware
    ├── routes/             # API route definitions
    ├── schema/             # Drizzle database schemas
    ├── services/           # Scrapers, cron scheduler, AI & heuristic cleaner
    ├── utils/              # Helper utilities
    └── server.js           # Server entry point
```

---

## Key Features

- **Automated Scraping**: Periodically scrapes job listings from TechnoPark, InfoPark, CyberPark, SmartCity, and ULCyberPark.
- **Dual-Stage Job Normalization**: Cleans and structures raw job data into normalized JSON (responsibilities, requirements, benefits) using Groq AI (`llama-3.1-8b-instant`) with an automatic heuristic regex fallback.
- **SEO-Optimized Slugs**: Automatically generates SEO-friendly URLs (`/job/role-company-location-id`) for individual job postings.
- **Filter and Search**: Supports real-time search and multi-parameter filtering by experience level, company, location, and date range.
- **Job Lifecycle Management**: Automated cron jobs purge expired listings (older than 31 days or past specified deadlines) to ensure listing freshness.

---

## Automated Background Schedule

The server runs scheduled background tasks using `node-cron`:

| Task | Description |
| :--- | :--- |
| Scrapers Execution | Sequentially scrapes all 5 tech park platforms and stores raw jobs in `rawjobs`. |
| Job Normalization | Processes pending records in `rawjobs`, normalizes data, inserts into `jobs`, and removes duplicates. |
| Job Deactivation | Scans active listings and deactivates expired jobs (`is_active = false`). |

---

## Environment Variables

### Backend Configuration (`server/.env`)

```env
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# UUID Namespace
JOB_UUID_NAMESPACE=1b671a64-40d5-491e-99b0-da01ff1f3341

# AI Normalization Providers
GROQ_API_KEY=gsk_your_groq_key
GROQ_MODEL=llama-3.1-8b-instant

OPENROUTER_API_KEY=sk-or-v1-your_openrouter_key
OPENROUTER_MODEL=openai/gpt-oss-20b:free
```

### Frontend Configuration (`client/.env`)

```env
NEXT_PUBLIC_API_URL=https://api.hirebase.xyz
NEXT_PUBLIC_SITE_URL=https://hirebase.xyz
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status health check |
| `GET` | `/api/v1/jobs` | Get paginated active jobs with query filters (`page`, `limit`, `level`, `location`, `company`, `dateRange`, `search`) |
| `GET` | `/api/v1/jobs/filters` | Get unique filter options (levels, locations, companies, date ranges) |
| `GET` | `/api/v1/jobs/stats` | Get statistics for new jobs added since the last 11 PM cutoff |
| `GET` | `/api/v1/jobs/:slug` | Get single job details by SEO slug |

---

## Local Development Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database instance (Supabase, Neon, or local PostgreSQL)

### 1. Backend Setup

```bash
cd server
npm install
npm run dev
```

The API server will start on `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The Next.js web app will start on `http://localhost:3000`.

---
