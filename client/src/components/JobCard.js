import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, Clock } from "lucide-react";

export default function JobCard({ job }) {
    return (
        <Link href={`/jobs/${job.id || '#'}`} className="group block">
            <div className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-foreground/20 hover:shadow-md">
                <div className="flex items-start gap-4">
                    {/* Company Logo */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                        {job.logo ? (
                            <img
                                src={job.logo}
                                alt={job.company}
                                className="h-8 w-8 object-contain"
                            />
                        ) : (
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                        )}
                    </div>

                    {/* Job Details */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {job.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground truncate">
                            {job.company}
                        </p>

                        {/* Meta Info */}
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            {job.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {job.location}
                                </span>
                            )}
                            {job.type && (
                                <Badge variant="secondary" className="font-normal">
                                    {job.type}
                                </Badge>
                            )}
                            {job.posted && (
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {job.posted}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tags */}
                {job.tags && job.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {job.tags.slice(0, 4).map((tag, index) => (
                            <Badge key={index} variant="outline" className="font-normal text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}
