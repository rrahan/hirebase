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
                {/* Links Section - 3 Columns */}
                <div className="mx-auto max-w-6xl px-6 pt-20 pb-8 md:pt-32 md:pb-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {/* Column 1 - Contact/Social */}
                        <div className="space-y-2 md:space-y-3">
                            <Link href="mailto:hello@hirebase.co" className="block text-sm md:text-base text-white hover:text-foreground transition-colors">
                                hello@hirebase.co
                            </Link>
                            <Link href="#" className="block text-sm md:text-base text-white hover:text-foreground transition-colors">
                                X
                            </Link>
                            <Link href="#" className="block text-sm md:text-base text-white hover:text-foreground transition-colors">
                                LinkedIn
                            </Link>
                        </div>

                        {/* Column 2 - Resources */}
                        <div className="space-y-2 md:space-y-3">
                            <Link href="/jobs" className="font-outfit block text-sm md:text-base text-white hover:text-foreground transition-colors">
                                Browse Jobs
                            </Link>
                            <Link href="#" className="font-outfit block text-sm md:text-base text-white hover:text-foreground transition-colors">
                                Companies
                            </Link>
                            <Link href="#" className="font-outfit block text-sm md:text-base text-white hover:text-foreground transition-colors">
                                Resources
                            </Link>
                        </div>

                        {/* Column 3 - Locations */}
                        <div className="space-y-2 md:space-y-3">
                            <p className="font-outfit text-sm md:text-base text-white">
                                Kerala, India
                            </p>
                            <p className="font-outfit text-sm md:text-base text-white">
                                Remote Friendly
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-foreground/20" />

                {/* Large Brand Name Section - Now at bottom */}
                <div className="h-[150px] sm:h-[200px] md:h-[280px] lg:h-[350px] flex items-center justify-center select-none pointer-events-none overflow-hidden">
                    <h2 className="opacity-80 text-center text-white text-[99px] sm:text-12xl md:text-[200px] lg:text-[400px] font-outfit font-bold tracking-tight">
                        hirebase
                    </h2>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-foreground/20" />
                <div className="mx-auto max-w-6xl px-6">
                    <div className="flex items-center justify-center gap-2 py-4 text-xs md:text-sm text-white/70">
                        <span className="text-white">
                            Crafted by{" "}
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
                        <span className="text-white">© 2026, hirebase</span>
                    </div>
                </div>
            </PixelBackground>
        </footer>
    );
}
