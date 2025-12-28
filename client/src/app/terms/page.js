"use client";

import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="selection:bg-[#149F65] selection:text-white w-full font-outfit overflow-x-hidden">
            <div className="mx-auto min-h-screen max-w-5xl lg:border-x">
                {/* Header Section */}
                <div className="px-4 pt-12 pb-8 border-b border-border">
                    <div className="space-y-4 max-w-2xl">
                        <h1 className="font-bold text-4xl md:text-5xl lg:font-black">
                            Terms of Service
                        </h1>
                        <p className="text-muted-foreground">
                            Simple, fair terms for using hirebase. No legal jargon.
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Last updated: December 26, 2025
                        </p>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="divide-y divide-border">
                    <TermsSection title="1. Acceptance of Terms">
                        <p className="text-muted-foreground">
                            By accessing and using hirebase, you agree to be bound by these Terms of Service.
                            If you disagree with any part of these terms, please discontinue use of our service.
                            These terms apply to all visitors, users, and others who access the service.
                        </p>
                    </TermsSection>

                    <TermsSection title="2. Description of Service">
                        <p className="mb-4">
                            hirebase provides:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li><span className="text-foreground">Job aggregation</span> — curated job listings from verified companies</li>
                            <li><span className="text-foreground">Search functionality</span> — tools to filter and discover opportunities</li>
                            <li><span className="text-foreground">AI-powered insights</span> — distilled job summaries for quick evaluation</li>
                            <li><span className="text-foreground">Real-time updates</span> — regularly refreshed listings to ensure accuracy</li>
                        </ul>
                    </TermsSection>

                    <TermsSection title="3. User Conduct">
                        <p className="mb-4">
                            You agree not to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li>Use automated systems to scrape or extract data without permission</li>
                            <li>Attempt to interfere with or disrupt the service's functionality</li>
                            <li>Impersonate any person or entity or misrepresent your affiliation</li>
                            <li>Use the service for any unlawful purpose or in violation of any regulations</li>
                            <li>Transmit any malware, viruses, or other harmful code</li>
                        </ul>
                    </TermsSection>

                    <TermsSection title="4. Intellectual Property">
                        <p className="text-muted-foreground">
                            The hirebase platform, including its design, features, and content created by us,
                            is protected by intellectual property laws. Job listings are sourced from third-party
                            companies and remain their respective property. You may use our service for personal,
                            non-commercial job searching purposes only.
                        </p>
                    </TermsSection>

                    <TermsSection title="5. Third-Party Links">
                        <p className="text-muted-foreground">
                            Our service may contain links to external company pages. We are not responsible
                            for the content, accuracy, or practices of these third-party sites.
                        </p>
                    </TermsSection>

                    <TermsSection title="6. Disclaimer of Warranties">
                        <p className="text-muted-foreground">
                            hirebase is provided "as is" without warranties of any kind. While we strive to
                            maintain accurate and up-to-date listings, we cannot guarantee that all job postings
                            are current, accurate, or still available. We regularly re-verify listings but
                            companies may change their postings at any time.
                        </p>
                    </TermsSection>

                    <TermsSection title="7. Limitation of Liability">
                        <p className="text-muted-foreground">
                            hirebase shall not be liable for any indirect, incidental, special, consequential,
                            or punitive damages resulting from your use or inability to use the service. This
                            includes any issues arising from applying to jobs discovered through our platform.
                        </p>
                    </TermsSection>

                    <TermsSection title="8. Changes to Terms">
                        <p className="text-muted-foreground">
                            We reserve the right to modify these terms at any time. Changes will be effective
                            immediately upon posting. Your continued use of hirebase after changes constitutes
                            acceptance of the new terms. We encourage you to review this page periodically.
                        </p>
                    </TermsSection>

                    <TermsSection title="9. Termination">
                        <p className="text-muted-foreground">
                            We may terminate or suspend access to our service immediately, without prior notice,
                            for any conduct that we believe violates these Terms or is harmful to other users,
                            us, or third parties, or for any other reason.
                        </p>
                    </TermsSection>

                    <TermsSection title="10. Contact">
                        <p className="text-muted-foreground">
                            Questions about these terms?{" "}
                            <Link href="/contact" className="text-primary hover:underline">
                                Contact us
                            </Link>{" "}
                            and we'll be happy to clarify. You can also review our{" "}
                            <Link href="/privacy" className="text-primary hover:underline">
                                Privacy Policy
                            </Link>{" "}
                            for information on how we handle your data.
                        </p>
                    </TermsSection>
                </div>

                {/* Bottom spacer */}
                <div className="h-12" />
            </div>
        </div>
    );
}

// Reusable section component
function TermsSection({ title, children }) {
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
