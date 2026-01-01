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
                userAgent: 'Applebot-Extended',
                disallow: '/',
            },
            {
                userAgent: 'Bytespider',
                disallow: '/',
            },
            {
                userAgent: 'CCBot',
                disallow: '/',
            },
            {
                userAgent: 'ClaudeBot',
                disallow: '/',
            },
            {
                userAgent: 'Google-Extended',
                disallow: '/',
            },
            {
                userAgent: 'GPTBot',
                disallow: '/',
            },
            {
                userAgent: 'meta-externalagent',
                disallow: '/',
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
