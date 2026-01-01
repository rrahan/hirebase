const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

export default async function sitemap() {
    // Static pages
    const staticPages = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${SITE_URL}/jobs`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.2,
        },
        {
            url: `${SITE_URL}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.2,
        },
        {
            url: `${SITE_URL}/faqs`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ];

    // Fetch all active jobs from API
    let jobPages = [];

    try {
        // Fetch all jobs by paginating through all pages
        let page = 1;
        let hasMore = true;
        const allJobs = [];

        while (hasMore) {
            const response = await fetch(`${API_BASE_URL}/api/v1/jobs?page=${page}&limit=100`, {
                next: { revalidate: 3600 } // Cache for 1 hour
            });

            if (!response.ok) {
                console.error('Failed to fetch jobs for sitemap');
                break;
            }

            const data = await response.json();

            if (data.success && data.data.length > 0) {
                allJobs.push(...data.data);
                hasMore = data.pagination.hasNextPage;
                page++;
            } else {
                hasMore = false;
            }
        }

        // Map jobs to sitemap entries
        jobPages = allJobs.map((job) => ({
            url: `${SITE_URL}/job/${job.slug}`,
            lastModified: job.date_posted ? new Date(job.date_posted) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

    } catch (error) {
        console.error('Error fetching jobs for sitemap:', error);
    }

    return [...staticPages, ...jobPages];
}
