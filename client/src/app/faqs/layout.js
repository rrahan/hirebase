import Header from "@/components/Header";
import UnderlineToBackground from "@/components/fancy/text/underline-to-background";

export const metadata = {
    title: "FAQs",
    description: "Frequently asked questions about finding tech jobs in Kerala through hirebase. Learn how our real-time job feed works.",
    openGraph: {
        title: "FAQs | hirebase",
        description: "Get answers about tech job hunting in Kerala.",
    },
};

// Simple footer for FAQs page
const SimpleFooter = () => (
    <footer className="border-t border-border bg-background font-outfit py-1">
        <div className="mx-auto max-w-6xl px-6">
            <div className="selection:bg-[#149F65] selection:text-white flex items-center justify-center gap-2 py-2 text-xs md:text-sm text-foreground/70">
                <span className="text-foreground">
                    Crafted by{" "}
                    <a href="https://rahan.eu?utm_source=hirebase.xyz" target="_blank" rel="noopener">
                        <UnderlineToBackground
                            underlineHeightRatio={0}
                            className="cursor-pointer"
                        >
                            rahan
                        </UnderlineToBackground>
                    </a>
                </span>
                <span className="text-foreground">•</span>
                <span className="hidden md:inline text-foreground">Building the future of hiring</span>
                <span className="hidden md:inline text-foreground">•</span>
                <span className="text-foreground">© 2026 hirebase</span>
            </div>
        </div>
    </footer>
);

export default function FaqsLayout({ children }) {
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
