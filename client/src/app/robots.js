export default function robots() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hirebase.xyz';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
            },
            {
                userAgent: 'Amazonbot',
                disallow: '/',
            },
            {
                userAgent: 'Bytespider',
                disallow: '/',
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
