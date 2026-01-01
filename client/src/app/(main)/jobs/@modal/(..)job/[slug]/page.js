"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, use } from "react";
import { motion } from "motion/react";
import { useOnClickOutside } from "usehooks-ts";
import { X } from "lucide-react";
import { findJobBySlug, getCompanyLogoUrl } from "@/data/jobs";

// Company logo component
const CompanyLogo = ({ name }) => {
    const logoUrl = getCompanyLogoUrl(name);

    return (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white border border-border overflow-hidden p-1.5">
            <img
                src={logoUrl}
                alt={`${name} logo`}
                className="h-full w-full object-contain"
                onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                }}
            />
            <span className="text-base font-semibold text-foreground hidden items-center justify-center h-full w-full">
                {name.charAt(0).toUpperCase()}
            </span>
        </div>
    );
};

export default function JobModalPage({ params }) {
    const router = useRouter();
    const ref = useRef(null);

    // Use React.use() to unwrap params promise in Next.js 15
    const { slug } = use(params);
    const job = findJobBySlug(slug);

    useOnClickOutside(ref, () => router.back());

    useEffect(() => {
        function onKeyDown(event) {
            if (event.key === "Escape") {
                router.back();
            }
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [router]);

    // Lock body scroll immediately to prevent layout shift
    useEffect(() => {
        // Calculate scrollbar width to prevent layout shift
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;

        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, []);

    if (!job) {
        router.back();
        return null;
    }

    return (
        <>
            {/* Backdrop */}
            <motion.div
                animate={{ opacity: 1 }}
                className="pointer-events-auto fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                onClick={() => router.back()}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <motion.div
                    className="flex h-fit w-[95%] max-w-4xl cursor-default flex-col items-start gap-4 overflow-hidden border bg-background p-6 shadow-lg font-geist relative"
                    ref={ref}
                    style={{ borderRadius: 12 }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                >
                    {/* Close button */}
                    <button
                        onClick={() => router.back()}
                        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Header */}
                    <div className="flex w-full items-center gap-4 pr-10">
                        <CompanyLogo name={job.company} />
                        <div className="flex grow items-center justify-between">
                            <div className="flex w-full flex-col gap-1">
                                <div className="font-medium text-foreground text-base">
                                    {job.title}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                    {job.company} · {job.location} · {job.remote === "Yes" ? "Remote" : job.remote === "Hybrid" ? "Hybrid" : "On-site"}
                                </div>
                                <div className="flex flex-row flex-wrap gap-2 text-muted-foreground text-xs mt-1">
                                    <span className="bg-secondary px-2 py-0.5 rounded">{job.salary}</span>
                                    <span className="bg-secondary px-2 py-0.5 rounded">{job.job_time}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="text-muted-foreground text-sm whitespace-pre-line leading-relaxed max-h-96 overflow-y-auto pr-2">
                        {job.job_description}
                    </div>
                </motion.div>
            </div>
        </>
    );
}
