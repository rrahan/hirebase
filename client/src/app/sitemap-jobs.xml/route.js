const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export async function GET() {
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
            lastModified: job.date_posted ? new Date(job.date_posted).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

    } catch (error) {
        console.error('Error fetching jobs for sitemap:', error);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${jobPages
            .map(
                (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
            )
            .join('\n')}
</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    });
}
