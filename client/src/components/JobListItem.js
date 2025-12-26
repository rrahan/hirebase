"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";

export default function JobListItem({ job }) {
    // Format the posted date nicely
    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        // If it's already formatted like "2 days ago", return as is
        if (dateStr.includes("ago")) return dateStr;
        // Otherwise format as "Posted on Dec 24, 2025"
        try {
            const date = new Date(dateStr);
            return `Posted on ${date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })}`;
        } catch {
            return dateStr;
        }
    };

    return (
        <Link href={`/jobs/${job.id || '#'}`} className="group block">
            <div className="flex items-center gap-4 px-4 py-4 transition-all duration-200 hover:bg-secondary/50 rounded-lg">
                {/* Company Logo */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card overflow-hidden">
                    {job.logo ? (
                        <img
                            src={job.logo}
                            alt={job.company}
                            className="h-full w-full object-contain p-1"
                        />
                    ) : (
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                    )}
                </div>

                {/* Job Details */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate font-outfit">
                        {job.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted-foreground truncate font-outfit">
                        {job.company}
                        {job.location && (
                            <>
                                <span className="mx-1.5">·</span>
                                {job.location}
                            </>
                        )}
                        {(job.posted || job.date_posted) && (
                            <>
                                <span className="mx-1.5">·</span>
                                {formatDate(job.posted || job.date_posted)}
                            </>
                        )}
                    </p>
                </div>
            </div>
        </Link>
    );
}
