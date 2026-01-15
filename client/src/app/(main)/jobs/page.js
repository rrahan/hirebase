import JobsPageClient from "./JobsPageClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.hirebase.xyz';

// Format structured description to readable text (server-side version)
function formatDescription(description) {
    if (!description) return "";
    if (typeof description === "string") return description;

    if (Array.isArray(description)) {
        const parts = [];
        for (const section of description) {
            if (section.overview) {
                parts.push(`About the Role\n${section.overview}`);
            }
            if (section.responsibilities && Array.isArray(section.responsibilities)) {
                parts.push(`Key Responsibilities\n${section.responsibilities.map(r => `• ${r}`).join('\n')}`);
            }
            if (section.requirements && Array.isArray(section.requirements)) {
                parts.push(`Requirements\n${section.requirements.map(r => `• ${r}`).join('\n')}`);
            }
        }
        return parts.join('\n\n');
    }
    return "";
}

// Transform API job data for server-side rendering (no React components)
function transformJobForServer(apiJob) {
    return {
        id: apiJob.id,
        slug: apiJob.slug,
        company: apiJob.company || "Unknown Company",
        title: apiJob.title || "Untitled Position",
        logoUrl: apiJob.logo, // Keep URL, client will create <img> component
        location: apiJob.location || "Location not specified",
        remote: "On-site",
        salary: "Competitive",
        job_time: "Full-time",
        job_description: formatDescription(apiJob.description),
        level: apiJob.level,
        website: apiJob.website,
        date_posted: apiJob.date_posted,
        deadline: apiJob.deadline,
    };
}

// Server-side data fetching
async function getInitialJobs() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/jobs?page=1&limit=10`, {
            next: { revalidate: 60 } // Cache for 60 seconds
        });

        if (!response.ok) {
            console.error('Failed to fetch jobs for SSR');
            return { jobs: [], pagination: null };
        }

        const data = await response.json();

        if (data.success) {
            return {
                jobs: data.data.map(transformJobForServer),
                pagination: {
                    currentPage: data.pagination.currentPage,
                    totalPages: data.pagination.totalPages,
                    totalJobs: data.pagination.totalJobs,
                    hasNextPage: data.pagination.hasNextPage,
                }
            };
        }

        return { jobs: [], pagination: null };
    } catch (error) {
        console.error('Error fetching jobs for SSR:', error);
        return { jobs: [], pagination: null };
    }
}

// Server-side stats fetching
async function getStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/jobs/stats`, {
            next: { revalidate: 60 }
        });

        if (!response.ok) {
            return { newJobsCount: 0 };
        }

        const data = await response.json();
        return data.success ? { newJobsCount: data.data.newJobsCount } : { newJobsCount: 0 };
    } catch (error) {
        console.error('Error fetching stats for SSR:', error);
        return { newJobsCount: 0 };
    }
}

// Server Component - fetches data and passes to client
export default async function JobsPage() {
    // Fetch data on the server
    const [{ jobs, pagination }, stats] = await Promise.all([
        getInitialJobs(),
        getStats()
    ]);

    return (
        <>
            {/* Hidden crawlable content for search engines - rendered in HTML without JS */}
            <div className="sr-only" aria-hidden="true">
                <h1>Tech Jobs in Kerala - hirebase</h1>
                <p>Find developer, designer, and startup jobs in Kerala. Real-time listings from Technopark, Infopark, and Kerala startups.</p>
                <h2>Current Job Openings</h2>
                {jobs.map((job) => (
                    <article key={job.id}>
                        <h3>{job.title} at {job.company}</h3>
                        <p>Location: {job.location}</p>
                        {job.level && <p>Level: {job.level}</p>}
                        <p>{job.job_description?.substring(0, 300)}...</p>
                    </article>
                ))}
            </div>

            {/* Interactive client component with SSR data */}
            <JobsPageClient
                initialJobs={jobs}
                initialPagination={pagination}
                initialStats={stats}
            />
        </>
    );
}
