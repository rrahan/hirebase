const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export async function GET() {
    // Generate current date for frequently updated pages
    const today = new Date().toISOString().split('T')[0];
    // Use a recent fixed date for rarely updated pages (update when content changes)
    const recentUpdate = '2026-01-16';

    const staticPages = [
        {
            url: SITE_URL,
            lastModified: today,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/jobs`,
            lastModified: today,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/contact`,
            lastModified: recentUpdate,
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/privacy`,
            lastModified: recentUpdate,
            changeFrequency: 'yearly',
            priority: 0.2,
        },
        {
            url: `${SITE_URL}/terms`,
            lastModified: recentUpdate,
            changeFrequency: 'yearly',
            priority: 0.2,
        },
        {
            url: `${SITE_URL}/faqs`,
            lastModified: recentUpdate,
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
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
