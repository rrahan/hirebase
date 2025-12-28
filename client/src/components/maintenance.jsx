"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { RaisedButton } from "@/components/ui/raised-button";
import Link from "next/link";

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-background flex flex-col relative">
            {/* Grid Background */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, var(--border) 1px, transparent 1px),
                        linear-gradient(to bottom, var(--border) 1px, transparent 1px)
                    `,
                    backgroundSize: '120px 120px',
                    opacity: 0.3
                }}
            />

            {/* Centered Container with Border */}
            <div className="mx-auto h-full min-h-screen max-w-5xl relative z-10 flex flex-col">
                {/* Main Content */}
                <main className="flex-1 flex items-center justify-center px-6">
                    <div className="max-w-2xl mx-auto text-center">
                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-bold font-outfit text-foreground mb-4">
                            We'll be back soon
                        </h1>

                        {/* Description */}
                        <p className="text-lg md:text-xl text-muted-foreground font-outfit mb-8 leading-relaxed">
                            We're currently performing scheduled maintenance to improve your experience.
                            <br className="hidden sm:block" />
                            Thank you for your patience.
                        </p>

                        {/* Status Link */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="https://status.hirebase.xyz/"
                                target="_blank"
                                rel="noopener"
                            >
                                <RaisedButton color="#107A4D" className="font-outfit select-none">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Check Status
                                </RaisedButton>
                            </a>
                            <a href="mailto:hello@hirebase.xyz">
                                <RaisedButton className="font-outfit select-none">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Contact Us
                                </RaisedButton>
                            </a>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
