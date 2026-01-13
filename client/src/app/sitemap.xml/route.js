const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export async function GET() {
    const sitemaps = [
        {
            loc: `${SITE_URL}/sitemap-pages.xml`,
            lastmod: new Date().toISOString(),
        },
        {
            loc: `${SITE_URL}/sitemap-jobs.xml`,
            lastmod: new Date().toISOString(),
        },
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
            .map(
                (sitemap) => `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`
            )
            .join('\n')}
</sitemapindex>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    });
}
