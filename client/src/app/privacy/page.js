"use client";

import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="selection:bg-[#149F65] selection:text-white w-full font-outfit overflow-x-hidden">
            <div className="mx-auto min-h-screen max-w-5xl lg:border-x">
                {/* Header Section */}
                <div className="px-4 pt-12 pb-8 border-b border-border">
                    <div className="space-y-4 max-w-2xl">
                        <h1 className="font-bold text-4xl md:text-5xl lg:font-black">
                            Privacy Policy
                        </h1>
                        <p className="text-muted-foreground">
                            Your privacy matters. Here's how we handle your data with transparency and respect.
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Last updated: December 26, 2025
                        </p>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="divide-y divide-border">
                    <PolicySection title="1. Information We Collect">
                        <p className="mb-4">
                            We collect minimal information necessary to provide our job search service:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li><span className="text-foreground">Search queries</span> — to display relevant job listings</li>
                            <li><span className="text-foreground">Usage analytics</span> — anonymous data to improve our service</li>
                            <li><span className="text-foreground">Contact information</span> — only when you reach out to us</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="2. What We Don't Do">
                        <p className="mb-4">
                            We believe in a builder-first approach. This means:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li><span className="text-foreground">No tracking cookies</span> — we don't follow you around the web</li>
                            <li><span className="text-foreground">No data selling</span> — your information is never sold to recruiters or third parties</li>
                            <li><span className="text-foreground">No ads</span> — zero advertising, zero engagement manipulation</li>
                            <li><span className="text-foreground">No account required</span> — browse jobs without creating profiles</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="3. Data Storage & Security">
                        <p className="text-muted-foreground">
                            Any data we collect is stored securely using industry-standard encryption. We retain minimal
                            data and regularly purge logs. Your search history is not stored or associated with any
                            identifying information.
                        </p>
                    </PolicySection>

                    <PolicySection title="4. Third-Party Services">
                        <p className="text-muted-foreground">
                            We use minimal third-party services. Our platform may contain links to external company pages.
                            We have no control over their privacy practices, so we encourage you to review their policies.
                        </p>
                    </PolicySection>

                    <PolicySection title="5. Your Rights">
                        <p className="mb-4">
                            You have full control over your data:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li><span className="text-foreground">Access</span> — request a copy of any data we have</li>
                            <li><span className="text-foreground">Deletion</span> — request complete removal of your data</li>
                            <li><span className="text-foreground">Correction</span> — update any incorrect information</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="6. Changes to This Policy">
                        <p className="text-muted-foreground">
                            We may update this policy occasionally. Significant changes will be communicated clearly.
                            Continued use of hirebase after changes constitutes acceptance of the updated policy.
                        </p>
                    </PolicySection>

                    <PolicySection title="7. Contact Us">
                        <p className="text-muted-foreground">
                            Questions about this policy? We're here to help.{" "}
                            <Link href="/contact" className="text-primary hover:underline">
                                Reach out to us
                            </Link>{" "}
                            and we'll respond within 24 hours.
                        </p>
                    </PolicySection>
                </div>

                {/* Bottom spacer */}
                <div className="h-12" />
            </div>
        </div>
    );
}

// Reusable section component
function PolicySection({ title, children }) {
    return (
        <div className="px-4 py-8">
            <h2 className="font-semibold text-xl md:text-2xl mb-4 text-foreground">
                {title}
            </h2>
            <div className="text-foreground leading-relaxed">
                {children}
            </div>
        </div>
    );
}
