const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export default async function sitemap() {
    // Sitemap index pointing to child sitemaps
    return [
        {
            url: `${SITE_URL}/sitemap-pages.xml`,
            lastModified: new Date(),
        },
        {
            url: `${SITE_URL}/sitemap-jobs.xml`,
            lastModified: new Date(),
        },
    ];
}
