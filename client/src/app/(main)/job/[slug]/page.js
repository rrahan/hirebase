import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Building2, Clock, Banknote, Flag, Bookmark, Share2, Globe, Mail } from "lucide-react";
import CompanyLogo from "@/components/company-logo";
import { RaisedButton } from "@/components/ui/raised-button";
import CopyButton from "@/components/copy-button";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Fetch job from API
async function getJob(slug) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/jobs/${slug}`, {
            cache: 'no-store' // Always fetch fresh data
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('Error fetching job:', error);
        return null;
    }
}

// Format structured description to readable text
function formatDescription(description) {
    if (!description) return "";

    // If it's a string, return as-is
    if (typeof description === "string") return description;

    // If it's an array of objects (structured format from API)
    if (Array.isArray(description)) {
        const parts = [];

        for (const section of description) {
            if (section.overview) {
                parts.push(`About the Role\n${section.overview}`);
            }
            if (section.responsibilities && Array.isArray(section.responsibilities)) {
                parts.push(`Key Responsibilities\n${section.responsibilities.map(r => `• ${r}`).join('\n')}`);
            }
            if (section.requirements && Array.isArray(section.requirements)) {
                parts.push(`Requirements\n${section.requirements.map(r => `• ${r}`).join('\n')}`);
            }
            if (section.preferred_qualifications && Array.isArray(section.preferred_qualifications)) {
                parts.push(`Preferred Qualifications\n${section.preferred_qualifications.map(r => `• ${r}`).join('\n')}`);
            }
            if (section.benefits && Array.isArray(section.benefits)) {
                parts.push(`Benefits\n${section.benefits.map(r => `• ${r}`).join('\n')}`);
            }
        }

        return parts.join('\n\n');
    }

    return "";
}

// Get apply URL from job website or generate from company name
function getApplyUrl(job) {
    if (job.website) {
        return job.website.startsWith('http') ? job.website : `https://${job.website}`;
    }
    const domain = job.company?.toLowerCase().replace(/\s+/g, '') + '.com';
    return `https://${domain}`;
}

// Get company domain from website or generate from name
function getCompanyDomain(job) {
    if (job.website) {
        try {
            const url = new URL(job.website.startsWith('http') ? job.website : `https://${job.website}`);
            return url.hostname.replace('www.', '');
        } catch {
            return job.website;
        }
    }
    return job.company?.toLowerCase().replace(/\s+/g, '') + '.com';
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const job = await getJob(slug);

    if (!job) {
        return {
            title: "Job Not Found | Hirebase",
        };
    }

    const title = `${job.title} at ${job.company} | Hirebase`;
    const description = `${job.company} is hiring: ${job.title}. ${job.location || 'Location flexible'}`;

    return {
        title,
        description,
        keywords: [
            job.title,
            job.company,
            job.location,
            `${job.company} jobs`,
            `${job.title.split(" ")[0]} jobs`,
        ],
        alternates: {
            canonical: `/job/${slug}`,
        },
        openGraph: {
            title: `${job.title} at ${job.company}`,
            description,
            type: "website",
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/job/${slug}`,
            images: [
                {
                    url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/og?title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&location=${encodeURIComponent(job.location || '')}`,
                    width: 1200,
                    height: 630,
                    alt: `${job.title} at ${job.company}`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${job.title} at ${job.company}`,
            description,
            images: [`${process.env.NEXT_PUBLIC_SITE_URL}/api/og?title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&location=${encodeURIComponent(job.location || '')}`],
        },
    };
}

// JSON-LD structured data for JobPosting schema
function JobPostingSchema({ job }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: job.title,
        description: formatDescription(job.description),
        hiringOrganization: {
            "@type": "Organization",
            name: job.company,
            logo: job.logo,
        },
        jobLocation: {
            "@type": "Place",
            address: {
                "@type": "PostalAddress",
                addressLocality: job.location,
            },
        },
        employmentType: "FULL_TIME",
        datePosted: job.date_posted || new Date().toISOString().split('T')[0],
        validThrough: job.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

export default async function JobPage({ params }) {
    const { slug } = await params;
    const job = await getJob(slug);

    if (!job) {
        notFound();
    }

    const companyDomain = getCompanyDomain(job);
    const applyUrl = getApplyUrl(job);
    const formattedDescription = formatDescription(job.description);

    return (
        <>
            <JobPostingSchema job={job} />

            <div className="min-h-screen bg-background">
                {/* Main content with vertical lines */}
                <div className="mx-auto max-w-4xl px-6 relative">
                    {/* Left vertical line */}
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-border hidden md:block" />
                    {/* Right vertical line */}
                    <div className="absolute right-0 top-0 bottom-0 w-px bg-border hidden md:block" />

                    {/* Back navigation */}
                    <div className="-mx-6 px-6 py-2 border-b border-border flex items-center justify-between">
                        <Link
                            href="/jobs"
                            className="-ml-4 inline-flex items-center justify-center gap-2 h-9 px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#107A4D] hover:bg-[#149F65] border border-[#149F65]/50 shadow-md relative overflow-hidden before:absolute before:inset-0 before:border-t before:border-white/40 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:rounded-xl transition-all duration-200 active:scale-[0.96] font-outfit group"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to all jobs
                        </Link>

                        {/* Action buttons */}
                        <div className="-mr-4 flex items-center gap-2">
                            {/* Share */}
                            <RaisedButton
                                size="icon"
                                color="#107A4D"
                                title="Share job"
                            >
                                <Share2 className="h-4 w-4" />
                            </RaisedButton>
                            {/* Save */}
                            <RaisedButton
                                size="icon"
                                color="#107A4D"
                                title="Save job"
                                disabled={true}
                            >
                                <Bookmark className="h-4 w-4" />
                            </RaisedButton>
                            {/* Report */}
                            <RaisedButton
                                size="icon"
                                color="#107A4D"
                                title="Report job"
                                disabled={true}
                            >
                                <Flag className="h-4 w-4" />
                            </RaisedButton>
                        </div>
                    </div>

                    {/* Job header */}
                    <div className="py-8 -mx-6 px-6 border-b border-border">
                        <div className="flex flex-col sm:flex-row gap-6">
                            <CompanyLogo name={job.company} logoUrl={job.logo} size="large" />

                            <div className="flex-1 space-y-3">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-semibold text-foreground font-outfit">
                                        {job.title}
                                    </h1>
                                    <p className="text-lg text-muted-foreground font-outfit mt-1">
                                        {job.company}
                                    </p>
                                </div>

                                {/* Job meta badges */}
                                <div className="flex flex-wrap gap-3 text-sm">
                                    {job.location && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-lg text-foreground font-geist">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            {job.location}
                                        </div>
                                    )}
                                    {job.level && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-lg text-foreground font-geist">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            {job.level}
                                        </div>
                                    )}
                                    {/* Company Website */}
                                    <a
                                        href={`${applyUrl}?utm_source=hirebase.xyz`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-lg text-foreground font-geist hover:bg-secondary/80 transition-colors"
                                    >
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        {companyDomain}
                                    </a>
                                    {/* HR Email */}
                                    {job.company_email && (
                                        <div className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-secondary rounded-lg text-foreground font-geist">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{job.company_email}</span>
                                            <CopyButton text={job.company_email} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job description */}
                    <div className="py-8">
                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                            <div className="text-foreground whitespace-pre-line leading-relaxed font-geist text-[15px]">
                                {formattedDescription}
                            </div>
                        </div>

                        {/* Apply CTA */}
                        <div className="mt-10 pt-8 -mx-6 px-6 border-t border-border">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <p className="text-foreground font-medium font-outfit">Interested in this role?</p>
                                    <p className="text-sm text-muted-foreground font-outfit">Apply directly on the company website</p>
                                </div>
                                <a
                                    href={`${applyUrl}?utm_source=hirebase.xyz`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 h-11 px-6 py-3 rounded-xl text-sm font-medium text-white cursor-pointer bg-[#107A4D] hover:bg-[#149F65] border border-[#149F65]/50 shadow-md relative overflow-hidden before:absolute before:inset-0 before:border-t before:border-white/40 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:rounded-xl transition-all duration-200 active:scale-[0.96] font-outfit"
                                >
                                    Apply Now
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Footer */}
            <footer className="border-t border-border bg-background font-outfit py-1">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="flex items-center justify-center gap-2 py-2 text-xs md:text-sm text-foreground/70">
                        <span className="text-foreground">
                            Crafted by{" "}
                            <a href="https://rahan.eu" target="_blank" rel="noopener" className="hover:underline">
                                rahan
                            </a>
                        </span>
                        <span className="text-foreground">•</span>
                        <span className="hidden md:inline text-foreground">Building the future of hiring</span>
                        <span className="hidden md:inline text-foreground">•</span>
                        <span className="text-foreground">© 2026 hirebase</span>
                    </div>
                </div>
            </footer>
        </>
    );
}
