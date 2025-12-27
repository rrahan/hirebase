import UnderlineToBackground from "@/components/fancy/text/underline-to-background"


const SimpleFooter = () => (
    <footer className="border-t border-border bg-background font-outfit py-1">
        <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-center justify-center gap-2 py-2 text-xs md:text-sm text-foreground/70">
                <span className="text-foreground">
                    Designed and engineered by{" "}
                    <a href="https://rahan.eu" target="_blank" rel="noopener">
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

export default function JobsLayout({ children }) {
    return (
        <>
            {children}
            <SimpleFooter />
        </>
    );
}
