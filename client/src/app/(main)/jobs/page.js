"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import JobListingComponent from "@/components/smoothui/job-listing-component";
import { Search } from "lucide-react";
import { Badge2 } from "@/components/ui/badge2";
import { ChevronDownIcon } from "@/components/ui/chevron-down";
import { Spinner } from "@/components/kibo-ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Company logo component
const CompanyLogo = ({ logoUrl, name }) => {
    const [hasError, setHasError] = useState(false);

    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-border overflow-hidden p-1">
            {logoUrl && !hasError ? (
                <img
                    src={logoUrl}
                    alt={`${name} logo`}
                    className="h-full w-full object-contain"
                    onError={() => setHasError(true)}
                />
            ) : (
                <span className="text-sm font-semibold text-foreground flex items-center justify-center h-full w-full">
                    {name?.charAt(0).toUpperCase() || "?"}
                </span>
            )}
        </div>
    );
};

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

// Transform API job data to component format
function transformJob(apiJob) {
    return {
        id: apiJob.id,
        slug: apiJob.slug,
        company: apiJob.company || "Unknown Company",
        title: apiJob.title || "Untitled Position",
        logo: <CompanyLogo logoUrl={apiJob.logo} name={apiJob.company} />,
        location: apiJob.location || "Location not specified",
        remote: "On-site", // API doesn't track remote status
        salary: "Competitive", // API doesn't track salary
        job_time: "Full-time", // Default
        job_description: formatDescription(apiJob.description),
        level: apiJob.level,
        website: apiJob.website,
        date_posted: apiJob.date_posted,
        deadline: apiJob.deadline,
    };
}

export default function JobsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [newJobsCount, setNewJobsCount] = useState(0);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0,
        hasNextPage: false,
    });

    // Fetch jobs from API
    const fetchJobs = async (page = 1, append = false) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const response = await fetch(`${API_BASE_URL}/api/v1/jobs?page=${page}&limit=10`);

            if (!response.ok) {
                throw new Error("Failed to fetch jobs");
            }

            const data = await response.json();

            if (data.success) {
                const transformedJobs = data.data.map(transformJob);

                if (append) {
                    setJobs(prev => [...prev, ...transformedJobs]);
                } else {
                    setJobs(transformedJobs);
                }

                setPagination({
                    currentPage: data.pagination.currentPage,
                    totalPages: data.pagination.totalPages,
                    totalJobs: data.pagination.totalJobs,
                    hasNextPage: data.pagination.hasNextPage,
                });
            } else {
                throw new Error(data.message || "Failed to fetch jobs");
            }
        } catch (err) {
            console.error("Error fetching jobs:", err);
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Fetch job stats (jobs added today)
    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/jobs/stats`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setNewJobsCount(data.data.newJobsCount);
                }
            }
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchJobs(1);
        fetchStats();
    }, []);

    // Filter jobs based on search (client-side filtering of loaded jobs)
    const filteredJobs = useMemo(() => {
        if (!searchQuery.trim()) return jobs;

        const query = searchQuery.toLowerCase();
        return jobs.filter((job) =>
            job.title.toLowerCase().includes(query) ||
            job.company.toLowerCase().includes(query) ||
            job.location?.toLowerCase().includes(query)
        );
    }, [searchQuery, jobs]);

    const loadMore = () => {
        if (pagination.hasNextPage && !loadingMore) {
            fetchJobs(pagination.currentPage + 1, true);
        }
    };

    const handleJobClick = (job) => {
        console.log("Job clicked:", job.company, job.title);
    };

    // Job listing skeleton component
    const JobListingSkeleton = () => (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-b-0">
                    <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-semibold font-outfit text-destructive">Error loading jobs</h3>
                    <p className="mt-2 text-muted-foreground font-outfit">{error}</p>
                    <button
                        onClick={() => fetchJobs(1)}
                        className="mt-4 px-4 py-2 bg-[#149F65] text-white rounded-lg font-outfit hover:bg-[#107A4D] transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Hero Header */}
            <section className="pt-16 pb-8">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    {/* Badge */}
                    <div className=" font-geist selection:bg-[#149F65] selection:text-white flex justify-center mb-6">
                        <Badge2 variant="animated-border">
                            Status: {newJobsCount} fresh roles indexed
                        </Badge2>
                    </div>

                    {/* Headline */}
                    <h1 className="selection:bg-[#149F65] selection:text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold font-outfit text-foreground">
                        Discover opportunities
                        that match your vision.
                    </h1>

                    {/* Subheadline */}
                    <p className="selection:bg-[#149F65] selection:text-white mt-5 font-outfit text-base text-muted-foreground md:text-lg max-w-xl mx-auto">
                        Explore verified opportunities at companies that are actually hiring.
                        <br className="hidden sm:block" />
                        Updated daily.
                    </p>
                </div>
            </section>

            {/* Search Section */}
            <section className="pb-4">
                <div className="mx-auto max-w-3xl px-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search jobs by position, location or company name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-14 pl-12 pr-4 bg-background border-border rounded-xl text-base font-outfit shadow-sm focus:ring-2 focus:ring-[#149F65]/20 focus:border-[#149F65] transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* Job Listings */}
            <section className="py-4">
                <div className="mx-auto max-w-3xl px-6">
                    {loading ? (
                        <JobListingSkeleton />
                    ) : filteredJobs.length > 0 ? (
                        <div className="selection:bg-[#149F65] selection:text-white border border-border rounded-xl bg-card overflow-hidden">
                            <JobListingComponent
                                jobs={filteredJobs}
                                onJobClick={handleJobClick}
                                className="!p-0"
                            />
                            {/* Load More Button - inside card container */}
                            {pagination.hasNextPage && !searchQuery && (
                                <div className="border-t border-border">
                                    <button
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        className="flex items-center justify-center gap-2 w-full py-2 text-md font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors font-outfit group disabled:opacity-50"
                                    >
                                        {loadingMore ? (
                                            <>
                                                <Spinner size={15} />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                Load More
                                                <ChevronDownIcon />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="selection:bg-[#149F65] selection:text-white py-16 text-center border border-border rounded-xl">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold font-outfit">No jobs found</h3>
                            <p className="mt-2 text-muted-foreground font-outfit">
                                Try adjusting your search to find what you're looking for.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
