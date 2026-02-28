import Header from "@/components/Header";
import UnderlineToBackground from "@/components/fancy/text/underline-to-background";

export const metadata = {
    title: "Contact Us",
    description: "Get in touch with hirebase for job listing inquiries, partnerships, or support. We're here to help you find tech opportunities in Kerala.",
    alternates: {
        canonical: 'https://hirebase.xyz/contact',
    },
    openGraph: {
        title: "Contact hirebase",
        description: "Reach out to our team for questions about tech jobs in Kerala.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Contact hirebase",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Contact hirebase",
        description: "Reach out to our team for questions about tech jobs in Kerala.",
        images: ["/og-image.png"],
    },
};

// Simple footer for contact page
const SimpleFooter = () => (
    <footer className="border-t border-border bg-background font-outfit py-1">
        <div className="mx-auto max-w-6xl px-6">
            <div className="selection:bg-[#149F65] selection:text-white flex items-center justify-center gap-2 py-2 text-xs md:text-sm text-foreground/70">
                <span className="text-foreground">
                    Built with ❤️ {" "}
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

export default function ContactLayout({ children }) {
    return (
        <>
            <Header />
            <main className="min-h-screen">
                {children}
            </main>
            <SimpleFooter />
        </>
    );
}
