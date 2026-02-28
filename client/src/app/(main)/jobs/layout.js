import UnderlineToBackground from "@/components/fancy/text/underline-to-background"

export const metadata = {
    title: "Tech Jobs in Kerala | Technopark & Infopark Vacancies",
    description: "Find developer, designer, and startup jobs in Kerala. Real-time listings from Technopark, Infopark, and Kerala startups. No middlemen or expired posts. Direct feed from company career portals.",
    keywords: [
        "Technopark jobs",
        "Infopark Kochi vacancies",
        "Tech jobs in Kochi",
        "Software engineer jobs Kerala",
        "Frontend developer Kochi",
        "Python developer Kerala",
        "UI/UX designer Kerala",
        "Startup jobs Kerala",
        "Remote jobs for Keralites",
        "Fresher tech jobs Kerala",
    ],
    alternates: {
        canonical: 'https://hirebase.xyz/jobs',
    },
    openGraph: {
        title: "Tech Jobs in Kerala | Technopark & Infopark",
        description: "Developer and design roles from Kerala startups. Direct openings from official company portals.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "hirebase - Tech Jobs in Kerala",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Tech Jobs in Kerala | hirebase",
        description: "Real-time tech job listings from Technopark, Infopark, and Kerala startups.",
        images: ["/og-image.png"],
    },
};

const SimpleFooter = () => (
    <footer className="border-t border-border bg-background font-outfit py-1">
        <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-center justify-center gap-2 py-2 text-xs md:text-sm text-foreground/70">
                <span className="text-foreground">
                    Built with ❤️ by{" "}
                    <a href="https://rahan.eu?utm_source=hirebase.xyz" target="_blank" rel="noopener">
                        <UnderlineToBackground
                            underlineHeightRatio={0}
                            className="cursor-pointer"
                        >
                            rahan
                        </UnderlineToBackground>
                    </a>
                </span>
                <span className="hidden md:inline text-foreground">•</span>
                <span className="text-foreground">© 2026 hirebase</span>
            </div>
        </div>
    </footer>
);

export default function JobsLayout({ children, modal }) {
    return (
        <>
            {children}
            {modal}
            <SimpleFooter />
        </>
    );
}

