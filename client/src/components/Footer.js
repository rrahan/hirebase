"use client";

import Link from "next/link";
import { motion } from "motion/react"
import PixelBackground from "@/components/ui/pixel-background";
import UnderlineToBackground from "@/components/fancy/text/underline-to-background"

export default function Footer() {
    return (
        <footer className="bg-background">
            {/* Single PixelBackground for entire footer */}
            <PixelBackground className="relative w-full">
                {/* Links Section - 4 Columns */}
                <div className="selection:bg-[#149F65] selection:text-white mx-auto max-w-6xl px-8 md:px-12 pt-12 pb-6 md:pt-16 md:pb-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        {/* Column 1 - Contact/Social */}
                        <div className="space-y-1.5 md:space-y-2">
                            <h4 className="font-outfit text-sm text-foreground/50 uppercase tracking-wider mb-2">Connect</h4>
                            <Link href="mailto:hello@hirebase.xyz" className="font-outfit block text-base md:text-lg text-foreground/80 hover:text-foreground transition-colors">
                                hello@hirebase.xyz
                            </Link>
                            <Link href="#" className="font-outfit block text-base md:text-lg text-foreground/80 hover:text-foreground transition-colors">
                                X (Twitter)
                            </Link>
                            <Link href="#" className="font-outfit block text-base md:text-lg text-foreground/80 hover:text-foreground transition-colors">
                                LinkedIn
                            </Link>
                        </div>

                        {/* Column 2 - Browse */}
                        <div className="space-y-1.5 md:space-y-2">
                            <h4 className="font-outfit text-sm text-foreground/50 uppercase tracking-wider mb-2">Browse</h4>
                            <Link href="/jobs" className="font-outfit block text-base md:text-lg text-foreground/80 hover:text-foreground transition-colors">
                                Jobs
                            </Link>
                            <Link href="#" className="font-outfit block text-base md:text-lg text-foreground/80 hover:text-foreground transition-colors">
                                Companies
                            </Link>
                            <Link href="#" className="font-outfit block text-base md:text-lg text-foreground/80 hover:text-foreground transition-colors">
                                Resources
                            </Link>
                        </div>

                        {/* Column 3 - Legal */}
                        <div className="space-y-1.5 md:space-y-2">
                            <h4 className="font-outfit text-sm text-foreground/50 uppercase tracking-wider mb-2">Legal</h4>
                            <Link href="/terms" className="font-outfit block text-base md:text-lg text-foreground/80 hover:text-foreground transition-colors">
                                Terms of Service
                            </Link>
                            <Link href="/privacy" className="font-outfit block text-base md:text-lg text-foreground/80 hover:text-foreground transition-colors">
                                Privacy Policy
                            </Link>
                        </div>

                        {/* Column 4 - Support */}
                        <div className="space-y-1.5 md:space-y-2">
                            <h4 className="font-outfit text-sm text-foreground/50 uppercase tracking-wider mb-2">Support</h4>
                            <Link href="/contact" className="font-outfit block text-base md:text-lg text-foreground/80 hover:text-foreground transition-colors">
                                Contact Us
                            </Link>
                            <Link href="/faqs" className="font-outfit block text-base md:text-lg text-foreground/80 hover:text-foreground transition-colors">
                                FAQs
                            </Link>
                            <Link href="https://hirebase.openstatus.dev/" target="_blank" rel="noopener" className="font-outfit block text-base md:text-lg text-foreground/80 hover:text-foreground transition-colors">
                                Status
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-foreground/20" />

                {/* Large Brand Name Section - Now at bottom */}
                <div className="h-[150px] sm:h-[200px] md:h-[280px] lg:h-[350px] flex items-center justify-center select-none pointer-events-none overflow-hidden">
                    <h2 className="opacity-90 text-center text-foreground text-[99px] sm:text-12xl md:text-[200px] lg:text-[400px] font-outfit font-bold tracking-tight">
                        hirebase
                    </h2>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-foreground/20" />
                <div className="mx-auto max-w-6xl px-6">
                    <div className=" font-outfit selection:bg-[#149F65] selection:text-white flex items-center justify-center gap-2 py-4 text-xs md:text-sm text-foreground/70">
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
            </PixelBackground>
        </footer>
    );
}
