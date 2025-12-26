import Header from "@/components/Header";
import UnderlineToBackground from "@/components/fancy/text/underline-to-background";

// Simple footer for terms page
const SimpleFooter = () => (
    <footer className="border-t border-border bg-background font-outfit py-1">
        <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-center justify-center gap-2 py-2 text-xs md:text-sm text-white/70">
                <span className="text-white">
                    Designed and engineered by{" "}
                    <a href="https://rahan.eu" target="_blank" rel="noopener">
                        <UnderlineToBackground
                            targetTextColor="#191919"
                            underlineHeightRatio={0}
                            className="cursor-pointer"
                        >
                            rahan
                        </UnderlineToBackground>
                    </a>
                </span>
                <span className="text-white">•</span>
                <span className="hidden md:inline text-white">Building the future of hiring</span>
                <span className="hidden md:inline text-white">•</span>
                <span className="text-white">© 2026 hirebase</span>
            </div>
        </div>
    </footer>
);

export default function TermsLayout({ children }) {
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
