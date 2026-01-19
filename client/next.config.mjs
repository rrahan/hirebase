/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false, // Prevents Next.js from adding slashes automatically

  async redirects() {
    return [
      // Fix trailing slash on sitemap causing GSC duplicate canonical issue
      {
        source: '/sitemap.xml/',
        destination: '/sitemap.xml',
        permanent: true, // Uses status code 308
      },
      // Handle any trailing slashes on job paths
      {
        source: '/job/:slug*/',
        destination: '/job/:slug*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
