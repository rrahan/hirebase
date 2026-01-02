// Organization and WebSite structured data for SEO
// These schemas help search engines understand the site's identity and structure

export function OrganizationSchema() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://hirebase.xyz/#organization",
        name: "hirebase",
        url: "https://hirebase.xyz",
        logo: {
            "@type": "ImageObject",
            url: "https://hirebase.xyz/logo.svg",
            width: 512,
            height: 512,
        },
        description: "Tech job board connecting talented professionals with opportunities in Kerala's tech ecosystem including Technopark, Infopark, and startups.",
        foundingDate: "2025",
        sameAs: [
            // Add social media profiles here when available
        ],
        areaServed: {
            "@type": "Place",
            name: "Kerala, India",
        },
        knowsAbout: [
            "Tech Jobs",
            "Software Development",
            "Startup Hiring",
            "IT Recruitment",
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

export function WebSiteSchema() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": "https://hirebase.xyz/#website",
        name: "hirebase",
        url: "https://hirebase.xyz",
        description: "Tech opportunities across Kerala. Updated in real-time directly from company career portals.",
        publisher: {
            "@id": "https://hirebase.xyz/#organization",
        },
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: "https://hirebase.xyz/jobs?q={search_term_string}",
            },
            "query-input": "required name=search_term_string",
        },
        inLanguage: "en-IN",
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

export function BreadcrumbSchema({ items }) {
    // items: array of { name, url } objects
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
