const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export async function GET() {
    const staticPages = [
        {
            url: SITE_URL,
            lastModified: '2026-01-13',
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/jobs`,
            lastModified: '2026-01-13',
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/contact`,
            lastModified: '2026-01-01',
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/privacy`,
            lastModified: '2026-01-01',
            changeFrequency: 'yearly',
            priority: 0.2,
        },
        {
            url: `${SITE_URL}/terms`,
            lastModified: '2026-01-01',
            changeFrequency: 'yearly',
            priority: 0.2,
        },
        {
            url: `${SITE_URL}/faqs`,
            lastModified: '2026-01-01',
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
